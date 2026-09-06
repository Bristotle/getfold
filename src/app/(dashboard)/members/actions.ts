"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { queueMessage } from "@/lib/notify";
import { templates } from "@/lib/messaging";

const GENDERS = ["male", "female"];

function clean(formData: FormData, key: string) {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export async function createMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) {
    redirect("/members?error=A member needs a full name.");
  }

  const gender = clean(formData, "gender");
  const dateOfBirth = clean(formData, "dateOfBirth");

  const supabase = await createClient();

  // organization_id is set from the server-side membership, never from the
  // form — a client-supplied value would be an obvious tenant-crossing hole.
  // RLS would reject it anyway (the insert policy checks org_role against
  // this column), but not sending it at all is the stronger guarantee.
  const { error } = await supabase.from("members").insert({
    organization_id: membership.organization.id,
    full_name: fullName,
    gender: gender && GENDERS.includes(gender) ? gender : null,
    date_of_birth: dateOfBirth,
    phone: clean(formData, "phone"),
    email: clean(formData, "email"),
    address: clean(formData, "address"),
    member_type: clean(formData, "memberType"),
  });

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  // Best-effort: a failure to queue the welcome must not undo adding the
  // member, so queueMessage swallows its own errors.
  await queueMessage({
    organizationId: membership.organization.id,
    type: "welcome",
    phone: clean(formData, "phone"),
    body: templates.welcome(membership.organization.name, fullName),
  });

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect(`/members?message=${encodeURIComponent(`${fullName} added.`)}`);
}

export async function archiveMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const supabase = await createClient();

  // Archive rather than delete: contributions, attendance and vital records
  // reference members, and a church's history shouldn't disappear because
  // someone left. The scoping .eq on organization_id is belt-and-braces on
  // top of the RLS update policy.
  const { error } = await supabase
    .from("members")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect("/members?message=Member archived.");
}

export async function updateMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!fullName) redirect(`/members/${id}?error=A member needs a full name.`);

  const gender = clean(formData, "gender");
  const groupId = String(formData.get("memberGroupId") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({
      full_name: fullName,
      gender: gender && GENDERS.includes(gender) ? gender : null,
      date_of_birth: clean(formData, "dateOfBirth"),
      phone: clean(formData, "phone"),
      email: clean(formData, "email"),
      address: clean(formData, "address"),
      member_type: clean(formData, "memberType"),
      member_group_id: groupId || null,
    })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath(`/members/${id}`);
  redirect(`/members/${id}?message=Changes saved.`);
}

export async function restoreMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/members?error=${encodeURIComponent("You do not have permission to change members.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/members?error=Missing member id.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ status: "active", archived_at: null })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/members?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect("/members?message=Member restored.");
}
