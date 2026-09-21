"use client";

import { Printer } from "lucide-react";

/** Opens the browser's print dialogue, where "Save as PDF" also lives. */
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print-hide inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <Printer size={16} strokeWidth={2.2} aria-hidden="true" />
      {label}
    </button>
  );
}
