"use client";

import { type InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A password field with a reveal toggle.
 *
 * Client side because the toggle needs state, which is why it lives apart
 * from the server-rendered Input in field.tsx rather than growing a flag
 * on it.
 *
 * Three details that are easy to get wrong:
 *
 * The button is type="button". Without that it defaults to submit and
 * revealing the password posts the form.
 *
 * aria-pressed carries the state, and the label changes with it, so a
 * screen reader user knows whether the password is currently visible.
 * An icon alone would tell them nothing.
 *
 * The field keeps padding-right for the button so a long password never
 * runs underneath it.
 */
export function PasswordInput({
  label,
  hint,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  const [shown, setShown] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-medium text-foreground">
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={shown ? "text" : "password"}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          className={cn(
            "h-11 w-full rounded-lg border border-border bg-surface pl-3 pr-12 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
            className
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          aria-controls={inputId}
          aria-label={shown ? "Hide password" : "Show password"}
          title={shown ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {shown ? (
            <EyeOff size={17} strokeWidth={1.9} aria-hidden="true" />
          ) : (
            <Eye size={17} strokeWidth={1.9} aria-hidden="true" />
          )}
        </button>
      </div>

      {hint && (
        <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
