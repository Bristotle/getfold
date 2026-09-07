"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can, assignableRoles } from "@/lib/permissions";

// Which roles this caller may hand out depends on their own. Only the
// person who holds the church can appoint another pastor, so an
// administrator cannot quietly promote themselves to owner.

export async function inviteMember(formData: FormData) {
  const { userId, membership } = await getMembership();
  if (!membership || !userId) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(
      `/team?error=${encodeURIComponent("Only an administrator can invite people.")}`
    );
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const role = String(formData.get("role") ?? "member");

  if (!email || !email.includes("@")) {
    redirect(`/team?error=${encodeURIComponent("Enter a valid email address.")}`);
  }
  if (!(assignableRoles(membership.role) as string[]).includes(role)) {
    redirect(`/team?error=${encodeURIComponent("You cannot assign that role.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.from("organization_invitations").insert({
    organization_id: membership.organization.id,
    email,
    role,
    invited_by_profile_id: userId,
  });

  if (error) {
    // (organization_id, email) is UNIQUE, a repeat invite is a duplicate,
    // not a mysterious failure.
    const msg =
      error.code === "23505"
        ? `${email} has already been invited.`
        : error.message;
    redirect(`/team?error=${encodeURIComponent(msg)}`);
  }

  revalidatePath("/team");
  redirect(
    `/team?message=${encodeURIComponent(
      `${email} invited. They'll join automatically when they sign up with that address.`
    )}`
  );
}

export async function revokeInvitation(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(`/team?error=${encodeURIComponent("Not permitted.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/team?error=${encodeURIComponent("Missing invitation.")}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_invitations")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/team?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/team");
  redirect(`/team?message=${encodeURIComponent("Invitation revoked.")}`);
}

export async function changeRole(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(
      `/team?error=${encodeURIComponent("Only an administrator can change roles.")}`
    );
  }

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!id) redirect(`/team?error=${encodeURIComponent("Missing member.")}`);
  if (!(assignableRoles(membership.role) as string[]).includes(role)) {
    redirect(`/team?error=${encodeURIComponent("You cannot assign that role.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .update({ role })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) {
    // The prevent_last_admin_removal trigger raises 23514 with a message
    // written for a human, pass it straight through.
    redirect(`/team?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/team");
  revalidatePath("/", "layout");
  redirect(`/team?message=${encodeURIComponent("Role updated.")}`);
}

export async function removeMember(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(`/team?error=${encodeURIComponent("Not permitted.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect(`/team?error=${encodeURIComponent("Missing member.")}`);

  const supabase = await createClient();
  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/team?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/team");
  redirect(
    `/team?message=${encodeURIComponent(
      "Removed from this church. Their account still exists."
    )}`
  );
}

/**
 * Turns any invitation addressed to the signed-in user's email into real
 * membership. Called from /onboarding, which is where someone with no church
 * ends up.
 */
export async function acceptInvitations() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_pending_invitations");

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }
  if (!data) {
    redirect(
      `/onboarding?error=${encodeURIComponent("No pending invitation was found for your email address.")}`
    );
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
