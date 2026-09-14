# The Fold brand kit

Everything anybody needs to put Fold on something. Files live in
`public/brand/` and are served from the site, so a link works when an
attachment does not: `getfold.org/brand/fold-logo.svg`, and the same for
every file below.

## The mark

A church: steeple, cross, bell window, the arched door, and two lower
wings. Line art in a single weight, so it prints, embroiders, engraves and
reverses without losing anything.

**It is generated, not drawn.** `node scripts/build-mark.mjs` computes every
point from a handful of decisions about the building and refuses to write
the files if two lines that should meet do not. The first hand-drawn
version had seven joints out of true: the nave walls hung 8.8 units below
the roof they were holding up, the tower walls punched 4.1 through it, and
both wing roofs started in mid air. That is why it looked wrong, and why
nothing here is typed by hand any more.

**If the mark ever changes, change that script.** Do not edit the SVG, and
do not edit the copy inside `src/components/marketing/logo.tsx`. Run the
script and paste its output.

## Two versions of one building

| | Use it |
| --- | --- |
| `fold-mark.svg` | Down to about 40px. Carries the rose window, the gable window and the wing windows. |
| `fold-mark-small.svg` | Below 40px. The same church with that detail removed, because at small sizes it closes into a smudge. |

Both are the same building. Never mix them in one layout.

## Files

| File | Use it for |
| --- | --- |
| `fold-logo.svg` | The full lockup on a light background. Scales to any size. |
| `fold-logo-light.svg` | The full lockup on a dark or purple background. |
| `fold-logo@1600.png`, `@800.png` | Slides, documents, anyone who cannot take an SVG. |
| `fold-mark.svg`, `fold-mark@1024.png` | The church alone, no wordmark. |
| `fold-mark-white.svg` | The church alone, on a dark ground. |
| `fold-mark-small.svg` | Small sizes. Used by the website header. |
| `fold-icon.svg`, `fold-icon@1024/512/192.png` | Profile pictures, app icons, favicons. Square, white on purple. |

## The wordmark

**FOLD** in heavy italic capitals, with **KNOW YOUR FLOCK** and
*(PROVERBS 27:23)* centred beneath it. It is part of the lockup files, so
nobody has to set it by hand, and nobody should.

## Colour

| | |
| --- | --- |
| Brand purple | `#6b2fd9` |
| Text | `#1a1033` |
| Ground | `#faf9f6` |

One colour does the whole mark and the whole wordmark. On a dark or purple
ground use the light files, which are white throughout. Never put the
purple mark on a dark ground.

## Clear space and minimum size

Leave the height of the cross clear on all four sides of the mark. Nothing
else goes in that space.

Smallest sizes that still read: the detailed mark at **40px**, the
simplified mark at **18px**, the full lockup at **120px** wide. Below that,
use the icon.

## Do not

- Redraw it, trace it, or rebuild it in another tool.
- Stretch it. Scale both dimensions together.
- Recolour it, add a gradient, a shadow, an outline or a glow.
- Set the wordmark in another typeface, or in upright rather than italic.
- Put the detailed mark below 40px.
- Separate the cross from the steeple, or the wordmark from the tagline.

## The overview

`Fold-Overview.pdf`, one page of A4, for anyone who asks what this is.
`Fold-Overview.png` is the same page as an image, which is what actually
gets looked at on a phone.

Both are built from `fold-overview.html`. Everything in it is taken from
getfold.org, deliberately, because a document that outruns the website is a
document somebody has to correct in front of a customer.

```bash
npm install --no-save playwright && npx playwright install chromium
node scripts/build-mark.mjs      # the logo files
node docs/overview/build.mjs     # the PDF and PNG
```

The overview build **fails if the content would run to two pages**. It
measures at the printable width, 695px, not the paper width: text wraps
more inside the margins, and measuring at 794px is what let the first build
look like it fitted while printing on two sheets.
