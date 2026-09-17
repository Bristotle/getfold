/**
 * Keeps titles and descriptions inside what a search result will show.
 *
 * Google shows roughly 60 characters of a title and 155 of a description
 * before cutting with an ellipsis, and the audit found seven titles and
 * fifteen descriptions on this site being cut mid sentence. A description
 * that ends in the middle of a clause reads as carelessness in the one
 * place a church first meets us.
 *
 * Both functions cut at a sentence or clause boundary rather than at a
 * character count, so the visible text is still a whole thought.
 */

/** A description of at most `max` characters, ending on a full thought. */
export function metaDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max);
  // Prefer the last sentence end, then the last clause, then the last word.
  const cut =
    Math.max(window.lastIndexOf(". "), window.lastIndexOf("? ")) > max * 0.5
      ? Math.max(window.lastIndexOf(". "), window.lastIndexOf("? ")) + 1
      : window.lastIndexOf(", ") > max * 0.6
        ? window.lastIndexOf(", ")
        : window.lastIndexOf(" ");
  const out = clean.slice(0, cut).replace(/[,;:]$/, "").trim();
  return /[.?!]$/.test(out) ? out : out + ".";
}

/**
 * A title with the site name appended only when there is room for it.
 *
 * The title itself is never cut. A title shortened to "How to prepare your
 * church's statistical return, step by..." loses the words that mattered,
 * and a search engine will truncate a long one visually while still
 * indexing every word of it, which is the better of the two outcomes. So a
 * long title simply goes without the suffix.
 */
export function metaTitle(title: string, suffix = "Fold", max = 60): string {
  const withSuffix = `${title}, ${suffix}`;
  return withSuffix.length <= max ? withSuffix : title;
}
