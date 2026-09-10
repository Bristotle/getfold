import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deliver, toE164, renderTemplate, DEFAULT_TEMPLATES } from "@/lib/messaging";

/**
 * The daily message run.
 *
 * Two jobs, in order. Queue today's birthday greetings for every church
 * that has switched them on, then send everything sitting in the queue for
 * those churches, which also picks up welcome texts and thank yous queued
 * during the day.
 *
 * Runs at 07:00 UTC, which is 07:00 in Accra. Early enough that a birthday
 * greeting arrives before the day is under way, late enough not to wake
 * anybody.
 *
 * Uses the service role, because a schedule has no user session and this
 * legitimately reads across every church. That key is why the route
 * refuses any request without the cron secret.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Birthday = {
  organization_id: string;
  organization_name: string;
  member_id: string;
  member_name: string;
  phone: string;
  sender_id: string | null;
  template: string | null;
};

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  // ---------- 1. queue today's birthdays ----------
  const { data: birthdays, error: bErr } = await supabase.rpc("birthdays_today");
  if (bErr) {
    return NextResponse.json({ error: bErr.message }, { status: 500 });
  }

  let queued = 0;
  for (const b of (birthdays ?? []) as Birthday[]) {
    const to = toE164(b.phone);
    if (!to) continue;
    const { error } = await supabase.from("notifications").insert({
      organization_id: b.organization_id,
      member_id: b.member_id,
      type: "birthday",
      channel: "sms",
      recipient: to,
      // The church's own wording where it has written one.
      body: renderTemplate(b.template ?? DEFAULT_TEMPLATES.birthday, {
        name: b.member_name,
        church: b.organization_name,
      }),
      status: "queued",
    });
    if (!error) queued++;
  }

  // ---------- 2. send what is waiting ----------
  //
  // Only for churches that have switched something on. A church that never
  // asked for automatic messages should not have its queue drained by a
  // schedule, and its manual queue stays exactly where the Messages page
  // shows it, waiting for somebody to press send.
  const { data: optedIn } = await supabase
    .from("organizations")
    .select("id, sms_sender_id")
    .or(
      "sms_welcome_enabled.eq.true,sms_thanks_enabled.eq.true,sms_birthday_enabled.eq.true"
    );

  const orgs = (optedIn ?? []) as { id: string; sms_sender_id: string | null }[];
  const orgIds = orgs.map((o) => o.id);
  const senderByOrg = new Map(orgs.map((o) => [o.id, o.sms_sender_id]));

  let sent = 0;
  let failed = 0;

  if (orgIds.length > 0) {
    const { data: pending } = await supabase
      .from("notifications")
      .select("id, recipient, body, organization_id")
      .in("organization_id", orgIds)
      .in("status", ["queued", "no_provider"])
      // A cap, because one runaway import should not spend a church's
      // entire SMS balance in a single run.
      .limit(200);

    for (const n of (pending ?? []) as {
      id: string;
      recipient: string;
      body: string;
      organization_id: string;
    }[]) {
      // Sent under the church's own name, not the platform's. A member who
      // does not recognise the sender treats the message as spam.
      const result = await deliver(
        n.recipient,
        n.body,
        senderByOrg.get(n.organization_id) ?? null
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
  }

  return NextResponse.json({
    birthdaysQueued: queued,
    churchesOptedIn: orgIds.length,
    sent,
    failed,
  });
}
