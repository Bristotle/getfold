# Sending Fold to somebody

Two things people ask for, and where they live.

## The logo

`public/brand/`, served from the site as well, so a link works if a file
attachment does not.

| File | Use it for |
| --- | --- |
| `fold-logo.svg` | Anywhere on a light background. Scales to any size. |
| `fold-logo-light.svg` | On a dark or purple background. |
| `fold-logo@1200.png` | Slides, documents, anyone who cannot take an SVG. |
| `fold-logo@600.png` | Email signatures, smaller placements. |
| `fold-mark.svg`, `fold-mark@512.png` | The mark on its own, no wordmark. |
| `fold-icon.svg`, `fold-icon@512.png` | Profile pictures, app icons, favicons. Square. |

Live links: `getfold.org/brand/fold-logo.svg`, and the same for every file
above.

**The mark.** A fold is an enclosure for a flock, so it is a shelter rather
than a steeple or a cross. Two arcs, one folded inside the other: the outer
is the wall, the inner is the fold itself, and it is open at the foot
because a fold has a gate. It holds down to 16 pixels and reverses to white
without losing the inner arc.

**Colours.** Brand purple `#6b2fd9`. Text `#1a1033`. Ground `#faf9f6`. Do
not put the purple mark on a dark ground, use the light version.

**Clear space.** Leave the height of the mark's arch on all four sides.
Never redraw it, stretch it, add a shadow, or set the wordmark in another
face.

## The overview

`Fold-Overview.pdf`, one page of A4, for anyone who asks what this is.
`Fold-Overview.png` is the same page as an image, for WhatsApp.

Both are built from `fold-overview.html`. Everything in it is taken from
getfold.org, deliberately, because a document that outruns the website is a
document somebody has to correct in front of a customer.

To rebuild after the site changes:

```bash
npm install --no-save playwright && npx playwright install chromium
node docs/overview/build.mjs
```

It prints the content height against the page budget and fails loudly if it
would run to two pages. Measure at the printable width, 695px, not the full
A4 width: text wraps more inside the margins and that is what silently
pushed it onto a second sheet the first time.
