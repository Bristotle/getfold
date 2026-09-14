/**
 * The band colours have to pass WCAG where they carry text.
 *
 * They come from the dashboard's chart palette, where they are fills behind
 * or beside labels rather than text themselves, so passing there says
 * nothing about passing here. Small uppercase type at 4.5:1 is the bar, and
 * teal, amber and pink all fail it on our background at full strength.
 *
 * This computes each one and darkens it until it passes, so the pricing
 * page can use a colour that is recognisably the band's without being
 * unreadable. Run it when a band colour changes.
 */
const BG = "#faf9f6";
const CARD = "#ffffff";

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const darken = (h, f) =>
  "#" + hex(h).map((v) => Math.round(v * f).toString(16).padStart(2, "0")).join("");

const BANDS = {
  Society: "#00b3a4",
  "Society Plus": "#6b2fd9",
  "Large Society": "#ffa400",
  "Circuit and above": "#ff6b9d",
};

console.log(`  background ${BG}, card ${CARD}\n`);
let worst = Infinity;
for (const [name, colour] of Object.entries(BANDS)) {
  const asIs = Math.min(ratio(colour, BG), ratio(colour, CARD));
  let text = colour;
  for (let f = 1; f > 0.2; f -= 0.02) {
    const c = darken(colour, f);
    if (Math.min(ratio(c, BG), ratio(c, CARD)) >= 4.5) { text = c; break; }
  }
  const got = Math.min(ratio(text, BG), ratio(text, CARD));
  worst = Math.min(worst, got);
  console.log(`  ${name.padEnd(18)} fill ${colour}  ${asIs.toFixed(2)}:1 ${asIs >= 4.5 ? "passes" : "FAILS as text"}`);
  console.log(`  ${"".padEnd(18)} text ${text}  ${got.toFixed(2)}:1 ${got >= 4.5 ? "passes AA" : "STILL FAILS"}\n`);
}
console.log(`  worst text ratio ${worst.toFixed(2)}:1`);
process.exit(worst >= 4.5 ? 0 : 1);
