import { TIERS } from "@/lib/pricing";

/*
  What Fold is, for a machine.

  SoftwareApplication is the type a search engine expects for a product like
  this, and it is generated from the same pricing constant the pricing page
  renders, so the price it carries cannot drift from the price a church is
  shown. Offers are in GHS, monthly, for the self serve bands only: the
  circuit rate is a conversation and is not a price.
*/
export const APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Fold",
  url: "https://www.getfold.org",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Church management software",
  operatingSystem: "Web",
  description:
    "Church management software built in Ghana around how a denomination actually works. Members, Bible classes, attendance and giving, with the statistical return your circuit asks for already filled in.",
  countriesSupported: "GH",
  inLanguage: "en-GH",
  isAccessibleForFree: false,
  offers: TIERS.filter((t) => t.monthly !== null).map((t) => ({
    "@type": "Offer",
    name: t.name,
    price: t.monthly,
    priceCurrency: "GHS",
    description: `${t.memberLimit}. Billed quarterly.`,
    url: "https://www.getfold.org/pricing",
    availability: "https://schema.org/InStock",
  })),
  publisher: {
    "@type": "Organization",
    name: "Manuel Technologies",
    url: "https://manueltechnologies.com",
  },
};
