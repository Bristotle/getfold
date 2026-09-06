"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const inputClass =
  "h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40";

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Presets churches actually report on, rather than arbitrary ranges. */
function presets() {
  const now = new Date();
  const y = now.getFullYear();
  const q = Math.floor(now.getMonth() / 3);
  return [
    {
      label: "This month",
      from: iso(new Date(y, now.getMonth(), 1)),
      to: iso(now),
    },
    {
      label: "This quarter",
      from: iso(new Date(y, q * 3, 1)),
      to: iso(now),
    },
    { label: "This year", from: `${y}-01-01`, to: iso(now) },
    { label: "Last year", from: `${y - 1}-01-01`, to: `${y - 1}-12-31` },
  ];
}

export function PeriodPicker({ from, to }: { from: string; to: string }) {
  const router = useRouter();

  // A plain GET form would work, but pushing the route keeps the printed
  // sheet and the URL in step, so a range can be shared or bookmarked.
  const go = (nextFrom: string, nextTo: string) =>
    router.push(`/reports?from=${nextFrom}&to=${nextTo}`);

  return (
    <Card>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">From</span>
          <input
            type="date"
            defaultValue={from}
            className={inputClass}
            onChange={(e) => e.target.value && go(e.target.value, to)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">To</span>
          <input
            type="date"
            defaultValue={to}
            className={inputClass}
            onChange={(e) => e.target.value && go(from, e.target.value)}
          />
        </label>

        <div className="flex flex-wrap gap-1">
          {presets().map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => go(p.from, p.to)}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-surface-soft hover:text-foreground"
            >
              {p.label}
            </button>
          ))}
        </div>

        <Button type="button" onClick={() => window.print()} className="ml-auto">
          Print / save as PDF
        </Button>
      </div>
    </Card>
  );
}
