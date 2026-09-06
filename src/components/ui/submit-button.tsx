"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";

/**
 * A submit button that disables itself while its form is in flight.
 *
 * This is the client half of the duplicate-submission fix. On a slow
 * connection the natural response to an unresponsive button is to press it
 * again, and for `collectByMomo` that meant two real charges against a
 * member's phone. Disabling is the honest signal that something is
 * happening.
 *
 * It is convenience, not the guarantee: a determined or unlucky client can
 * still post twice, so money-moving actions also carry a server-side guard.
 */
export function SubmitButton({
  children,
  pendingLabel,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? (pendingLabel ?? "Working…") : children}
    </Button>
  );
}
