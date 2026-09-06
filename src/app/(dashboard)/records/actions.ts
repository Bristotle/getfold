"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsOptionalRow } from "@/lib/owns";
import { can } from "@/lib/permissions";
import { VITAL_RECORD_TYPES, values } from "@/lib/constants";

export async function createVitalRecord(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "records.write")) {
    redirect(`/records?error=${encodeURIComponent("You do not have permission to change records.")}`);
  }

  const type = String(formData.get("type") ?? "");
  const date = String(formData.get("date") ?? "").trim();
  const memberId = String(formData.get("memberId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!values(VITAL_RECORD_TYPES).includes(type)) {
    redirect("/records?error=Pick a record type.");
  }
  if (!date) redirect("/records?error=Pick the date.");

  const supabase = await createClient();

  if (!(await ownsOptionalRow("members", memberId || null, membership.organization.id))) {
    redirect(`/records?error=${encodeURIComponent("That member is not in your church.")}`);
  }

  const { error } = await supabase.from("vital_records").insert({
    organization_id: membership.organization.id,
    // Optional on purpose: a wedding may involve someone not on the register,
    // and a baptism is often recorded before membership is granted.
    member_id: memberId || null,
    type,
    date,
    note: note || null,
  });

  if (error) redirect(`/records?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/records");
  redirect("/records?message=Record saved.");
}

export async function deleteVitalRecord(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "records.write")) {
    redirect(`/records?error=${encodeURIComponent("You do not have permission to change records.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/records?error=Missing record id.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("vital_records")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/records?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/records");
  redirect("/records?message=Record deleted.");
}
