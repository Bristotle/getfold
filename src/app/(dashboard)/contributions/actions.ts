"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsOptionalRow } from "@/lib/owns";
import { can } from "@/lib/permissions";
import { queueMessage } from "@/lib/notify";
import { templates, toE164 } from "@/lib/messaging";
import { CONTRIBUTION_TYPES, PAYMENT_METHODS, values } from "@/lib/constants";

export async function recordContribution(formData: FormData) {
  const { userId, membership } = await getMembership();
  if (!membership || !userId) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "finance.write")) {
    redirect(`/contributions?error=${encodeURIComponent("You do not have permission to record contributions.")}`);
  }

  const type = String(formData.get("type") ?? "");
  const paymentMethod = String(formData.get("paymentMethod") ?? "cash");
  const memberId = String(formData.get("memberId") ?? "").trim();
  const fundId = String(formData.get("fundId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const rawAmount = String(formData.get("amount") ?? "").trim();

  const amount = Number(rawAmount);
  if (!rawAmount || !Number.isFinite(amount) || amount <= 0) {
    redirect("/contributions?error=Enter an amount greater than zero.");
  }
  if (!values(CONTRIBUTION_TYPES).includes(type)) {
    redirect("/contributions?error=Pick a contribution type.");
  }
  if (!values(PAYMENT_METHODS).includes(paymentMethod)) {
    redirect("/contributions?error=Pick a payment method.");
  }

  const supabase = await createClient();

  // The member id arrives from the form. Without this the row could point at
  // another church's member.
  if (!(await ownsOptionalRow("members", memberId || null, membership.organization.id))) {
    redirect(`/contributions?error=${encodeURIComponent("That member is not in your church.")}`);
  }

  const { error } = await supabase.from("contributions").insert({
    organization_id: membership.organization.id,
    // Anonymous giving is normal, an offering collected in a bowl has no
    // member attached, so member_id stays null rather than being required.
    member_id: memberId || null,
    // Earmarking is optional, general offerings belong to no fund. When a
    // fund IS set, the contributions_sync_fund trigger updates its running
    // total; nothing here writes funds.current_amount directly.
    fund_id: fundId || null,
    type,
    // Send a fixed-2dp string, not a float: the column is DECIMAL(12,2) and
    // money should never round-trip through binary floating point.
    amount: amount.toFixed(2),
    payment_method: paymentMethod,
    note: note || null,
    recorded_by_profile_id: userId,
  });

  if (error) {
    redirect(`/contributions?error=${encodeURIComponent(error.message)}`);
  }

  // Only attributed giving gets a receipt, an anonymous offering has
  // nobody to thank, and we must never guess at a recipient.
  if (memberId) {
    const { data: m } = await supabase
      .from("members")
      .select("full_name, phone")
      .eq("id", memberId)
      .maybeSingle();

    if (m && toE164(m.phone)) {
      await queueMessage({
        organizationId: membership.organization.id,
        memberId,
        type: "contribution_receipt",
        automatic: true,
        phone: m.phone,
        body: templates.contributionReceipt(
          membership.organization.name,
          m.full_name,
          amount,
          type
        ),
      });
    }
  }

  revalidatePath("/contributions");
  revalidatePath("/dashboard");
  revalidatePath("/funds");
  redirect("/contributions?message=Contribution recorded.");
}
