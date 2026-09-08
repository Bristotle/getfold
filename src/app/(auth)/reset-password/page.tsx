import { Card } from "@/components/ui/card";
import { StatusBanner } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submit-button";
import { updatePassword } from "../login/actions";

export const metadata = { title: "Set a new password, Fold" };

/**
 * Reached from the link in the reset email.
 *
 * Supabase signs the visitor in with a short-lived recovery session before
 * this page renders, which is why there is no token to handle here. If that
 * session is missing or expired the action refuses and sends them back to
 * request a fresh link.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-foreground">
          Set a new password
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose something you will remember. You will be signed in straight
          afterwards.
        </p>

        <div className="mt-4 flex flex-col gap-2 empty:mt-0">
          <StatusBanner error={error} message={message} />
        </div>

        <form action={updatePassword} className="mt-6 flex flex-col gap-4">
          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            minLength={6}
            required
            hint="At least 6 characters."
          />
          <PasswordInput
            label="Confirm new password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={6}
            required
          />
          <SubmitButton pendingLabel="Saving…">Save new password</SubmitButton>
        </form>
      </Card>
    </main>
  );
}
