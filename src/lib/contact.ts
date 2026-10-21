/**
 * Fold's own phone line, in the three forms the site needs.
 *
 * One place, because it used to be three: written into the footer, as a
 * fallback in the WhatsApp redirect, and an environment variable on the
 * Contact page that was never set, so the three disagreed and the Contact
 * page showed no number at all.
 *
 * This is a dedicated business SIM (from October 2026), not anybody's
 * personal handset, so it is fine for it to appear in the page.
 */
export const SUPPORT_PHONE = {
  /** As a Ghanaian would write it. */
  display: "020 283 7410",
  /** For tel: links. */
  tel: "+233202837410",
  /** For wa.me, which wants the number with no plus. */
  whatsapp: "233202837410",
} as const;
