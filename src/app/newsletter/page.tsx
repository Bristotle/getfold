import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";

export const metadata: Metadata = {
  title: "Newsletter, Fold",
  robots: { index: false },
};

/**
 * Where a newsletter sign up lands.
 *
 * The footer form is on every public page and those pages are static, so
 * the thank you cannot be shown in place without making all of them
 * dynamic. This page is the one dynamic thing, and it sends the visitor
 * back to wherever they were.
 */
export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string }>;
}) {
  const { status, from } = await searchParams;

  // Only a path on this site is ever linked back to.
  const back = from && from.startsWith("/") && !from.startsWith("//") ? from : "/";

  const copy =
    status === "bad-email"
      ? {
          title: "That email address did not look right",
          body: "Check it for a missing letter or an extra space and try again.",
        }
      : status === "failed"
        ? {
            title: "That did not go through",
            body: "Please try again in a moment. If it keeps failing, write to us and we will add you by hand.",
          }
        : {
            title: "You are on the list",
            body: "New products, features and projects related to the Christian faith, straight to your inbox, and not often. Nothing else, and one click to leave.",
          };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-muted-foreground">
              {copy.body}
            </p>
            <Link
              href={back as "/"}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Back to where you were
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
