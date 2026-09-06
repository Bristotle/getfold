/**
 * The Fold mark.
 *
 * A church door rather than a steeple or a cross: a door is what a fold has,
 * and it reads at 20px where a detailed building does not. The arch doubles
 * as the shelter the name refers to.
 *
 * `showTagline` is off by default so the mark can sit in the app header
 * without repeating the pitch on every page.
 */
export function Logo({
  showTagline = false,
  size = "md",
}: {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg" ? 40 : size === "sm" ? 24 : 30;
  const wordmark =
    size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";

  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        width={dims}
        height={dims}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* roof */}
        <path
          d="M4 14.5 16 4l12 10.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {/* walls */}
        <path
          d="M6.5 13.5V27h19V13.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
        {/* the door: an arch, the fold itself */}
        <path
          d="M12.5 27v-6a3.5 3.5 0 1 1 7 0v6"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
        />
      </svg>

      <span className="flex flex-col leading-none">
        <span
          className={`${wordmark} font-bold tracking-tight text-foreground`}
        >
          Fold
        </span>
        {showTagline && (
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Know your flock
          </span>
        )}
      </span>
    </span>
  );
}
