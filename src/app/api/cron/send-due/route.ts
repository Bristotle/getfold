import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deliver } from "@/lib/messaging";

/**
 * Sends the messages that are now due.
 *
 * Exists because a thank you for a gift is deliberately held back a few
 * minutes: sent the instant the payment confirms it arrives on top of MTN's
 * approval code and MTN's own debit alert, and reads as machinery rather
 * than as the church. Something has to pick it up once it is due, and a
 * serverless function cannot sit and wait.
 *
 * Runs often, does almost nothing most times it runs, and that is the
 * point. The daily job still flushes anything this misses, so a message is
 * never lost, only late.
 *
 * Service role, because there is no user session behind a cron, and because
 * it has to see every church's queue rather than one church's.
 */
export const dynamic = "force-dynamic";

/** A cap, so one bad batch cannot run the function out of time. */
const BATCH = 60;

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: due, error } = await supabase
    .from("notifications")
    .select("id, recipient, body, organization_id")
    .in("status", ["queued", "no_provider"])
    .lte("send_after", new Date().toISOString())
    .order("send_after", { ascending: true })
    .limit(BATCH);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  /*
    The sender name belongs to the church, not to us, and it is the whole
    point of the feature. Looked up per church rather than per message, so a
    batch of forty for one congregation is one query.
  */
  const orgIds = [...new Set((due ?? []).map((n) => n.organization_id))];
  const senders = new Map<string, string | null>();
  if (orgIds.length) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, sms_sender_id")
      .in("id", orgIds);
    for (const o of orgs ?? []) senders.set(o.id, o.sms_sender_id);
  }

  let sent = 0;
  let failed = 0;

  for (const n of due ?? []) {
    const result = await deliver(
      n.recipient,
      n.body,
      senders.get(n.organization_id) ?? null
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

  return NextResponse.json({ due: due?.length ?? 0, sent, failed });
}
