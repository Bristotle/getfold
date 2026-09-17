import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ChevronRight } from "lucide-react";
import { Logo } from "@/components/marketing/logo";
import { SupportWidgets } from "@/components/marketing/support-widgets";
import { OPPORTUNITIES } from "@/lib/join";
import { DENOMINATIONS } from "@/lib/denominations";
import { MODULES } from "@/lib/modules";
import {
  PaymentMarks,
  PaystackMark,
} from "@/components/marketing/payment-marks";
import { Lock } from "lucide-react";
import { subscribeNewsletter } from "@/app/newsletter-actions";

/**
 * The public footer.
 *
 * Two bands. The top one is who we are and how to reach us: the mark, one
 * line, the social accounts, contact details, and the newsletter. The
 * second is the map of the site, five columns, each with a line under its
 * heading saying what is in it, because a heading alone is a label and a
 * heading with a line is an invitation.
 *
 * Every link column is generated from the same data as the pages it points
 * to, so a new feature, denomination or opportunity appears here from one
 * edit and can never point at a page that does not exist.
 */
const COLUMNS = [
  {
    heading: "Features",
    line: "Everything a church runs, in one place",
    links: [
      ...MODULES.map((m) => ({
        label: m.title,
        href: `/features/${m.slug}` as const,
      })),
      { label: "All features", href: "/features" },
    ],
  },
  {
    heading: "Product",
    line: "Plans, comparison and getting started",
    links: [
      { label: "Pricing", href: "/pricing" },
      { label: "Compare", href: "/compare" },
      { label: "Getting started", href: "/getting-started" },
      { label: "Help centre", href: "/help" },
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    heading: "Your church",
    line: "Built for how your denomination works",
    links: DENOMINATIONS.map((d) => ({
      label: d.short,
      href: `/for/${d.slug}` as const,
    })),
  },
  {
    heading: "Quick links",
    line: "About us and the small print",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Security", href: "/security" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms and conditions", href: "/terms" },
    ],
  },
  {
    heading: "Join us",
    line: "Work with Fold across Ghana",
    links: [
      { label: "All opportunities", href: "/join" },
      ...OPPORTUNITIES.map((o) => ({
        label: o.title,
        href: `/join/${o.slug}` as const,
      })),
    ],
  },
] as const;

/**
 * The social accounts, drawn inline. The marks are the standard ones and
 * carry no colour of their own here, so they sit quietly in white on the
 * purple ground rather than each shouting its brand.
 */
const SOCIAL = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/manuel-technologies/",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "Facebook",
    href: "https://web.facebook.com/profile.php?id=61594152671187",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    label: "X",
    href: "https://x.com/manueltechhq",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
] as const;

const linkClass =
  "group inline-flex items-center gap-1.5 rounded text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

/** The small arrow beside each link. Nudges on hover, and only then. */
function Arrow() {
  return (
    <ChevronRight
      size={13}
      strokeWidth={2.4}
      aria-hidden="true"
      className="shrink-0 text-[#c9b3ff] transition-transform group-hover:translate-x-0.5"
    />
  );
}

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
          {/* ---------- who we are, how to reach us ---------- */}
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr]">
            <div className="min-w-0">
              <Logo showTagline variant="light" />
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/75">
                Church software built in Ghana around how a denomination
                actually works.
              </p>

              <ul className="m-0 mt-5 flex list-none gap-2.5 p-0">
                {SOCIAL.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Fold on ${s.label}`}
                      className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 text-white/80 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d={s.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#c9b3ff]">
                Get in touch
              </h2>
              <p className="mt-1 text-xs text-white/60">
                We answer, usually the same day
              </p>
              <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0 text-sm">
                <li className="flex items-start gap-2.5">
                  <Phone size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-[#c9b3ff]" />
                  <span>
                    <span className="block text-xs text-white/60">Phone</span>
                    <a href="tel:+233247902348" className="font-numeric font-medium text-white/85 hover:text-white">
                      +233 24 790 2348
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-[#c9b3ff]" />
                  <span className="min-w-0">
                    <span className="block text-xs text-white/60">Email</span>
                    <a href="mailto:info@manueltechnologies.com" className="break-all font-medium text-white/85 hover:text-white">
                      info@manueltechnologies.com
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-[#c9b3ff]" />
                  <span>
                    <span className="block text-xs text-white/60">Office</span>
                    <span className="font-medium text-white/85">Accra, Ghana</span>
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock size={16} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-[#c9b3ff]" />
                  <span>
                    <span className="block text-xs text-white/60">Hours</span>
                    <span className="font-numeric font-medium text-white/85">Mon to Sat, 8am to 5pm</span>
                  </span>
                </li>
              </ul>
            </div>

            <div className="min-w-0" id="newsletter">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#c9b3ff]">
                Straight to your inbox
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-white/75">
                Free news of our new products, features and projects related
                to the Christian faith. Not often, and one click to leave.
              </p>
              {/*
                A plain form, so it works with no JavaScript. The honeypot is
                the same one the contact form uses.
              */}
              <form action={subscribeNewsletter} className="mt-4">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-0 w-0 opacity-0"
                />
                <input type="hidden" name="source" value="footer" />
                <label htmlFor="newsletter-email" className="sr-only">
                  Your email address
                </label>
                <div className="flex min-w-0 gap-2">
                  <input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@church.org"
                    className="h-11 min-w-0 flex-1 rounded-lg border border-white/25 bg-white/10 px-3 text-sm text-white placeholder:text-white/45 focus:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
                  />
                  <button
                    type="submit"
                    className="h-11 shrink-0 rounded-lg bg-white px-4 text-sm font-semibold text-[#33196b] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Join
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ---------- the map of the site ---------- */}
          <div className="mt-14 grid gap-10 border-t border-white/15 pt-12 sm:grid-cols-2 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.heading} className="min-w-0">
                <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[#c9b3ff]">
                  {col.heading}
                </h2>
                <p className="mt-1 text-xs leading-snug text-white/60">
                  {col.line}
                </p>
                <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className={linkClass}>
                        <Arrow />
                        <span>{l.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ---------- how you can pay ---------- */}
          <div className="mt-12 flex flex-col items-center gap-3 border-t border-white/15 pt-8">
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-white/75">
              <Lock size={14} strokeWidth={2.2} aria-hidden="true" />
              Payments secured by
              <PaystackMark />
            </span>
            <PaymentMarks />
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/15 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
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
