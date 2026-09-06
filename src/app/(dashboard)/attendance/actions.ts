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

export async function toggleCheckIn(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "attendance.write")) {
    redirect(
      `/attendance?error=${encodeURIComponent("You do not have permission to record attendance.")}`
    );
  }

  const recordId = String(formData.get("recordId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const wasPresent = String(formData.get("present") ?? "0") === "1";

  if (!recordId || !memberId) {
    redirect(`/attendance?error=${encodeURIComponent("Missing service or member.")}`);
  }

  const supabase = await createClient();

  // Both references come from the form and are otherwise unchecked.
  if (
    !(await ownsRow("attendance_records", recordId, membership.organization.id)) ||
    !(await ownsRow("members", memberId, membership.organization.id))
  ) {
    redirect(`/attendance?error=${encodeURIComponent("That service or member is not in your church.")}`);
  }

  if (wasPresent) {
    const { error } = await supabase
      .from("attendance_check_ins")
      .delete()
      .eq("attendance_record_id", recordId)
      .eq("member_id", memberId)
      .eq("organization_id", membership.organization.id);
    if (error) {
      redirect(`/attendance/${recordId}?error=${encodeURIComponent(error.message)}`);
    }
  } else {
    // (attendance_record_id, member_id) is UNIQUE, so a double-click races
    // into a duplicate-key error rather than a second row. Treat that as
    // already-done instead of surfacing it.
    const { error } = await supabase.from("attendance_check_ins").insert({
      organization_id: membership.organization.id,
      attendance_record_id: recordId,
      member_id: memberId,
    });
    if (error && error.code !== "23505") {
      redirect(`/attendance/${recordId}?error=${encodeURIComponent(error.message)}`);
    }
  }

  revalidatePath(`/attendance/${recordId}`);
  revalidatePath("/insights");
  redirect(`/attendance/${recordId}`);
}
