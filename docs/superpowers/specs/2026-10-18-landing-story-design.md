# Landing page as a scroll story: design

Date: 2026-10-18. Status: approved direction (option A, "a story in chapters"), spec for review.
Builds on: `2026-10-18-redesign-direction-a.md` (the look stays exactly as it is).
Approved prototype (throwaway, Estonian only): https://claude.ai/artifact/Jmq8Z1R1Zaj8XLZWTDeLCZ

## Why

The client is happy with the direction A look, but finds the landing layout too plain: every
section uses the same "heading left, content right" split, stacked one after the other. They want
it to feel more advanced. They chose scroll-driven storytelling, structure A: the landing page
reads as one story, with a few chapters that pin to the screen while their content changes as you
scroll. They compared it with B (only three pinned moments) and chose A.

## What stays

- Direction A: tokens, fonts, the orange logo, photos, radius 2 px, hairlines, **no glow**.
- Real facts only, bilingual et/en content files, `site.ts` as the source of facts and prices.
- The catalog pages, header, footer, inquiry form, FAQ, About and Contact are unchanged.
- No new npm dependencies: `motion/react` (`useScroll`, `useTransform`, `useMotionValueEvent`)
  and CSS `position: sticky` do the work.

## The story (page order)

| # | Chapter | Id | Pinned | Desktop length | Phone length |
|---|---|---|---|---|---|
| 1 | Valgus / Light (hero) | `top` | yes | 190 vh | 160 vh |
| 2 | Probleem / The problem | `problem` | yes | 300 vh | 260 vh |
| 3 | Vahe / The difference, then the three facts | `difference` | yes | 240 vh | 200 vh |
| 4 | Lahendus / The fix | `anatomy` | yes | 320 vh | 280 vh |
| 5 | Teenused ja hinnad / Services and prices | `services` | no | | |
| 6 | Töö käik / Process | `process` | yes | 360 vh | 300 vh |
| 7 | Kataloog / Catalog | `catalog-teaser` | desktop only | 280 vh | native swipe |
| 8 | Car makes, About, FAQ, Contact | as now | no | | |

"Length" is the height of the chapter's scroll track. Its stage is one screen tall
(`100svh`) and sticks to the top while the track scrolls past. `p` below is the chapter's progress
from 0 (stage reaches the top) to 1 (track ends). Ids `services`, `process`, `faq` and `contact`
stay, because the header navigation links to them.

### 1 · Light (hero)

- The current hero, with the BMW photo, h1, lead, both buttons and the trust row.
- As `p` grows:
  - The photo scales from 1 to 1.22 towards the headlight.
  - The copy block drifts up 50 px and fades out between p 0.08 and 0.38.
  - The trust row fades out between 0.05 and 0.30.
  - One new line fades in between 0.42 and 0.66: "Aga iga esituli vananeb." / "But every headlight ages."
- **LCP rule:** at `p = 0` everything is fully visible. The h1 is in the server HTML, is never
  hidden before scrolling, and is never inside `Reveal`.
- **Phones:** the copy stays on top and the photo is a band below it, as now. The trust row stays
  in the flow under the stage (it does not fade).

### 2 · The problem

- **Stage:** the unpolished/polished pair of the same headlight, in one frame at the photos' own
  2.13:1 shape, with the text beside it on desktop (5/7 split) and below it on phones.
- **The wipe:** between p 0.30 and 0.62 the polished photo is revealed from left to right
  (`clip-path`), with a 1 px ivory seam at its edge. The caption switches from "Enne
  poleerimist" to "Pärast poleerimist" at the midpoint.
- **Three text beats** crossfade (about 5 % of `p` overlap). Each has the kicker "Probleem":
  - Beat 1 (0–0.33): "Tuleklaas vananeb." / "Lenses age." Body: new copy (see Content).
  - Beat 2 (0.33–0.66): "Poleerimine teeb klaasi korraks selgeks." / "Polishing clears the
    lens, for a while." Body: the first sentence of `polish.intro`.
  - Beat 3 (0.66–1): `polish.compare.heading` ("Poleerida või vahetada?") with the two
    existing compare columns (temporary / lasting).

### 3 · The difference

- The road photo stays **framed** at its own 3:2 (4:3 on phones), sized to fit under the
  heading. It never goes full-bleed: the client rejected a cropped, zoomed-in version.
- Between p 0.08 and 0.92, scroll moves the split from 10 % to 90 %.
- The slider stays draggable and keyboard-operable. Once the visitor drags or uses the keys, their
  position wins and scroll stops driving it.
- Below the frame, the existing caption ("Simulatsioon ühe foto põhjal") and a scroll hint.
- The three facts (`difference.facts`) follow as a normal, unpinned block.

### 4 · The fix

