import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dispatch, QUEUED_COLUMNS, type QueuedNotification } from "@/lib/dispatch";
import { queueDueMeetingReminders } from "@/lib/meetings";

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
 * It also queues meeting reminders as they fall due, just before sending, so
 * a reminder goes out in the run that queued it rather than five minutes
 * into a thirty minute warning.
 *
 * Service role, because there is no user session behind a cron, and because
 * it has to see every church's queue rather than one church's.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * A cap, so one bad batch cannot run the function out of time. Large
 * enough for a whole congregation's reminders in one run: at sixty, a
 * society of two hundred would have heard about its prayer meeting over
 * twenty minutes.
 */
const BATCH = 400;

/** Messages in flight at once. Enough to clear a batch in seconds. */
const PARALLEL = 8;

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

  const reminders = await queueDueMeetingReminders(supabase);

  const { data: due, error } = await supabase
    .from("notifications")
    .select(QUEUED_COLUMNS)
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

  const queue = [...((due ?? []) as QueuedNotification[])];
  await Promise.all(
    Array.from({ length: PARALLEL }, async () => {
      for (let n = queue.shift(); n; n = queue.shift()) {
        const outcome = await dispatch(
          supabase,
          n,
          senders.get(n.organization_id) ?? null
        );
        if (outcome === "sent") sent++;
        else failed++;
      }
    })
  );

  return NextResponse.json({
    reminders,
    due: due?.length ?? 0,
    sent,
    failed,
  });
}
