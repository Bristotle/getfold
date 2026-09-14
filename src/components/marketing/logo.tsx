/**
 * The Fold mark.
 *
 * The church, matching the brand files in public/brand exactly. It used to
 * be a plain house outline with an arched door, which read as a generic
 * home icon and did not match anything we sent anybody.
 *
 * `showTagline` is off by default so the mark can sit in the app header
 * without repeating the pitch on every page.
 *
 * `variant="light"` is for a dark ground, such as the panel beside the
 * sign in form, where the brand purple on deep purple would disappear.
 */
export function Logo({
  showTagline = false,
  size = "md",
  variant = "default",
}: {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "light";
}) {
  const markClass = variant === "light" ? "text-white" : "text-primary";
  const wordClass = variant === "light" ? "text-white" : "text-foreground";
  const taglineClass =
    variant === "light" ? "text-white/70" : "text-muted-foreground";
  const dims =
    size === "lg" ? 40 : size === "sm" ? 24 : 30;
  const wordmark =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/*
          The church, simplified. The full mark in public/brand carries the
          side wings, the rose window and the small windows; below about
          40px those close into a smudge, and the header renders at 24 to 40.
          This is the same building with that detail removed, not a second
          idea, so the site and the brand kit read as one mark.
        */}
        <g
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={markClass}
        >
          {/* cross */}
          <path d="M60 8v16M52 16h16" />
          {/* steeple */}
          <path d="M42 40 60 22l18 18" />
          <path d="M47 40v18M73 40v18" />
          {/* nave roof and walls */}
          <path d="M18 82 60 50l42 32" />
          <path d="M29 80v28M91 80v28" />
          {/* the door */}
          <path d="M50 108V90a10 10 0 0 1 20 0v18" />
          {/* ground */}
          <path d="M12 108h96" />
        </g>
      </svg>

      <span className="flex flex-col leading-none">
        <span
          className={`${wordmark} font-bold tracking-tight ${wordClass}`}
        >
          Fold
        </span>
        {showTagline && (
          <span className={`mt-1 text-[11px] font-medium uppercase tracking-[0.16em] ${taglineClass}`}>
            Know your flock
          </span>
        )}
      </span>
    </span>
  );
}
