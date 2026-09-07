import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { Logo } from "@/components/marketing/logo";
import { AuthPanel } from "@/components/marketing/auth-panel";
import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Log in, Fold",
  description: "Log in to your church's Fold account.",
};

/**
 * Log in. Signing in only.
 *
 * Creating an account lives at /signup now. A page that tried to do both
 * had to bury one of them, and the one it buried was the one every button
 * on the marketing site was pointing at.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

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
          <h1 className="text-xl font-bold text-foreground">Log in to Fold</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back. Enter the details you signed up with.
          </p>

          <div className="mt-4 flex flex-col gap-2 empty:mt-0">
            <StatusBanner error={error} message={message} />
          </div>

          <form action={signIn} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <SubmitButton className="mt-1" pendingLabel="Logging in…">
              Log in
            </SubmitButton>
            <Link
              href="/forgot-password"
              className="self-start rounded text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Forgot your password?
            </Link>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New church?{" "}
          <Link
            href="/signup"
            className="rounded font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Create an account
          </Link>{" "}
          and start your 30 day free trial.
        </p>
        </div>
      </div>

      <AuthPanel />
    </main>
  );
}
