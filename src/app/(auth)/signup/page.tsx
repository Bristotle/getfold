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
import { SourceFields } from "@/components/source-fields";

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
  searchParams: Promise<{ error?: string; message?: string; email?: string }>;
}) {
  // Filled in from the link in an invitation, so the address matches the
  // one the invitation was sent to, which is what makes it join the church.
  const { error, message, email: invited } = await searchParams;

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

  // The link in an invitation, opened by somebody already signed in. The
  // dashboard offers the invitation; billing, below, does not, and an
  // invited elder who already had a church of his own was sent there.
  if (invited && membership) redirect("/dashboard");

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
          {/*
            The invitation email links here with the address filled in. It
            used to greet the invited elder with "Create your church account",
            which told him to start a church of his own.
          */}
          <h1 className="text-xl font-bold text-foreground">
            {invited ? "Accept your invitation" : "Create your church account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invited
              ? "Create your account with the address your invitation was sent to. You join the church that invited you; you do not set up a new one."
              : "Free for 30 days. No credit card, and nothing to cancel."}
          </p>

          <div className="mt-4 flex flex-col gap-2 empty:mt-0">
            <StatusBanner error={error} message={message} />
          </div>

          <form action={signUp} className="mt-6 flex flex-col gap-4">
            <SourceFields />
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
              defaultValue={invited?.slice(0, 200)}
              required
            />
            {/*
              Asked for because Fold supports churches on WhatsApp. Of the
              first fifteen church leaders, one had a number on record, and
              there was no way to reach the rest when their churches went
              quiet.
            */}
            <Input
              label="Your WhatsApp number"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0244 000 000"
              minLength={9}
              hint="So we can help you set up on WhatsApp. Never shared, and never used to send adverts."
              required
            />
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
              /*
                The rule, before it is broken rather than after.

                This used to say only "at least 8 characters", while the
                project also requires a capital, a small letter and a
                number. So the form invited a password it was going to
                reject, and the rejection was Supabase printing three
                alphabets in full. Telling somebody the rule up front costs
                one line and saves the round trip.
              */
              hint="At least 8 characters, with a capital letter, a small letter and a number. Something like Hosanna2026 works."
            />
            <SubmitButton className="mt-1" pendingLabel="Creating your account…">
              Create account
            </SubmitButton>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
            {invited
              ? "Confirm your address from the email that follows, log in, and press Join. Already have an account? Log in instead and you will be offered the invitation."
              : "You name your church on the next step, so there is nothing else to prepare."}
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