- **Stage:** an original line drawing of a headlight in four layers, front to back: lens,
  projector shroud, projector, housing. It uses 1 px strokes in `fg` at 30 % (active layer:
  full `fg`, 1.6 px), with no fills and no glow. The projector carries the stepped low-beam
  cut-off line. It is drawn as inline SVG with `currentColor`.
- **The parts list:** on desktop it sits beside the drawing (7/5 split), on phones below it.
  It shows the four parts from `polish.parts`, numbered 01–04.
- As `p` grows:
  - Between 0.02 and 0.30 the layers move apart along a diagonal depth axis (dashed hairlines).
  - From 0.30 to 0.98 the active part steps 01 → 04. The matching layer brightens and the list
    item opens to show its description.
- The SVG has `role="img"` and a bilingual label naming the four parts. The list carries the text.

### 5 · Services and prices

The current Services section, unchanged, as a calm breather between chapters.

### 6 · Process

- **Stage:** a full-bleed photo per step that crossfades as the step changes, under a bottom
  scrim strong enough for AA. On top: the kicker, a large step number, the title, the body, the
  mono tag, and a four-part progress bar.
- **Photos** are decorative (`alt=""`), because the text carries the meaning:
  1. Päring: `headlight-unpolished.jpg`, the kind of photo a customer sends.
  2. Pakkumine: `projector-bench.jpg`.
  3. Paigaldus: `retrofit-in-progress.jpg`.
  4. Garantii: `hero-headlight.jpg`.
- Step k = floor(4p), clamped to 0–3. The copy comes from `process.ts`, unchanged. This replaces
  `ProcessTimeline`.

### 7 · Catalog

- **Desktop:** the stage holds the heading and a horizontal row of tiles. Between p 0.10 and 0.92,
  vertical scroll moves the row sideways. The tiles are:
  1. Lenses (`cat-lens.jpg`).
  2. Complete headlights: one real unit photo, framed on `surface-2` like the catalog does.
  3. LED group (`cat-led.jpg`, current crop and brightness).
  4. Xenon group (`cat-xenon.jpg`).
  5. A "whole catalog (N products)" card.
- **Counts and links** come from the data with the existing `filterProducts`/`parseFilters`
  logic, including multi-category links.
- **Phones and tablets below 900 px:** not pinned. The row is a native horizontal swipe with
  scroll-snap.

### Chapter index and progress

- **From 1440 px:** a fixed chapter index at the right edge, made of hairline ticks. Only the
  active chapter shows its label: Valgus, Probleem, Vahe, Lahendus, Hinnad, Töö käik, Kataloog
  (and the English equivalents). The links jump to the chapter start. It never overlaps content,
  because from 1440 px the container leaves a gutter wider than the index.
- **Below 1440 px:** a 1 px reading-progress line under the header.

## Static mode (no JS, or reduced motion)

Chapters pin only when `html.js` is set and `prefers-reduced-motion: no-preference`. Otherwise
the track has no extra height, the stage is not sticky, and every beat, step, layer label and
description is shown in reading order:

| Chapter | Static layout |
|---|---|
| Problem | Both photos are stacked with their captions; all three beats are visible. |
| Fix | The drawing is fully exploded, with every description open. |
| Process | The four steps are listed, each with its photo. |
| Catalog | The tiles are a native swipe row. |

The current e2e check ("every landing section heading shows at once" under reduced motion) must
keep passing.

## Architecture

- **`src/components/story/ScrollChapter.tsx`** (client): the scroll track and sticky stage.
  - It exposes the chapter's progress as a motion value through context
    (`useChapterProgress()`), from `useScroll({ target, offset: ["start start", "end end"] })`.
  - Its props are the desktop and phone lengths, `id`, `aria-labelledby` and the children.
  - Pinning is CSS: `.chapter` and `.chapter-stage` in `globals.css`, gated by
    `html.js` and the reduced-motion media query.
  - Motion values drive transforms and opacity only, so there is no React re-render per frame.
- **`src/lib/story.ts`** (pure, unit tested):
  - `segment(p, a, b)`;
  - `beatOpacity(p, [start, end], fade)`;
  - `activeIndex(p, count, start, end)`;
  - `explodeOffset(layer, e)`.
- **Chapters**, each a server section that composes small client leaves:
  - **Hero:** `Hero.tsx`, reworked, with a client leaf for the zoom and fades.
  - **Problem:** `ProblemChapter.tsx`, with a client leaf for the wipe and beats.
  - **Difference:** `Difference.tsx` plus `CompareSlider`, which gains an optional
    `drivenBy` motion value and the "visitor wins" rule.
  - **Fix:** `AnatomyChapter.tsx` plus `HeadlightLines.tsx` (the SVG).
  - **Process:** `ProcessChapter.tsx`, which replaces `Process.tsx` and `ProcessTimeline.tsx`.
  - **Catalog:** `CatalogTeaser.tsx`, reworked into the strip.
  - **Index:** `ChapterIndex.tsx` with the progress line.
