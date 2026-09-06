"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsRow } from "@/lib/owns";
import { can } from "@/lib/permissions";
import { SERVICE_TYPES, values } from "@/lib/constants";

function count(formData: FormData, key: string) {
  const n = Number(String(formData.get(key) ?? "0").trim() || 0);
  // Negative or non-numeric counts are nonsense; clamp rather than reject so
  // a mistyped field doesn't lose the whole entry.
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export async function recordAttendance(formData: FormData) {
  const { userId, membership } = await getMembership();
  if (!membership || !userId) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "attendance.write")) {
    redirect(`/attendance?error=${encodeURIComponent("You do not have permission to record attendance.")}`);
  }

  const serviceType = String(formData.get("serviceType") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const maleCount = count(formData, "maleCount");
  const femaleCount = count(formData, "femaleCount");

  if (!date) {
    redirect("/attendance?error=Pick the date of the service.");
  }
  if (!values(SERVICE_TYPES).includes(serviceType)) {
    redirect("/attendance?error=Pick a service type.");
  }
  if (maleCount + femaleCount === 0) {
    redirect("/attendance?error=Enter at least one attendee.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("attendance_records").insert({
    organization_id: membership.organization.id,
    service_type: serviceType,
    date,
    male_count: maleCount,
    female_count: femaleCount,
    recorded_by_profile_id: userId,
  });

  if (error) {
    redirect(`/attendance?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  redirect(
    `/attendance?message=${encodeURIComponent(
      `Recorded ${maleCount + femaleCount} attendees.`
    )}`
  );
}

/**
 * Saves the whole attendance roll for one service in a single request.
 *
 * Replaces the previous per-member toggle, which cost a full page reload per
 * tick. Only the difference is written: a service where two people changed
 * costs two rows, not the entire register.
 */
export async function saveCheckIns(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "attendance.write")) {
    redirect(
      `/attendance?error=${encodeURIComponent("You do not have permission to record attendance.")}`
    );
  }

  const recordId = String(formData.get("recordId") ?? "");
  if (!recordId) {
    redirect(`/attendance?error=${encodeURIComponent("Missing service.")}`);
  }

  // The service must be ours before anything is written against it.
  if (!(await ownsRow("attendance_records", recordId, membership.organization.id))) {
    redirect(
      `/attendance?error=${encodeURIComponent("That service is not in your church.")}`
    );
  }

  let requested: string[];
  try {
    const parsed = JSON.parse(String(formData.get("present") ?? "[]"));
    requested = Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    redirect(`/attendance/${recordId}?error=${encodeURIComponent("Could not read the attendance list.")}`);
  }

  const supabase = await createClient();

  // Only members of this church count. RLS already hides everyone else, so
  // this both validates the submission and silently drops anything foreign
  // rather than failing the whole save.
  const { data: ourMembers } = await supabase
    .from("members")
    .select("id")
    .eq("status", "active");

  const allowed = new Set((ourMembers ?? []).map((m) => m.id as string));
  const present = new Set(requested.filter((id) => allowed.has(id)));

  const { data: existingRows } = await supabase
    .from("attendance_check_ins")
    .select("member_id")
    .eq("attendance_record_id", recordId);

  const existing = new Set((existingRows ?? []).map((r) => r.member_id as string));

  const toAdd = [...present].filter((id) => !existing.has(id));
  const toRemove = [...existing].filter((id) => !present.has(id));

  if (toAdd.length > 0) {
    const { error } = await supabase.from("attendance_check_ins").insert(
      toAdd.map((memberId) => ({
        organization_id: membership.organization.id,
        attendance_record_id: recordId,
        member_id: memberId,
      }))
    );
    // 23505 is the unique constraint: someone else saved the same person
    // while this page was open, which is the desired end state anyway.
    if (error && error.code !== "23505") {
      redirect(`/attendance/${recordId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  if (toRemove.length > 0) {
    const { error } = await supabase
      .from("attendance_check_ins")
      .delete()
      .eq("attendance_record_id", recordId)
      .in("member_id", toRemove);
    if (error) {
      redirect(`/attendance/${recordId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/attendance/${recordId}`);
  revalidatePath("/insights");
  revalidatePath("/dashboard");

  const changed = toAdd.length + toRemove.length;
  redirect(
    `/attendance/${recordId}?message=${encodeURIComponent(
      changed === 0
        ? "Nothing to save."
        : `Attendance saved. ${present.size} present.`
    )}`
  );
}
