import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  deliver,
  deliverWhatsAppReminder,
  providerStatus,
  templates,
  type MeetingReminder,
} from "@/lib/messaging";

/**
 * Sends one queued notification by whichever channel it was queued for, and
 * records what happened.
 *
 * Every sender goes through here: the five minute job, the daily job and
 * the Send button. Before WhatsApp there was only one channel and each of
 * them called deliver() directly, which would have sent a WhatsApp row out
 * as a text without anybody noticing.
 */

export type QueuedNotification = {
  id: string;
  organization_id: string;
  member_id: string | null;
  type: string;
  channel: string;
  recipient: string;
  body: string;
  params: unknown;
};

export const QUEUED_COLUMNS =
  "id, organization_id, member_id, type, channel, recipient, body, params";

function reminderOf(n: Pick<QueuedNotification, "type" | "params">) {
  return n.type === "meeting_reminder" && n.params
    ? (n.params as MeetingReminder)
    : null;
}

/**
 * "Starts in 30 minutes" is only true for half an hour. A reminder that
 * waited in the queue, because no provider was connected or nobody pressed
 * Send, must not arrive after the meeting has begun.
 */
function tooLate(n: Pick<QueuedNotification, "type" | "params">) {
  const r = reminderOf(n);
  return Boolean(r && Date.now() >= new Date(r.startsAt).getTime());
}

export async function dispatch(
  supabase: SupabaseClient,
  n: QueuedNotification,
  senderId: string | null
): Promise<"sent" | "failed"> {
  if (tooLate(n)) {
    await supabase
      .from("notifications")
      .update({
        status: "failed",
        error: "Not sent: the meeting had already started.",
      })
      .eq("id", n.id);
    return "failed";
  }

  const reminder = reminderOf(n);

  if (n.channel === "whatsapp" && reminder) {
    const result = await deliverWhatsAppReminder(n.recipient, reminder);
    if (result.ok) {
      await supabase
        .from("notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          error: null,
          provider_message_id: result.messageId ?? null,
        })
        .eq("id", n.id);
      return "sent";
    }

    await supabase
      .from("notifications")
      .update({ status: "failed", error: result.error ?? "Unknown error" })
      .eq("id", n.id);
    await fallBackToText(supabase, n, senderId);
    return "failed";
  }

  const result = await deliver(n.recipient, n.body, senderId);
  await supabase
    .from("notifications")
    .update(
      result.ok
        ? { status: "sent", sent_at: new Date().toISOString(), error: null }
        : { status: "failed", error: result.error ?? "Unknown error" }
    )
    .eq("id", n.id);
  return result.ok ? "sent" : "failed";
}

/**
 * The WhatsApp message did not go, so send a text instead.
 *
 * A new row rather than a retry of the old one, so the Messages page tells
 * the truth: WhatsApp failed, and here is the text that went in its place.
 * Called from dispatch() when Meta refuses a message outright, and from the
 * webhook when Meta accepted it and then could not deliver it, which is
 * what happens to a number that is not on WhatsApp.
 */
export async function fallBackToText(
  supabase: SupabaseClient,
  n: Pick<
    QueuedNotification,
    "organization_id" | "member_id" | "type" | "recipient" | "body" | "params"
  >,
  senderId: string | null
): Promise<void> {
  if (tooLate(n)) return;

  const reminder = reminderOf(n);
  const body = reminder ? templates.meetingReminder(reminder) : n.body;

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      organization_id: n.organization_id,
      member_id: n.member_id,
      type: n.type,
      channel: "sms",
      recipient: n.recipient,
      body,
      params: n.params ?? null,
      status: providerStatus().configured ? "queued" : "no_provider",
    })
    .select(QUEUED_COLUMNS)
    .single();

  if (error || !data) return;
  if (!providerStatus().configured) return;

  // Sent now rather than on the next run, because the next run is five
  // minutes of a thirty minute warning.
  await dispatch(supabase, data as QueuedNotification, senderId);
}
