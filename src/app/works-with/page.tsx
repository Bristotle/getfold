import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { INTEGRATIONS } from "@/lib/integrations";

export const metadata: Metadata = {
  title: "What Fold works with: MoMo, Paystack, Excel, SMS",
  description:
    "Does Fold work with MTN MoMo, Telecel Cash, AirtelTigo Money, Paystack, Excel and Arkesel SMS? Yes. How each connects, what it costs and what it cannot do.",
  alternates: { canonical: "https://www.getfold.org/works-with" },
  openGraph: { images: ["/og-default.png"], title: "What Fold works with", description: "Mobile money networks, Paystack, Excel and SMS: how each connects." },
};

export default function WorksWithPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Works with</p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              The things your church already uses
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Every wallet your members give from, the processor that settles it,
              the spreadsheet your register is in, and the texts your church sends.
              How each connects, what it costs, and what it cannot do.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((i) => (
              <li key={i.slug} className="min-w-0">
                <Link href={`/works-with/${i.slug}`} className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {i.kind === "wallet" ? "Mobile money" : i.kind === "processor" ? "Payments" : i.kind === "file" ? "Your register" : "Messaging"}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-foreground group-hover:text-primary">Fold + {i.name}</h2>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted-foreground">{i.what}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    How it works
                    <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <TryBand title="Nothing to install, nothing to integrate" body="Name where giving settles, choose a sender name, upload your register. Thirty days free, no card." />
      </main>
      <SiteFooter />
    </div>
  );
}
