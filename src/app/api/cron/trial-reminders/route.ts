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

/*
  One message per milestone. days_left counts down to the end of the trial
  and keeps going past it, so day 60 of the account is -30 here, day 84 is
  -54 and day 90 is -59. The lifecycle the owner decided:

    day 31   grace, full use, reminders
    day 61   read only
    day 91   deleted

  Every message says what happens next and when, because a reminder that
  does not name the date is a reminder that gets ignored.
*/
function message(name: string, days: number) {
  if (days <= -59) {
    return `Fold: FINAL NOTICE. ${name} and all its records will be deleted tomorrow. To keep them, choose a plan today at getfold.org/billing. To take them with you, export your register from Members now.`;
  }
  if (days <= -54) {
    return `Fold: ${name} will be deleted in 7 days, with every member, service and gift recorded. Choose a plan at getfold.org/billing, or export your register from Members before then.`;
  }
  if (days <= -45) {
    return `Fold: ${name} is read only. In 15 days the church and its records are deleted. Choose a plan at getfold.org/billing to keep everything exactly as it is.`;
  }
  if (days <= -30) {
    return `Fold: the grace period for ${name} has ended and the account is now read only. Nothing has been deleted. Choose a plan at getfold.org/billing to record again. In 30 days the records are removed.`;
  }
  if (days <= -29) {
    return `Fold: tomorrow ${name} becomes read only. You can still see and export everything, but nothing new can be recorded until a plan is chosen. getfold.org/billing`;
  }
  if (days <= -14) {
    return `Fold: ${name} has 16 days of full use left before it becomes read only. Choose a plan at getfold.org/billing and nothing changes.`;
  }
  if (days <= 0) {
    return `Fold: your free trial for ${name} has ended. Nothing has been deleted and your register is still yours. You have 30 days of full use to choose a plan at getfold.org/billing.`;
  }
  if (days === 1) {
    return `Fold: one day left on your free trial for ${name}. After it ends you keep full use for 30 more days while you choose a plan. getfold.org/billing`;
  }
  return `Fold: ${days} days left on your free trial for ${name}. Nothing will be deleted when it ends. To continue, choose a plan at getfold.org/billing`;
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
  endsAt: string,
  deleted = false
): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";
  const ends = new Date(endsAt).toLocaleDateString("en-GH", { day: "numeric", month: "long", year: "numeric" });

  const stage = deleted
    ? { subject: `${church} has been removed from Fold`, lead: `As we said we would, ${church} and every record in it were deleted this morning, ninety days after the free trial began and thirty days after the account became read only. Nothing of the church remains on our systems.` }
    : days <= -59
      ? { subject: `Final notice: ${church} will be deleted tomorrow`, lead: `Tomorrow ${church} and all its records will be deleted. To keep them, choose a plan today. To take them with you, export your register from the Members page now.` }
      : days <= -54
        ? { subject: `${church} will be deleted in 7 days`, lead: `In seven days ${church} will be deleted, with every member, service and gift recorded in it. Choose a plan and nothing changes. Or export your register from the Members page and take it with you.` }
        : days <= -30
          ? { subject: `${church} is now read only`, lead: `The grace period for ${church} has ended and the account is now read only. Everything you recorded is still there and can still be seen and exported, but nothing new can be recorded until a plan is chosen. In thirty days the records are removed.` }
          : days <= 0
            ? { subject: `Your Fold trial for ${church} has ended`, lead: `The free trial for ${church} ended on ${ends}. Nothing has been deleted, and you have thirty days of full use to choose a plan.` }
            : { subject: `${days === 1 ? "One day" : `${days} days`} left on your Fold trial for ${church}`, lead: `The free trial for ${church} ends on ${ends}. Nothing will be deleted when it does: you keep full use for thirty more days while you choose a plan.` };

  const subject = stage.subject;
  const body = [
    `Hello,`,
    ``,
    stage.lead,
    ``,
    ...(deleted ? [] : [
      `To keep going, open Billing in Fold and choose a band. It is billed every three months, by mobile money, card or bank transfer, and the price is held for twelve months from the day you start.`,
      ``,
      `  https://www.getfold.org/billing`,
      ``,
      `If Fold is not right for your church, export your register as a spreadsheet from the Members page and take it with you.`,
      ``,
    ]),
    `If anything did not work the way you hoped, reply to this email and tell us. We read every one.`,
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

  /*
    Advance every church a day before deciding who to remind. The step is
    in the database (0043) and returns what it did: which churches became
    read only today, and which were deleted, with their pastor. Those get
    their notice here regardless of the milestone list, because "your
    records were deleted this morning" is not a reminder, it is a receipt.
  */
  const { data: steps, error: stepError } = await supabase.rpc("run_trial_lifecycle");
  if (stepError) {
    return NextResponse.json({ error: `lifecycle: ${stepError.message}` }, { status: 500 });
  }
  let readOnlyToday = 0;
  let deletedToday = 0;
  const accountsRemoved: string[] = [];
  for (const step of (steps ?? []) as {
    action: string; organization_id: string; organization_name: string;
    pastor_id: string | null; pastor_email: string | null;
  }[]) {
    if (step.action === "read_only") readOnlyToday++;
    if (step.action === "deleted") {
      deletedToday++;
      if (step.pastor_email) {
        await sendTrialEmail(step.pastor_email, step.organization_name, -60, new Date().toISOString(), true);
      }
      /*
        The pastor's login belongs to nobody now. Removing it keeps the
        privacy policy's promise that everything is gone, unless that person
        also leads another church, in which case the account is theirs and
        stays.
      */
      if (step.pastor_id) {
        const { count } = await supabase
          .from("organization_members")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", step.pastor_id);
        if ((count ?? 0) === 0) {
          const { error: delErr } = await supabase.auth.admin.deleteUser(step.pastor_id);
          if (!delErr) accountsRemoved.push(step.organization_name);
        }
      }
    }
  }

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
    readOnlyToday,
    deletedToday,
    accountsRemoved,
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
