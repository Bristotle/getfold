import "server-only";
import { deliver, toE164 } from "@/lib/messaging";

/**
 * Tells us when somebody enquires.
 *
 * Until now an enquiry went into a table with no select policy and no
 * notification, so a pastor filled the form, read "a real person replies
 * within a day", and the row sat in Postgres unseen. That made a promise on
 * the public site untrue, which is worse than the missing feature.
 *
 * Two channels, both optional and both attempted. SMS first because it
 * works today and gets read in minutes; email because it carries the whole
 * message rather than a summary. Neither is required: the enquiry is
 * already saved before this runs, and the admin page can always read it.
 *
 * Nothing here throws. A failed alert must never turn into a failed
 * enquiry, which would lose the very thing we are trying not to miss.
 */

const MAX_SMS = 300;

export type Enquiry = {
  name: string;
  email: string;
  phone?: string | null;
  church?: string | null;
  message?: string | null;
  source: string;
};

async function sendEmail(subject: string, body: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";
  if (!key || !to) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: to.split(",").map((t) => t.trim()).filter(Boolean),
        subject,
        text: body,
        // So hitting reply in the inbox goes to the church, not to us.
        reply_to: undefined,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function alertNewEnquiry(e: Enquiry): Promise<void> {
  const lines = [
    `New enquiry from ${e.name}`,
    e.church ? `Church: ${e.church}` : null,
    `Email: ${e.email}`,
    e.phone ? `Phone: ${e.phone}` : null,
    `Page: ${e.source}`,
    "",
    e.message || "(no message)",
  ].filter(Boolean) as string[];

  const full = lines.join("\n");

  // Email, with everything.
  await sendEmail(
    `Fold enquiry: ${e.name}${e.church ? ` (${e.church})` : ""}`,
    full
  );

  // SMS, trimmed, because it is billed by the segment and this is an alert
  // rather than the message itself.
  const to = toE164(process.env.ALERT_PHONE);
  if (to) {
    const short =
      `Fold enquiry from ${e.name}` +
      (e.church ? ` at ${e.church}` : "") +
      `. ${e.email}` +
      (e.phone ? ` / ${e.phone}` : "") +
      (e.message ? `. "${e.message}"` : "");
    try {
      await deliver(to, short.slice(0, MAX_SMS));
    } catch {
      // Already saved. An alert failing is not the enquiry failing.
    }
  }
}
