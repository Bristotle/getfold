import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SupportWidgets } from "@/components/marketing/support-widgets";
import { OPPORTUNITIES } from "@/lib/join";
import { DENOMINATIONS } from "@/lib/denominations";

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
      { label: "Pricing", href: "/pricing" },
      { label: "Getting started", href: "/getting-started" },
      { label: "Help centre", href: "/help" },
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    heading: "Your church",
    links: DENOMINATIONS.map((d) => ({
      label: d.short,
      href: `/for/${d.slug}` as const,
    })),
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

      {/*
        A deep purple ground rather than the brand purple. The measurement
        decided it: white at 70% opacity on #6b2fd9 comes out at 4.17:1 and
        fails WCAG AA for normal text, while the deeper gradient below
        measures 8.68:1 at the same opacity. A footer is mostly small
        secondary type, so it needs the headroom.
      */}
      <footer
        className="relative isolate overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(160deg, #241442 0%, #33196b 45%, #4a1fa0 100%)",
        }}
      >
        {/* the same lattice the marketing sections use, in white */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 15%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 80% at 50% 0%, #000 15%, transparent 100%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(55% 70% at 12% 0%, rgb(255 255 255 / 0.10) 0%, transparent 60%), radial-gradient(45% 60% at 90% 100%, rgb(255 255 255 / 0.07) 0%, transparent 60%)",
          }}
        />

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1fr]">
            <div>
              <Logo showTagline variant="light" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">
                Church software built in Ghana around how a denomination
                actually works. Societies, circuits, Bible classes, and the
                return your circuit asks for.
              </p>

              {/*
                No WhatsApp button here. The floating one sits in the
                bottom right of every page, so a second one in the footer
                was the same offer twice, and two ways to do one thing is
                how a page starts feeling cluttered.
              */}
            </div>

            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#c9b3ff]">
                  {col.heading}
                </h2>
                <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="rounded text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-white/20 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {year} Fold. All rights reserved.</p>
            <p>
              Built by{" "}
              <a
                href="https://manueltechnologies.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded font-semibold text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
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
