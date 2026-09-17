"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * A newsletter sign up from the footer.
 *
 * Runs as an anonymous visitor against the insert policy in
 * 0042_newsletter.sql. There is no select policy for the public, so this
 * can never become a way to read who else signed up.
 *
 * The footer is on every page, and those pages are static HTML on purpose.
 * Reading a query string inside the footer to say thank you in place would
 * make all fifty of them dynamic, so the thank you has a page of its own,
 * and it remembers where the visitor came from so they can go back.
 */
export async function subscribeNewsletter(formData: FormData) {
  // Honeypot. A real person never sees this field.
  if (String(formData.get("website") ?? "").trim() !== "") {
    redirect(await backTo("subscribed"));
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@") || email.length < 5 || email.length > 200) {
    redirect(await backTo("bad-email"));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert({
    email,
    source: String(formData.get("source") ?? "footer").slice(0, 60),
  });

  /*
    An address already on the list is not an error the person needs to
    see. They asked to hear from us and they will, which is the only fact
    that matters to them.
  */
  if (error && !/duplicate|unique/i.test(error.message)) {
    redirect(await backTo("failed"));
  }

  redirect(await backTo("subscribed"));
}

/**
 * The thank you page, told where the visitor was. The Referer is checked to
 * be one of ours before it is trusted; anything else sends them home.
 */
async function backTo(status: string): Promise<`/${string}`> {
  const referer = (await headers()).get("referer") ?? "";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

  let from = "/";
  try {
    const url = new URL(referer);
    const ours = new URL(site);
    if (url.host === ours.host || url.hostname === "localhost") {
      from = url.pathname || "/";
    }
  } catch {
    // No usable Referer. Home is fine.
  }

  return `/newsletter?status=${status}&from=${encodeURIComponent(from)}` as `/${string}`;
}
