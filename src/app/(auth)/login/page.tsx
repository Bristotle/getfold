import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signIn, signUp } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-foreground">Sign in to Fold</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Or create an account for your church below.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {message && (
          <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            {message}
          </p>
        )}

        <form action={signIn} className="mt-6 flex flex-col gap-3">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button type="submit" className="mt-1">
            Sign in
          </Button>
        </form>

        <details className="mt-6 text-sm text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            New church? Create an account
          </summary>
          <form action={signUp} className="mt-3 flex flex-col gap-3">
            <input
              name="fullName"
              type="text"
              placeholder="Your full name"
              required
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              minLength={6}
              required
              className="h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" variant="secondary">
              Create account
            </Button>
          </form>
        </details>
      </Card>
    </main>
  );
}
