import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";
import { MODULES } from "@/lib/modules";

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
/*
  Features is a menu now, not a link. Each area of the product has a page
  of its own, and a pastor who wants to know about giving should land on
  giving rather than on a page about everything. The list comes from the
  same data as the pages and the footer, so it cannot name a page that does
  not exist.
*/
const LINKS = [
  { href: "/compare", label: "Compare" },
  { href: "/about", label: "About" },
  { href: "/getting-started", label: "Getting started" },
  { href: "/help", label: "Help" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * The verse the product is named after, as a thin bar above the header.
 *
 * Kept to one line and quiet on purpose. It is there to say what Fold is
 * for before anything else is read, not to compete with the hero. On a
 * phone the reference sits under the verse rather than beside it, so the
 * line never wraps mid-sentence.
 */
function VerseBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <p className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-x-3 gap-y-0.5 px-4 py-2 text-center sm:flex-row sm:px-6">
        <span className="font-serif text-[13px] italic leading-snug text-primary-foreground/95 sm:text-sm">
          &ldquo;Know well the condition of your flocks, and give attention to
          your herds.&rdquo;
        </span>
        <span className="font-numeric text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70 sm:text-[11px]">
          Proverbs 27:23
        </span>
      </p>
    </div>
  );
}

export function SiteHeader() {
  return (
    <>
    <VerseBar />
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
              {/*
                Opens on hover and on keyboard focus, with no JavaScript.
                group-focus-within keeps it open while any link inside has
                focus, so a keyboard user can tab through the whole list.
                The panel sits inside the same element as the trigger, so
                moving the pointer from one to the other never closes it.
              */}
              <li className="group relative">
                <Link
                  href="/features"
                  aria-haspopup="true"
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Features
                  <ChevronDown
                    size={14}
                    strokeWidth={2.2}
                    aria-hidden="true"
                    className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180"
                  />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="m-0 list-none rounded-xl border border-border bg-surface p-2 shadow-[0_18px_50px_-20px_rgba(26,16,51,0.35)]">
                    {MODULES.map((m) => (
                      <li key={m.slug}>
                        <Link
                          href={`/features/${m.slug}`}
                          className="flex min-h-10 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          {m.title}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-1 border-t border-border pt-1">
                      <Link
                        href="/features"
                        className="flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        All features
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
              {LINKS.map((l) => (
                <li key={l.label}>
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
              Log in
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
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
                <li>
                  {/* A second disclosure inside the first, for the same
                      reason the first is one: it works before hydration. */}
                  <details className="group/features">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
                      Features
                      <ChevronDown
                        size={16}
                        strokeWidth={2.2}
                        aria-hidden="true"
                        className="transition-transform group-open/features:rotate-180"
                      />
                    </summary>
                    <ul className="m-0 list-none p-0 pb-1 pl-3">
                      {MODULES.map((m) => (
                        <li key={m.slug}>
                          <Link
                            href={`/features/${m.slug}`}
                            className="flex min-h-10 items-center rounded-lg px-3 text-[14px] text-muted-foreground transition-colors hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            {m.title}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/features"
                          className="flex min-h-10 items-center rounded-lg px-3 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          All features
                        </Link>
                      </li>
                    </ul>
                  </details>
                </li>
                {LINKS.map((l) => (
                  <li key={l.label}>
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
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="flex min-h-11 items-center justify-center rounded-lg bg-primary px-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </details>
        </div>
      </div>
    </header>
    </>
  );
}
