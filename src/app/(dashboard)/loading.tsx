/**
 * Shown while a dashboard page's data is being fetched.
 *
 * Skeleton rather than a spinner: it holds the shape of the page so the
 * layout does not jump when content arrives, which matters most on the slow
 * connections this product is built for. `role="status"` announces the wait
 * to a screen reader rather than leaving silence.
 */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading</span>

      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 animate-pulse rounded bg-surface-soft" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-surface-soft" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-surface-soft" />
            <div className="mt-3 h-7 w-14 animate-pulse rounded bg-surface-soft" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 animate-pulse rounded bg-surface-soft"
              style={{ width: `${90 - i * 12}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
