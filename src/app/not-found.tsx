import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Page not found, Fold",
  robots: { index: false },
};

/**
 * The page that is not there.
 *
 * A wrong link from a WhatsApp forward, a mistyped address, a post that
 * was renamed. Whoever arrives here was looking for something, so the page
 * offers the four places that answer most questions and a search box into
 * the help centre, rather than a number and an apology.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <p className="font-numeric text-sm font-semibold uppercase tracking-wide text-primary">
              404
            </p>
            <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              That page is not here
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
              The link may be old or mistyped. Nothing of your church&rsquo;s
              has gone anywhere.
            </p>

            <form
              action="/help/search"
              method="get"
              className="mx-auto mt-8 flex max-w-md gap-2"
            >
              <label htmlFor="nf-q" className="sr-only">
                Search the help centre
              </label>
              <input
                id="nf-q"
                name="q"
                type="search"
                placeholder="Search the help centre"
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />
              <button
                type="submit"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Search
              </button>
            </form>

            <ul className="m-0 mt-8 flex list-none flex-wrap justify-center gap-x-6 gap-y-2 p-0 text-sm font-medium">
              <li><Link href="/" className="text-primary hover:underline">Home</Link></li>
              <li><Link href="/pricing" className="text-primary hover:underline">Pricing</Link></li>
              <li><Link href="/help" className="text-primary hover:underline">Help centre</Link></li>
              <li><Link href="/blog" className="text-primary hover:underline">Blog</Link></li>
              <li><Link href="/contact" className="text-primary hover:underline">Contact</Link></li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
