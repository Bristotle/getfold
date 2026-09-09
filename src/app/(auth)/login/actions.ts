"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isRateLimited,
  logAuthEvent,
  RATE_LIMIT_MESSAGE,
} from "@/lib/auth-guard";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  if (await isRateLimited(email)) {
    await logAuthEvent(email, "rate_limited", "signIn");
    redirect(`/login?error=${encodeURIComponent(RATE_LIMIT_MESSAGE)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await logAuthEvent(email, "login_failed", error.message);
    // Deliberately generic. Supabase already answers "Invalid login
    // credentials" for both a wrong password and an address with no
    // account, and passing its message straight through would risk
    // leaking a more specific one in future.
    redirect(
      `/login?error=${encodeURIComponent(
        "That email and password do not match an account."
      )}`
    );
  }

  await logAuthEvent(email, "login_ok");

  // Land on /dashboard; its layout sends the user to /onboarding if they
  // don't belong to a church yet.
  // Deliberately NOT revalidatePath("/", "layout"). Every authenticated
  // page is already rendered per request, so revalidating them changes
  // nothing, while "/" with "layout" invalidated all ~50 static marketing
  // and help pages on every single sign in. That was the largest source of
  // ISR writes on the project and none of it was needed.
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));

  if (await isRateLimited(email)) {
    await logAuthEvent(email, "rate_limited", "signUp");
    redirect(`/signup?error=${encodeURIComponent(RATE_LIMIT_MESSAGE)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    await logAuthEvent(email, "signup_failed", error.message);

    // "User already registered" tells an attacker which of a
    // congregation's addresses have accounts. Answer as though the signup
    // worked and send them to log in, which is also what a real person in
    // that position needs to do.
    if (/already registered|already exists/i.test(error.message)) {
      redirect(
        `/login?message=${encodeURIComponent(
          "If that address does not already have an account, check your email to confirm it. Otherwise log in below."
        )}`
      );
    }
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  await logAuthEvent(email, "signup_ok");

  // Whether a session exists here depends on a project setting: with
  // "Confirm email" ON (the Supabase default) signUp returns no session
  // and the user must click a link first. With it OFF they are signed in
  // immediately. Branch on the actual result rather than assuming either.
  if (data.session) {
      redirect("/onboarding");
  }

  redirect(
    "/login?message=Check your email to confirm your account, then log in."
  );
}

export async function signOut() {
  const supabase = await createClient();
  // "global" revokes every refresh token for this user, so signing out on
  // the church laptop also ends the session on the phone that was left in
  // the vestry. The default only ends the session doing the asking.
  await supabase.auth.signOut({ scope: "global" });

  redirect("/login");
}

/**
 * Sends a password reset link.
 *
 * Deliberately reports the same thing whether or not the address has an
 * account. Saying "no account found" would let anyone check which of a
 * congregation's emails are registered, and a church's member list is
 * exactly the kind of thing worth not confirming.
 */
export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    redirect(
      `/forgot-password?error=${encodeURIComponent("Enter the email address you signed up with.")}`
    );
  }

  const supabase = await createClient();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  });

  await logAuthEvent(email, "reset_requested");

  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "If that address has an account, a reset link is on its way. Check your inbox, and your spam folder."
    )}`
  );
}

/**
 * Sets a new password.
 *
 * Reached only from the link in the reset email, which signs the user in
 * with a recovery session first. Without that session there is nobody to
 * update, so the attempt is refused rather than failing obscurely.
 */
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Use at least 8 characters.")}`
    );
  }
  if (password !== confirm) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Those two passwords do not match.")}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?error=${encodeURIComponent("That reset link has expired. Request a new one.")}`
    );
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  }

  // Changing a password is what somebody does after suspecting their
  // account is compromised, so end every OTHER session and keep this one.
  // Without this the attacker's session survives the password change,
  // which makes the reset close to useless.
  await supabase.auth.signOut({ scope: "others" });
  await logAuthEvent(user.email ?? null, "password_changed");

  redirect("/dashboard");
}
