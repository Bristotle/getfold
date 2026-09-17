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
  /*
    The stages the owner decided. daysLeft counts down to the end of the
    trial and keeps going past it, so day 61 of the account is -30 and day
    91 is -60. The banner says which stage you are in and what the next one
    is, with the date, because a warning that names the date is one people
    act on.
  */
  const readOnly = status === "expired";
  const daysToReadOnly = daysLeft + 30;
  const daysToDeletion = daysLeft + 60;
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
            href="/billing"
            className="rounded text-xs font-semibold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Choose a plan
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
            {readOnly ? (
              <>
                <strong className="font-semibold">
                  Your account is read only.
                </strong>{" "}
                Everything is still here and can be exported, but nothing new
                can be recorded until you choose a plan.{" "}
                {daysToDeletion > 1
                  ? `In ${daysToDeletion} days the church and its records are deleted.`
                  : daysToDeletion === 1
                    ? "Tomorrow the church and its records are deleted."
                    : "The church and its records are due for deletion today."}
              </>
            ) : over ? (
              <>
                <strong className="font-semibold">
                  Your free trial has ended.
                </strong>{" "}
                Nothing has been deleted and you still have full use.{" "}
                {daysToReadOnly > 1
                  ? `In ${daysToReadOnly} days the account becomes read only`
                  : "Tomorrow the account becomes read only"}
                , and 30 days after that the records are removed. Choose a
                plan and nothing changes.
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
            href="/billing"
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
