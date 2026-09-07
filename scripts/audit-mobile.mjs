import { chromium } from "playwright";

const PAGES = ["/", "/features", "/compare", "/about", "/getting-started",
  "/blog", "/help", "/help/members/import-from-excel", "/contact",
  "/blog/what-mobile-money-costs-a-church"];
const WIDTHS = [320, 360, 390, 414, 768];
const BASE = process.env.BASE ?? "http://127.0.0.1:3100";

const browser = await chromium.launch();
let bad = 0;

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: 844 },
    deviceScaleFactor: 2,
    isMobile: width < 768,
  });
  const page = await ctx.newPage();

  for (const path of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });

    const result = await page.evaluate(() => {
      // The overflow-x:hidden guard clamps scrollWidth, which is exactly how
      // the real bug stayed invisible. Turn it off to measure the truth.
      const html = document.documentElement;
      const prevH = html.style.overflowX, prevB = document.body.style.overflowX;
      html.style.overflowX = "visible";
      document.body.style.overflowX = "visible";

      const vw = html.clientWidth;
      const scrollWidth = html.scrollWidth;

      const offenders = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right <= vw + 1 && r.left >= -1) continue;
        // Report the outermost offender only, not every descendant.
        if (offenders.some((o) => o.node.contains(el))) continue;
        offenders.push({
          node: el,
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute("class") ?? "").slice(0, 90),
          text: (el.textContent ?? "").trim().slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
        });
      }

      html.style.overflowX = prevH;
      document.body.style.overflowX = prevB;
      return {
        vw,
        scrollWidth,
        offenders: offenders.slice(0, 6).map((o) => ({
          tag: o.tag, cls: o.cls, text: o.text, left: o.left, right: o.right,
        })),
      };
    });

    const over = result.scrollWidth - result.vw;
    if (over > 1) {
      bad++;
      console.log(`FAIL ${width}px ${path}  document is ${over}px too wide`);
      for (const o of result.offenders) {
        console.log(`      <${o.tag} class="${o.cls}"> [${o.left}..${o.right}] "${o.text}"`);
      }
    } else {
      console.log(`ok   ${width}px ${path}`);
    }
  }
  await ctx.close();
}

await browser.close();
console.log(bad === 0 ? "\nAll pages fit at every width." : `\n${bad} page/width combinations overflow.`);
process.exit(bad === 0 ? 0 : 1);
