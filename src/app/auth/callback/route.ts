import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Where every link in an auth email lands.
 *
 * Supabase uses the PKCE flow with @supabase/ssr: the link in a reset or
 * confirmation email comes back here with a one time `?code=`, and the
 * application has to exchange it for a session. Nothing did, so a reset
 * link signed nobody in and "Set a new password" refused every attempt.
 * The exchange works because the browser that asked for the link holds the
 * matching verifier cookie, which is also why a link opened on a different
 * device fails and the person is asked for a fresh one.
 *
 * `next` is where to go afterwards, and only a path on this site is
 * accepted. An absolute URL there would make this an open redirect that
 * hands somebody a signed in session on the way to another site.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const asked = url.searchParams.get("next") ?? "/dashboard";
  const next = asked.startsWith("/") && !asked.startsWith("//") ? asked : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  const failed = next.startsWith("/reset-password")
    ? `/forgot-password?error=${encodeURIComponent(
        "That reset link has expired or was opened in a different browser. Ask for a new one here, and open it on this device."
      )}`
    : `/login?error=${encodeURIComponent(
        "That link has expired or was already used. Log in, or ask for a new link."
      )}`;
  return NextResponse.redirect(new URL(failed, url.origin));
}
