"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsRow } from "@/lib/owns";
import { can } from "@/lib/permissions";

export async function requestTransfer(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "people.write")) {
    redirect(`/transfers?error=${encodeURIComponent("You do not have permission to request transfers.")}`);
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  if (!memberId) redirect("/transfers?error=Pick the member transferring.");

  const supabase = await createClient();

  if (!(await ownsRow("members", memberId, membership.organization.id))) {
    redirect(`/transfers?error=${encodeURIComponent("That member is not in your church.")}`);
  }

  // One open request per member: a second pending row would make the
  // approve/reject outcome ambiguous.
  const { data: existing } = await supabase
    .from("member_transfers")
    .select("id")
    .eq("member_id", memberId)
    .eq("status", "pending")
    .limit(1);

  if (existing && existing.length > 0) {
    redirect("/transfers?error=That member already has a pending transfer.");
  }

  const { error } = await supabase.from("member_transfers").insert({
    organization_id: membership.organization.id,
    member_id: memberId,
    // to_organization_id stays null unless the receiving church also uses
    // Fold. Recording the request is what matters; the destination is often
    // a church outside the system entirely.
    status: "pending",
  });

  if (error) redirect(`/transfers?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/transfers");
  revalidatePath("/dashboard");
  redirect("/transfers?message=Transfer requested.");
}

async function resolve(formData: FormData, status: "approved" | "rejected") {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // Approving marks a member transferred out, so it is an admin decision.
  if (!can(membership.role, "transfers.manage")) {
    redirect(`/transfers?error=${encodeURIComponent("Only an administrator can approve or reject a transfer.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/transfers?error=Missing transfer id.");

  const supabase = await createClient();

  const { data: transfer } = await supabase
    .from("member_transfers")
    .select("id, member_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!transfer) redirect("/transfers?error=Could not find that transfer.");
  if (transfer.status !== "pending") {
    redirect("/transfers?error=That transfer has already been resolved.");
  }

  const { error } = await supabase
    .from("member_transfers")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/transfers?error=${encodeURIComponent(error.message)}`);

  // Approving a transfer is what actually moves the member off the active
  // register. Rejecting leaves them exactly as they were.
  if (status === "approved") {
    const { error: memberError } = await supabase
      .from("members")
      .update({ status: "transferred_out" })
      .eq("id", transfer.member_id)
      .eq("organization_id", membership.organization.id);

    if (memberError) {
      redirect(
        `/transfers?error=${encodeURIComponent(
          `Transfer approved, but the member's status could not be updated: ${memberError.message}`
        )}`
      );
    }
  }

  revalidatePath("/transfers");
  revalidatePath("/members");
  revalidatePath("/dashboard");
  redirect(
    `/transfers?message=Transfer ${status}.${
      status === "approved" ? " The member is now marked transferred out." : ""
    }`
  );
}

export async function approveTransfer(formData: FormData) {
  await resolve(formData, "approved");
}

export async function rejectTransfer(formData: FormData) {
  await resolve(formData, "rejected");
}
