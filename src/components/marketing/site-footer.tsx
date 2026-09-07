import Link from "next/link";
import { Logo } from "@/components/marketing/logo";

/**
 * The public footer.
 *
 * Carries the legal links a church will look for before trusting software
 * with its members' personal data, and the Manuel Technologies attribution.
 */
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Getting started", href: "/getting-started" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Sign in", href: "/login" },
      { label: "Start free trial", href: "/login" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms and conditions", href: "/terms" },
    ],
  },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
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
  );
}
