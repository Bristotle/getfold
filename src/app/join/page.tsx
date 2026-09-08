import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { OPPORTUNITIES } from "@/lib/join";

export const metadata: Metadata = {
  title: "Join us, partnerships and roles across Ghana",
  description:
    "Partner with Fold or work with us. Business, sales and brand partnerships, consulting, internships and engineering roles, open to anyone in Ghana.",
};

export default function JoinPage() {
  const groups = [
    { kind: "Partnership", label: "Partnerships" },
    { kind: "Role", label: "Roles" },
    { kind: "Programme", label: "Programmes" },
  ] as const;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
              Join us
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Work with us, from anywhere in Ghana
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Partnerships for people who already know churches, and roles for
              people who want to build software churches actually use. Accra,
              Kumasi, Takoradi, Tamale, or wherever you are.
            </p>
          </div>
        </section>

        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
            {groups.map((g) => {
              const items = OPPORTUNITIES.filter((o) => o.kind === g.kind);
              if (items.length === 0) return null;
              return (
                <div key={g.kind} className="mb-12 last:mb-0">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {g.label}
                  </h2>
                  <ul className="m-0 mt-4 flex list-none flex-col gap-3 p-0">
                    {items.map((o) => (
                      <li key={o.slug}>
                        <Link
                          href={`/join/${o.slug}`}
                          className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-background p-5 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <span className="min-w-0">
                            <span className="block text-balance text-base font-bold text-foreground group-hover:text-primary">
                              {o.title}
                            </span>
                            <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                              {o.summary}
                            </span>
                            <span className="mt-2.5 block text-xs text-muted-foreground">
                              {o.commitment}
                            </span>
                          </span>
                          <ArrowRight
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                            className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <p className="mt-10 rounded-xl border border-border bg-background p-5 text-sm leading-relaxed text-muted-foreground">
              None of these is a numbered vacancy with a closing date. Fold is
              a small company, and we would rather read a good application at
              the wrong moment than miss it. If what you do is not on this
              list, write anyway and say what it is.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
