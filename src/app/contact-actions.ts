"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { alertNewEnquiry } from "@/lib/alert";
import { scoreEnquiry } from "@/lib/spam";

/**
 * An enquiry from the public site.
 *
 * Runs with the anon key like any other visitor, so the RLS insert policy in
 * 0016_contact_requests.sql is what actually guards it. There is no select
 * policy, so writing here can never become a way to read what others wrote.
 */
export async function submitEnquiry(formData: FormData) {
  /*
    Where to send the visitor afterwards. The form lives on the homepage
    and on /contact, and somebody who wrote to us from /contact used to be
    dropped on the homepage with the answer, which reads as the site having
    lost their place. The source field says which page, so the reply goes
    back to it. Anything else falls back to the homepage.
  */
  const source = String(formData.get("source") ?? "homepage");
  const back = source === "contact-page" ? "/contact" : "/";

  // Honeypot. A real person never sees this field, so anything in it came
  // from something filling every input on the page. Answer cheerfully and
  // store nothing, rather than telling the bot it was caught.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect(`${back}?sent=1#contact`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const church = String(formData.get("church") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) {
    redirect(`${back}?error=${encodeURIComponent("Please tell us your name.")}#contact`);
  }
  if (!email || !email.includes("@") || email.length < 3) {
    redirect(
      `${back}?error=${encodeURIComponent("Please give an email address we can reply to.")}#contact`
    );
  }

  /*
    Alert first, then save with the outcome on the row.

    The obvious order is the other way round, and it was: save, then alert
    best effort. The trouble is that recording whether the alert worked then
    needs an UPDATE, and this runs as an anonymous visitor with one INSERT
    policy and nothing else. The update would have written nothing at all,
    silently, which is precisely the failure being fixed.

    Alerting first needs no new policy and no wider access, and if the
    insert somehow fails afterwards the enquiry is still not lost: the email
    and the text both carry every detail. The row is the record; the alert
    is the thing that gets somebody to answer.
  */
  const enquiry = {
    name,
    email,
    phone: phone || null,
    church: church || null,
    message: message || null,
    source,
  };

  /*
    A cold pitch is saved and readable, it just does not wake anybody up.
    The sender is told the same thing either way: telling somebody they were
    scored as spam only teaches them how to get through next time, and would
    be a horrible thing to show a church we got wrong.
  */
  const verdict = scoreEnquiry(enquiry);
  const alert = verdict.spam
    ? { ok: false, error: undefined }
    : await alertNewEnquiry(enquiry);

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    phone: phone.slice(0, 40) || null,
    church: church.slice(0, 200) || null,
    message: message.slice(0, 4000) || null,
    source: source.slice(0, 40),
    alerted_at: alert.ok ? new Date().toISOString() : null,
    alert_error: verdict.spam
      ? null
      : alert.ok
        ? null
        : (alert.error ?? "Unknown error"),
    spam: verdict.spam,
    spam_score: verdict.score,
    spam_reasons: verdict.reasons.join("; ") || null,
  });

  if (error) {
    redirect(
      `${back}?error=${encodeURIComponent(
        "We could not send that just now. Please try again, or email us directly."
      )}#contact`
    );
  }

  redirect(`${back}?sent=1#contact`);
}
