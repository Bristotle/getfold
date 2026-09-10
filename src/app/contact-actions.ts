"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { alertNewEnquiry } from "@/lib/alert";

/**
 * An enquiry from the public site.
 *
 * Runs with the anon key like any other visitor, so the RLS insert policy in
 * 0016_contact_requests.sql is what actually guards it. There is no select
 * policy, so writing here can never become a way to read what others wrote.
 */
export async function submitEnquiry(formData: FormData) {
  // Honeypot. A real person never sees this field, so anything in it came
  // from something filling every input on the page. Answer cheerfully and
  // store nothing, rather than telling the bot it was caught.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect(`/?sent=1#contact`);
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const church = String(formData.get("church") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name) {
    redirect(`/?error=${encodeURIComponent("Please tell us your name.")}#contact`);
  }
  if (!email || !email.includes("@") || email.length < 3) {
    redirect(
      `/?error=${encodeURIComponent("Please give an email address we can reply to.")}#contact`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_requests").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    phone: phone.slice(0, 40) || null,
    church: church.slice(0, 200) || null,
    message: message.slice(0, 4000) || null,
    source: "homepage",
  });

  if (error) {
    redirect(
      `/?error=${encodeURIComponent(
        "We could not send that just now. Please try again, or email us directly."
      )}#contact`
    );
  }

  /*
    Tell somebody. The row is already saved, so this is best effort: an
    alert that fails must not turn into an enquiry that fails, which would
    lose the very thing we are trying not to miss.
  */
  await alertNewEnquiry({
    name,
    email,
    phone: phone || null,
    church: church || null,
    message: message || null,
    source: String(formData.get("source") ?? "homepage"),
  });

  redirect(`/?sent=1#contact`);
}
