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

  // Don't message the same person twice in a fortnight, a follow-up that
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
        (skipped ? ` ${skipped} skipped, contacted within the last 14 days.` : "")
    )}`
  );
}

/**
 * Attempts delivery of everything not yet sent. Each message records its own
 * outcome, so a provider failure never loses the message, it stays visible
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

  // Read the sender here rather than adding it to ActiveOrg, which is
  // passed through most of the app and should stay small.
  const { data: org } = await supabase
    .from("organizations")
    .select("sms_sender_id")
    .eq("id", membership.organization.id)
    .maybeSingle();
  const senderId = (org as { sms_sender_id: string | null } | null)?.sms_sender_id ?? null;

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
    const result = await deliver(
      n.recipient,
      n.body,
      senderId
    );
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

/**
 * Turns an automatic message on or off, and sets the name it is sent under.
 *
 * Both live behind org.manage rather than people.write. Deciding that a
 * congregation will start receiving texts, and under what name, is a
 * leadership decision rather than a clerical one.
 */
export async function updateMessageSettings(formData: FormData) {
  const { membership } = await getMembership();
  if (!membership) redirect("/onboarding");
  if (!can(membership.role, "org.manage")) {
    redirect(
      `/messages?error=${encodeURIComponent(
        "Only the pastor or an administrator can change these."
      )}`
    );
  }

  const supabase = await createClient();

  const sender = String(formData.get("senderId") ?? "").trim();
  if (sender.length > 0 && sender.length < 3) {
    redirect(
      `/messages?error=${encodeURIComponent("A sender name needs at least 3 characters.")}`
    );
  }
  if (sender.length > 11) {
    redirect(
      `/messages?error=${encodeURIComponent(
        "A sender name can be at most 11 characters. Networks will not carry a longer one."
      )}`
    );
  }

  const { error: senderError } = await supabase.rpc("set_sms_sender_id", {
    org_id: membership.organization.id,
    sender: sender || null,
  });
  if (senderError) {
    redirect(`/messages?error=${encodeURIComponent(senderError.message)}`);
  }

  // The church's own wording. Blank means "use ours", which is why these
  // are cleared to null rather than stored empty: improving the defaults
  // later should still reach every church that never wrote their own.
  const { error: tplError } = await supabase.rpc("set_message_templates", {
    org_id: membership.organization.id,
    t_welcome: String(formData.get("tplWelcome") ?? "").trim() || null,
    t_birthday: String(formData.get("tplBirthday") ?? "").trim() || null,
    t_thanks: String(formData.get("tplThanks") ?? "").trim() || null,
  });
  if (tplError) {
    redirect(`/messages?error=${encodeURIComponent(tplError.message)}`);
  }

  const { error } = await supabase
    .from("organizations")
    .update({
      sms_welcome_enabled: formData.get("welcome") === "on",
      sms_thanks_enabled: formData.get("thanks") === "on",
      sms_birthday_enabled: formData.get("birthday") === "on",
    })
    .eq("id", membership.organization.id);

  if (error) {
    redirect(`/messages?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/messages");
  redirect(
    `/messages?message=${encodeURIComponent(
      sender
        ? `Saved. Messages will be sent as "${sender}". The very first one may be held while your provider approves the name, so send a test to your own phone before relying on it.`
        : "Saved."
    )}`
  );
}
