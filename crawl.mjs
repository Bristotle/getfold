import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const BASE = "https://www.getfold.org";
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
const out = [];

for (const url of urls) {
  const p = await ctx.newPage();
  let weight = 0, requests = 0;
  p.on("response", async (r) => {
    requests++;
    try { const h = r.headers()["content-length"]; if (h) weight += Number(h); } catch {}
  });
  const t0 = Date.now();
  let status = 0;
  try {
    const res = await p.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    status = res?.status() ?? 0;
  } catch { status = -1; }
  const load = Date.now() - t0;

  const d = await p.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const qa = (s) => [...document.querySelectorAll(s)];
    const headings = qa("h1,h2,h3,h4,h5,h6").map(h => ({ t: h.tagName, x: h.textContent.trim().slice(0,80) }));
    const imgs = qa("img");
    const links = qa("a[href]");
    const inputs = qa("input:not([type=hidden]), select, textarea");
    return {
      title: document.title,
      desc: q('meta[name="description"]')?.content ?? "",
      canonical: q('link[rel="canonical"]')?.href ?? "",
      lang: document.documentElement.lang || "",
      h1s: qa("h1").map(h => h.textContent.trim()),
      headings,
      words: (document.querySelector("main")?.innerText ?? document.body.innerText).trim().split(/\s+/).length,
      imgTotal: imgs.length,
      imgNoAlt: imgs.filter(i => !i.hasAttribute("alt")).length,
      links: links.length,
      internal: links.filter(a => a.href.startsWith(location.origin)).length,
      external: links.filter(a => a.href.startsWith("http") && !a.href.startsWith(location.origin)).length,
      extNoRel: links.filter(a => a.href.startsWith("http") && !a.href.startsWith(location.origin) && a.target === "_blank" && !(a.rel||"").includes("noopener")).length,
      jsonld: qa('script[type="application/ld+json"]').map(s => { try { return JSON.parse(s.textContent)["@type"]; } catch { return "INVALID"; } }),
      og: !!q('meta[property="og:title"]') || !!q('meta[property="og:url"]'),
      inputsTotal: inputs.length,
      inputsUnlabelled: inputs.filter(i => {
        const id = i.id;
        return !(id && document.querySelector(`label[for="${CSS.escape(id)}"]`)) && !i.getAttribute("aria-label") && !i.closest("label");
      }).length,
      skipLink: !!q('a[href="#main"], a[href^="#main"]'),
      mainLandmark: !!q("main"),
      hrefsInternal: links.filter(a => a.href.startsWith(location.origin)).map(a => a.href.split("#")[0]),
    };
  }).catch(() => null);

  out.push({ url, status, load, requests, weightKb: Math.round(weight/1024), ...(d ?? {}) });
  await p.close();
  process.stdout.write(".");
}
await b.close();
writeFileSync("/tmp/crawl.json", JSON.stringify(out, null, 1));
console.log(`\ncrawled ${out.length}`);
