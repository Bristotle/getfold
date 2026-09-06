"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";

function amountOrNull(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  // DECIMAL(12,2) — send a fixed-2dp string, never a float.
  return n.toFixed(2);
}

export async function createFund(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "finance.write")) {
    redirect(`/funds?error=${encodeURIComponent("You do not have permission to manage funds.")}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/funds?error=Give the fund a name.");

  const supabase = await createClient();
  const { error } = await supabase.from("funds").insert({
    organization_id: membership.organization.id,
    name,
    description: String(formData.get("description") ?? "").trim() || null,
    target_amount: amountOrNull(formData, "targetAmount"),
    // current_amount is deliberately not set here — the
    // contributions_sync_fund trigger owns it.
  });

  if (error) redirect(`/funds?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/funds");
  redirect(`/funds?message=${encodeURIComponent(`${name} created.`)}`);
}

export async function updateFund(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "finance.write")) {
    redirect(`/funds?error=${encodeURIComponent("You do not have permission to manage funds.")}`);
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) redirect("/funds?error=Missing fund id.");
  if (!name) redirect("/funds?error=Give the fund a name.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("funds")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      target_amount: amountOrNull(formData, "targetAmount"),
    })
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/funds?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/funds");
  redirect("/funds?message=Fund updated.");
}

export async function deleteFund(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  // Defence in depth: the RLS policy is the real boundary, but failing
  // here gives a readable message instead of a raw Postgres error.
  if (!can(membership.role, "finance.write")) {
    redirect(`/funds?error=${encodeURIComponent("You do not have permission to manage funds.")}`);
  }

  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/funds?error=Missing fund id.");

  const supabase = await createClient();

  // contributions_fund_id_fkey is ON DELETE SET NULL, so the money stays on
  // record — those contributions simply stop being earmarked. Nothing is lost.
  const { error } = await supabase
    .from("funds")
    .delete()
    .eq("id", id)
    .eq("organization_id", membership.organization.id);

  if (error) redirect(`/funds?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/funds");
  revalidatePath("/contributions");
  redirect("/funds?message=Fund deleted. Its contributions were kept.");
}
