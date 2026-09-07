import Image from "next/image";
import { Quote } from "lucide-react";
import { SectionBg } from "@/components/marketing/section-bg";

/**
 * Social proof.
 *
 * The largest gap on our homepage against every competitor: ten of the
 * eleven products audited show church logos, member counts, testimonials or
 * star ratings, and we show none.
 *
 * The arrays below are empty on purpose, and this section renders nothing
 * while they are. A testimonial attributed to a church that has not given
 * one is a fabricated record, and inventing one on a page whose whole
 * argument is "every claim here is checkable" would be the worst possible
 * thing to put on it.
 *
 * To turn this on, add the real quote with the real name, title and church,
 * given with their permission. Nothing else needs changing.
 */
type Testimonial = {
  quote: string;
  name: string;
  /** Their role in their own words, for example "Presiding Elder". */
  role: string;
  church: string;
  /** Optional. Put the file in /public and give the path here. */
  photo?: string;
};

const TESTIMONIALS: Testimonial[] = [];

/** Churches using Fold, shown as names rather than logos we do not have. */
const CHURCHES: string[] = [];

export function Proof() {
  if (TESTIMONIALS.length === 0 && CHURCHES.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <SectionBg variant="orbs" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        {CHURCHES.length > 0 && (
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Churches using Fold
            </p>
            <ul className="m-0 mt-5 flex list-none flex-wrap items-center justify-center gap-x-8 gap-y-3 p-0">
              {CHURCHES.map((c) => (
                <li
                  key={c}
                  className="text-balance text-[15px] font-semibold text-foreground/70"
                >
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {TESTIMONIALS.length > 0 && (
          <ul
            className={`m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 ${
              CHURCHES.length > 0 ? "mt-14" : ""
            }`}
          >
            {TESTIMONIALS.map((t) => (
              <li
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-background p-6"
              >
                <span aria-hidden="true" className="text-primary">
                  <Quote size={22} strokeWidth={2} />
                </span>
                <blockquote className="m-0 mt-4 flex-1 text-[16px] leading-relaxed text-foreground/85">
                  {t.quote}
                </blockquote>
                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  {t.photo && (
                    <Image
                      src={t.photo}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}, {t.church}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
