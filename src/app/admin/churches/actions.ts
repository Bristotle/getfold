"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { friendly } from "@/lib/errors";
import { sendEmail } from "@/lib/email";
import type { DirectoryRow } from "@/lib/platform";

/**
 * Opening and closing a church for support.
 *
 * The permission check, the time limit and the entry in the church's own
 * activity log all happen inside start_platform_view() in the database, so
 * nothing here can widen them. These only call it and say what happened.
 */

const UUID = /^[0-9a-f-]{36}$/i;

export async function openChurch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/churches");

  const supabase = await createClient();
  const { error } = await supabase.rpc("start_platform_view", { org_id: id });
  if (error) {
    redirect(`/admin/churches/${id}?error=${encodeURIComponent(friendly(error))}`);
  }
  redirect(`/admin/churches/${id}`);
}

export async function closeChurch(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/churches");

  const supabase = await createClient();
  await supabase.rpc("end_platform_view", { org_id: id });
  redirect("/admin/churches?message=Closed. You can no longer see that church.");
}

/**
 * Records a payment a church made outside the website, such as mobile
 * money sent straight to Fold's number.
 *
 * platform_record_payment() decides who may, writes the paid invoice, makes
 * the church active for the period and notes it in the church's own log.
 * This only gathers the form, and sends the pastor a receipt so the church
 * has it in writing too.
 */
export async function recordPayment(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/churches");

  const amount = Number(String(formData.get("amount") ?? "").replace(/[^\d.]/g, ""));
  const band = String(formData.get("band") ?? "");
  const months = Number(formData.get("months") ?? 3);
  const method = String(formData.get("method") ?? "");
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 120);
  const paidOn = String(formData.get("paidOn") ?? "") || null;
  const startsOn = String(formData.get("startsOn") ?? "") || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("platform_record_payment", {
    org_id: id,
    band,
    amount,
    months,
    method,
    reference,
    paid_on: paidOn,
    starts_on: startsOn,
  });
  if (error) redirect(`/admin/churches/${id}?error=${encodeURIComponent(friendly(error))}`);

  const period = (data as { period_start: string; period_end: string }[] | null)?.[0];
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

  // A receipt to the pastor. Best effort: the payment is recorded either way.
  const { data: dir } = await supabase.rpc("platform_church_directory");
  const church = ((dir ?? []) as DirectoryRow[]).find((r) => r.organization_id === id);
  let receipt = "";
  if (church?.pastor_email) {
    const sent = await sendEmail({
      to: church.pastor_email,
      replyTo: process.env.ALERT_EMAIL?.split(",")[0]?.trim() ?? null,
      subject: `Payment received for ${church.name}`,
      text: [
        `Hello,`,
        ``,
        `Thank you. We have received GHS ${amount.toFixed(2)} for ${band} for ${church.name}${reference ? ` (reference ${reference})` : ""}.`,
        ``,
        `Your Fold account is paid up from ${fmt(period?.period_start)} to ${fmt(period?.period_end)}. You do not need to do anything else, and you will not be asked to pay for this period again. The invoice is under Billing in Fold.`,
        ``,
        `If anything here is wrong, reply to this email and we will put it right.`,
        ``,
        `Fold`,
        `getfold.org`,
      ].join("\n"),
    });
    receipt = sent.ok ? ` A receipt was emailed to ${church.pastor_email}.` : ` The receipt email did not send (${sent.error}).`;
  }

  redirect(
    `/admin/churches/${id}?message=${encodeURIComponent(
      `Payment recorded. ${church?.name ?? "The church"} is paid up from ${fmt(period?.period_start)} to ${fmt(period?.period_end)}.${receipt}`
    )}`
  );
}
