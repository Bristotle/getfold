import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SectionBg } from "@/components/marketing/section-bg";
import { SubmitButton } from "@/components/ui/submit-button";
import { SourceFields } from "@/components/source-fields";
import { createClient } from "@/lib/supabase/server";
import { QUESTIONS, SURVEY_SLUG, SURVEY_TITLE, MIN_RESPONSES } from "@/lib/survey";
import { AUTHORS } from "@/lib/posts";
import { submitSurvey } from "../actions";

const URL_ = `https://www.getfold.org/research/${SURVEY_SLUG}`;

export const metadata: Metadata = {
  title: SURVEY_TITLE,
  description:
    "An anonymous survey of how churches in Ghana keep their membership register, record giving and mobile money, take attendance and prepare the statistical return. Results published openly.",
  alternates: { canonical: URL_ },
  openGraph: { images: ["/og-default.png"], title: SURVEY_TITLE },
};

// Results change as answers arrive.
export const revalidate = 300;

type Row = { question: string | null; answer: string | null; n: number | null; total: number };

/**
 * Original research: ten questions to the people who keep church records.
 *
 * The form works with no JavaScript. The results section shows only the
 * count until MIN_RESPONSES have answered, then every answer's share, as
 * percentages with the count beside them so nobody mistakes 3 of 31 for a
 * national figure. See src/lib/survey.ts and migration 0052.
 */
export default async function SurveyPage({
  searchParams,
}: {
  searchParams: Promise<{ thanks?: string; error?: string }>;
}) {
  const { thanks, error } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.rpc("survey_results", {
    survey_slug: SURVEY_SLUG,
    min_responses: MIN_RESPONSES,
  });
  const rows = (data ?? []) as Row[];
  const total = Number(rows[0]?.total ?? 0);
  const published = total >= MIN_RESPONSES;
  const author = AUTHORS.founder;

  const share = (q: string) =>
    QUESTIONS.find((x) => x.id === q)!.options.map((o) => {
      const n = Number(rows.find((r) => r.question === q && r.answer === o)?.n ?? 0);
      return { label: o, n, pct: total ? Math.round((n / total) * 100) : 0 };
    });

  return (
    <div className="min-h-screen">
      {published && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Dataset",
              name: SURVEY_TITLE,
              description: `Anonymous answers from ${total} people who keep records for churches in Ghana, on how the register, giving, attendance and statistical return are kept.`,
              url: URL_,
              creator: { "@type": "Organization", name: "Fold", url: "https://www.getfold.org" },
              spatialCoverage: { "@type": "Place", name: "Ghana" },
              temporalCoverage: "2026",
              variableMeasured: QUESTIONS.map((q) => q.text),
              isAccessibleForFree: true,
            }),
          }}
        />
      )}
      <SiteHeader />
      <main id="main">
        <section className="relative isolate overflow-hidden border-b border-border">
          <SectionBg variant="aurora" />
          <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Research
            </p>
            <h1 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              How churches in Ghana keep their records
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              A 2026 survey by{" "}
              <Link href={author.url} className="font-semibold text-foreground hover:underline">
                {author.name}
              </Link>
              , {author.role}.
            </p>
            <div className="mt-6 rounded-xl border border-primary/25 bg-primary-soft p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">In short</p>
              <p className="mt-2 text-[17px] leading-relaxed text-foreground">
                {published
                  ? `${total} people who keep records for churches in Ghana answered ten questions on where the register is kept, how giving and mobile money are recorded, how attendance is taken and how long the statistical return takes. The full results are below, as shares of everyone who answered.`
                  : `Nobody has published how churches in Ghana actually keep their records, so we are asking. Ten questions, about two minutes, anonymous. Results are published here for anyone to use once ${MIN_RESPONSES} churches have answered; ${total} have so far.`}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <section id="results" className="scroll-mt-24">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Results</h2>
            {thanks && (
              <p className="mt-3 rounded-lg bg-success/10 px-3 py-2 text-sm text-success-text">
                Thank you. Your answers are counted.
              </p>
            )}
            {!published ? (
              <p className="mt-3 text-[17px] leading-relaxed text-foreground/85">
                <span className="font-numeric font-semibold">{total}</span> of the{" "}
                <span className="font-numeric">{MIN_RESPONSES}</span> answers needed so far.
                Below {MIN_RESPONSES}, a percentage would be one or two churches, so nothing is
                shown until then. Share this page with another church secretary or treasurer.
              </p>
            ) : (
              <div className="mt-6 flex flex-col gap-6">
                {QUESTIONS.map((q) => (
                  <figure key={q.id} className="m-0 min-w-0 rounded-xl border border-border bg-surface p-4 sm:p-5">
                    <figcaption className="text-sm font-bold text-foreground">{q.text}</figcaption>
                    <table className="mt-3 w-full text-sm">
                      <tbody>
                        {share(q.id).map((r) => (
                          <tr key={r.label}>
                            <th scope="row" className="w-1/2 py-1.5 pr-3 text-left font-normal text-foreground/85">
                              {r.label}
                            </th>
                            <td className="py-1.5">
                              <span className="flex min-w-0 items-center gap-2">
                                <span aria-hidden="true" className="h-3 shrink-0 rounded-sm bg-primary" style={{ width: `${Math.max(1, r.pct) * 0.6}%` }} />
                                <span className="font-numeric text-foreground">{r.pct}%</span>
                                <span className="font-numeric text-xs text-muted-foreground">({r.n})</span>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </figure>
                ))}
                <p className="text-xs text-muted-foreground">
                  {total} answers. Shares are of everyone who answered; a question someone
                  skipped is not counted for them, so a column may sum to less than 100%.
                  Self selected, not a random sample: read it as how these churches work, not
                  as a census. Free to quote with a link to this page.
                </p>
              </div>
            )}
          </section>

          <section id="survey" className="mt-12 scroll-mt-24 border-t border-border pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Answer the survey</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              For whoever keeps records for a church: pastor, secretary, treasurer or class
              leader. Your church is never named, and no single answer is ever shown.
            </p>
            {error && (
              <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger-text">{error}</p>
            )}
            <form action={submitSurvey} className="mt-6 flex flex-col gap-6">
              <SourceFields />
              {/* Hidden from people, filled in by bots. */}
              <div aria-hidden="true" className="hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {QUESTIONS.map((q, n) => (
                <fieldset key={q.id} className="m-0 min-w-0 border-0 p-0">
                  <legend className="text-base font-bold text-foreground">
                    <span className="font-numeric text-muted-foreground">{n + 1}. </span>
                    {q.text}
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o) => (
                      <label key={o} className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
                        <input type="radio" name={q.id} value={o} className="h-4 w-4 shrink-0 accent-[var(--color-primary)]" />
                        {o}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">
                  Email, if you would like the results{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </span>
                <input name="email" type="email" maxLength={200} className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
                <span className="text-xs text-muted-foreground">
                  Used once, to send the results. Never published, never shared, never added to
                  any list.
                </span>
              </label>
              <SubmitButton size="lg" pendingLabel="Sending…">Send my answers</SubmitButton>
            </form>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
