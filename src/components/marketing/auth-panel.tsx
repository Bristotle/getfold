import { Logo } from "@/components/marketing/logo";

/**
 * The brand panel beside the sign in and sign up forms.
 *
 * A CSS sky rather than a photograph, deliberately. We have no licensed
 * photograph of a Ghanaian congregation, and a stock American church behind
 * a Ghanaian product would be the first dishonest thing a new user sees. A
 * gradient with the church mark costs nothing to serve and cannot be wrong.
 *
 * To use a real photograph later, drop it in /public and set
 * NEXT_PUBLIC_AUTH_IMAGE to its path. The overlay is already tuned to keep
 * the type readable over an image.
 */
export function AuthPanel() {
  const image = process.env.NEXT_PUBLIC_AUTH_IMAGE;

  return (
    <aside
      aria-hidden="true"
      className="relative isolate hidden overflow-hidden lg:block"
      style={
        image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {/* the sky */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          background: image
            ? "linear-gradient(180deg, rgb(26 16 51 / 0.72) 0%, rgb(107 47 217 / 0.55) 100%)"
            : "linear-gradient(165deg, #2a1a52 0%, #6b2fd9 55%, #9d7bea 100%)",
        }}
      />
      {/* a faint lattice, the same one the marketing pages use */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 0%, #000 20%, transparent 100%)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-10 text-white xl:p-14">
        <Logo variant="light" />

        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            For societies, circuits and congregations across Ghana
          </p>
          <h2 className="mt-4 text-balance font-serif text-4xl font-bold leading-[1.08] xl:text-[2.9rem]">
            Church software that speaks your denomination&apos;s language.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/80">
            Members, Bible classes, attendance and giving recorded in your own
            words, and the statistical return your circuit asks for already
            filled in. No spreadsheet, and no rebuilding it every quarter.
          </p>

          {/*
            The verse the product is named after. Fold, a flock, a shepherd
            who knows his own. It earns its place here rather than being
            decoration.
          */}
          <figure className="relative mt-10 border-t border-white/20 pt-8">
            <span
              aria-hidden="true"
              className="absolute -top-1 left-0 font-serif text-6xl leading-none text-white/25"
            >
              &ldquo;
            </span>
            <blockquote className="m-0 pl-9 font-serif text-lg italic leading-relaxed text-white/90">
              Know well the condition of your flocks, and give attention to
              your herds.
            </blockquote>
            <figcaption className="mt-3 pl-9 text-xs font-semibold uppercase tracking-[0.14em] text-white/60">
              Proverbs 27:23
            </figcaption>
          </figure>
        </div>

        <p className="text-xs text-white/55">
          Know your flock. Built in Ghana by Manuel Technologies.
        </p>
      </div>
    </aside>
  );
}
