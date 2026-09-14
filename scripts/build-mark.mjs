/**
 * Draws the Fold church, and proves every line meets the one it touches.
 *
 * The first version was typed by hand and seven junctions were wrong: the
 * nave walls hung 8.8 units below the roof they were supposed to hold up,
 * the tower walls punched 4.1 through it, and both wing roofs started in
 * mid air. At a glance it read as a church; at any size it read as a badly
 * drawn one, and that is exactly how it looked.
 *
 * So nothing here is typed. The building is described by a handful of
 * numbers, every other point is computed from them, and assertJoints fails
 * the build if any two lines that should meet do not. Change a number and
 * the whole drawing stays square.
 *
 *   node scripts/build-mark.mjs
 */
import { writeFileSync } from "node:fs";

const PURPLE = "#6b2fd9";

/* The building, as decisions rather than coordinates. */
const G = 106;              // ground line

/*
  Proportion, after looking at it large.

  The first pass put the nave eaves at x=22 and 98, almost the full width,
  with a shallow roof. It read as a barn, and the wing roofs continued the
  nave roof line closely enough that the whole thing became one long sweep
  from one side to the other rather than a church with two lower wings.

  So the nave is narrower and its roof steeper, and the wings now hang off
  the nave WALL rather than off the eave, which puts them clearly below the
  main roof with the eave overhanging them. That separation is what makes
  it read as a building instead of a tent.
*/
const NAVE = { apex: [60, 48], eaveX: 30, eaveY: 76, wallX: [40, 80] };
const TOWER = { apex: [60, 20], eaveX: 46, eaveY: 36, wallX: [52, 68] };
const CROSS = { top: 6, barY: 12, barHalf: 7 };
const ROSE = { cy: 40, r: 4.5 };
const WING = { startY: 80, outX: 14, outY: 92, wallX: 18 };
const DOOR = { halfWidth: 10, springY: 91 };

/** Height of a gable roof at a given x, given its apex and one eave. */
const roofY = (x, apex, eaveX, eaveY) => {
  const slope = (eaveY - apex[1]) / (apex[0] - eaveX);
  return apex[1] + Math.abs(x - apex[0]) * slope;
};

const naveY = (x) => roofY(x, NAVE.apex, NAVE.eaveX, NAVE.eaveY);
const towerY = (x) => roofY(x, TOWER.apex, TOWER.eaveX, TOWER.eaveY);

/** The wing roof runs from the nave wall down and out, under the eave. */
const wingY = (x, side) => {
  const [x1, y1] = side === "l" ? [NAVE.wallX[0], WING.startY] : [NAVE.wallX[1], WING.startY];
  const [x2, y2] = side === "l" ? [WING.outX, WING.outY] : [120 - WING.outX, WING.outY];
  return y1 + ((x - x1) * (y2 - y1)) / (x2 - x1);
};

const n = (v) => Number(v.toFixed(1));

/* Every junction, computed once and used everywhere. */
const naveWallTop = n(naveY(NAVE.wallX[0]));
const towerWallTop = n(towerY(TOWER.wallX[0]));
const towerWallBottom = n(naveY(TOWER.wallX[0]));
const wingWallTopL = n(wingY(WING.wallX, "l"));
const doorTop = DOOR.springY - DOOR.halfWidth;

/**
 * Fails the build if two lines that should meet do not. A logo is a set of
 * promises between lines, and this is the only way to keep them.
 */
