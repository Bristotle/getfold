import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { deliver, toE164 } from "@/lib/messaging";

/**
 * Trial reminders, run once a day.
 *
 * Sends at seven days, three days, one day and on the day the trial ends.
 * The queue comes from trials_needing_reminder(), which excludes anything
 * already reminded today, so a re-run or a retry cannot double up.
 *
 * SMS where we have a phone, which is the reliable channel in Ghana. Most
 * pastors have no phone on file, because signup asks only for a name, an
 * email and a password, so the queue carries the email too and the job
 * reports how many it could not reach by SMS. Email sending is not wired
 * up yet, and this route says so in its response rather than pretending.
 *
 * Uses the service role, because there is no user session on a schedule and
 * it legitimately needs to read across every church. That key is why this
 * route checks the cron secret before doing anything at all.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Row = {
  organization_id: string;
  organization_name: string;
  days_left: number;
  ends_at: string;
  pastor_phone: string | null;
  pastor_email: string | null;
};

function message(name: string, days: number) {
  if (days <= 0) {
    return `Fold: your free trial for ${name} has ended. Nothing has been deleted and your register is still yours. Reply or visit getfold.org/contact to keep going, or to export everything.`;
  }
  if (days === 1) {
    return `Fold: one day left on your free trial for ${name}. Tell us how many members you have and we will send a price today. getfold.org/contact`;
  }
  return `Fold: ${days} days left on your free trial for ${name}. Nothing will be deleted when it ends. To continue, visit getfold.org/contact`;
}

export async function GET(request: Request) {
  // Vercel Cron sends this header; a manual call must present the secret.
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

  const { data, error } = await supabase.rpc("trials_needing_reminder");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as Row[];
  let sent = 0;
  let unreachableBySms = 0;
  const failures: string[] = [];

  for (const row of rows) {
    const phone = row.pastor_phone ? toE164(row.pastor_phone) : null;

    if (!phone) {
      // No number on file. Do NOT mark it reminded, so it stays in the
      // queue and is picked up the moment a phone is added or email
      // sending is wired up. Silently dropping it would be worse.
      unreachableBySms++;
      continue;
    }

    const result = await deliver(
      phone,
      message(row.organization_name, row.days_left)
    );

    if (result.ok) {
      await supabase.rpc("mark_trial_reminded", { org_id: row.organization_id });
      sent++;
    } else {
      // Left unmarked on purpose, so tomorrow's run tries again.
      failures.push(`${row.organization_name}: ${result.error ?? "send failed"}`);
    }
  }

  return NextResponse.json({
    due: rows.length,
    sent,
    unreachableBySms,
    failures,
    note:
      unreachableBySms > 0
        ? "Churches with no phone on file were left in the queue. Email reminders are not wired up yet."
        : undefined,
  });
}
