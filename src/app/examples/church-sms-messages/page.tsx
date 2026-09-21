import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { TryBand } from "@/components/marketing/try-band";
import { SMS_CATEGORIES, SMS_COUNT } from "@/lib/sms-examples";
import { metaDescription } from "@/lib/seo";

const TITLE = `${SMS_COUNT} church SMS examples for Ghana: welcome, tithe thank you, birthdays, reminders`;
const DESCRIPTION =
  "Ready to send texts for a Ghanaian church, each under 160 characters with a line on why it works: first-time visitor welcomes, tithe thank yous, birthdays, reminders, absences, funerals and pledges.";

export const metadata: Metadata = {
  title: `${SMS_COUNT} church SMS examples for Ghana`,
  description: metaDescription(DESCRIPTION),
  keywords: [
    "church SMS templates",
    "church text message examples",
    "welcome message for first time visitors church",
    "tithe thank you message",
    "church birthday SMS",
  ],
  alternates: { canonical: "https://www.getfold.org/examples/church-sms-messages" },
  openGraph: { images: ["/og-default.png"], title: TITLE, description: DESCRIPTION },
};

/**
 * The gallery. Every example is a real text with a real reason, and each
 * category opens with when to send it, which is the part most churches
 * get wrong: the right message on the wrong day is spam.
 */
export default function SmsExamplesPage() {
  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE,
            description: DESCRIPTION,
            author: { "@type": "Organization", name: "Fold" },
            publisher: { "@type": "Organization", name: "Fold", logo: { "@type": "ImageObject", url: "https://www.getfold.org/brand/fold-icon@512.png" } },
            datePublished: "2026-09-21",
            dateModified: "2026-09-21",
            mainEntityOfPage: "https://www.getfold.org/examples/church-sms-messages",
          }),
        }}
      />
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Examples</p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              {SMS_COUNT} texts a church actually sends
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Each one under 160 characters so it goes as one message and one
              credit, with a line on why it works. Copy them, change the names,
              send them from your church&rsquo;s own name.
            </p>
            <nav aria-label="Categories" className="mt-8 flex flex-wrap justify-center gap-2">
              {SMS_CATEGORIES.map((c) => (
                <a
                  key={c.slug}
                  href={`#${c.slug}`}
                  className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface px-3.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {c.name}
                </a>
              ))}
            </nav>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="rounded-xl border border-border bg-surface-soft px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
            <strong className="font-semibold text-foreground">Three rules before any of these.</strong>{" "}
            Send from the church&rsquo;s name, not a number: a sender name of up to 11 letters is registered once with the SMS provider. Send one thing per text. And send to the people it concerns, which means a class reminder goes to the class, not the register.
          </div>

          {SMS_CATEGORIES.map((c) => (
            <div key={c.slug} id={c.slug} className="mt-14 scroll-mt-24 first:mt-10">
              <h2 className="text-balance font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {c.name}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{c.intro}</p>
              <ul className="m-0 mt-6 flex list-none flex-col gap-5 p-0">
                {c.examples.map((e) => (
                  <li key={e.text} className="min-w-0 rounded-2xl border border-border bg-surface p-5">
                    <div className="flex gap-3">
                      <span aria-hidden="true" className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                        <MessageSquareText size={16} strokeWidth={2} />
                      </span>
                      <p className="min-w-0 text-[16px] leading-relaxed text-foreground">{e.text}</p>
                    </div>
                    <p className="mt-3 border-t border-border pt-3 text-[14px] leading-relaxed text-muted-foreground">
                      <strong className="font-semibold text-foreground">Why it works:</strong> {e.why}
                    </p>
                    <p className="mt-2 font-numeric text-xs text-muted-foreground">
                      {e.text.length} characters
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-14 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-lg font-bold text-foreground">Sent for you, from your church&rsquo;s name</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              Fold sends the thank you a few minutes after a mobile money gift succeeds, the birthday text on the morning from the register, and lets a class leader text their own class. The sender name is your church&rsquo;s.
            </p>
            <Link href="/features/communication" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
              Communication in Fold
              <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
            </Link>
          </div>
        </section>

        <TryBand
          title="The texts write themselves when the register is right"
          body="Birthdays, thank yous and class reminders come from records your team already keeps. Thirty days free, no card."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
