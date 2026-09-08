/**
 * A decorative background layer for a marketing section.
 *
 * Three rules make this safe to scatter across the site:
 *
 * 1. It is absolutely positioned and inset, so it contributes nothing to
 *    layout and cannot widen the document. The parent section needs
 *    `relative isolate overflow-hidden`.
 * 2. It is aria-hidden and pointer-events-none, so it is invisible to a
 *    screen reader and cannot swallow a click.
 * 3. Every variant is faint enough that the text contrast measured against
 *    the underlying token still holds.
 *
 * Variants are used in a rhythm rather than everywhere: two neighbouring
 * sections never share one, and plain sections are left plain so the eye
 * gets somewhere to rest.
 */
const VARIANTS = {
  /** Fine dot lattice fading from the top. Quiet texture. */
  dots: "bg-dots",
  /** Larger line grid. Reads as structure rather than texture. */
  grid: "bg-grid",
  /** Spotlight plus dots. The signature opening for every page hero. */
  aurora: "bg-aurora",
  /** Soft brand orbs left and right. Depth with no pattern. */
  orbs: "bg-orbs",
  /** White light on a purple band, where the brand colour is the ground. */
  mesh: "bg-mesh",
} as const;

export function SectionBg({ variant }: { variant: keyof typeof VARIANTS }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 ${VARIANTS[variant]}`}
    />
  );
}

/**
 * A photograph as a section background, with the scrim that makes type
 * readable over it.
 *
 * Renders nothing until NEXT_PUBLIC_CONGREGATION_IMAGE is set, so a
 * section using this simply keeps its `fallback` treatment until there is
 * an image we hold the right to publish. That means it can be wired up
 * now and switched on later by an environment variable alone.
 *
 * `tone` picks the scrim. Use "dark" under white type, which is the usual
 * case for a photograph behind a headline, and "light" under dark type.
 * The dark scrim is heavy on purpose: a congregation photograph is busy
 * edge to edge, and type over a thin wash of it is unreadable, which is
 * the mistake most sites make with an image hero.
 *
 * The three stops are not guesses. Each was composited over pure white,
 * the worst case for a photograph sitting under white type, and measured:
 * 12.06:1, 7.27:1 and 5.13:1 against white. The bottom stop was 0.78 and
 * measured 4.42:1, which fails WCAG AA for normal text, so it went to
 * 0.85. Anyone changing these numbers should measure again rather than
 * eyeball it, because a scrim that looks fine over a dark photograph
 * fails over a bright one.
 */
export function PhotoBg({
  tone = "dark",
  fallback,
}: {
  tone?: "dark" | "light";
  fallback?: keyof typeof VARIANTS;
}) {
  const src = process.env.NEXT_PUBLIC_CONGREGATION_IMAGE;

  if (!src) {
    return fallback ? <SectionBg variant={fallback} /> : null;
  }

  const scrim =
    tone === "dark"
      ? "linear-gradient(180deg, rgb(26 16 51 / 0.86) 0%, rgb(26 16 51 / 0.72) 45%, rgb(107 47 217 / 0.85) 100%)"
      : "linear-gradient(180deg, rgb(250 249 246 / 0.94) 0%, rgb(250 249 246 / 0.88) 100%)";

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0" style={{ background: scrim }} />
    </div>
  );
}

/**
 * A blurred photograph behind a light section, as a wash of colour rather
 * than a picture.
 *
 * Two things make this cheap enough to justify.
 *
 * The source is a 64 pixel wide file of about 1 KB, not the 170 KB one.
 * Blurring destroys detail, so scaling a tiny image up and blurring it in
 * CSS is visually identical to blurring a large one and costs a
 * hundred-and-fiftieth as much. On Ghanaian mobile data that is the whole
 * argument.
 *
 * And the paper wash on top is heavy, starting at 94 percent. The hero is
 * dark type on a light ground, so the photograph has to sit behind a wash
 * that keeps it legible even where the picture is black.
 *
 * 88 percent was the first attempt and it failed. Headings were fine at
 * 12.41:1, but the muted body copy came out at 3.89:1 over the dark parts
 * of the photograph, below the 4.5:1 AA needs. The threshold measured at
 * 93 percent, so this uses 94 with the wash deepening down the section.
 * Anyone lightening these numbers to see more of the picture should
 * measure again, because the headline will look fine long after the body
 * copy has stopped being readable.
 *
 * Renders nothing without an image, so the hero keeps its aurora.
 */
export function HeroWash() {
  const src = process.env.NEXT_PUBLIC_CONGREGATION_BLUR;
  if (!src) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
      <div
        className="absolute -inset-8"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(48px) saturate(1.15)",
          transform: "scale(1.1)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgb(250 249 246 / 0.94) 0%, rgb(250 249 246 / 0.95) 55%, rgb(250 249 246 / 0.98) 100%)",
        }}
      />
    </div>
  );
}
