"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { createInvoicePaymentLink, invoiceReference } from "@/lib/paystack";

/**
 * Produces a payment link for an invoice and hands the church to Paystack.
 *
 * The link is stored on the invoice so returning to the page reuses the
 * same one rather than opening a second transaction for the same quarter,
 * which is how a church ends up paying twice and nobody notices until the
 * treasurer does.
 */
export async function payInvoice(formData: FormData) {
  const { membership, email } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "finance.view")) {
    redirect(
      `/billing?error=${encodeURIComponent(
        "Only the pastor, an administrator or a finance officer can pay an invoice."
      )}`
    );
  }

  const invoiceId = String(formData.get("invoiceId") ?? "");
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, amount_pesewas, period_start, period_end, status, paystack_authorization_url")
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) redirect("/billing?error=Could not find that invoice.");
  if (invoice.status === "paid") redirect("/billing?message=That invoice is already paid.");

  // Reuse an existing link rather than opening a second transaction.
  if (invoice.paystack_authorization_url) {
    // Off site by design: typedRoutes only knows our own routes.
    redirect(invoice.paystack_authorization_url as Route);
  }

  const reference = invoiceReference(
    membership.organization.slug,
    invoice.period_start as string
  );

  const result = await createInvoicePaymentLink({
    email: email ?? `billing+${membership.organization.slug}@example.com`,
    amountPesewas: invoice.amount_pesewas as number,
    reference,
    churchName: membership.organization.name,
    periodLabel: `${invoice.period_start} to ${invoice.period_end}`,
  });

  if (!result.ok) {
    redirect(`/billing?error=${encodeURIComponent(result.error)}`);
  }

  await supabase
    .from("invoices")
    .update({
      paystack_reference: reference,
      paystack_authorization_url: result.url,
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  revalidatePath("/billing");
  redirect(result.url as Route);
}
