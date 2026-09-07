import Image from "next/image";
import { SectionBg } from "@/components/marketing/section-bg";

/**
 * A photograph of a real congregation, with the church named underneath.
 *
 * Renders nothing until NEXT_PUBLIC_CONGREGATION_IMAGE is set, so the page
 * is never waiting on an image we do not have the right to use.
 *
 * A band rather than a hero on purpose. The hero keeps the product
 * screenshot, which is what a pastor is actually deciding on, and this
 * sells belonging further down. It also means the photograph does not need
 * empty space for a headline, so a wider range of shots will work.
 *
 * The caption is the point. An uncredited photograph is decoration; a
 * photograph captioned with a real church's name is social proof, which is
 * the largest gap we have against every competitor. Set
 * NEXT_PUBLIC_CONGREGATION_CREDIT to the church or photographer to credit,
 * and set it whenever the licence asks for attribution.
 */
export function CongregationBand() {
  const src = process.env.NEXT_PUBLIC_CONGREGATION_IMAGE;
  if (!src) return null;

  const caption = process.env.NEXT_PUBLIC_CONGREGATION_CAPTION;
  const credit = process.env.NEXT_PUBLIC_CONGREGATION_CREDIT;
  const alt =
    process.env.NEXT_PUBLIC_CONGREGATION_ALT ??
    "A congregation gathered for worship";

  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-surface">
      <SectionBg variant="orbs" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14">
          <figure className="m-0">
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <Image
                src={src}
                alt={alt}
                width={1400}
                height={900}
                className="h-auto w-full object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
                priority={false}
              />
            </div>
            {(caption || credit) && (
              <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {caption && (
                  <span className="font-medium text-foreground">{caption}</span>
                )}
                {credit && <span>Photograph: {credit}</span>}
              </figcaption>
            )}
          </figure>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Who this is for
            </p>
            <h2 className="mt-3 text-balance font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
              The society, the circuit, the class
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              Not an abstraction. A society with Bible classes and class
              leaders, a return due at the circuit, a register that has been
              kept in a book for thirty years, and a secretary who loses an
              evening to it every quarter.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              That is the church Fold is built around, in the words that
              church already uses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
