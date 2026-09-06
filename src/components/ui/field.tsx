import { type InputHTMLAttributes, type SelectHTMLAttributes, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Form primitives.
 *
 * These exist because the same input styling was copied into thirteen files,
 * and the login form shipped with placeholders and no labels at all. Sharing
 * them means an accessibility fix is made once rather than thirteen times.
 *
 * Every field gets a real `<label>` tied to its control by id. A placeholder
 * is never a label: it disappears the moment someone starts typing, and a
 * screen reader announces an unlabelled edit field.
 */

const controlClass =
  "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60";

function Wrapper({
  label,
  hint,
  optional,
  htmlFor,
  className,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-foreground">
        {label}
        {optional && (
          <span className="font-normal text-muted-foreground"> (optional)</span>
        )}
      </label>
      {children}
      {hint && (
        <span id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

export function Input({
  label,
  hint,
  optional,
  className,
  fieldClassName,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  optional?: boolean;
  fieldClassName?: string;
}) {
  const generated = useId();
  const inputId = id ?? generated;
  return (
    <Wrapper
      label={label}
      hint={hint}
      optional={optional}
      htmlFor={inputId}
      className={fieldClassName}
    >
      <input
        id={inputId}
        aria-describedby={hint ? `${inputId}-hint` : undefined}
        className={cn(controlClass, className)}
        {...props}
      />
    </Wrapper>
  );
}

export function Select({
  label,
  hint,
  optional,
  className,
  fieldClassName,
  id,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  hint?: string;
  optional?: boolean;
  fieldClassName?: string;
}) {
  const generated = useId();
  const selectId = id ?? generated;
  return (
    <Wrapper
      label={label}
      hint={hint}
      optional={optional}
      htmlFor={selectId}
      className={fieldClassName}
    >
      <select
        id={selectId}
        aria-describedby={hint ? `${selectId}-hint` : undefined}
        className={cn(controlClass, className)}
        {...props}
      >
        {children}
      </select>
    </Wrapper>
  );
}

/**
 * The outcome of an action.
 *
 * Every action reports by redirecting with a query parameter, which reloads
 * the document. Without a live region a screen reader user gets no signal
 * that anything happened, which combined with a still-enabled button invites
 * a second submission.
 *
 * Errors use role="alert" so they interrupt; confirmations use role="status"
 * so they wait their turn.
 */
export function StatusBanner({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (!error && !message) return null;

  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-text"
        >
          {error}
        </p>
      )}
      {message && (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success-text"
        >
          {message}
        </p>
      )}
    </>
  );
}
