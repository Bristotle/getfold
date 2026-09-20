import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

/*
  WebSite with a SearchAction, on every page. The help centre's search is a
  plain GET at /help/search?q=, so the action described here is something
  that genuinely works, which is the only reason to declare it.
*/
const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Fold",
  url: SITE,
  inLanguage: "en-GH",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE}/help/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
  publisher: { "@type": "Organization", name: "Manuel Technologies", url: "https://manueltechnologies.com" },
};

export const metadata: Metadata = {
  /*
    metadataBase was missing, which meant Open Graph URLs and canonicals
    were relative and effectively absent. Every absolute URL Next generates
    now resolves against the canonical host.
  */
  metadataBase: new URL(SITE),

  title: {
    default: "Fold, church software in your denomination's language",
    template: "%s",
  },
  description:
    "Members, Bible classes, attendance and giving in your own words, and the statistical return your circuit asks for already filled in. Built in Ghana. 30 day free trial, no card.",

  /*
    "./" resolves per route, so every page emits a canonical pointing at
    itself on the www host. Without this, the apex copy and the www copy of
    each page compete with one another.
  */
  alternates: { canonical: "./" },

  openGraph: {
    type: "website",
    siteName: "Fold",
    locale: "en_GH",
    url: SITE,
    /*
      A default card for every page. The audit found no page on the site
      had one, so every link shared on WhatsApp, which is how a church here
      passes anything on, showed as a bare URL. A page can still set its
      own; this is what shows when it does not.
    */
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Fold, church management software built in Ghana",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og-default.png"] },

  /*
    Google Search Console verification. Set NEXT_PUBLIC_GOOGLE_VERIFICATION
    to the content value of the meta tag GSC gives you, and it appears in
    the head of every page. Unset, nothing is emitted.
  */
  verification: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION }
    : undefined,

  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Not maximumScale or userScalable: pinch zoom must keep working. A church
  // secretary reading a giving figure on a phone may well need it, and
  // disabling it fails WCAG 1.4.4.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f6" },
    { media: "(prefers-color-scheme: dark)", color: "#6b2fd9" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        {/*
          Ten navigation links sit before the content on every dashboard page.
          Without this a keyboard user tabs through all of them each time.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        {children}
        {/*
          Page views, counted without a cookie. Vercel Analytics identifies
          a visit by a hash of the request that expires the same day, sets
          nothing in the browser and stores no IP address, which is why the
          site can count visitors and still set no cookies at all until
          somebody signs in. The script is served from this origin, so the
          content security policy needs no new host.
        */}
        <Analytics />
      </body>
    </html>
  );
}
