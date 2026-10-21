/**
 * Which page brought a church to sign up or enquire.
 *
 * Fold writes articles, guides and comparison pages to bring churches in,
 * and could not tell which of them did: only page views were counted.
 *
 * Nothing is stored in the visitor's browser. The privacy policy promises
 * the public site sets no cookies, and that stands. Instead SourceFields
 * (src/components/source-fields.tsx) adds hidden fields to the signup,
 * contact and newsletter forms when the page loads, and this reads them
 * back on the server: the page on this site that led there, the host name
 * of the site that sent them if they came from elsewhere, and utm_ tags.
 * Saved on the row they create. See migration 0051.
 */

export type Source = {
  from_page: string | null;
  from_site: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

const clip = (v: FormDataEntryValue | null, n: number) => {
  const s = typeof v === "string" ? v.replace(/[^\w\s./:\-+%@]/g, "").trim() : "";
  return s ? s.slice(0, n) : null;
};

/** The hidden fields from a submitted form, cleaned and capped. */
export function sourceFrom(formData: FormData): Source {
  const page = clip(formData.get("from_page"), 300);
  return {
    // A path on this site, never a full address somebody could stuff.
    from_page: page && page.startsWith("/") ? page : null,
    from_site: clip(formData.get("from_site"), 200),
    utm_source: clip(formData.get("utm_source"), 100),
    utm_medium: clip(formData.get("utm_medium"), 100),
    utm_campaign: clip(formData.get("utm_campaign"), 100),
  };
}
