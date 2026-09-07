import type { MetadataRoute } from "next";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

/**
 * Crawlers are welcome on the marketing pages and nowhere else. The
 * disallow list is every route that requires a session, so a church's
 * records can never turn up in a search result even if a URL leaks.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/members",
        "/attendance",
        "/contributions",
        "/funds",
        "/groups",
        "/insights",
        "/messages",
        "/onboarding",
        "/records",
        "/reports",
        "/team",
        "/transfers",
        "/visitors",
        "/login",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
