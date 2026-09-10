import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg, CtaBand } from "@/components/marketing/section-bg";
import { sortedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Church admin, giving and attendance, the Fold blog",
  description:
    "Practical writing for Ghanaian churches on registers, attendance, giving and the quarterly return. No jargon, no sales pitch.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main id="main">
        {/* ---------- hero ---------- */}
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Blog
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Notes on running a church well
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Registers, attendance, giving and the quarterly return, written
              for how churches in Ghana actually work. Useful whether or not
              you ever use Fold.
            </p>
          </div>
        </section>

        {/* ---------- posts ---------- */}
        <section className="relative isolate overflow-hidden bg-surface">
          <SectionBg variant="dots" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
            <ul className="m-0 flex list-none flex-col gap-5 p-0">
              {sortedPosts.map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block rounded-2xl border border-border bg-background p-6 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:p-8"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {post.category}
                      </span>
                      <time
                        dateTime={post.published}
                        className="font-numeric text-xs text-muted-foreground"
                      >
                        {post.date}
                      </time>
                    </div>

                    <h2 className="mt-3 text-balance text-xl font-bold leading-snug tracking-tight text-foreground group-hover:text-primary sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      Read more
                      <ArrowRight
                        size={15}
                        strokeWidth={2.2}
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- close ---------- */}
        <CtaBand>
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Stop rebuilding the same return every quarter
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
              Register, attendance and giving in one place, on the phone in
              your pocket. Thirty days free, no card, no commitment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Start your free trial
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-primary-foreground/40 px-6 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
              >
                Talk to a person
              </Link>
            </div>
          </div>
        </CtaBand>
      </main>

      <SiteFooter />
    </div>
  );
}
