/* The default share card, 1200x630, built from the brand files so it
   cannot drift from the logo. Shown by WhatsApp, Facebook and LinkedIn
   whenever a page is shared, which in Ghana is the distribution channel. */
import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const logo = readFileSync("public/brand/fold-logo-light.svg", "utf8");
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;width:1200px;height:630px;display:flex;flex-direction:column;justify-content:center;padding:0 88px;box-sizing:border-box;
font-family:-apple-system,"Segoe UI",system-ui,sans-serif;color:#fff;
background:linear-gradient(160deg,#241442 0%,#33196b 45%,#4a1fa0 100%);position:relative;overflow:hidden}
.grid{position:absolute;inset:0;opacity:.14;background-image:linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px);background-size:64px 64px;
-webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 0%,#000 15%,transparent 100%)}
.logo{width:390px;margin-bottom:44px}
h1{font-size:54px;line-height:1.12;margin:0 0 22px;letter-spacing:-.5px;max-width:960px;font-weight:800}
p{font-size:26px;line-height:1.4;margin:0;color:rgba(255,255,255,.8);max-width:900px}
.url{position:absolute;right:88px;bottom:52px;font-size:22px;color:rgba(255,255,255,.65);font-weight:600}
</style><div class="grid"></div>
<div class="logo">${logo.replace('width="430" height="150"','width="390" height="136"')}</div>
<h1>Church management software built in Ghana, around how a denomination actually works</h1>
<p>Members, Bible classes, attendance and giving, with the statistical return your circuit asks for already filled in. 30 days free.</p>
<div class="url">getfold.org</div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.screenshot({ path: "public/og-default.png" });
await b.close();
console.log("  written public/og-default.png");