- **Deleted:** `Polish.tsx` (split into Problem and Fix), `ProcessTimeline.tsx`, and any
  content keys left unused. Their tests move to the new components.
- **Content:** new strings go in `src/content/story.ts` (chapter labels, the hero's second line,
  the problem beats). Everything else reuses `polish.ts`, `difference.ts`, `process.ts`,
  `catalog.ts` and `hero.ts`.

## Content

New copy, to add to CONTENT-TODO "copy to confirm":

- Hero, second line: "Aga iga esituli vananeb." / "But every headlight ages."
- Problem, beat 1:
  - Title: "Tuleklaas vananeb." / "Lenses age."
  - Body: "Päike, kivid ja aastad muudavad tuleklaasi pinna karedaks ja kollakaks. Valgus hajub
    ja teele jõuab seda vähem." / "Sun, stones and years make the lens surface rough and yellow.
    The light scatters, and less of it reaches the road."
- Problem, beat 2 title: "Poleerimine teeb klaasi korraks selgeks." / "Polishing clears the lens,
  for a while."
- Chapter labels for the index: Valgus, Probleem, Vahe, Lahendus, Hinnad, Töö käik, Kataloog /
  Light, Problem, Difference, Fix, Prices, Process, Catalog.

## Performance and accessibility

- **LCP:** the hero h1 and photo render at load exactly as today, and LCP stays at 1.1 s or
  better on the throttled phone profile. CLS stays at 0.05 or less. Only `transform`, `opacity`
  and `clip-path` animate.
- **Images:** `next/image` with correct `sizes`. Only the hero is preloaded. Process photos load
  lazily except step 1.
- **Contrast:** text over photos (hero, process) meets AA per word at 360–1440 px in both
  locales, measured with the probe.
- **Content and keyboard:** every word of every beat is in the DOM in reading order, so screen
  readers get the whole story. No pinned stage traps keyboard focus. Anchor links land at the
  chapter's start, below the header.
- **Overflow:** none at 360 px.

## Testing

- **Unit:** `lib/story.ts` (segments, beats, active index at the boundaries); each chapter
  renders all of its content in both locales; the Difference slider's "visitor wins" rule.
- **e2e:**
  - The existing suite passes, with the reduced-motion headings check covering the new ids.
  - Scrolling to the middle of the problem chapter shows "Pärast poleerimist".
  - Scrolling to the end of the fix chapter marks part 04 active.
  - The catalog strip moves on desktop and swipes on phones.
  - No console errors through a full scroll.
- **Manual:** screenshots at 1440 and 390 per chapter at p 0, 0.5 and 1, then the AA probe and
  LCP/CLS check.

## As built

Where the build departs from the text above (2026-10-18):

- **Pinning** also needs a viewport at least 32rem (512 px) tall; shorter screens get the static
  layout.
- **Hero:** the pinned stage is one screen tall. The trust row reads after the chapter, in the
  flow, below lg and on screens under 42rem tall; elsewhere it stays in the stage (and fades
  when pinned). The second line centres from lg; below lg it sits near the top, where the copy
  was.
- **Problem:** from lg, screens under 45rem tall give the beats the wider column (7/5). Landscape
  tablets (md to lg) also put the photo beside the beats, at 7/5. Phones up to 43rem tall get a
  compact type scale, so the photo keeps its full width. The caption chip hides in frames
  narrower than 12.5rem (the alt texts carry the meaning).
- **Difference:** the side tags fade out as the split reaches them.
- **Fix:** the assembled drawing starts at 1.25× and settles to its own size as it comes apart,
  while the dashed depth edges draw in. The parts list never changes size while it scrolls: each
  part keeps its row, and the descriptions share one slot under the list, as tall as the longest.
  The active part is `aria-current="step"` in `fg`; its description fades and rises into the
  slot while the others fade out.
- **Process:** side by side (the heading beside the step) on landscape screens from md, which
  covers desktops; stacked on phones and portrait screens. Step 1's photo loads eagerly at low
  fetch priority, so React does not preload it beside the hero photo.
- **Catalog:** the strip pins from 1024 px (lg), not 900 px. Pinned, the photo row is 4:5 at
  most and gives up height first on short screens (the frames grow wider). Phones (below 640 px)
  use 4:3 frames.
- **Chapter index:** shows only after hydration and while motion is allowed. Labels sit above the
  ticks. Only the current label shows; hovering the index reveals all of them, and a focused
  tick shows its own. The catalog strip is full-bleed, so its tiles do pass under the index;
  the labels sit on a small `bg` chip there (as the problem chapter's caption does).

## Out of scope

Video or frame-sequence scrubbing (needs real footage), new photography, catalog page changes,
and changes to the copy beyond the new lines above.
