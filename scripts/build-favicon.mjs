/**
 * Builds src/app/favicon.ico from the brand icon.
 *
 * Next serves /icon from icon.tsx and links it from every page, but a
 * browser opening a bookmark, a feed reader, and half the link preview
 * services ask for /favicon.ico by name and never read the link tag. That
 * request was a 404. An ICO is a tiny directory of images; since Vista the
 * images inside may be PNGs, so this is three resizes and a 6 + 16n byte
 * header, no other format needed.
 *
 *   node scripts/build-favicon.mjs
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const SIZES = [16, 32, 48];
const src = "public/brand/fold-icon@512.png";
const pngs = await Promise.all(SIZES.map((s) => sharp(src).resize(s, s).png().toBuffer()));

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(pngs.length, 4);

const dir = Buffer.alloc(16 * pngs.length);
let offset = 6 + dir.length;
pngs.forEach((png, i) => {
  const s = SIZES[i];
  const o = i * 16;
  dir.writeUInt8(s === 256 ? 0 : s, o);
  dir.writeUInt8(s === 256 ? 0 : s, o + 1);
  dir.writeUInt8(0, o + 2); // colours in palette
  dir.writeUInt8(0, o + 3); // reserved
  dir.writeUInt16LE(1, o + 4); // planes
  dir.writeUInt16LE(32, o + 6); // bits per pixel
  dir.writeUInt32LE(png.length, o + 8);
  dir.writeUInt32LE(offset, o + 12);
  offset += png.length;
});

writeFileSync("src/app/favicon.ico", Buffer.concat([header, dir, ...pngs]));
console.log(`src/app/favicon.ico: ${SIZES.join(", ")}px, ${offset} bytes`);
