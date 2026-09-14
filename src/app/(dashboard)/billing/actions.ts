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
  const invoiceId = String(formData.get("invoiceId") ?? "");
  await openPaymentLink(invoiceId);
}

/**
 * Starts or renews the subscription without leaving the church's account.
 *
 * This is the gap that sent a paying customer in a circle. Billing showed
 * the band and linked to the public pricing page, whose only button starts a
 * free trial, which leads to signup, which asks a church that is already
 * signed in to create itself a second time. A pastor with money in hand
 * could not give it to us.
 *
 * Raising the invoice is the database's job, in start_subscription, which
 * decides the period rather than trusting anything sent from here. Paying
 * during a trial does not shorten it.
 */
export async function startSubscription() {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "finance.view")) {
    redirect(
      `/billing?error=${encodeURIComponent(
        "Only the pastor, an administrator or a finance officer can arrange billing."
      )}`
    );
  }

  const supabase = await createClient();
  const { data: invoiceId, error } = await supabase.rpc("start_subscription", {
    org_id: membership.organization.id,
  });

  if (error || !invoiceId) {
    /*
      The function raises readable messages for the cases a church can
      actually hit, above the self serve ceiling and a cancelled account, so
      they are passed through. Anything else is a fault at our end and says
      so rather than showing a treasurer a Postgres error.
    */
    const known =
      error?.message &&
      /talk to us|Not permitted|No such church/i.test(error.message);
    redirect(
      `/billing?error=${encodeURIComponent(
        known
          ? error.message
          : "Could not raise your invoice. Please try again, or contact us and we will sort it out."
      )}`
    );
  }

  await openPaymentLink(String(invoiceId));
}

/**
 * Shared by both buttons: turn an invoice into a Paystack link and go there.
 */
async function openPaymentLink(invoiceId: string) {
  const { membership, email } = await getMembership();
  if (!membership) redirect("/onboarding");

  if (!can(membership.role, "finance.view")) {
    redirect(
      `/billing?error=${encodeURIComponent(
        "Only the pastor, an administrator or a finance officer can pay an invoice."
      )}`
    );
  }

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
