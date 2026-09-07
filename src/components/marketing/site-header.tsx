import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { Button } from "@/components/ui/button";

/**
 * The public header.
 *
 * No JavaScript: on a phone the links wrap onto a second row rather than
 * hiding behind a menu button. Four destinations is few enough that a
 * hamburger would cost a tap and save nothing.
 */
const LINKS = [
  { href: "/getting-started", label: "Getting started" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Logo />
        </Link>

        <nav aria-label="Site" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="m-0 flex list-none flex-wrap items-center gap-x-5 gap-y-1 p-0">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Sign in
          </Link>
          <Link href="/login">
            <Button size="sm">Start free trial</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
