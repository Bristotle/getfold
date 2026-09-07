import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";

/**
 * The public header.
 *
 * Two headers in one element, switched at sm. On a phone the links used to
 * wrap onto a second row, which on a 390px screen meant a header two rows
 * deep before the page had said anything. They now live behind a hamburger.
 *
 * The disclosure is a real <details>, not React state: it opens before
 * hydration, it is keyboard operable and announced correctly for free, and
 * it costs the page no JavaScript at all. The panel is hidden outright at
 * sm and up so the same markup cannot leave a stray open menu behind when
 * a phone is rotated into a tablet width.
 */
const LINKS = [
  { href: "/about", label: "About" },
  { href: "/getting-started", label: "Getting started" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ---------- the bar ---------- */}
        <div className="flex min-w-0 items-center justify-between gap-4 py-3.5">
          <Link
            href="/"
            className="min-w-0 shrink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Logo />
          </Link>

          {/* desktop links */}
          <nav aria-label="Site" className="hidden min-w-0 sm:block">
            <ul className="m-0 flex list-none items-center gap-x-5 p-0">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="whitespace-nowrap rounded py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* desktop actions */}
          <div className="hidden shrink-0 items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="whitespace-nowrap rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Sign in
            </Link>
            <Link href="/login">
              <Button size="sm">Start free trial</Button>
            </Link>
          </div>

          {/* phone menu */}
          <details className="group relative shrink-0 sm:hidden">
            <summary
              aria-label="Menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
            >
              {/* three bars that become a cross when the panel is open */}
              <span
                aria-hidden="true"
                className="relative block h-4 w-5 [&>span]:absolute [&>span]:left-0 [&>span]:block [&>span]:h-0.5 [&>span]:w-full [&>span]:rounded-full [&>span]:bg-current [&>span]:transition-transform"
              >
                <span className="top-0 group-open:top-[7px] group-open:rotate-45" />
                <span className="top-[7px] group-open:opacity-0" />
                <span className="top-[14px] group-open:top-[7px] group-open:-rotate-45" />
              </span>
            </summary>

            <nav
              aria-label="Site"
              className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(17rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-2 shadow-[0_18px_50px_-20px_rgba(26,16,51,0.35)]"
            >
              <ul className="m-0 flex list-none flex-col p-0">
                {LINKS.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-2 flex flex-col gap-2 border-t border-border pt-2">
                <Link
                  href="/login"
                  className="flex min-h-11 items-center rounded-lg px-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Start free trial
                </Link>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
