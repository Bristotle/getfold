"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { friendly } from "@/lib/errors";

const REMIND_CHOICES = [10, 15, 30, 60, 120];

function fail(message: string): never {
  redirect(`/meetings?error=${encodeURIComponent(message)}`);
}

/**
 * Reads and checks the meeting form. Every problem is reported in words a
 * secretary can act on, rather than left to the database constraint.
 */
function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) fail("Give the meeting a name, for example Tuesday Prayer Meeting.");
  if (title.length > 80) fail("Keep the name under 80 characters.");

  const weekdays = formData
    .getAll("weekday")
    .map((v) => Number(v))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  if (weekdays.length === 0) fail("Tick at least one day the meeting happens.");

  const startsAt = String(formData.get("startsAt") ?? "").trim();
  if (!/^\d{2}:\d{2}$/.test(startsAt)) fail("Choose the time the meeting starts.");

  const rawUrl = String(formData.get("joinUrl") ?? "").trim();
  let joinUrl: string;
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "https:") throw new Error();
    joinUrl = u.toString();
  } catch {
    fail(
      "Paste the full link people use to join, starting with https://, for example https://meet.google.com/abc-defg-hij."
    );
  }
  if (joinUrl.length > 300) fail("That link is too long. Copy the short one from Google Meet.");

  const minutes = Number(formData.get("remindMinutes"));
  const remindMinutes = REMIND_CHOICES.includes(minutes) ? minutes : 30;

  // Blank means Fold's wording, stored as null so a better default later
  // still reaches every church that never wrote its own.
  const message = String(formData.get("message") ?? "").trim() || null;
  if (message && message.length > 480) {
    fail(
      `Keep the message under 480 characters. Yours is ${message.length}. Every 160 characters is another text for each member.`
    );
  }

  return {
    title,
    weekdays: [...new Set(weekdays)].sort(),
    starts_at: startsAt,
    join_url: joinUrl,
    remind_minutes: remindMinutes,
    message,
  };
}

async function leader() {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "org.manage")) {
    fail("Only the pastor or an administrator can change meeting reminders.");
  }
  return membership;
}

export async function createMeeting(formData: FormData) {
  const membership = await leader();
  const meeting = readForm(formData);

  const supabase = await createClient();
  const { error } = await supabase.from("meetings").insert({
    organization_id: membership.organization.id,
    ...meeting,
  });
  if (error) fail(friendly(error));

  revalidatePath("/meetings");
  redirect(
    `/meetings?message=${encodeURIComponent(
      `${meeting.title} saved. Members will be reminded ${meeting.remind_minutes} minutes before it starts.`
    )}`
  );
}

export async function updateMeeting(formData: FormData) {
  const membership = await leader();
  const id = String(formData.get("id") ?? "");
  if (!id) fail("Missing meeting id.");
  const meeting = readForm(formData);

  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .update({ ...meeting, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);
  if (error) fail(friendly(error));

  revalidatePath("/meetings");
  redirect("/meetings?message=Changes saved.");
}

export async function setMeetingEnabled(formData: FormData) {
  const membership = await leader();
  const id = String(formData.get("id") ?? "");
  const enabled = formData.get("enabled") === "true";
  if (!id) fail("Missing meeting id.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("meetings")
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);
  if (error) fail(friendly(error));

  revalidatePath("/meetings");
  redirect(
    `/meetings?message=${encodeURIComponent(
      enabled ? "Reminders are back on." : "Reminders paused. Nothing will be sent until you turn them back on."
    )}`
  );
}

export async function deleteMeeting(formData: FormData) {
  const membership = await leader();
  const id = String(formData.get("id") ?? "");
  if (!id) fail("Missing meeting id.");

  const supabase = await createClient();
  // Reminders already sent stay on the Messages page. They belong to the
  // member's history, not the meeting's.
  const { error } = await supabase
    .from("meetings")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);
  if (error) fail(friendly(error));

  revalidatePath("/meetings");
  redirect("/meetings?message=Meeting removed. No more reminders will go out for it.");
}
