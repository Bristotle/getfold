import Link from "next/link";
import { LifeBuoy, Search, BookOpen, Mail, X } from "lucide-react";
import { CATEGORIES } from "@/lib/help";

/**
 * The two floating helpers, one in each bottom corner.
 *
 * Left: a help launcher in the manner of a hosted support widget, but
 * without the hosted part. A real Zendesk or Intercom bubble downloads
 * several hundred kilobytes of third party JavaScript, watches the visitor,
 * and is the slowest thing on most marketing sites. This is a <details>
 * element and a handful of links into our own help centre: it opens before
 * hydration, it is keyboard operable and announced correctly for free, and
 * it adds no JavaScript at all.
 *
 * Right: WhatsApp, because that is how a Ghanaian pastor would rather ask a
 * question than by filling in a form.
 *
 * Both are marketing only. The app has a fixed bottom bar on phones and a
 * floating button would sit on top of it.
 */

/** 0247902348 in the form wa.me expects: country code, no plus, no spaces. */
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "233247902348";
const WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY ?? "024 790 2348";

const GREETING = encodeURIComponent(
  "Hello Fold, I have a question about using this for my church."
);

export function SupportWidgets() {
  return (
    <>
      {/* ---------------- help, bottom left ---------------- */}
      <details className="group fixed bottom-4 left-4 z-40 sm:bottom-6 sm:left-6">
        <summary
          aria-label="Help"
          className="flex h-12 cursor-pointer list-none items-center gap-2 rounded-full border border-border bg-surface pl-3.5 pr-4 text-sm font-semibold text-foreground shadow-[0_10px_30px_-10px_rgba(26,16,51,0.35)] transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden"
        >
          <span aria-hidden="true" className="text-primary group-open:hidden">
            <LifeBuoy size={19} strokeWidth={1.9} />
          </span>
          <span aria-hidden="true" className="hidden text-primary group-open:block">
            <X size={19} strokeWidth={2.2} />
          </span>
          <span className="group-open:hidden">Help</span>
          <span className="hidden group-open:block">Close</span>
        </summary>

        <div className="absolute bottom-[calc(100%+0.6rem)] left-0 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_50px_-16px_rgba(26,16,51,0.4)]">
          {/* the header band, with search inside it */}
          <div className="bg-primary p-4 text-primary-foreground">
            <p className="text-sm font-bold">Support</p>
            <form action="/help" method="get" role="search" className="mt-3">
              <label htmlFor="widget-q" className="sr-only">
                Search the help centre
              </label>
              <div className="relative">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <Search size={15} strokeWidth={2} />
                </span>
                <input
                  id="widget-q"
                  name="q"
                  type="search"
                  placeholder="How can we help?"
                  className="h-10 w-full rounded-lg border border-primary-foreground/30 bg-surface pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary-foreground focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                />
              </div>
            </form>
          </div>

          {/* the body */}
          <div className="p-3">
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Popular topics
            </p>
            <ul className="m-0 flex list-none flex-col p-0">
              {CATEGORIES.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/help/${c.slug}`}
                    className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-[13px] font-medium text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span aria-hidden="true" className="shrink-0 text-primary">
                      <BookOpen size={15} strokeWidth={1.9} />
                    </span>
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/help"
                className="flex min-h-10 items-center justify-center rounded-lg border border-border bg-background px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Browse the help centre
              </Link>
              <Link
                href="/contact"
                className="flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <Mail size={15} strokeWidth={2} aria-hidden="true" />
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </details>

      {/* ---------------- whatsapp, bottom right ---------------- */}
      <a
        href={`https://wa.me/${WHATSAPP}?text=${GREETING}`}
        target="_blank"
        rel="noopener noreferrer"
        className="group fixed bottom-4 right-4 z-40 flex h-12 items-center gap-2.5 rounded-full pl-3 pr-4 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(37,211,102,0.6)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:bottom-6 sm:right-6"
        style={{ background: "#25D366" }}
      >
        {/* WhatsApp's own mark, drawn rather than loaded from their CDN. */}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15h-.01c-1.5 0-2.98-.4-4.27-1.17l-.31-.18-3.17.83.85-3.09-.2-.32a8.22 8.22 0 0 1-1.26-4.39c0-4.54 3.7-8.23 8.24-8.23a8.2 8.2 0 0 1 8.23 8.24c0 4.54-3.7 8.23-8.1 8.23z" />
        </svg>
        <span className="hidden sm:inline">WhatsApp us</span>
        <span className="sr-only sm:hidden">
          WhatsApp us on {WHATSAPP_DISPLAY}
        </span>
      </a>
    </>
  );
}
