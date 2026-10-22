"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can, assignableRoles } from "@/lib/permissions";
import { friendly } from "@/lib/errors";
import { sendEmail } from "@/lib/email";
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/permissions";

/**
 * Tells somebody they have been invited.
 *
 * Inviting only ever wrote a row: the person joined when they happened to
 * sign up with that address, and nothing told them to. The first pastor to
 * invite a team waited for people who had no idea they were expected. This
 * is the email that should always have gone.
 *
 * Replies go to the person who invited them, not to Fold, because "is this
 * really from you?" is the right question and the inviter is who answers.
 */
async function sendInvitation(i: {
  email: string;
  role: string;
  church: string;
  inviterName: string;
  inviterEmail: string | null;
}) {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";
  const signup = `${site}/signup?email=${encodeURIComponent(i.email)}`;
  const role = ROLE_LABELS[i.role] ?? i.role;
  const what = ROLE_DESCRIPTIONS[i.role];

  return sendEmail({
    to: i.email,
    replyTo: i.inviterEmail,
    subject: `${i.inviterName} invited you to ${i.church} on Fold`,
    text: [
      `Hello,`,
      ``,
      `${i.inviterName} has invited you to help run ${i.church} on Fold, as ${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}.${what ? ` ${what}` : ""}`,
      ``,
      `To accept, create your account with this email address, ${i.email}:`,
      ``,
      `  ${signup}`,
      ``,
      `Confirm the address from the email that follows, log in, and press "Join" on the first screen. You will be in ${i.church} straight away.`,
      ``,
      `Already have a Fold account with this address? Just log in at ${site}/login and you will be offered the invitation.`,
      ``,
      `If you were not expecting this, reply and ${i.inviterName} will see your message, or simply ignore it.`,
      ``,
      `Fold`,
      `Church management software, made in Ghana`,
    ].join("\n"),
  });
}

/** Who is inviting, for the email: their name and the address replies go to. */
async function inviter(userId: string) {
  const supabase = await createClient();
  const [{ data: me }, { data: auth }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle<{ full_name: string | null }>(),
    supabase.auth.getUser(),
  ]);
  return {
    name: me?.full_name?.trim() || "Your pastor",
    email: auth.user?.email ?? null,
  };
}

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

  const who = await inviter(userId);
  const sent = await sendInvitation({
    email,
    role,
    church: membership.organization.name,
    inviterName: who.name,
    inviterEmail: who.email,
  });

  revalidatePath("/team");
  if (!sent.ok) {
    redirect(
      `/team?error=${encodeURIComponent(
        `${email} is invited, but the email did not send (${sent.error}). Ask them to sign up at getfold.org/signup with that address, and they will join automatically.`
      )}`
    );
  }
  redirect(
    `/team?message=${encodeURIComponent(
      `Invitation emailed to ${email}. Ask them to check their spam folder too. They join as soon as they sign up with that address.`
    )}`
  );
}

/**
 * Emails a pending invitation again. For anybody invited before invitations
 * sent email at all, and for anybody whose first email went to spam.
 */
export async function resendInvitation(formData: FormData) {
  const { userId, membership } = await getMembership();
  if (!membership || !userId) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(`/team?error=${encodeURIComponent("Only an administrator can invite people.")}`);
  }

  const supabase = await createClient();
  const { data: invite } = await supabase
    .from("organization_invitations")
    .select("email, role, accepted_at")
    .eq("id", String(formData.get("id") ?? ""))
    .eq("organization_id", membership.organization.id)
    .maybeSingle<{ email: string; role: string; accepted_at: string | null }>();

  if (!invite || invite.accepted_at) {
    redirect(`/team?error=${encodeURIComponent("That invitation is no longer pending.")}`);
  }

  const who = await inviter(userId);
  const sent = await sendInvitation({
    email: invite.email,
    role: invite.role,
    church: membership.organization.name,
    inviterName: who.name,
    inviterEmail: who.email,
  });

  redirect(
    sent.ok
      ? `/team?message=${encodeURIComponent(`Invitation emailed to ${invite.email} again. Ask them to check their spam folder too.`)}`
      : `/team?error=${encodeURIComponent(`The email did not send (${sent.error}). Ask ${invite.email} to sign up at getfold.org/signup with that address.`)}`
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

  if (error) redirect(`/team?error=${encodeURIComponent(friendly(error))}`);

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
    redirect(`/team?error=${encodeURIComponent(friendly(error))}`);
  }

  revalidatePath("/team");
  // Deliberately NOT revalidatePath("/", "layout"). Every authenticated
  // page is already rendered per request, so revalidating them changes
  // nothing, while "/" with "layout" invalidated all ~50 static marketing
  // and help pages on every single sign in. That was the largest source of
  // ISR writes on the project and none of it was needed.
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

  if (error) redirect(`/team?error=${encodeURIComponent(friendly(error))}`);

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
    redirect(`/onboarding?error=${encodeURIComponent(friendly(error))}`);
  }
  if (!data) {
    redirect(
      `/onboarding?error=${encodeURIComponent("No pending invitation was found for your email address.")}`
    );
  }

  redirect("/dashboard");
}

/**
 * Clears every record the church typed in, to start again.
 *
 * All of the deciding happens in reset_church() in the database: that only
 * the pastor may, that the church's name was typed exactly, and what is
 * kept. This only asks, and says what happened.
 */
export async function resetChurch(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "org.transfer")) {
    redirect(`/team?error=${encodeURIComponent("Only the pastor can clear the church's records.")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_church", {
    org_id: membership.organization.id,
    confirm_name: String(formData.get("confirmName") ?? ""),
  });
  if (error) redirect(`/team?error=${encodeURIComponent(friendly(error))}`);

  revalidatePath("/", "layout");
  redirect(
    `/team?message=${encodeURIComponent(
      "Everything was cleared. Your team, invoices and online payment records were kept."
    )}`
  );
}
