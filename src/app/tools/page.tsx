import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Printer, Calculator } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Free tools for churches in Ghana",
  description:
    "Printable templates for Ghanaian churches: statistical return, attendance sheet, offering count sheet, membership form, and a giving fee calculator. No sign up.",
  alternates: { canonical: "https://www.getfold.org/tools" },
  openGraph: {
    images: ["/og-default.png"],
    title: "Free tools for churches",
    description: "Printable templates and a giving fee calculator. No sign up.",
  },
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Free tools</p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Things a church can use this Sunday
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Printable sheets for the register, the count and the return, and a
              calculator for what mobile money giving costs. No account, no
              email address, nothing to unlock.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.slug} className="min-w-0">
                <Link
                  href={`/tools/${t.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    {t.printable ? <Printer size={20} strokeWidth={1.8} /> : <Calculator size={20} strokeWidth={1.8} />}
                  </span>
                  <h2 className="mt-4 text-lg font-bold text-foreground group-hover:text-primary">{t.name}</h2>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{t.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    {t.printable ? "Open and print" : "Open the calculator"}
                    <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <TryBand
          title="Or let the counting do itself"
          body="Every sheet here is a thing Fold fills in from the records your team keeps as they go. Thirty days free, no card."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
