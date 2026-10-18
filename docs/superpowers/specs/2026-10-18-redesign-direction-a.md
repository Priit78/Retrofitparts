# Redesign: Direction A "Dark refined"

Date: 2026-10-18. Status: approved by the user. They picked direction A from the mockups
(https://claude.ai/artifact/76PLVgifjVWUbEd1TVGPnM) and chose to keep the mockup's accent rather
than switch to the client's brand orange.

This document amends `2026-10-17-retrofitparts-website-design.md`. Everything there still holds
unless it is changed below: routes, i18n, content rules, catalog behaviour, inquiry form, SEO,
"real facts only", accessibility and 360 px.

## Why

The user found the first build cheap-looking and disliked the big light animation. The causes were
no real photography, neon glow effects everywhere, a very wide display font, and too many competing
gimmicks. Direction A fixes all four: photo-led, calm typography, no glow, one restrained palette.

## Visual system (replaces the old "Visual system")

- **Palette (theme tokens, same names):**
  - `bg` #0e1013
  - `surface` #15181c
  - `surface-2` #1b1f24
  - `line` white at 11%
  - `fg` #eeece8 (warm white)
  - `muted` #a2a6ac
  - `light` #eeece8
  - `accent` #d6d3cc (ivory, for small emphasis and the focus ring)
  - `halogen` #d9a35b ("before" states only)
  - `danger` #ff8a80
  - A new `soft` token #c9cdd2 for secondary body text.
- **No glow:** no coloured `box-shadow` glows, no text glow, no bloom, no neon gradients, no
  cursor-follow light effects. Hover feedback is a border, background or underline change.
- **Typography:** Albert Sans for display and body (weights 400–700; headings 600, tracking −0.02
  to −0.035 em, normal width), and IBM Plex Mono for small uppercase labels (12 px, +0.08 em
  tracking). Both load through `next/font/google` with `latin-ext`. Archivo Expanded, Inter and
  JetBrains Mono are removed.
- **Shape:** border radius 2 px on buttons, photos and cards. Hairline (`line`) dividers rather
  than boxed cards wherever possible.
- **Buttons:**
  - primary: `light` background, `bg` text, 46 px tall, 600 weight
  - ghost: 1 px border at white 35%, `fg` text
- **Motion:** quiet. Simple fade or rise reveals (`Reveal`), the before/after slider, the process
  progress line, and the FAQ accordion. No canvas, no particles, no marquee, no parallax glow.
  Reduced motion still shows everything.
- **Photography:** real photos everywhere, served through `next/image` from static imports in
  `src/assets/photos/`.
  - Stock photos come from Pexels (free commercial licence) and are listed in `docs/CREDITS.md`.
  - The client's own photos come from retrofitparts.ee.
  - Every photo has meaningful bilingual alt text, or empty alt when decorative.

## Page changes (landing)

Order: Hero, Services and prices, Difference (before/after), Polish (replaces Anatomy), Process,
Catalog teaser, Car makes, About, FAQ, Contact. The brand marquee is removed. The represented brands
appear in the hero trust row and the About section.

1. **Header:** transparent over the hero at the top (light text), solid `bg` with a hairline
   border once scrolled. Text wordmark "Retrofit Parts" (Albert Sans 700, "Parts" in `muted`).
   Ivory "Küsi pakkumist" button. Same nav, language switch and mobile sheet behaviour.
2. **Hero:** a full-bleed photo (lit LED headlight at night, `hero-headlight.jpg`) with a dark
   gradient from the left and bottom.
   - Mono eyebrow "Esitulede retrofit · Tallinn".
   - H1 "Selge valgus. Kindel töö." / "Clear light. Solid work.".
   - The lead sentence, two CTAs, and a four-column trust row with hairline separators: 10+ years,
     2-year warranty, official representative of Morimoto, Bimmerjakes and Strands, workshop at
     Pärnu mnt 160F.
   - The H1 is visible at first paint. The photo is `priority`, and the image's LCP is acceptable.
   - The projector lens SVG and the beam canvas are deleted.
3. **Services:** a two-column layout. Left: heading and intro. Right: the price "menu" from
   `site.pricing` (rows with hairlines, tabular figures, "alates" above the price). Below it, the
   eight services as a two-column hairline list, each with a title and one line. No glow cards.
4. **Difference:** the before/after slider now uses the photo `road-night.jpg` (a driver's view of
   a snowy forest road at night).
   - "Before" is the same photo with a CSS filter simulating a faded halogen light; "after" is
     cooled and crisp.
   - Labelled "Simulatsioon ühe foto põhjal" / "Simulation based on one photo".
   - Keep all the CompareSlider behaviour: keyboard, tap to move, pinch zoom, aria and the intro
     sweep.
   - The three fact cards become a flat three-column row.
   - The SVG road scene is deleted.
5. **Polish (was Anatomy):** heading "Poleerimine on ajutine lahendus".
   - Two photos: `headlight-hazed.jpg` (stock) and `retrofit-in-progress.jpg` (the client's own:
     a projector retrofit with the bumper off). Each has a mono caption.
   - The four headlight parts (lens, shroud, projector, housing) as a numbered hairline list with
     one line each. Numbering is fine here because the parts are a real front-to-back order.
   - The polish-versus-replace comparison stays as a two-column list.
   - The exploded SVG headlight and the scroll pinning are deleted.
6. **Process:** the same four steps. Hairline vertical rail with mono step numbers, and the rail
   fills in `fg` with scroll progress (no glow). On mobile it is a plain list.
7. **Catalog teaser:** three large photo tiles (`cat-lens.jpg`, `cat-led.jpg`, `cat-xenon.jpg`)
   for Lenses, LED projectors and high beams, and Xenon, with real product counts. They link to the
   filtered catalog. A "Vaata kogu kataloogi" link with the total count follows. The featured
   product row is removed from the landing page.
8. **Car makes:** keep the typographic grid, restyled flat (hairlines, no glow), with the product
   count per make.
9. **About:** the story text plus the client's real photo `projector-bench.jpg` (a lit Morimoto LED
   projector on the workbench). The figures (2015, 10+, 2 years, catalog count) are plain large
   numbers with no glow.
