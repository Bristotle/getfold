"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import {
  createSubaccount,
  listSettlementOptions,
  settlementLabel,
} from "@/lib/paystack";

/**
 * Records where a church's giving should be paid.
 *
 * The account number reaches Paystack and is then deliberately dropped. We
 * keep only their opaque subaccount code and a label like "MTN ending
 * 2348". Holding a bank or mobile money number for every church would be a
 * liability with no corresponding benefit, since Paystack is the party that
 * actually needs it.
 */
export async function setSettlement(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  // Narrower than finance.view on purpose. Recording giving is bookkeeping;
  // deciding where the money lands is not.
  if (!can(membership.role, "org.manage")) {
    redirect(
      `/payouts?error=${encodeURIComponent(
        "Only the pastor or an administrator can set where giving is paid."
      )}`
    );
  }

  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();

  if (!bankCode || !accountNumber) {
    redirect(
      `/payouts?error=${encodeURIComponent(
        "Choose where the money should go and enter the account number."
      )}`
    );
  }

  const options = await listSettlementOptions();
  const option = options.find((o) => o.code === bankCode);
  if (!option) {
    redirect(
      `/payouts?error=${encodeURIComponent("That destination is not available.")}`
    );
  }

  const created = await createSubaccount({
    businessName: membership.organization.name,
    bankCode,
    accountNumber,
    // Zero. The church receives the whole gift less Paystack's own fee.
    // Taking a share of church giving is a decision nobody has made yet,
    // and defaulting to it quietly would be the wrong way to make it.
    percentageCharge: 0,
  });

  if (!created.ok) {
    redirect(`/payouts?error=${encodeURIComponent(created.error)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_settlement_destination", {
    org_id: membership.organization.id,
    subaccount_code: created.code,
    s_type: option.type,
    bank_code: option.code,
    label: settlementLabel(option.name, accountNumber),
  });

  if (error) {
    redirect(`/payouts?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/payouts");
  revalidatePath("/contributions");
  redirect(
    `/payouts?message=${encodeURIComponent(
      created.accountName
        ? `Set. Paystack confirmed the account name as ${created.accountName}. Giving will be paid straight there.`
        : "Set. Giving will be paid straight into that account."
    )}`
  );
}
