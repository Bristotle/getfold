import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/posts";

/**
 * The public pages only. Everything behind a login is deliberately absent,
 * and robots.ts disallows those paths outright.
 */
const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.getfold.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
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
    ...POSTS.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.published),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
