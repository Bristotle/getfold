"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Land on /dashboard; its layout sends the user to /onboarding if they
  // don't belong to a church yet.
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const fullName = String(formData.get("fullName"));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Whether a session exists here depends on a project setting: with
  // "Confirm email" ON (the Supabase default) signUp returns no session
  // and the user must click a link first. With it OFF they are signed in
  // immediately. Branch on the actual result rather than assuming either.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  redirect(
    "/login?message=Check your email to confirm your account, then sign in."
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
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

  if (password.length < 6) {
    redirect(
      `/reset-password?error=${encodeURIComponent("Use at least 6 characters.")}`
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

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
