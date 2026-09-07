import { Search } from "lucide-react";

/**
 * Help centre search.
 *
 * A plain GET form. It navigates to /help?q=..., the server filters the
 * article index, and the results render as HTML. No JavaScript, no search
 * index to download, and it works on the first paint. A church looking
 * something up mid Sunday should not be waiting on a bundle.
 */
export function HelpSearch({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/help" method="get" role="search" className="mx-auto max-w-xl">
      <label htmlFor="help-q" className="sr-only">
        Search the help centre
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
        >
          <Search size={18} strokeWidth={1.8} />
        </span>
        <input
          id="help-q"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder="Search for an answer, for example import members"
          className="h-14 w-full rounded-xl border border-border bg-surface pl-12 pr-28 text-[15px] text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 inline-flex min-h-10 -translate-y-1/2 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Search
        </button>
      </div>
    </form>
  );
}
