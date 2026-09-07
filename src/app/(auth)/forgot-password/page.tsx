import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input, StatusBanner } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { requestPasswordReset } from "../login/actions";

export const metadata = { title: "Reset your password, Fold" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-foreground">
          Reset your password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the email address you signed up with and we will send you a
          link to set a new one.
        </p>

        <div className="mt-4 flex flex-col gap-2 empty:mt-0">
          <StatusBanner error={error} message={message} />
        </div>

        <form action={requestPasswordReset} className="mt-6 flex flex-col gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <SubmitButton pendingLabel="Sending…">Send reset link</SubmitButton>
        </form>

        <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </Card>
    </main>
  );
}
