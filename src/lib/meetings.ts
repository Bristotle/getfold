import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  toE164,
  providerStatus,
  whatsappStatus,
  templates,
  meetingReminderWhatsAppText,
  type MeetingReminder,
} from "@/lib/messaging";

/** Sunday first, matching Postgres extract(dow) and the meetings table. */
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/** "Tuesday and Friday at 7:00 pm", the way a church would say it. */
export function describeSchedule(weekdays: number[], startsAt: string) {
  const days = [...weekdays].sort((a, b) => a - b);
  const names =
    days.length === 7
      ? "Every day"
      : days.length === 1
        ? WEEKDAYS[days[0]]
        : `${days.slice(0, -1).map((d) => WEEKDAYS[d]).join(", ")} and ${WEEKDAYS[days[days.length - 1]]}`;

  const [h, m] = startsAt.split(":").map(Number);
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const time = `${hour12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  return `${names} at ${time}`;
}

/**
 * A link that opens WhatsApp with the reminder already written, for the
 * leader to post into the church's own group.
 *
 * This is the route that works today. Fold sending WhatsApp messages
 * itself needs Meta to approve the Fold number and the template first,
 * but anybody can share text into a WhatsApp group from their own phone,
 * and for a congregation that already lives in one group it is the most
 * natural place for the link anyway. wa.me with no number lets them pick
 * the group or a broadcast list.
 */
export function whatsappShareUrl(
  church: string,
  title: string,
  weekdays: number[],
  startsAt: string,
  joinUrl: string
) {
  const when = describeSchedule(weekdays, startsAt).replace(/^.* at /, "");
  const text = `${church}: ${title} starts at ${when}.\n\nJoin here: ${joinUrl}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

type Due = {
  meeting_id: string;
  organization_id: string;
  organization_name: string;
  title: string;
  join_url: string;
  remind_minutes: number;
  occurs_at: string;
};

/**
 * Queues a reminder for every active member of every church whose meeting
 * is coming up. Called by the five minute job just before it sends, with
 * the service role, so the reminders queued here go out in the same run.
 *
 * Each occurrence is claimed before anything is queued, by moving the
 * meeting's last_reminded_for forward only if nobody else has. Two runs that
 * overlap cannot both claim it, so nobody is reminded twice.
 */
export async function queueDueMeetingReminders(
  supabase: SupabaseClient
): Promise<{ meetings: number; queued: number }> {
  const { data, error } = await supabase.rpc("due_meeting_reminders");
  if (error || !data) return { meetings: 0, queued: 0 };

  const whatsappOn = whatsappStatus().configured;
  const smsOn = providerStatus().configured;

  let meetings = 0;
  let queued = 0;

  for (const d of data as Due[]) {
    const { data: previous } = await supabase
      .from("meetings")
      .select("last_reminded_for")
      .eq("id", d.meeting_id)
      .maybeSingle<{ last_reminded_for: string | null }>();

    const { data: claimed } = await supabase
      .from("meetings")
      .update({ last_reminded_for: d.occurs_at })
      .eq("id", d.meeting_id)
      .or(`last_reminded_for.is.null,last_reminded_for.lt.${d.occurs_at}`)
      .select("id");
    if (!claimed?.length) continue;

    const { data: members } = await supabase
      .from("members")
      .select("id, full_name, phone, whatsapp_opt_in")
      .eq("organization_id", d.organization_id)
      .eq("status", "active")
      .not("phone", "is", null)
      .limit(5000);

    /*
      One reminder per phone, not per member. A husband and wife who share
      a phone, or three children registered on their mother's number, are
      common, and four identical reminders on one phone is how a church
      gets its number blocked.
    */
    const seen = new Set<string>();
    const rows = [];
    for (const m of (members ?? []) as {
      id: string;
      full_name: string;
      phone: string | null;
      whatsapp_opt_in: boolean;
    }[]) {
      const to = toE164(m.phone);
      if (!to || seen.has(to)) continue;
      seen.add(to);

      const reminder: MeetingReminder = {
        name: m.full_name,
        title: d.title,
        church: d.organization_name,
        minutes: Math.max(
          1,
          Math.round((new Date(d.occurs_at).getTime() - Date.now()) / 60_000)
        ),
        url: d.join_url,
        startsAt: d.occurs_at,
      };

      // WhatsApp only for somebody who agreed to it. Everyone else, and
      // everyone while WhatsApp is not connected, gets a text.
      const channel = whatsappOn && m.whatsapp_opt_in ? "whatsapp" : "sms";

      rows.push({
        organization_id: d.organization_id,
        member_id: m.id,
        type: "meeting_reminder",
        channel,
        recipient: to,
        body:
          channel === "whatsapp"
            ? meetingReminderWhatsAppText(reminder)
            : templates.meetingReminder(reminder),
        params: reminder,
        status: channel === "whatsapp" || smsOn ? "queued" : "no_provider",
      });
    }

    let failed = false;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { error: insertError } = await supabase
        .from("notifications")
        .insert(batch);
      if (insertError) {
        failed = true;
        break;
      }
      inserted += batch.length;
    }
    queued += inserted;

    // Nothing was queued, so hand the occurrence back for the next run to
    // try, rather than the meeting silently going unreminded.
    if (failed && inserted === 0) {
      await supabase
        .from("meetings")
        .update({ last_reminded_for: previous?.last_reminded_for ?? null })
        .eq("id", d.meeting_id);
      continue;
    }

    meetings++;
  }

  return { meetings, queued };
}
