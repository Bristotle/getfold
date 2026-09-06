"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { GROUP_TYPES, values } from "@/lib/constants";

export async function createGroup(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/groups?error=${encodeURIComponent("You do not have permission to change groups.")}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "bible_class");
  const leaderId = String(formData.get("leaderId") ?? "").trim();

  if (!name) redirect("/groups?error=Give the group a name.");

  const supabase = await createClient();
  const { error } = await supabase.from("member_groups").insert({
    organization_id: membership.organization.id,
    name,
    type: values(GROUP_TYPES).includes(type) ? type : "other",
    leader_id: leaderId || null,
  });

  if (error) redirect(`/groups?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/groups");
  redirect(`/groups?message=${encodeURIComponent(`${name} created.`)}`);
}

export async function updateGroup(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/groups?error=${encodeURIComponent("You do not have permission to change groups.")}`);
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const leaderId = String(formData.get("leaderId") ?? "").trim();

  if (!id) redirect("/groups?error=Missing group id.");
  if (!name) redirect(`/groups/${id}?error=Give the group a name.`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("member_groups")
    .update({
      name,
      type: values(GROUP_TYPES).includes(type) ? type : "other",
      leader_id: leaderId || null,
    })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/groups/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/groups");
  revalidatePath(`/groups/${id}`);
  redirect(`/groups/${id}?message=Group updated.`);
}

export async function assignMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/groups?error=${encodeURIComponent("You do not have permission to change groups.")}`);
  }

  const groupId = String(formData.get("groupId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  if (!groupId || !memberId) {
    redirect(`/groups/${groupId}?error=Pick a member to add.`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ member_group_id: groupId })
    .eq("id", memberId)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/members");
  redirect(`/groups/${groupId}?message=Member added to group.`);
}

export async function unassignMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/groups?error=${encodeURIComponent("You do not have permission to change groups.")}`);
  }

  const groupId = String(formData.get("groupId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ member_group_id: null })
    .eq("id", memberId)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/groups/${groupId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/groups/${groupId}`);
  revalidatePath("/members");
  redirect(`/groups/${groupId}?message=Member removed from group.`);
}

export async function deleteGroup(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "people.write")) {
    redirect(`/groups?error=${encodeURIComponent("You do not have permission to change groups.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/groups?error=Missing group id.");

  const supabase = await createClient();

  // No need to detach members first: members_member_group_id_fkey is
  // ON DELETE SET NULL, so Postgres clears their group and leaves the
  // member rows themselves untouched.
  const { error } = await supabase
    .from("member_groups")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    redirect(`/groups/${id}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/groups");
  revalidatePath("/members");
  redirect("/groups?message=Group deleted. Its members were kept.");
}
