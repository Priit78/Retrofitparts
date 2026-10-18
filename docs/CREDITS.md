# Photo credits

## Stock photos (Pexels)

The Pexels License allows free commercial use with no attribution required. These sources are recorded so each photo can be re-checked or swapped for the client's own.

| File (`src/assets/photos/`) | Pexels photo | Use |
|---|---|---|
| `hero-headlight.jpg` | [Close-Up of Car Headlight with Purple LED Rings, #33990956](https://www.pexels.com/photo/close-up-of-car-headlight-with-purple-led-rings-33990956/), edited: desaturated, the LED rings turned from purple to white, darkened, and placed on a 2560 × 1440 canvas in the page colour with feathered edges | Landing hero; process chapter, step 4 (Garantii); also `src/assets/og/hero-og.jpg`, the sharing image's background, cut from it |
| `road-night.jpg` | [Road in Snow in Forest at Night, #15100466](https://www.pexels.com/photo/road-in-snow-in-forest-at-night-15100466/), cropped to remove the air freshener and dashboard | Before/after slider (simulation) |
| `cat-lens.jpg` | [Extreme Close-up of a Car's Left Front Light, #15469365](https://www.pexels.com/photo/extreme-close-up-of-a-cars-left-front-light-15469365/), cropped | Catalog teaser: lenses |
| `cat-led.jpg` | [Close-up of Luxury Car Headlight in Parking Area, #35113549](https://www.pexels.com/photo/close-up-of-luxury-car-headlight-in-parking-area-35113549/) (a Lamborghini; the crop keeps its script badge out of frame) | Catalog teaser: LED |
| `cat-xenon.jpg` | [A Close-Up Shot of the Headlight of a Car, #11079820](https://www.pexels.com/photo/a-close-up-shot-of-the-headlight-of-a-car-11079820/), cropped | Catalog teaser: xenon |
| `forest-drive.jpg` | [Car with Headlights On in Dark Forest Setting, #29052777](https://www.pexels.com/photo/car-with-headlights-on-in-dark-forest-setting-29052777/) | Contact band |

## The client's own photos (from retrofitparts.ee)

| File | Source | Use |
|---|---|---|
| `retrofit-in-progress.jpg` | retrofitparts.ee media library (`headlight-assembly-2.jpg`) | Process chapter, step 3 (Paigaldus) |
| `projector-bench.jpg` | retrofitparts.ee media library (`headlight-assembly-3.jpg`) | About section; process chapter, step 2 (Pakkumine) |
| `headlight-unpolished.jpg`, `headlight-polished.jpg` | Supplied by the project owner on 2026-10-18: the same BMW 3 Series headlight before and after polishing. Cropped to matching frames, 1600 × 750, metadata stripped | Problem chapter: the polishing pair; `headlight-unpolished.jpg` also in the process chapter, step 1 (Päring) |

The client should confirm these are their own work. Their own workshop and finished-car photography would replace the stock photos above; see `docs/CONTENT-TODO.md`.

## Product photos (the client's own, from retrofitparts.ee)

The 12 photos in `public/products/` come from the client's own media library on retrofitparts.ee
(`wp-content/uploads/2025/04/` and `2026/04/`). They are the client's phone snapshots of their own
headlight units: one full-unit shot per product, re-encoded at 1000 px wide (quality 78,
progressive, metadata stripped). The part-number label close-ups are not used.

| File (`public/products/`) | Source file |
|---|---|
| `mb-c-klass-w205-parem-led-ils-esituli-a2059063204.jpg` | `IMG-2795-4.jpg` |
| `ford-galaxy-s-max-taastatud-esitulede-komplekt-1zs009250-41-1zs009250-42.jpg` | `IMG-2806-5.jpg` |
| `bmw-g30-pre-lci-vasak-esituli-7439193-04.jpg` | `IMG-2785-2.jpg` |
| `bmw-f15-xenon-esitulede-komplekt-7290055-7290056.jpg` | `IMG-2812-4.jpg` |
| `bmw-f10-vasak-halogeen-esituli-uus-originaal.jpg` | `IMG-2822-5.jpg` |
| `audi-a6-c7-parem-esituli-4g0941006c.jpg` | `IMG-2782-8.jpg` |
| `bmw-f01-pre-lci-vasak-esituli-7182137.jpg` | `IMG-2596-5.jpg` |
| `bmw-f10-lci-parem-esituli-731713211.jpg` | `IMG-2593-3.jpg` |
| `ford-mondeo-mkv-vasak-esituli-es7313d155af.jpg` | `IMG-2590-7.jpg` |
| `mb-gls-x166-parem-esituli-a1669069002.jpg` | `IMG-2588.jpg` |
| `mb-e-klass-w213-vasak-esituli-a2139066501.jpg` | `IMG-2583.jpg` |
| `volvo-s-v90-parem-esituli-32342465.jpg` | `IMG-2580.jpg` |

No supplier packshots are used. The client should confirm these are their own photos; see
`docs/CONTENT-TODO.md`.

## Logo

`src/components/layout/logo.ts` holds the client's "RETROFIT PARTS" lettering, traced into an
SVG path from their logo `retrofit-parts-logo-500.png` on retrofitparts.ee (the frame, tagline
and URL left out). The favicon `src/app/icon.svg` is "RP" from the same lettering. Both should
be replaced by the original vector logo when the client sends it.

## Fonts

All under the SIL Open Font License 1.1.

- Albert Sans (display and body) and IBM Plex Mono (labels), served through Google Fonts with
  `next/font`.
- `src/assets/fonts/AlbertSans-400.ttf` and `AlbertSans-600.ttf` are bundled for the sharing
  image (`src/app/[locale]/opengraph-image.tsx`), which cannot read web fonts.
