import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getMembership } from "@/lib/org";
import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Logo } from "@/components/marketing/logo";
import { AuthPanel } from "@/components/marketing/auth-panel";
import { signUp } from "../login/actions";

export const metadata: Metadata = {
  title: "Create your church account, Fold",
  description:
    "Start your 30 day free trial of Fold. No credit card, no commitment, and nothing to cancel.",
};

/**
 * Sign up.
 *
 * This used to live inside a collapsed <details> at the bottom of the sign
 * in page, which meant every "Start free trial" button on the site landed a
 * new church on a form asking for a password it had never set. Signing in
 * and signing up are different jobs for different people and now have
 * different pages.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  /*
    Somebody already signed in does not need to sign up.

    Every "Start 30 days free" button on the marketing site points here,
    including the ones on the pricing page, and a pastor who was already
    signed in and looking at the bands was asked to create their church a
    second time. That is how a church that wanted to pay us ended up going
    in a circle instead. Onboarding has guarded against this since it was
    written; signup never did.

    Sent to billing rather than the dashboard, because the plan is what
    somebody reading the pricing page came for.
  */
  const { email, membership } = await getMembership();
  if (membership) {
    redirect(
      `/billing?message=${encodeURIComponent(
        `You are already signed in for ${membership.organization.name}. Here is your plan.`
      )}`
    );
  }
  if (email) redirect("/onboarding");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mx-auto mb-6 block w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Logo showTagline />
        </Link>

        <Card>
          <h1 className="text-xl font-bold text-foreground">
            Create your church account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free for 30 days. No credit card, and nothing to cancel.
          </p>

          <div className="mt-4 flex flex-col gap-2 empty:mt-0">
            <StatusBanner error={error} message={message} />
          </div>

          <form action={signUp} className="mt-6 flex flex-col gap-4">
            <Input
              label="Your full name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
              hint="At least 8 characters. A short phrase you will remember beats a short word you will not."
            />
            <SubmitButton className="mt-1" pendingLabel="Creating your account…">
              Create account
            </SubmitButton>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            You name your church on the next step, so there is nothing else to
            prepare.
          </p>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Log in
          </Link>
        </p>
        </div>
      </div>

      <AuthPanel />
    </main>
  );
}
