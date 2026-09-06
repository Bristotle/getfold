import "server-only";

import { createClient } from "@/lib/supabase/server";
import { toE164, providerStatus } from "@/lib/messaging";

type Queue = {
  organizationId: string;
  memberId?: string | null;
  type: "welcome" | "contribution_receipt" | "absence_followup";
  phone: string | null | undefined;
  body: string;
};

/**
 * Records an outbound message.
 *
 * Never throws and never blocks the caller's own work: adding a member must
 * succeed even if the SMS cannot be queued. A church would rather have the
 * member on the register with no welcome text than lose the member because
 * a messaging provider was down.
 *
 * Returns null when there is no usable phone number — nothing is stored,
 * because a message that can never be delivered is noise in the log rather
 * than a record of intent.
 */
export async function queueMessage({
  organizationId,
  memberId,
  type,
  phone,
  body,
}: Queue): Promise<string | null> {
  const to = toE164(phone);
  if (!to) return null;

  try {
    const supabase = await createClient();
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
