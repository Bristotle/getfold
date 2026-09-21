import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";
import { CATEGORIES, ALL_ARTICLES } from "@/lib/help";
import { OPPORTUNITIES } from "@/lib/join";
import { DENOMINATIONS } from "@/lib/denominations";
import { MODULES } from "@/lib/modules";
import { ROLES } from "@/lib/roles";
import { TERMS } from "@/lib/glossary";
import { TOOLS } from "@/lib/tools";
import { INTEGRATIONS } from "@/lib/integrations";
import { COMPARISONS } from "@/lib/compare";
import { STATS_UPDATED } from "@/lib/stats";

/**
 * The public pages only. Everything behind a login is deliberately absent,
 * and robots.ts disallows those paths outright.
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

export default function sitemap(): MetadataRoute.Sitemap {
  /*
    A fixed date for pages whose content is data in this repository, moved
    forward by hand when that content changes. "new Date()" on every build
    stamped 74 pages with today's date daily, which is a lie a crawler
    learns to ignore.
  */
  const now = new Date("2026-09-17");
  // The programmatic sets shipped together on this date.
  const sets = new Date("2026-09-21");

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    // Denomination pages rank above the generic ones, because a church
    // searching for its own denomination is far closer to buying.
    ...DENOMINATIONS.map((d) => ({
      url: `${BASE}/for/${d.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    // The same product framed for one person: secretaries, treasurers,
    // class leaders, pastors, small churches.
    ...ROLES.map((r) => ({
      url: `${BASE}/for/${r.slug}`,
      lastModified: sets,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Head to head with a named product. Buying intent, and dated.
    ...COMPARISONS.map((c) => ({
      url: `${BASE}/compare/${c.slug}`,
      lastModified: new Date(c.checked),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Free tools, no sign up. The most shared pages on the site.
    { url: `${BASE}/tools`, lastModified: sets, changeFrequency: "monthly" as const, priority: 0.8 },
    ...TOOLS.map((t) => ({
      url: `${BASE}/tools/${t.slug}`,
      lastModified: sets,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // "Does it work with MTN": one page per thing a church already uses.
    { url: `${BASE}/works-with`, lastModified: sets, changeFrequency: "monthly" as const, priority: 0.6 },
    ...INTEGRATIONS.map((i) => ({
      url: `${BASE}/works-with/${i.slug}`,
      lastModified: sets,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // The statistics page carries its own checked date.
    { url: `${BASE}/church-statistics-ghana`, lastModified: new Date(STATS_UPDATED), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${BASE}/examples/church-sms-messages`, lastModified: sets, changeFrequency: "monthly" as const, priority: 0.6 },
    // The glossary: many small pages, each an anchor for the rest.
    { url: `${BASE}/glossary`, lastModified: sets, changeFrequency: "monthly" as const, priority: 0.6 },
    ...TERMS.map((t) => ({
      url: `${BASE}/glossary/${t.slug}`,
      lastModified: sets,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
    {
      // A price is among the highest intent searches there is.
      url: `${BASE}/pricing`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    },
    {
      url: `${BASE}/features`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    /*
      One page per area of the product. A church does not search for
      "church management software", it searches for the thing it is trying
      to fix, so these answer the search that actually happens.
    */
    ...MODULES.map((m) => ({
      url: `${BASE}/features/${m.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE}/security`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/compare`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/getting-started`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE}/join`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...OPPORTUNITIES.map((o) => ({
      url: `${BASE}/join/${o.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${BASE}/help`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...CATEGORIES.map((c) => ({
      url: `${BASE}/help/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...ALL_ARTICLES.map((a) => ({
      url: `${BASE}/help/${a.category.slug}/${a.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    /*
      A post's real date. lastModified is only worth sending if it is true:
      a sitemap that stamps every page with today's date on every build
      teaches a crawler that the date means nothing, and it stops using it
      to decide what to fetch first.
    */
    ...POSTS.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.updated ?? p.published),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