10. **FAQ:** a flat hairline accordion.
11. **Contact:** a CTA band with the photo `forest-drive.jpg` behind a dark gradient
    ("Saada meile auto mark, mudel ja foto tuledest."). Below it, the form and details card,
    restyled flat. The glowing map pin is deleted (link to Google Maps instead).
12. **Footer:** a quiet hairline footer.

## Catalog changes

- **Live data:** replace the 63 captured products with the live catalog (115 products from the
  WooCommerce Store API, 2026-10-18).
  - Drop the €0 junk row "toode".
  - Add the category `headlights` ("Komplektsed tuled" / "Complete headlights") for complete
    headlight units.
  - Keep the bilingual names and descriptions and the extracted specs. Write English for new items.
- **Product photos:** use the client's own photos (full-unit shots of the used and new OEM
  headlights) where a product has one, via `Product.image`. Part-number label shots are not used.
- **Illustrations:** the category renders lose the blue rim light and glow. Neutral, monochrome
  studio lighting in the A palette; same shapes.
- **UI:** the filter bar, cards, drawer and product page are restyled to the A tokens. Same
  behaviour.

## Facts changed or confirmed by the live site (2026-10-18)

- Address, hours, phone and email are confirmed.
- The old address "Kopli 25" still appears on the live /kontakt/ and /kkk/ pages (CONTENT-TODO).
- Installation prices 150/300/90 € do not appear on the live site, so they are unconfirmed
  (CONTENT-TODO).
- The live site says prices include "20% VAT", but the figures match 24%. Our copy says
  "sisaldab käibemaksu" without a rate. The client must confirm (CONTENT-TODO).

## Out of scope

A logo redesign (the client's orange wordmark is noted in CONTENT-TODO as a brand decision) and
new photography (recommended: the client's own workshop and finished-car shots).
