"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMembership } from "@/lib/org";
import { can } from "@/lib/permissions";
import { queueMessage } from "@/lib/notify";
import { templates, deliver, providerStatus } from "@/lib/messaging";

/**
 * Queues a "we've missed you" message for everyone currently on the
 * attrition watchlist above a risk threshold.
 */
export async function queueAbsenceFollowUps(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "people.write")) {
    redirect(`/insights?error=${encodeURIComponent("Not permitted.")}`);
  }

  const minRisk = Number(String(formData.get("minRisk") ?? "2")) || 2;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("attrition_watchlist", {
    org_id: membership.organization.id,
    recent_weeks: 6,
    baseline_weeks: 18,
  });

  if (error) {
    redirect(`/insights?error=${encodeURIComponent(error.message)}`);
  }

  const candidates = ((data ?? []) as {
    member_id: string;
    full_name: string;
    phone: string | null;
    risk: number;
  }[]).filter((r) => r.risk >= minRisk && r.phone);

  // Don't message the same person twice in a fortnight — a follow-up that
  // arrives repeatedly reads as automated nagging, which is worse than
  // saying nothing.
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("notifications")
    .select("member_id")
    .eq("type", "absence_followup")
    .gte("created_at", since);

  const alreadyContacted = new Set(
    ((recent ?? []) as { member_id: string | null }[])
      .map((r) => r.member_id)
      .filter(Boolean)
  );

  let queued = 0;
  let skipped = 0;
  for (const c of candidates) {
    if (alreadyContacted.has(c.member_id)) {
      skipped++;
      continue;
    }
    const id = await queueMessage({
      organizationId: membership.organization.id,
      memberId: c.member_id,
      type: "absence_followup",
      phone: c.phone,
      body: templates.absenceFollowUp(membership.organization.name, c.full_name),
    });
    if (id) queued++;
  }

  revalidatePath("/messages");
  revalidatePath("/insights");
  redirect(
    `/messages?message=${encodeURIComponent(
      `${queued} follow-up${queued === 1 ? "" : "s"} queued.` +
        (skipped ? ` ${skipped} skipped — contacted within the last 14 days.` : "")
    )}`
  );
}

/**
 * Attempts delivery of everything not yet sent. Each message records its own
 * outcome, so a provider failure never loses the message — it stays visible
 * and can be retried.
 */
export async function sendQueued() {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "people.write")) {
    redirect(`/messages?error=${encodeURIComponent("Not permitted.")}`);
  }

  const status = providerStatus();
  if (!status.configured) {
    redirect(
      `/messages?error=${encodeURIComponent(
        `No SMS provider configured. Set ${status.missing.join(", ")} in .env, then try again.`
      )}`
    );
  }

  const supabase = await createClient();
  const { data: pending } = await supabase
    .from("notifications")
    .select("id, recipient, body")
    .in("status", ["queued", "no_provider", "failed"])
    .limit(100);

  let sent = 0;
  let failed = 0;

  for (const n of (pending ?? []) as {
    id: string;
    recipient: string;
    body: string;
  }[]) {
    const result = await deliver(n.recipient, n.body);
    await supabase
      .from("notifications")
      .update(
        result.ok
          ? { status: "sent", sent_at: new Date().toISOString(), error: null }
          : { status: "failed", error: result.error ?? "Unknown error" }
      )
      .eq("id", n.id);
    if (result.ok) sent++;
    else failed++;
  }

  revalidatePath("/messages");
  redirect(
    `/messages?message=${encodeURIComponent(
      `${sent} sent${failed ? `, ${failed} failed` : ""}.`
    )}`
  );
}
