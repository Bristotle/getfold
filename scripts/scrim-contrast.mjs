// Worst case: the photograph is pure white exactly where the type sits.
// Composite each scrim stop over white and check white type against it.
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const L = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const over = ([r, g, b], a, bg = [255, 255, 255]) =>
  [r, g, b].map((c, i) => a * c + (1 - a) * bg[i]);
const ratio = (fg, bg) => { const a = L(fg), b = L(bg); const [hi, lo] = a > b ? [a, b] : [b, a]; return (hi + 0.05) / (lo + 0.05); };

const INK = [26, 16, 51], PURPLE = [107, 47, 217], WHITE = [255, 255, 255];
const stops = [
  ["top    ink @ 0.86", over(INK, 0.86)],
  ["mid    ink @ 0.72", over(INK, 0.72)],
  ["bottom purple @ " + (process.argv[2] ?? "0.78"), over(PURPLE, Number(process.argv[2] ?? 0.78))],
];
let worst = Infinity;
for (const [name, bg] of stops) {
  const r = ratio(WHITE, bg);
  worst = Math.min(worst, r);
  console.log(`  ${name}  ->  ${r.toFixed(2)}:1  ${r >= 4.5 ? "PASS" : "FAIL (AA needs 4.5)"}`);
}
console.log(`\n  worst stop: ${worst.toFixed(2)}:1`);
process.exit(worst >= 4.5 ? 0 : 1);
