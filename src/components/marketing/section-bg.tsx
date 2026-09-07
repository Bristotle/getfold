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
