import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-foreground">Sign in to Fold</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Or create an account for your church below.
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
          <SubmitButton className="mt-1" pendingLabel="Signing in…">
            Sign in
          </SubmitButton>
        </form>

        <details className="mt-8 text-sm text-muted-foreground">
          <summary className="cursor-pointer rounded font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            New church? Create an account
          </summary>
          <form action={signUp} className="mt-4 flex flex-col gap-4">
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
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              hint="At least 6 characters."
            />
            <SubmitButton variant="secondary" pendingLabel="Creating…">
              Create account
            </SubmitButton>
          </form>
        </details>
      </Card>
    </main>
  );
}
