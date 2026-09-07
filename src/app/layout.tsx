import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

export const metadata: Metadata = {
  /*
    metadataBase was missing, which meant Open Graph URLs and canonicals
    were relative and effectively absent. Every absolute URL Next generates
    now resolves against the canonical host.
  */
  metadataBase: new URL(SITE),

  title: {
    default: "Fold, church software that speaks your denomination's language",
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
  },
  twitter: { card: "summary_large_image" },

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
      </body>
    </html>
  );
}
