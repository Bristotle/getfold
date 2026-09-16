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

/**
 * Sends one alert, and says what happened.
 *
 * It used to return a bare boolean that every caller ignored, so an email
 * that never sent was indistinguishable from one that did. An enquiry came
 * in, the SMS went out, the email did not, and there was nothing anywhere
 * to say why. The reason is now carried back and recorded.
 */
async function sendEmail(
  subject: string,
  body: string,
  replyTo?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  const from = process.env.ALERT_FROM ?? "Fold <no-reply@getfold.org>";
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };
  if (!to) return { ok: false, error: "ALERT_EMAIL is not set" };

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
        /*
          So hitting reply in the inbox goes to the person who wrote in.
          The comment here used to say exactly that while the value was
          `undefined`, which is a promise the code was not keeping: every
          reply went to no-reply@getfold.org and died.
        */
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (res.ok) return { ok: true };

    // Resend explains itself in the body, and that explanation is the whole
    // value of this function when something is wrong.
    const detail = await res
      .json()
      .then((j: { message?: string; name?: string }) => j.message ?? j.name)
      .catch(() => null);
    return { ok: false, error: `HTTP ${res.status}${detail ? `, ${detail}` : ""}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * A plain operational alert to whoever ALERT_EMAIL names.
 *
 * For things that need a person rather than a record: a church asking to
 * pay by bank transfer, for instance, where the product cannot complete the
 * job on its own because we do not hold the bank details it would need.
 */
export async function sendAlert(a: {
  subject: string;
  body: string;
}): Promise<boolean> {
  return (await sendEmail(a.subject, a.body)).ok;
}

export async function alertNewEnquiry(
  e: Enquiry
): Promise<{ ok: boolean; error?: string }> {
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

  // Email, with everything, and replies going back to whoever wrote in.
  const email = await sendEmail(
    `Fold enquiry: ${e.name}${e.church ? ` (${e.church})` : ""}`,
    full,
    e.email
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

  return email;
}
