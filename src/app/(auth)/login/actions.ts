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
