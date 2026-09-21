import Link from "next/link";
import { CtaBand } from "./section-bg";

/**
 * The closing band on the programmatic pages: glossary, tools, roles,
 * integrations, comparisons. One title and one sentence, then the trial.
 * A thin wrapper over CtaBand so these pages cannot compose a tenth band
 * by hand.
 */
export function TryBand({
  title,
  body,
  cta = "Start your 30 day free trial",
  href = "/signup",
}: {
  title: string;
  body: string;
  cta?: string;
  href?: "/signup" | "/contact" | "/pricing";
}) {
  return (
    <CtaBand>
      <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 sm:py-16">
        <h2 className="text-balance font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-primary-foreground/85">
          {body}
        </p>
        <div className="mt-8">
          <Link
            href={href}
            className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary-foreground px-6 text-base font-semibold text-primary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          >
            {cta}
          </Link>
        </div>
      </div>
    </CtaBand>
  );
}
