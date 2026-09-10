/**
 * Pricing.
 *
 * One file, so changing a price is one edit and the page, the FAQ and any
 * future invoice all move together.
 *
 * THE BANDS. The two figures here are the ones chosen commercially, 299
 * and 499, placed on the church sizes they suit rather than at the entry
 * point. Placed at the entry point, a 200 member church comparing us with
 * the nearest Ghanaian alternative sees GHS 299 against their GHS 99 and
 * stops reading before the statistical return is ever mentioned. Moving
 * them up the curve and adding a smaller first band keeps the same numbers
 * and removes that comparison.
 *
 * BILLED QUARTERLY. Deliberate, and the one thing here no competitor can
 * copy without copying the product: the statistical return is quarterly,
 * so the bill is too. It matches how a church treasurer budgets, cuts
 * collection work by two thirds, and reduces the number of times a year
 * somebody reconsiders from twelve to four.
 *
 * WHAT IS NOT CLAIMED HERE. There is no mention of a share of member
 * giving, because that requires Paystack subaccounts and those are not
 * built yet. Advertising it now would be a claim we cannot honour. There is
 * no founding church offer either, because a dated limited offer has to be
 * a real decision, not a permanent banner.
 */

export type Tier = {
  slug: string;
  name: string;
  /** Who it is for, in one line. */
  who: string;
  /** Monthly equivalent in cedis. Null means the price is a conversation. */
  monthly: number | null;
  memberLimit: string;
  /** What makes this band different from the one below it. */
  highlights: string[];
  featured?: boolean;
};

/** Quarterly is the default. Annual is priced at ten months, not twelve. */
export const ANNUAL_MONTHS_CHARGED = 10;

export const TIERS: Tier[] = [
  {
    slug: "society",
    name: "Society",
    who: "A single congregation finding its feet",
    monthly: 149,
    memberLimit: "Up to 100 members",
    highlights: [
      "The full product, nothing withheld",
      "Members, Bible classes, attendance and giving",
      "Your statistical return, any period",
      "Unlimited people on your team",
    ],
  },
  {
    slug: "society-plus",
    name: "Society Plus",
    who: "The size most societies and congregations actually are",
    monthly: 299,
    memberLimit: "101 to 400 members",
    featured: true,
    highlights: [
      "Everything in Society",
      "Insights: who has quietly stopped coming",
      "Mobile money giving alongside cash",
      "Text your members from the register",
    ],
  },
  {
    slug: "large-society",
    name: "Large Society",
    who: "A town society or a large assembly",
    monthly: 499,
    memberLimit: "401 to 1,000 members",
    highlights: [
      "Everything in Society Plus",
      "Priority support, same day",
      "We move your register across for you",
      "Help setting up your first return",
    ],
  },
  {
    slug: "circuit",
    name: "Circuit and above",
    who: "A circuit, district, presbytery or diocese with several societies",
    monthly: null,
    memberLimit: "More than 1,000 members, or more than one society",
    highlights: [
      "Every society keeps its own register",
      "One account oversees them all",
      "A rate agreed for the whole circuit",
      "Invoiced by bank transfer if your treasurer needs it",
    ],
  },
];

/**
 * "GHS 299", not "₵299".
 *
 * Intl renders the cedi sign, and mixing that with the GHS in our own copy
 * looked careless on the same page. GHS is also what every competitor
 * publishes and what a treasurer writes in a budget line, so it is the
 * unambiguous choice for a price.
 */
export const cedis = (n: number) =>
  `GHS ${new Intl.NumberFormat("en-GH", { maximumFractionDigits: 0 }).format(n)}`;

/** What a tier costs per quarter, which is how it is actually billed. */
export const quarterly = (monthly: number) => monthly * 3;

/** What a tier costs for a year, at ten months rather than twelve. */
export const annual = (monthly: number) => monthly * ANNUAL_MONTHS_CHARGED;
