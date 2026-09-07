import Link from "next/link";
import { Logo } from "@/components/marketing/logo";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Shared chrome for the legal pages, so privacy and terms cannot drift
 * apart in header, measure or type scale.
 *
 * Running text is held near 70 characters. These are documents someone
 * actually has to read, often on a phone.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="rounded text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {updated}
        </p>
        <div className="legal mt-10 flex flex-col gap-6 text-[15px] leading-relaxed text-muted-foreground">
          {children}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-foreground">{heading}</h2>
      {children}
    </section>
  );
}
