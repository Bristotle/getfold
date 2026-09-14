/**
 * Builds the one page overview.
 *
 *   node docs/overview/build.mjs
 *
 * Measures at the PRINTABLE width, not the paper width. A4 is 794px at
 * 96dpi but the margins leave 695px, so text wraps more in the PDF than in
 * a browser window at 794px. Measuring at the wrong width is what pushed
 * the first build onto a second sheet while appearing to fit.
 */
import { chromium } from "playwright";
import { pathToFileURL, fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const MM = 3.7795;
const WIDTH = Math.round(210 * MM - 26 * MM);
const BUDGET = Math.round(297 * MM - 24 * MM);
// fileURLToPath, not .pathname: a directory with a space in it comes back
// percent encoded from .pathname and then gets encoded a second time.
const here = fileURLToPath(new URL(".", import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: 400 } });
await page.goto(pathToFileURL(`${here}fold-overview.html`).href, {
  waitUntil: "networkidle",
});
await page.emulateMedia({ media: "print" });

const height = await page.evaluate(() => document.body.scrollHeight);
console.log(`  content ${height}px of ${BUDGET}px available`);

await page.pdf({
  path: `${here}Fold-Overview.pdf`,
  format: "A4",
  printBackground: true,
});

await page.emulateMedia({ media: "screen" });
await page.setViewportSize({ width: 794, height: 1123 });
await page.screenshot({ path: `${here}Fold-Overview.png`, fullPage: true });
await browser.close();

const pdf = readFileSync(`${here}Fold-Overview.pdf`).toString("latin1");
const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log(`  ${pages} page(s)`);
if (pages !== 1) {
  console.error("  FAIL: this is a one page document. Cut something.");
  process.exit(1);
}
console.log("  built Fold-Overview.pdf and Fold-Overview.png");
