import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SupportWidgets } from "@/components/marketing/support-widgets";
import { OPPORTUNITIES } from "@/lib/join";

/**
 * The public footer.
 *
 * Carries the legal links a church will look for before trusting software
 * with its members' personal data, and the Manuel Technologies attribution.
 */
/**
 * Three columns.
 *
 * Product is what a church is buying. Quick links is everything else it
 * might want to read, legal included. Join us is for a different reader
 * entirely, somebody who wants to work with us rather than buy from us,
 * and each entry is its own page so it can be found on its own terms.
 *
 * Join us is generated from OPPORTUNITIES rather than typed out here, so a
 * new one appears in the footer, on /join and in the sitemap from a single
 * edit.
 */
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Compare", href: "/compare" },
      { label: "Pricing", href: "/contact" },
      { label: "Getting started", href: "/getting-started" },
      { label: "Help centre", href: "/help" },
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    heading: "Quick links",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms and conditions", href: "/terms" },
    ],
  },
  {
    heading: "Join us",
    links: [
      { label: "All opportunities", href: "/join" },
      ...OPPORTUNITIES.map((o) => ({
        label: o.title,
        href: `/join/${o.slug}` as const,
      })),
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <>
      <SupportWidgets />
      <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo showTagline />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Church management built for how Ghanaian churches actually
              operate. Cash first, configurable to your denomination.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {col.heading}
              </h2>
              <ul className="m-0 mt-3 flex list-none flex-col gap-2 p-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="rounded text-sm text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Fold. All rights reserved.</p>
          <p>
            Built by{" "}
            <a
              href="https://manueltechnologies.com"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Manuel Technologies
            </a>
          </p>
        </div>
      </div>
      </footer>
    </>
  );
}
