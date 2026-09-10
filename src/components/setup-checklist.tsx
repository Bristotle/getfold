import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Step } from "@/app/(dashboard)/dashboard/setup-progress";

/**
 * The first thing a new church sees, and the last thing it sees of this.
 *
 * It disappears the moment all five are done rather than lingering as a
 * permanent congratulation, because a church that has finished setting up
 * should get its dashboard back.
 *
 * Only the next unfinished step is expanded. A list of five things to do
 * is a list somebody puts off; one thing to do is a thing somebody does.
 */
export function SetupChecklist({
  steps,
  done,
  total,
  churchName,
}: {
  steps: Step[];
  done: number;
  total: number;
  churchName: string;
}) {
  const next = steps.find((s) => !s.done);
  const pct = Math.round((done / total) * 100);

  return (
    <Card>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-base font-bold text-foreground">
          {done === 0
            ? `Let's get ${churchName} set up`
            : `${churchName} is ${pct}% set up`}
        </h2>
        <span className="font-numeric text-xs text-muted-foreground">
          {done} of {total} done
        </span>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-soft"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Setup progress"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(pct, 3)}%` }}
        />
      </div>

      <ol className="m-0 mt-5 flex list-none flex-col gap-1.5 p-0">
        {steps.map((s) => {
          const isNext = s.key === next?.key;
          return (
            <li key={s.key}>
              {s.done ? (
                <div className="flex items-center gap-3 px-1 py-1.5">
                  <span
                    aria-hidden="true"
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success/15 text-success-text"
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/40">
                    {s.title}
                  </span>
                  {s.count ? (
                    <span className="font-numeric text-xs text-muted-foreground">
                      {s.count}
                    </span>
                  ) : null}
                </div>
              ) : isNext ? (
                <Link
                  href={s.href}
                  className="group flex gap-3 rounded-lg border border-primary/30 bg-primary-soft p-3.5 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      {s.title}
                      <ArrowRight
                        size={14}
                        strokeWidth={2.4}
                        aria-hidden="true"
                        className="text-primary transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      {s.why}
                    </span>
                  </span>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-1 py-1.5">
                  <span
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 rounded-full border border-border"
                  />
                  <span className="text-sm text-muted-foreground">
                    {s.title}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
