import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The phone representation of a table.
 *
 * A five or six column table on a 390px screen forces sideways scrolling to
 * reach the action at the end of each row, which is the wrong shape for the
 * device most of these users hold. Every list in the app therefore renders
 * twice: this below `sm`, the real table above it.
 *
 * Kept deliberately small. Each row is a title, a muted line of secondary
 * detail, an optional trailing value such as an amount or a status pill, and
 * an optional action. Anything that does not fit that shape should stay a
 * table and scroll.
 */
export function DataList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul className={cn("m-0 flex list-none flex-col p-0 sm:hidden", className)}>
      {children}
    </ul>
  );
}

export function DataRow({
  title,
  meta,
  trailing,
  action,
}: {
  title: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{title}</div>
        {meta && (
          <div className="mt-0.5 truncate text-xs text-muted-foreground">
            {meta}
          </div>
        )}
      </div>
      {(trailing || action) && (
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {trailing}
          {action}
        </div>
      )}
    </li>
  );
}

/** Wraps the real table so it only shows from `sm` up. */
export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="hidden overflow-x-auto sm:block">{children}</div>;
}

/** Joins secondary details with a middot, dropping anything empty. */
export function metaLine(...parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(" · ");
}
