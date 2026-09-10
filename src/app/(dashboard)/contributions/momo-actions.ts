"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { ownsOptionalRow } from "@/lib/owns";
import { can } from "@/lib/permissions";
import { toE164 } from "@/lib/messaging";
import {
  initiateMomoCharge,
  newReference,
  paystackStatus,
  verifyTransaction,
  MOMO_PROVIDERS,
  type MomoProvider,
} from "@/lib/paystack";
import { CONTRIBUTION_TYPES, values } from "@/lib/constants";

export async function collectByMomo(formData: FormData) {
  const { userId, membership } = await getMembership();
  if (!membership || !userId) redirect("/onboarding");
  if (!can(membership.role, "finance.write")) {
    redirect(
      `/contributions?error=${encodeURIComponent("You do not have permission to collect payments.")}`
    );
  }

  const status = paystackStatus();
  if (!status.configured) {
    redirect(
      `/contributions?error=${encodeURIComponent(
        `Paystack is not connected. Add ${status.missing.join(", ")} to .env.`
      )}`
    );
  }

  const rawAmount = String(formData.get("amount") ?? "").trim();
  const amount = Number(rawAmount);
  const provider = String(formData.get("provider") ?? "mtn") as MomoProvider;
  const type = String(formData.get("type") ?? "tithe");
  const memberId = String(formData.get("memberId") ?? "").trim();
  const rawPhone = String(formData.get("phone") ?? "").trim();

  if (!rawAmount || !Number.isFinite(amount) || amount <= 0) {
    redirect(`/contributions?error=${encodeURIComponent("Enter an amount greater than zero.")}`);
  }
  if (!MOMO_PROVIDERS.some((p) => p.value === provider)) {
    redirect(`/contributions?error=${encodeURIComponent("Pick a mobile money network.")}`);
  }
  if (!values(CONTRIBUTION_TYPES).includes(type)) {
    redirect(`/contributions?error=${encodeURIComponent("Pick a contribution type.")}`);
  }

  const phone = toE164(rawPhone);
  if (!phone) {
    redirect(
      `/contributions?error=${encodeURIComponent("Enter a valid Ghanaian mobile money number.")}`
    );
  }

  const supabase = await createClient();

  if (!(await ownsOptionalRow("members", memberId || null, membership.organization.id))) {
    redirect(`/contributions?error=${encodeURIComponent("That member is not in your church.")}`);
  }

  // Server-side duplicate guard. SubmitButton disables on the client, but a
  // dropped response, a retried request or a second tab can still deliver
  // two identical submissions, and each one charges a member's phone for
  // real. If the same number is already being asked for the same amount,
  // treat the second attempt as the duplicate it almost certainly is.
  const since = new Date(Date.now() - 3 * 60 * 1000).toISOString();
  const { data: inFlight } = await supabase
    .from("payments")
    .select("id")
    .eq("phone", phone)
    .eq("amount", amount.toFixed(2))
    .eq("status", "pending")
    .gte("created_at", since)
    .limit(1);

  if (inFlight && inFlight.length > 0) {
    redirect(
      `/contributions?error=${encodeURIComponent(
        "A prompt for that amount was already sent to this number in the last few minutes. Ask them to check their phone, or use Check status below."
      )}`
    );
  }

  const reference = newReference(membership.organization.slug);

  // The payment row is written BEFORE calling Paystack. If the request
  // succeeds but the response is lost, the webhook still finds a record to
  // settle against, the alternative loses real money.
  const { error: insertError } = await supabase.from("payments").insert({
    organization_id: membership.organization.id,
    member_id: memberId || null,
    reference,
    amount: amount.toFixed(2),
    provider,
    phone,
    type,
    status: "pending",
  });

  // Where does this money land?
  //
  // Refuse outright rather than charging without a destination. A charge
  // with no subaccount settles into FOLD's account, which would mean
  // holding a church's tithes: a trust problem, and Bank of Ghana territory
  // we have no licence for. Better to send the pastor to set it up than to
  // take a member's money into the wrong account.
  const { data: settlement } = await supabase
    .from("organizations")
    .select("paystack_subaccount_code")
    .eq("id", membership.organization.id)
    .maybeSingle();

  if (!settlement?.paystack_subaccount_code) {
    redirect(
      `/payouts?error=${encodeURIComponent(
        "Set where your giving should be paid before taking mobile money. Cash giving needs nothing set up."
      )}`
    );
  }

  if (insertError) {
    redirect(`/contributions?error=${encodeURIComponent(insertError.message)}`);
  }

  // Paystack requires an email, but most members have none. We fall back to
  // an address on example.com, reserved by RFC 2606, so it can never reach
  // a real person, while still passing Paystack's validator.
  //
  // NOT example.invalid: that TLD is equally reserved but Paystack rejects
  // it outright ("email must be a valid email"), which would have failed
  // every anonymous collection.
  const { data: member } = memberId
    ? await supabase.from("members").select("email").eq("id", memberId).maybeSingle()
    : { data: null };

  const email =
    member?.email || `giving+${membership.organization.slug}@example.com`;

  const result = await initiateMomoCharge({
    email,
    amountCedis: amount,
    phone,
    provider,
    reference,
    subaccount: settlement.paystack_subaccount_code,
  });

  if (!result.ok) {
    await supabase
      .from("payments")
      .update({ status: "failed", gateway_response: result.error })
      .eq("reference", reference);
    redirect(`/contributions?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/contributions");
  redirect(
    `/contributions?message=${encodeURIComponent(
      result.displayText ??
        "Prompt sent. Ask them to approve it on their phone, it will appear here once confirmed."
    )}`
  );
}

/**
 * Asks Paystack what happened to a pending payment, and settles it.
 *
 * A webhook can be missed, a deploy mid-flight, a transient 500, a URL not
 * yet configured, so the record must never depend solely on receiving one.
 * This is the manual reconciliation path, and it must be able to complete a
 * payment, not merely report on it.
 */
export async function refreshPayment(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "finance.write")) {
    redirect(`/contributions?error=${encodeURIComponent("Not permitted.")}`);
  }

  const reference = String(formData.get("reference") ?? "");
  if (!reference) redirect(`/contributions?error=${encodeURIComponent("Missing reference.")}`);

  const result = await verifyTransaction(reference);
  if (!result.ok) {
    redirect(`/contributions?error=${encodeURIComponent(result.error)}`);
  }

  const supabase = await createClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, member_id, type, phone, contribution_id, status")
    .eq("reference", reference)
    .eq("organization_id", membership.organization.id)
    .maybeSingle();

  if (!payment) {
    redirect(`/contributions?error=${encodeURIComponent("Payment not found.")}`);
  }

  if (result.status !== "success") {
    await supabase
      .from("payments")
      .update({
        status:
          result.status === "abandoned"
            ? "abandoned"
            : result.status === "failed"
              ? "failed"
              : "pending",
        gateway_response: result.gatewayResponse,
      })
      .eq("id", payment.id);

    revalidatePath("/contributions");
    redirect(
      `/contributions?message=${encodeURIComponent(`Paystack says: ${result.status}.`)}`
    );
  }

  // Already settled, here or by the webhook.
  if (payment.contribution_id) {
    revalidatePath("/contributions");
    redirect(`/contributions?message=${encodeURIComponent("Already recorded.")}`);
  }

  const { data: contribution, error: cErr } = await supabase
    .from("contributions")
    .insert({
      organization_id: membership.organization.id,
      member_id: payment.member_id,
      type: payment.type,
      amount: result.amountCedis.toFixed(2),
      payment_method: "momo",
      note: `Mobile money · ${payment.phone}`,
    })
    .select("id")
    .single();

  if (cErr || !contribution) {
    redirect(
      `/contributions?error=${encodeURIComponent(cErr?.message ?? "Could not record the contribution.")}`
    );
  }

  // Claim the payment only if nothing else has. The webhook may be doing
  // exactly this at the same moment; `is("contribution_id", null)` means
  // whichever arrives second updates no rows and cleans up after itself,
  // so a single payment can never produce two contributions.
  const { data: claimed } = await supabase
    .from("payments")
    .update({
      status: "success",
      contribution_id: contribution.id,
      gateway_response: result.gatewayResponse,
    })
    .eq("id", payment.id)
    .is("contribution_id", null)
    .select("id");

  if (!claimed || claimed.length === 0) {
    // The webhook won the race, remove the duplicate we just created.
    await supabase.from("contributions").delete().eq("id", contribution.id);
    revalidatePath("/contributions");
    redirect(`/contributions?message=${encodeURIComponent("Already recorded.")}`);
  }

  revalidatePath("/contributions");
  revalidatePath("/dashboard");
  redirect(
    `/contributions?message=${encodeURIComponent(
      `Payment confirmed and recorded (GHS ${result.amountCedis.toFixed(2)}).`
    )}`
  );
}
