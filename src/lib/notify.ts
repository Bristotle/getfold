import "server-only";

import { createClient } from "@/lib/supabase/server";
import { toE164, providerStatus } from "@/lib/messaging";

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
}: Queue): Promise<string | null> {
  const to = toE164(phone);
  if (!to) return null;

  try {
    const supabase = await createClient();

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
          .select(column)
          .eq("id", organizationId)
          .maybeSingle();
        if (!(org as Record<string, boolean> | null)?.[column]) return null;
      }
    }
    const { data, error } = await supabase
      .from("notifications")
      .insert({
        organization_id: organizationId,
        member_id: memberId ?? null,
        type,
        channel: "sms",
        recipient: to,
        body,
        // Distinguishes "waiting to go" from "nothing can send it", so the
        // UI can tell the church which it is.
        status: providerStatus().configured ? "queued" : "no_provider",
      })
      .select("id")
      .single();

    if (error) return null;
    return data?.id ?? null;
  } catch {
    return null;
  }
}