function assertJoints() {
  const checks = [
    ["nave wall meets nave roof", naveWallTop, naveY(NAVE.wallX[0])],
    ["nave wall meets nave roof, right", naveWallTop, naveY(NAVE.wallX[1])],
    ["tower wall top meets tower roof", towerWallTop, towerY(TOWER.wallX[0])],
    ["tower wall foot meets nave roof", towerWallBottom, naveY(TOWER.wallX[0])],
    ["wing roof starts on the nave wall", WING.startY, wingY(NAVE.wallX[0], "l")],
    ["wing wall meets wing roof", wingWallTopL, wingY(WING.wallX, "l")],
    ["cross rises from the tower apex", TOWER.apex[1], towerY(TOWER.apex[0])],
  ];
  let bad = 0;
  for (const [what, a, b] of checks) {
    const ok = Math.abs(a - b) < 0.15;
    if (!ok) bad++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${what}  ${a.toFixed(1)} vs ${b.toFixed(1)}`);
  }

  /* Nothing may sit on top of anything else. */
  const clearances = [
    ["rose window clears the tower roof", ROSE.cy - ROSE.r, towerY(60 - ROSE.r)],
    ["nave apex clears the rose window", ROSE.cy + ROSE.r, NAVE.apex[1]],
    ["gable window clears the tower foot", 60, towerWallBottom],
    ["door clears the gable window", doorTop, 68],
    ["the wing roof hangs clear of the nave eave", wingY(NAVE.eaveX, "l"), NAVE.eaveY],
  ];
  for (const [what, a, b] of clearances) {
    const gap = Math.abs(a - b);
    const ok = gap >= 3;
    if (!ok) bad++;
    console.log(`  ${ok ? "ok  " : "FAIL"} ${what}  gap ${gap.toFixed(1)}`);
  }
  if (bad) {
    console.error(`\n  ${bad} problem(s). Not writing a broken mark.`);
    process.exit(1);
  }
}

/** The detailed mark: everything. */
function paths({ detailed }) {
  const p = [];
  // cross
  p.push(`M60 ${CROSS.top}V${TOWER.apex[1]}M${60 - CROSS.barHalf} ${CROSS.barY}h${CROSS.barHalf * 2}`);
  // tower roof
  p.push(`M${TOWER.eaveX} ${TOWER.eaveY} 60 ${TOWER.apex[1]}l${60 - TOWER.eaveX} ${TOWER.eaveY - TOWER.apex[1]}`);
  // tower walls, from the tower roof down to the nave roof
  p.push(`M${TOWER.wallX[0]} ${towerWallTop}V${towerWallBottom}M${TOWER.wallX[1]} ${towerWallTop}V${towerWallBottom}`);
  // nave roof
  p.push(`M${NAVE.eaveX} ${NAVE.eaveY} 60 ${NAVE.apex[1]}l${60 - NAVE.eaveX} ${NAVE.eaveY - NAVE.apex[1]}`);
  // nave walls, from the nave roof down to the ground
  p.push(`M${NAVE.wallX[0]} ${naveWallTop}V${G}M${NAVE.wallX[1]} ${naveWallTop}V${G}`);
  // door
  p.push(`M${60 - DOOR.halfWidth} ${G}V${DOOR.springY}a${DOOR.halfWidth} ${DOOR.halfWidth} 0 0 1 ${DOOR.halfWidth * 2} 0V${G}`);
  // wings, hung off the nave wall so the eave overhangs them
  p.push(`M${NAVE.wallX[0]} ${WING.startY} ${WING.outX} ${WING.outY}M${WING.wallX} ${wingWallTopL}V${G}`);
  p.push(`M${NAVE.wallX[1]} ${WING.startY} ${120 - WING.outX} ${WING.outY}M${120 - WING.wallX} ${wingWallTopL}V${G}`);
  // ground
  p.push(`M10 ${G}h100`);

  if (!detailed) return p;

  // detail that only survives above about 40px
  p.push(`M56 68V64a4 4 0 0 1 8 0v4`);                       // gable window
  p.push(`M25 ${G}v-6a4 4 0 0 1 8 0v6`);                     // left wing window
  p.push(`M${120 - 33} ${G}v-6a4 4 0 0 1 8 0v6`);            // right wing window
  return p;
}

const svg = ({ detailed, colour, width }) => {
  const d = paths({ detailed });
  const circle = detailed
    ? `\n    <circle cx="60" cy="${ROSE.cy}" r="${ROSE.r}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Fold">
  <title>Fold</title>
  <g fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">
    ${d.map((x) => `<path d="${x}"/>`).join("\n    ")}${circle}
  </g>
</svg>
`;
};

assertJoints();

writeFileSync("public/brand/fold-mark.svg", svg({ detailed: true, colour: PURPLE, width: 3.4 }));
writeFileSync("public/brand/fold-mark-white.svg", svg({ detailed: true, colour: "#ffffff", width: 3.4 }));
writeFileSync("public/brand/fold-mark-small.svg", svg({ detailed: false, colour: PURPLE, width: 5 }));

const icon = svg({ detailed: false, colour: "#ffffff", width: 5 })
  .replace(/<g /, `<g transform="translate(60 61) scale(0.76) translate(-60 -56)" `)
  .replace(/<title>Fold<\/title>/, `<title>Fold</title>\n  <rect width="120" height="120" rx="26" fill="${PURPLE}"/>`);
writeFileSync("public/brand/fold-icon.svg", icon);

/* The lockup: the church, then FOLD with the tagline and the reference. */
const lockup = (colour, word, tag, verse) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 150" width="430" height="150" role="img" aria-label="Fold, know your flock">
  <title>Fold, know your flock</title>
  <g fill="none" stroke="${colour}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(8 13) scale(1.04)">
    ${paths({ detailed: true }).map((x) => `<path d="${x}"/>`).join("\n    ")}
    <circle cx="60" cy="${ROSE.cy}" r="${ROSE.r}"/>
  </g>
  <text x="292" y="84" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="76" font-weight="800" font-style="italic" fill="${word}" letter-spacing="1">FOLD</text>
  <text x="292" y="112" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="20" font-weight="700" fill="${tag}" letter-spacing="1.6">KNOW YOUR FLOCK</text>
  <text x="292" y="130" text-anchor="middle" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="12.5" font-weight="700" font-style="italic" fill="${verse}" letter-spacing="0.5">(PROVERBS 27:23)</text>
</svg>
`;
writeFileSync("public/brand/fold-logo.svg", lockup(PURPLE, PURPLE, PURPLE, PURPLE));
writeFileSync(
  "public/brand/fold-logo-light.svg",
  lockup("#ffffff", "#ffffff", "#ffffff", "rgba(255,255,255,0.8)")
);

console.log("\n  wrote 6 svg files to public/brand");
