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

/**
 * The email version, longer than the text because it can be.
 *
 * Plain text on purpose. A church office reading this on a phone in a
 * mail app that has not loaded images should get the whole message.
 */
async function sendTrialEmail(
  to: string,
  church: string,
  days: number,
  endsAt: string
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";
  const ends = new Date(endsAt).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" });

  const subject =
    days <= 0
      ? `Your Fold trial for ${church} has ended`
      : days === 1
        ? `One day left on your Fold trial for ${church}`
        : `${days} days left on your Fold trial for ${church}`;

  const body = [
    `Hello,`,
    ``,
    days <= 0
      ? `The free trial for ${church} ended on ${ends}. Nothing has been deleted: your register, attendance and giving are all still there and still yours.`
      : `The free trial for ${church} ends on ${ends}, ${days === 1 ? "tomorrow" : `in ${days} days`}. Nothing will be deleted when it does.`,
    ``,
    `To keep going, open Billing in Fold and choose a band. It is billed every three months, by mobile money, card or bank transfer, and the price is held for twelve months from the day you start.`,
    ``,
    `  https://www.getfold.org/billing`,
    ``,
    `If Fold is not right for your church, you can export your register as a spreadsheet at any time from the Members page, and we will delete everything within thirty days of you asking.`,
    ``,
    `If anything about the trial did not work the way you hoped, reply to this email and tell us. We read every one.`,
    ``,
    `Fold`,
    `getfold.org`,
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, text: body, reply_to: process.env.ALERT_EMAIL?.split(",")[0]?.trim() }),
    });
    return res.ok;
  } catch {
    return false;
  }
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
  let sentBySms = 0;
  let sentByEmail = 0;
  let unreachable = 0;
  const failures: string[] = [];

  for (const row of rows) {
    const phone = row.pastor_phone ? toE164(row.pastor_phone) : null;
    const text = message(row.organization_name, row.days_left);

    /*
      Text first, email second, and both where both exist.

      Sign up collects an email and a password and nothing else, so most
      pastors have no phone on file until they add one, and for months this
      job left every one of them queued with a note saying email was not
      wired up. Now it is. A reminder that reaches nobody is a trial that
      ends in silence, which is the outcome the job exists to prevent.
    */
    let reached = false;

    if (phone) {
      const result = await deliver(phone, text);
      if (result.ok) {
        sentBySms++;
        reached = true;
      } else {
        failures.push(`${row.organization_name} (sms): ${result.error ?? "send failed"}`);
      }
    }

    if (row.pastor_email) {
      const ok = await sendTrialEmail(row.pastor_email, row.organization_name, row.days_left, row.ends_at);
      if (ok) {
        sentByEmail++;
        reached = true;
      } else {
        failures.push(`${row.organization_name} (email): send failed`);
      }
    }

    if (reached) {
      await supabase.rpc("mark_trial_reminded", { org_id: row.organization_id });
    } else if (!phone && !row.pastor_email) {
      // Nothing on file at all. Left in the queue rather than marked, so it
      // is picked up the moment either is added.
      unreachable++;
    }
  }

  return NextResponse.json({
    due: rows.length,
    sentBySms,
    sentByEmail,
    unreachable,
    failures,
    note:
      unreachable > 0
        ? "Churches with neither a phone nor an email on file were left in the queue."
        : undefined,
  });
}
