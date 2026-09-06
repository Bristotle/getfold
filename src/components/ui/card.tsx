import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-5 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardLabel({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function CardStat({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("font-numeric text-3xl font-bold text-foreground", className)}
      {...props}
    />
  );
}
