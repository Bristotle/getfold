import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // min-h-9 keeps every variant at or above the 24px minimum target size
  // required by WCAG 2.2 AA (2.5.8). The destructive actions in tables used
  // to be bare 12px text links, which were both hard to hit on a phone and
  // missing a focus ring.
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-surface-soft",
        ghost: "text-foreground hover:bg-surface-soft",
        // For in-table actions: reads as a link, but keeps a real target size
        // and a visible focus state.
        quiet:
          "font-medium text-muted-foreground hover:bg-surface-soft hover:text-foreground",
        destructive:
          "font-medium text-danger-text hover:bg-danger/10 focus-visible:ring-danger/40",
      },
      size: {
        xs: "h-9 px-2 text-xs",
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";
