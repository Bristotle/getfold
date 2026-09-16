/**
 * Scores an enquiry for whether it is a cold sales pitch.
 *
 * Every enquiry this site has ever received has been one: Instagram
 * followers, promotional video, SEO rankings, and a "To the
 * http://getfold.org/xxx Owner" template. Before a real church writes in
 * and gets lost among them, they need separating.
 *
 * TWO RULES SHAPED THIS.
 *
 * It quarantines rather than rejects. A wrongly binned pitch costs nothing;
 * a wrongly binned church costs a customer and we would never know it
 * happened. So nothing is ever refused or deleted: the row is always saved,
 * the alerts are simply not sent, and the enquiry sits on the admin page
 * behind a filter where it can be read.
 *
 * And the signals describe the sender's subject, not their manners. Cold
 * pitches talk about OUR website and OUR business; a church secretary talks
 * about THEIR church. That difference is the reliable one. Nothing here
 * scores somebody for writing briefly, for not filling in every field, or
 * for writing in a second language.
 */

/** What a pitch is selling. Each is worth a lot, and they are specific. */
const PITCH = [
  "seo",
  "search engine optimi",
  "google ranking",
  "rank your",
  "backlink",
  "guest post",
  "domain authority",
  "followers",
  "instagram",
  "tiktok",
  "social media growth",
  "digital marketing",
  "lead generation",
  "web design service",
  "website redesign",
  "promotional video",
  "video to advertise",
  "explainer video",
  "crypto",
  "bitcoin",
  "forex",
  "loan offer",
  "traffic to your",
  "grow your business",
  "boost your website",
  "increase your sales",
];

/**
 * A pitch is about us. A church is about itself. This is the signal that
 * separates them most reliably, so it is weighted like one.
 */
const ABOUT_US = [
  "getfold",
  "your website",
  "your site",
  "your business",
  "your company",
  "your brand",
  "your online presence",
];

/** Templates that only ever appear in bulk outreach. */
const TEMPLATE = [
  "to the owner",
  "to the webmaster",
  "dear owner",
  "dear webmaster",
  "i just visited",
  "i came across your",
  "i hope this email finds you well",
  "i hope this message finds you well",
];

const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|co|info|biz|xyz)\b/gi;

export type SpamVerdict = {
  score: number;
  /** True once the score reaches the threshold. */
  spam: boolean;
  /** Plain reasons, for the admin page. Never shown to the sender. */
  reasons: string[];
};

/** At or above this, the alerts are held back. */
export const SPAM_THRESHOLD = 5;

export function scoreEnquiry(e: {
  name: string;
  email: string;
  phone?: string | null;
  church?: string | null;
  message?: string | null;
}): SpamVerdict {
  const reasons: string[] = [];
  let score = 0;

  const name = (e.name ?? "").toLowerCase();
  const message = (e.message ?? "").toLowerCase();
  const haystack = `${name} ${message}`;

  /*
    A link in the NAME field is the strongest single signal there is. A
    person types their name there. "To the http://getfold.org/fekal0911
    Owner" is a template that filled the wrong box.
  */
  const nameHasUrl = URL_PATTERN.test(name);
  URL_PATTERN.lastIndex = 0;
  if (nameHasUrl) {
    score += 5;
    reasons.push("a web address in the name field");
  }

  const pitched = PITCH.filter((k) => haystack.includes(k));
  if (pitched.length) {
    const points = Math.min(pitched.length * 3, 6);
    score += points;
    reasons.push(`sells ${pitched.slice(0, 3).join(", ")}`);
  }

  const aboutUs = ABOUT_US.filter((k) => haystack.includes(k));
  if (aboutUs.length) {
    score += 3;
    reasons.push("written about our website rather than their church");
  }

  const templated = TEMPLATE.filter((k) => haystack.includes(k));
  if (templated.length) {
    score += 2;
    reasons.push("opens with a bulk outreach template");
  }

  const links = (e.message ?? "").match(URL_PATTERN)?.length ?? 0;
  if (links > 0) {
    score += Math.min(links * 2, 4);
    reasons.push(`${links} link${links === 1 ? "" : "s"} in the message`);
  }

  /*
    Weak on purpose, and never enough on its own. Plenty of real people
    leave the church field empty, so this only ever tips something already
    suspected over the line.
  */
  if (!(e.church ?? "").trim()) {
    score += 1;
    reasons.push("no church named");
  }

  /*
    A score alone is not enough to bin something.

    There must also be a sign that somebody is SELLING: a pitch keyword, a
    bulk template, or a web address typed into the name field. Without that
    gate, a church that happened to mention our website and paste a link to
    their own would have reached the threshold on tone alone, and been
    silently quarantined for writing a perfectly ordinary enquiry.

    Every real pitch received so far carries at least one of these, so the
    gate costs nothing and removes the whole class of false positive.
  */
  const selling = pitched.length > 0 || templated.length > 0 || nameHasUrl;

  return { score, spam: selling && score >= SPAM_THRESHOLD, reasons };
}
