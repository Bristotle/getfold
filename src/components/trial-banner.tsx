import Link from "next/link";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * The trial notice at the top of the app.
 *
 * Quiet for most of the trial and only becomes prominent in the last week,
 * because a banner shouting at a church from day one is a banner they stop
 * seeing by day ten.
 *
 * It never blocks anything. A church past its trial still owns its
 * register, and locking a pastor out of the membership list on day 31
 * would contradict everything we tell them about their own data.
 */
export function TrialBanner({
  status,
  daysLeft,
}: {
  status: string;
  daysLeft: number;
}) {
  if (status === "active" || status === "cancelled") return null;

  const over = daysLeft <= 0;
  const urgent = over || daysLeft <= 7;

  if (!urgent) {
    return (
      <div className="border-b border-border bg-surface-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 sm:px-6">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className="shrink-0">
              <Clock size={14} strokeWidth={1.9} />
            </span>
            <span>
              <span className="font-numeric font-semibold text-foreground">
                {daysLeft}
              </span>{" "}
              days left on your free trial.
            </span>
          </p>
          <Link
            href="/contact"
            className="rounded text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Talk to us about continuing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`border-b ${
        over
          ? "border-warning/40 bg-warning/10"
          : "border-primary/30 bg-primary-soft"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        <p className="flex items-start gap-2.5 text-sm">
          <span
            aria-hidden="true"
            className={`mt-0.5 shrink-0 ${
              over ? "text-warning-text" : "text-primary"
            }`}
          >
            {over ? (
              <AlertTriangle size={16} strokeWidth={2} />
            ) : (
              <Clock size={16} strokeWidth={2} />
            )}
          </span>
          <span className="text-foreground">
            {over ? (
              <>
                <strong className="font-semibold">
                  Your free trial has ended.
                </strong>{" "}
                Nothing has been deleted and your register is still yours.
                Talk to us to keep going, or export everything and leave.
              </>
            ) : (
              <>
                <strong className="font-semibold">
                  {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                </strong>{" "}
                on your free trial. Tell us how many members you have and we
                will send a price the same day.
              </>
            )}
          </span>
        </p>
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/contact"
            className="inline-flex min-h-9 items-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Continue with Fold
          </Link>
          {over && (
            <Link
              href="/members"
              className="rounded text-xs font-semibold text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Export my register
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
