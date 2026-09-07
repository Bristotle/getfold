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
      ? "linear-gradient(180deg, rgb(26 16 51 / 0.86) 0%, rgb(26 16 51 / 0.72) 45%, rgb(107 47 217 / 0.78) 100%)"
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
