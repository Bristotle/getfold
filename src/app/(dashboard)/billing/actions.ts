"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import {
  createInvoicePaymentLink,
  invoiceReference,
  INVOICE_METHODS,
  type InvoiceMethod,
} from "@/lib/paystack";

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
  await openPaymentLink(invoiceId, methodFrom(formData));
}

/**
 * Reads the chosen method, refusing anything not on the list.
 *
 * Form data is whatever was posted, so an unrecognised value falls back to
 * mobile money rather than being passed to Paystack as a channel name.
 */
function methodFrom(formData: FormData): InvoiceMethod {
  const raw = String(formData.get("method") ?? "momo");
  return INVOICE_METHODS.some((m) => m.value === raw)
    ? (raw as InvoiceMethod)
    : "momo";
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
export async function startSubscription(formData: FormData) {
  const method = methodFrom(formData);
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

  await openPaymentLink(String(invoiceId), method);
}

/**
 * Shared by both buttons: turn an invoice into a Paystack link and go there.
 */
async function openPaymentLink(invoiceId: string, method: InvoiceMethod) {
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
    .select(
      "id, amount_pesewas, period_start, period_end, status, paystack_authorization_url, payment_method"
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (!invoice) redirect("/billing?error=Could not find that invoice.");
  if (invoice.status === "paid") redirect("/billing?message=That invoice is already paid.");

  /*
    Bank transfer and cheque never touch Paystack. The invoice records the
    intent and waits, we are told so the details go out, and it is marked
    paid by hand when the money clears. Anything else would be pretending a
    gateway is involved in a payment that is settled between two banks.
  */
  if (method === "bank") {
    await supabase
      .from("invoices")
      .update({
        payment_method: "bank",
        status: "sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invoice.id);

    await notifyBankTransfer({
      church: membership.organization.name,
      email: email ?? "no email on the account",
      amountPesewas: invoice.amount_pesewas as number,
      period: `${invoice.period_start} to ${invoice.period_end}`,
    });

    revalidatePath("/billing");
    redirect(
      `/billing?message=${encodeURIComponent(
        "Noted. We will send your bank details and a copy of the invoice today, and mark this paid once it clears. If it is urgent, message us on WhatsApp."
      )}`
    );
  }

  /*
    Reuse an existing link rather than opening a second transaction for the
    same quarter, which is how a church pays twice and nobody notices until
    the treasurer does.

    But only when it is a link for the method now being asked for. A stored
    link carries the channel it was created with, so a church that opened a
    card page and then wanted mobile money would otherwise be handed the
    card page again every time.
  */
  if (invoice.paystack_authorization_url && invoice.payment_method === method) {
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
    method,
  });

  if (!result.ok) {
    redirect(`/billing?error=${encodeURIComponent(result.error)}`);
  }

  await supabase
    .from("invoices")
    .update({
      paystack_reference: reference,
      paystack_authorization_url: result.url,
      payment_method: method,
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoice.id);

  revalidatePath("/billing");
  redirect(result.url as Route);
}

/**
 * Tells us a church wants to pay off the gateway.
 *
 * Nothing in the product can send bank details, because we do not hold
 * them, so this is the honest mechanism: the church is told we will send
 * them, and we are told to send them. Failing to alert must not fail the
 * church's action, so the result is deliberately ignored.
 */
async function notifyBankTransfer(params: {
  church: string;
  email: string;
  amountPesewas: number;
  period: string;
}) {
  const { sendAlert } = await import("@/lib/alert");
  await sendAlert({
    subject: `${params.church} wants to pay by bank transfer or cheque`,
    body: [
      `Church:  ${params.church}`,
      `Contact: ${params.email}`,
      `Amount:  GHS ${(params.amountPesewas / 100).toFixed(2)}`,
      `Period:  ${params.period}`,
      "",
      "Send the bank details and a copy of the invoice, then mark it paid when it clears.",
    ].join("\n"),
  }).catch(() => {});
}
