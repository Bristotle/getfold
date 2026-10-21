import { POSTS } from "@/lib/posts";
import { CATEGORIES } from "@/lib/help";
import { TERMS } from "@/lib/glossary";
import { TOOLS } from "@/lib/tools";
import { ROLES } from "@/lib/roles";
import { DENOMINATIONS } from "@/lib/denominations";
import { INTEGRATIONS } from "@/lib/integrations";
import { COMPARISONS } from "@/lib/compare";
import { MODULES } from "@/lib/modules";
import { SUPPORT_PHONE } from "@/lib/contact";

/**
 * /llms.txt: the site described for a language model, in the format at
 * llmstxt.org. A heading, a one paragraph summary, then every page worth
 * reading as a link with one line saying what it answers.
 *
 * Generated from the same typed data the pages render, so it cannot fall
 * out of date when an article is added. Static, rebuilt on every deploy.
 */
export const dynamic = "force-static";

const BASE = "https://www.getfold.org";

/** One line, no markdown that would break the list. */
const line = (s: string) => s.replace(/\s+/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").trim();

export function GET() {
  const out: string[] = [
    "# Fold",
    "",
    "> Fold is church management software built in Ghana for Ghanaian churches. It keeps the membership register, Bible classes and groups, attendance, tithes and offerings including mobile money, and produces the statistical return a society, circuit, district or diocese asks for. Made by Manuel Technologies. 30 day free trial, priced in cedis.",
    "",
    "Every article answers its question in the first paragraph, marked \"In short\". Figures carry their sources. Product screenshots are real pages captured from a demonstration society.",
    "",
    `Contact: ${SUPPORT_PHONE.display} (call or WhatsApp), ${BASE}/contact`,
    "",
    "## Guides",
    `- [Running a church in Ghana: the complete guide](${BASE}/guide): every guide, tool and term on this site, organised by the work a church actually does.`,
    `- [Church statistics in Ghana](${BASE}/church-statistics-ghana): sourced figures on denominations, membership and mobile money in Ghana.`,
    `- [How churches in Ghana keep their records: 2026 survey](${BASE}/research/church-records-2026): original, anonymous survey of the people who keep church records; results published once 30 churches have answered.`,
    "",
    "## Articles",
    ...POSTS.map((p) => `- [${p.title}](${BASE}/blog/${p.slug}): ${line(p.answer)}`),
    "",
    "## Help",
    ...CATEGORIES.flatMap((c) =>
      c.articles.map((a) => `- [${a.title}](${BASE}/help/${c.slug}/${a.slug}): ${line(a.summary)}`)
    ),
    "",
    "## Features",
    ...MODULES.map((m) => `- [${m.title}](${BASE}/features/${m.slug}): ${line(m.summary)}`),
    `- [Pricing](${BASE}/pricing): bands by society size, billed quarterly in cedis.`,
    "",
    "## For each denomination and role",
    ...DENOMINATIONS.map((d) => `- [${d.title}](${BASE}/for/${d.slug}): ${line(d.description)}`),
    ...ROLES.map((r) => `- [${r.title}](${BASE}/for/${r.slug}): ${line(r.description)}`),
    "",
    "## Comparisons",
    ...COMPARISONS.map((c) => `- [${c.title}](${BASE}/compare/${c.slug}): ${line(c.description)}`),
    "",
    "## Free tools",
    ...TOOLS.map((t) => `- [${t.title}](${BASE}/tools/${t.slug}): ${line(t.description)}`),
    "",
    "## Works with",
    ...INTEGRATIONS.map((i) => `- [${i.title}](${BASE}/works-with/${i.slug}): ${line(i.description)}`),
    "",
    "## Optional",
    ...TERMS.map((t) => `- [${t.term}](${BASE}/glossary/${t.slug}): ${line(t.definition)}`),
    "",
  ];

  return new Response(out.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
