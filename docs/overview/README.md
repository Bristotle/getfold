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
| `fold-mark.svg`, `fold-mark@1024.png` | The church on its own, no wordmark. Down to about 40px. |
| `fold-mark-small.svg` | The same church with the detail removed, for anything under 40px. |
| `fold-icon.svg`, `fold-icon@512.png` | Profile pictures, app icons, favicons. Square. |

Live links: `getfold.org/brand/fold-logo.svg`, and the same for every file
above.

**The mark.** A church: steeple, cross, bell window, the arched door, and
the two side wings. Drawn as line art in one weight so it prints, embroiders
and reverses cleanly.

**Two versions, one building.** The detailed mark carries the wings, the
rose window and the small windows, and it holds down to about 40px. Below
that those details close into a smudge, so use `fold-mark-small.svg`, which
is the same church with the detail taken out rather than a different idea.
The website header and the app icon both use the simplified one.

**The wordmark.** FOLD in heavy italic capitals, with KNOW YOUR FLOCK and
(PROVERBS 27:23) beneath it, centred. It is part of the lockup files, so
nobody needs to set it by hand.

**Colours.** Brand purple `#6b2fd9` for everything, mark and type alike. On
a dark or purple ground use the light version, which is white throughout.
Do not put the purple mark on a dark ground.

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
