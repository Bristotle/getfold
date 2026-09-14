import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  toE164,
  providerStatus,
  deliver,
  DEFAULT_TEMPLATES,
  renderTemplate,
} from "@/lib/messaging";

/**
 * The narrow slice of supabase-js this module uses, so a service role
 * client and a session client are interchangeable here without either
 * pretending to be the other.
 */
type SupabaseLike = {
  from: (table: string) => never extends never
    ? ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>
    : never;
};

type Queue = {
  organizationId: string;
  memberId?: string | null;
  type: "welcome" | "contribution_receipt" | "absence_followup";
  phone: string | null | undefined;
  body: string;
  /**
   * True when nothing a person did triggered this, so it has to be
   * something the church switched on. Manual sends skip the check.
   */
  automatic?: boolean;
  /**
   * Deliver immediately rather than leaving it for the daily job. For
   * anything whose value depends on arriving promptly.
   */
  sendNow?: boolean;
};

/**
 * Records an outbound message.
 *
 * Never throws and never blocks the caller's own work: adding a member must
 * succeed even if the SMS cannot be queued. A church would rather have the
 * member on the register with no welcome text than lose the member because
 * a messaging provider was down.
 *
 * Returns null when there is no usable phone number, nothing is stored,
 * because a message that can never be delivered is noise in the log rather
 * than a record of intent.
 */
/**
 * Which switch governs each automatic message. A type absent from here has
 * no switch and always goes, which is correct for anything a person chose.
 */
const AUTOMATIC_TOGGLE: Record<string, string | undefined> = {
  welcome: "sms_welcome_enabled",
  contribution_receipt: "sms_thanks_enabled",
  birthday: "sms_birthday_enabled",
};

export async function queueMessage({
  organizationId,
  memberId,
  type,
  phone,
  body,
  automatic,
  sendNow,
  sendAfterMinutes,
  client,
}: Queue & {
  /*
    Hold the message back this many minutes.

    A thank you sent the instant a payment confirms arrives on top of MTN's
    own two texts, the approval code and the debit alert, and reads as part
    of the machinery. A few minutes later it arrives on its own and reads as
    the church. Nothing is sent inline when this is set; the flush job picks
    it up once it is due.
  */
  sendAfterMinutes?: number;
  /*
    A client to use instead of the caller's session.

    The Paystack webhook has no session, so it could not queue anything, and
    that is why a tithe paid by mobile money was never thanked while one
    typed in by hand was. The webhook passes its service role client here.
    Everything else leaves this alone and keeps row level security.
  */
  client?: SupabaseLike;
}): Promise<string | null> {
  const to = toE164(phone);
  if (!to) return null;

  let senderId: string | null = null;

  try {
    const supabase = client ?? (await createClient());

    /*
      An automatic message needs the church to have asked for it.

      A message the church triggered by clicking something is different:
      they chose it, so it goes. But a welcome text that fires whenever a
      member is added spends the church's standing with its own
      congregation, and that is not ours to spend on their behalf. One
      annoyed member tells the whole society.
    */
    if (automatic) {
      const column = AUTOMATIC_TOGGLE[type];
      if (column) {
        const { data: org } = await supabase
          .from("organizations")
          .select(`${column}, sms_sender_id`)
          .eq("id", organizationId)
          .maybeSingle();
        if (!(org as Record<string, unknown> | null)?.[column]) return null;
        senderId =
          ((org as { sms_sender_id?: string | null } | null)?.sms_sender_id) ??
          null;
      }
    }
    const dueAt = sendAfterMinutes
      ? new Date(Date.now() + sendAfterMinutes * 60_000).toISOString()
      : new Date().toISOString();

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        organization_id: organizationId,
        member_id: memberId ?? null,
        type,
        channel: "sms",
        recipient: to,
        body,
        send_after: dueAt,
        // Distinguishes "waiting to go" from "nothing can send it", so the
        // UI can tell the church which it is.
        status: providerStatus().configured ? "queued" : "no_provider",
      })
      .select("id")
      .single();

    if (error) return null;
    const id = data?.id ?? null;

    /*
      Send it now, not tomorrow morning.

      A welcome and a thank you are single messages triggered by something a
      person just did, and their whole value is promptness. A member who
      gave by mobile money and hears nothing for a day rings the treasurer,
      which is the phone call this feature exists to prevent.

      Birthdays are different and stay on the daily job: they are a batch,
      and the time of day is the point.

      A failure here is not a failure overall. The row stays queued and the
      daily job retries it, so the worst case is the behaviour we had
      before rather than a lost message.
    */
    // Deliberately not inline when the message is being held back. The
    // flush job owns it from here.
    if (id && sendNow && !sendAfterMinutes) {
      const result = await deliver(to, body, senderId);
      if (result.ok) {
        await supabase
          .from("notifications")
          .update({ status: "sent", sent_at: new Date().toISOString(), error: null })
          .eq("id", id);
      }
    }

    return id;
  } catch {
    return null;
  }
}

/**
 * Thanks somebody for a gift that arrived through the gateway.
 *
 * This existed only on the hand typed path, keyed to a member on the
 * register, so a tithe paid by mobile money was never acknowledged at all.
 * That is the wrong way round: a gift typed in by the treasurer was given
 * in front of them, while a gift sent from a phone had no acknowledgement
 * whatsoever, and silence after sending money is exactly when a member
 * rings the church to ask whether it arrived.
 *
 * Anonymous giving is thanked here, which the hand typed path deliberately
 * does not do. The difference is real: there, thanking would mean guessing
 * who gave. Here the number is the one that actually paid, so there is
 * nothing to guess.
 *
 * It comes from the church's own sender name, never ours. That is the
 * point of the feature.
 */
/** How long a thank you waits. One place, so it is a decision not a magic number. */
export const THANK_YOU_DELAY_MINUTES = 3;

export async function thankForGiving(params: {
  organizationId: string;
  memberId: string | null;
  /** The number that paid. Used when the gift is not attributed. */
  payingPhone: string | null;
  amountCedis: number;
  type: string;
  client?: SupabaseLike;
}): Promise<void> {
  try {
    const supabase = params.client ?? (await createClient());

    const { data: org } = await supabase
      .from("organizations")
      .select("name, sms_template_thanks")
      .eq("id", params.organizationId)
      .maybeSingle();

    if (!org) return;

    let name = "friend";
    let phone = params.payingPhone;

    if (params.memberId) {
      const { data: member } = await supabase
        .from("members")
        .select("full_name, phone")
        .eq("id", params.memberId)
        .maybeSingle();
      if (member) {
        name = (member as { full_name: string }).full_name;
        // The member's own number wins: it is the one the church holds for
        // them, and somebody may well have paid on their behalf.
        phone = (member as { phone: string | null }).phone ?? phone;
      }
    }

    if (!phone) return;

    await queueMessage({
      organizationId: params.organizationId,
      memberId: params.memberId,
      type: "contribution_receipt",
      automatic: true,
      sendNow: true,
      /*
        Three minutes. Long enough for MTN's debit alert to have landed and
        been read, short enough that the member still connects it to the
        gift they just made.
      */
      sendAfterMinutes: THANK_YOU_DELAY_MINUTES,
      phone,
      body: renderTemplate(
        (org as { sms_template_thanks: string | null }).sms_template_thanks ??
          DEFAULT_TEMPLATES.thanks,
        {
          name,
          church: (org as { name: string }).name,
          amount: `GHS ${params.amountCedis.toFixed(2)}`,
          type: params.type,
        }
      ),
      client: params.client,
    });
  } catch {
    // Never let a thank you break a payment being recorded.
  }
}
