# Landing Scroll Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the landing page into a scroll story. Five chapters pin to the screen while their
content changes with scroll, and calm sections sit around them.

**Architecture:**
- A `ScrollChapter` client component provides each chapter's track and sticky stage, and
  exposes the chapter's scroll progress (a motion value, 0–1) through context.
- Chapters are server sections that compose small client leaves. Those leaves map progress to
  `opacity`, `transform` and `clip-path` with pure helpers from `src/lib/story.ts`.
- Pinning is CSS gated on `html.js` and `prefers-reduced-motion: no-preference`. Otherwise
  everything renders as normal stacked sections.

**Tech Stack:** Next.js 16.4 (App Router, static), React 19, Tailwind CSS 4, motion 14
(`motion/react`), Vitest + Testing Library, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-18-landing-story-design.md`. The approved prototype is
https://claude.ai/artifact/Jmq8Z1R1Zaj8XLZWTDeLCZ; its source is
`/tmp/claude-0/-home-user-Retrofitparts/f4715ac7-c7ad-5f90-ba4a-5d2b841f2de0/scratchpad/proto/story.src.html`,
and its timings and layouts are the reference.

## Global Constraints

- **Look:** direction A is unchanged. Use the tokens (`bg surface surface-2 line fg soft muted
  halogen brand`), Albert Sans and IBM Plex Mono, radius 2 px, hairlines. **No glow:** no
  coloured or blurred shadows, bloom, neon or radial light. Dark scrims over photos are fine.
- **Facts and copy:** real facts only. Every string is bilingual in `src/content/*.ts`, and facts
  and prices come from `site.ts`. New copy goes in `src/content/story.ts`, exactly as below.
- **Dependencies:** none new. Use `motion/react` and CSS `position: sticky`.
- **Client code:** `"use client"` only on leaf components. Animate only `transform`, `opacity`
  and `clip-path`, through motion values (no React state per frame).
- **Hero:** the hero h1 and photo are fully visible at load (p = 0). The h1 is never hidden
  before scrolling and never inside `Reveal`. The hero photo keeps `preload`.
- **Static mode:** with no JS, or with reduced motion, nothing pins and every beat, step, layer
  description and photo is visible in reading order.
- **Accessibility and layout:** no horizontal overflow at 360 px. AA contrast, per word, for
  text over photos. Visible focus. No keyboard trap in pinned stages.
- **Ids:** `top`, `problem`, `difference`, `anatomy`, `services`, `process`,
  `catalog-teaser`, `faq` and `contact` exist on the landing page. The header nav links
  `#services`, `#process`, `#faq` and `#contact` keep working.
- **Gate:** each task passes `npm run typecheck && npm run lint && npm test && npm run build`.
  The last task also passes `npm run e2e`.
- **Pushing:** merged tasks stay local until Task 7. The branch auto-deploys, so don't push
  stubs.

## Review Focus

1. **Anchor jumps into or past tall chapters.** Clicking `Tööprotsess` or `KKK` in the header
   must land at the section start below the header, once, with focus moved there, as the current
   e2e tests require. Task 7 keeps those tests green and adds `#anatomy` to them.
2. **Pre-hydration flash.** Before JS runs, a pinned stage must not show every beat stacked on
   top of each other. Beats after the first carry `data-pinned-hidden`, which CSS hides only in
   pinned mode. Task 1 tests the CSS hook, and Task 7 checks it in a no-JS e2e run.
3. **Visitor versus scroll on the slider.** Once someone drags or keys the before/after slider,
   scroll stops moving it. Task 4 tests this.
4. **Resize or rotation mid-page.** The catalog strip recomputes its travel when the viewport or
   track width changes, and never translates past its last tile. Task 6 tests this, and Task 7
   checks overflow after a resize.
5. **State after jumping.** Every chapter's state is a pure function of its current progress, so
   jumping to `#contact` and scrolling back shows the right step and beat. Task 1 tests
   `activeIndex`/`beatOpacity` at the boundaries, and Task 5 tests a step from p alone.

---

### Task 1: Story foundation: progress, chapter shell, CSS, copy and page wiring

**Files:**
- Create: `src/lib/story.ts`, `src/lib/story.test.ts`
- Create: `src/components/story/ScrollChapter.tsx`, `src/components/story/ScrollChapter.test.tsx`
- Create: `src/components/story/Beat.tsx` (client), `src/components/story/Beat.test.tsx`
- Create: `src/content/story.ts`
- Create stubs (each renders `<section id=…><h2>…</h2></section>` with its content title):
  `src/components/story/ProblemChapter.tsx`, `src/components/story/AnatomyChapter.tsx`,
  `src/components/story/ProcessChapter.tsx`; `src/components/story/ChapterIndex.tsx` (returns `null`)
- Modify: `src/app/globals.css` (chapter rules in `@layer components`)
- Modify: `src/app/[locale]/page.tsx`. The order becomes Hero, ProblemChapter, Difference,
  AnatomyChapter, Services, ProcessChapter, CatalogTeaser, CarMakes, About, Faq, Contact, with
  `<ChapterIndex locale={locale} />` last. Polish and Process are no longer imported.

**Interfaces (produced):**
- `segment(p: number, start: number, end: number): number`: clamp((p − start)/(end − start),
  0, 1). It requires `end > start`.
- `beatOpacity(p: number, range: readonly [number, number], fade = 0.05): number`:
  - It is `segment(p, a, a + fade) × (1 − segment(p, b − fade, b))`.
  - When `a ≤ 0` the fade-in factor is 1, so the first beat is visible at p = 0.
  - When `b > 1` the fade-out factor is 1, so a last beat stays visible.
- `activeIndex(p: number, count: number, start = 0, end = 1): number`:
  `min(count − 1, floor(segment(p, start, end) × count))`.
- `explodeOffset(layer: number, e: number, step = { x: 120, y: 64 }): { x: number; y: number }`:
  `{ x: layer·step.x·e, y: −layer·step.y·e }`.
- `ScrollChapter` (client), with these props:
  - `id: string`
  - `labelledBy?: string`
  - `label?: string`
  - `length: { base: number; md: number }`, in vh (base below 768 px, md from 768 px)
  - `pinFrom?: "base" | "lg"`, default `"base"`. `"lg"` pins only from 1024 px.
  - `className?: string`
  - `stageClassName?: string`
  - `children: ReactNode`

  It renders `<section id className="chapter" data-pin-from style="--chapter-len,--chapter-len-md">`
  around `<div className="chapter-stage">`. Its progress comes from
  `useScroll({ target, offset: ["start start", "end end"] })`.
- `useChapter(): { progress: MotionValue<number>; animated: boolean }`. `animated` is `false`
  when reduced motion is on (`usePrefersReducedMotion`), and leaves then set no motion styles.
- `ChapterProgressProvider({ progress: number; animated?: boolean; children })` is a test
  helper. It supplies a fixed progress.
- `Beat` (client), with these props:
  - `range: readonly [number, number]`
  - `fade?: number`
  - `lift?: number` (px, default 14)
  - `initiallyHidden?: boolean`, which sets `data-pinned-hidden`
  - `as?: "div" | "p"`
  - `className?: string`
  - `children`

  Its opacity is `beatOpacity`. Its y is `+(1 − o)·lift` before the range midpoint and
  `−(1 − o)·lift` after it.
- CSS in `globals.css`. When `html.js` is set and under
  `@media (prefers-reduced-motion: no-preference)`:
  - `.chapter { height: var(--chapter-len) }`, and from 768 px `var(--chapter-len-md)`.
  - `.chapter-stage { position: sticky; top: 0; height: 100svh; overflow: hidden }`.
  - `.chapter [data-pinned-hidden] { opacity: 0 }`.
  - `[data-pin-from="lg"]` applies all of these only from 1024 px.

  Outside that context, `.chapter` and `.chapter-stage` are plain blocks.
- `src/content/story.ts` exports `story`:
  - `heroNext`: et "Aga iga esituli vananeb.", en "But every headlight ages."
  - `problem.kicker`: et "Probleem", en "The problem"
  - `problem.beats`, with three entries:
    1. Title et "Tuleklaas vananeb.", en "Lenses age." Body et "Päike, kivid ja aastad muudavad
       tuleklaasi pinna karedaks ja kollakaks. Valgus hajub ja teele jõuab seda vähem.", en "Sun,
       stones and years make the lens surface rough and yellow. The light scatters, and less of
       it reaches the road."
    2. Title et "Poleerimine teeb klaasi korraks selgeks.", en "Polishing clears the lens, for a
       while." Body et "See on odavaim lahendus, kuid valgust see sageli juurde ei anna.", en "It
       is the cheapest fix, but it often adds no light at all."
    3. The title is `polish.compare.heading`. This beat has no body; it shows the compare
       columns.
  - `difference.scrollHint`: et "Keri edasi ja vaata, kuidas valgus muutub.", en "Keep
    scrolling to see the light change."
  - `anatomy.kicker`: et "Lahendus", en "The fix"
  - `anatomy.drawingLabel`: et "Esitule neli osa eest taha: tuleklaas, projektori kate,
    projektor ja korpus", en "The four parts of a headlight, front to back: outer lens, shroud,
    projector and housing"
  - `index.label`: et "Peatükid", en "Chapters"
  - `chapters`, as `{ id, label }[]`:
    - `top`: Valgus / Light
    - `problem`: Probleem / Problem
    - `difference`: Vahe / Difference
    - `anatomy`: Lahendus / Fix
    - `services`: Hinnad / Prices
    - `process`: Töö käik / Process
    - `catalog-teaser`: Kataloog / Catalog

- [ ] **Step 1: Write the failing tests in `src/lib/story.test.ts`**

```ts
expect(segment(0.5, 0.3, 0.7)).toBe(0.5);
expect(segment(-1, 0, 1)).toBe(0);
expect(segment(2, 0, 1)).toBe(1);
expect(beatOpacity(0, [0, 0.33])).toBe(1);          // first beat visible at load
expect(beatOpacity(0.2, [0.33, 0.66])).toBe(0);
expect(beatOpacity(0.5, [0.33, 0.66])).toBe(1);
expect(beatOpacity(1, [0.66, 1.01])).toBe(1);       // last beat stays
expect(activeIndex(0, 4)).toBe(0);
expect(activeIndex(0.999, 4)).toBe(3);
expect(activeIndex(1, 4)).toBe(3);                   // never out of range
expect(activeIndex(0.3, 4, 0.3, 0.98)).toBe(0);
expect(explodeOffset(3, 1)).toEqual({ x: 360, y: -192 });
expect(explodeOffset(2, 0)).toEqual({ x: 0, y: -0 });
```

- [ ] **Step 2:** Run `npx vitest run src/lib/story.test.ts`. It should FAIL because the module
  is not found.
- [ ] **Step 3:** Implement `src/lib/story.ts` with the four signatures above.
- [ ] **Step 4:** Run the same test. It should PASS.
- [ ] **Step 5: Write the failing component tests.**
  - `ScrollChapter.test.tsx`:
    - It renders `section#x.chapter` with `--chapter-len: 160vh` and `--chapter-len-md: 190vh`
      for `length={{ base: 160, md: 190 }}`.
    - Children sit inside `.chapter-stage`.
    - `pinFrom="lg"` sets `data-pin-from="lg"`.
  - `Beat.test.tsx`:
    - Under `ChapterProgressProvider progress={0.5}`, a `Beat range={[0.33, 0.66]}` has style
      `opacity: 1`.
    - At `progress={0.1}` it has `opacity: 0`.
    - With `animated={false}` it has no inline opacity.
    - `initiallyHidden` renders `data-pinned-hidden`.
- [ ] **Step 6:** Run them. They should FAIL. Then implement `ScrollChapter.tsx` (with `useChapter`
  and `ChapterProgressProvider`) and `Beat.tsx`. Run them again. They should PASS.
- [ ] **Step 7:** Add the chapter CSS to `globals.css`, `story.ts`, the stubs and the page
  order. `npm run dev`: `/et` renders with no errors and the stubs show their headings.
- [ ] **Step 8:** Run the gate (`npm run typecheck && npm run lint && npm test && npm run build`).
  Some existing Polish and Process tests now test files no longer on the page. Leave them; their
  owners delete them in Tasks 3 and 5. Commit with "Add the scroll story foundation: chapter
  shell, progress helpers, copy and page order".

---

### Task 2: Hero chapter and chapter index

**Files:**
- Modify: `src/components/sections/Hero.tsx`, `src/components/sections/Hero.test.tsx`
- Create: `src/components/story/HeroZoom.tsx` (client: scales its child with progress)
- Replace stub: `src/components/story/ChapterIndex.tsx` (client), and create `ChapterIndex.test.tsx`

**Interfaces:**
- Consumes: `ScrollChapter`, `useChapter`, `Beat`, `segment`, `story.heroNext`,
  `story.chapters`, `story.index.label`.
- Produces: `HeroZoom({ children, to = 1.22 })`, which sets scale `1 + (to − 1)·p` on the
  photo wrapper, with transform origin about 72 % 48 %.

**Hero layout:**
- Wrap the current hero in `ScrollChapter id="top" labelledBy="hero-title"
  length={{ base: 160, md: 190 }}`.
- The copy block is `Beat range={[0, 0.38]} fade={0.30} lift={50}`.
- The trust row on desktop is `Beat range={[0, 0.30]} fade={0.25}`. On phones the trust row
  sits after the stage in normal flow and does not fade (`md:` placement).
- A new line `story.heroNext` is `Beat range={[0.42, 1.01]} fade={0.24} initiallyHidden`. It
  is set large (`clamp(34px, 5vw, 64px)`, semibold), vertically centred on desktop and near the
  top on phones.
- The h1, lead, CTAs and photo `preload` are unchanged.

**ChapterIndex:**
- From 1440 px, a fixed `<nav aria-label={story.index.label}>` on the right, vertically centred.
  It holds one link per `story.chapters` entry (`href="#id"`).
  - Each tick is a 14 px hairline that grows to 28 px in `fg` when active.
  - Only the active label shows, in mono 11 px.
  - The active chapter is the last one whose top is above 50 % of the viewport, from scroll
    events in rAF.
- Below 1440 px, a 1 px `bg-fg/70` progress line is fixed under the header (`top-16 lg:top-20`),
  `scaleX` = page scroll progress (`useScroll()`).
- Render it only on the landing page (page.tsx already does).

- [ ] **Step 1: Write the failing tests.**
  - `Hero.test.tsx` gains three cases:
    - At `ChapterProgressProvider progress={0}`, the h1 and lead are visible (`opacity: 1`) and
      the `heroNext` text is present with `data-pinned-hidden`.
    - At `progress={0.7}`, the `heroNext` line has `opacity: 1`.
    - The section has id `top`.
  - `ChapterIndex.test.tsx`: it renders 7 links with the et labels in order, and their hrefs
    are `#top` … `#catalog-teaser`.
- [ ] **Step 2:** Run `npx vitest run src/components/sections/Hero.test.tsx src/components/story/ChapterIndex.test.tsx`.
  It should FAIL.
- [ ] **Step 3:** Implement `HeroZoom`, the Hero changes and `ChapterIndex`.
- [ ] **Step 4:** Run the same tests. They should PASS.
- [ ] **Step 5:** Take screenshots of `/et` at 1440 and 390 at scroll 0 and in the middle of
  the hero track. Check that the h1 is at full opacity at 0, and that the hero line's text has
  AA contrast at 1024 and 1440 (`scratchpad/r3/probe2.mjs … "#top"`).
- [ ] **Step 6:** Run the gate, then commit with "Hero chapter: zoom, fade and the second line; chapter index".

---

### Task 3: Problem and Fix chapters (the polishing story split in two)

**Files:**
- Replace stub: `src/components/story/ProblemChapter.tsx`. Create `PolishWipe.tsx` (client)
  and `ProblemChapter.test.tsx`.
- Replace stub: `src/components/story/AnatomyChapter.tsx`. Create `HeadlightLines.tsx` (SVG,
  server), `ExplodedHeadlight.tsx` (client), `PartsList.tsx` (client) and
  `AnatomyChapter.test.tsx`.
- Delete: `src/components/sections/Polish.tsx`, `src/components/sections/Polish.test.tsx`.
- Modify: `src/content/polish.ts`. Remove the keys left unused (`eyebrow`, `title`, `intro`,
  `photos.retrofit` and `partsNote` if unused). Keep `photos.unpolished`, `photos.polished`,
  `parts`, `partsHeading` and `compare`.

**Interfaces:**
- Consumes: `ScrollChapter`, `useChapter`, `Beat`, `segment`, `activeIndex`, `explodeOffset`,
  `story.problem`, `story.anatomy`, `polish.*`.
- Produces:
  - `PolishWipe({ before, after, beforeCaption, afterCaption })` (client), a frame at
    `aspect-[32/15]`.
    - The after photo's `clip-path` is `inset(0 ${100 − 100·w}% 0 0)`, with
      `w = segment(p, 0.30, 0.62)`.
    - A 1 px `fg` seam sits at `w·100 %` and is shown only while 0 < w < 1.
    - The caption switches at w ≥ 0.5.
    - In static mode it shows both photos stacked, each with its own caption.
  - `HeadlightLines({ label, active?: number, offsets?: {x,y}[] })`: an inline SVG with four
    `<g data-layer={0..3}>`, front to back (lens, shroud, projector with the stepped cut-off
    line, housing), plus two dashed axis lines.
    - Strokes are `currentColor` at `fg`/30, 1.1 px, `vector-effect: non-scaling-stroke`.
    - The active layer is `fg` at 1.6 px. There are no fills.
    - Use the prototype's paths as the starting drawing and refine them.

**Problem chapter:**
- `ScrollChapter id="problem" label={story.problem.kicker[locale]} length={{ base: 260, md: 300 }}`.
- The stage is a 5/7 split on desktop, with the text left and the photo right; on phones the
  photo is on top. It holds:
  - `PolishWipe`;
  - Beat 1, `Beat range={[0, 0.33]}`;
  - Beat 2, `Beat range={[0.33, 0.66]} initiallyHidden`;
  - Beat 3, `Beat range={[0.66, 1.01]} initiallyHidden`, holding the two compare columns
    (temporary in `halogen`, lasting in `fg`), as in the current Polish section.
- In pinned mode the beats are stacked in one grid cell (`grid-area: 1/1`); in static mode they
  sit in order.

**Fix chapter:**
- `ScrollChapter id="anatomy" label={story.anatomy.kicker[locale]} length={{ base: 280, md: 320 }}`.
- The stage has the kicker, the `partsHeading` h2, `ExplodedHeadlight`, and `PartsList` beside
  it (a 7/5 split on desktop; the list below on phones).
- Explode `e = segment(p, 0.02, 0.30)`. Layer `i` is offset by `explodeOffset(i, e)`.
- The active part is `activeIndex(p, 4, 0.30, 0.98)`, and only once `e > 0.9`. Before that no
  layer is active.
- The `PartsList` item for the active part gets `aria-current="step"`, `fg` text, and its
  description open.
- In static mode everything is fully exploded and every description is open.

- [ ] **Step 1: Write the failing tests** (both locales via `it.each(locales)`).
  - Problem:
    - Both alt texts, from `polish.photos`, are present.
    - At `progress={0}` the caption reads `polish.photos.unpolished.caption`; at `progress={0.6}`
      it reads `…polished.caption`.
    - At `progress={0.5}` the beat-2 title has `opacity: 1` and the beat-1 title has
      `opacity: 0`.
    - All three beat titles are in the DOM in order.
    - The compare groups are found by role `group` with the names `polish.compare.polish.title`
      and `…replace.title`.
  - Fix:
    - The SVG has role `img` with name `story.anatomy.drawingLabel`.
    - The list has 4 items, in `polish.parts` order.
    - At `progress={0.8}` the item with `aria-current="step"` is part 3 (projector), from
      `activeIndex(0.8, 4, 0.3, 0.98) = 2`.
    - At `progress={0.1}` no item has `aria-current`.
    - With `animated={false}` every description is visible.
- [ ] **Step 2:** Run them. They should FAIL. Implement the leaves and chapters. Run them again.
  They should PASS.
- [ ] **Step 3:** Delete `Polish.tsx` and its test, and prune `polish.ts`. Then
  `grep -rn "polish\.\(eyebrow\|title\|intro\|photos.retrofit\)" src` should show nothing.
- [ ] **Step 4:** Take screenshots at 1440 and 390 at p 0, 0.5 and 1 for each chapter. Check
  that there's no overflow at 360, and that the static mode is right (run `--reduced`).
- [ ] **Step 5:** Run the gate, then commit with "Problem and Fix chapters replace the polishing section".

---

### Task 4: Difference chapter (scroll-driven, framed slider)

**Files:**
- Modify: `src/components/sections/Difference.tsx`, `src/components/difference/CompareSlider.tsx`,
  `src/components/difference/CompareSlider.test.tsx`, `src/components/difference/Difference.test.tsx`
- Create: `src/components/difference/ScrollDrivenSlider.tsx` (client)
- Modify: `src/content/difference.ts`, only if a hint key moves. The hint lives in `story.ts`.

**Interfaces:**
- Consumes: `ScrollChapter`, `useChapter`, `segment`, `story.difference.scrollHint`.
- Produces: `CompareSlider` gains `drivenBy?: MotionValue<number>`, a 0–100 position.
  - When it is given and the visitor has not touched the slider, `position` follows it and the
    intro sweep does not run.
  - After any pointer drag, tap or key on the slider, `drivenBy` is ignored for the rest of the
    page view.
- `ScrollDrivenSlider(props: CompareSlider props without drivenBy)` derives
  `10 + 80·segment(p, 0.08, 0.92)` from `useChapter().progress` and passes it as `drivenBy`.
  With `animated` false it passes nothing, so the slider rests at 50 % as today.

**Layout:**
- `ScrollChapter id="difference" labelledBy={heading id} length={{ base: 200, md: 240 }}`.
- The stage is a centred column: the kicker, h2 and intro, then the slider frame and its
  caption plus `scrollHint`.
- The frame keeps `aspect-[4/3] md:aspect-[3/2]` and is sized to fit under the heading:
  `md:w-[min(100%,calc((100svh-290px)*1.5))]`, centred.
- It never goes full-bleed. The prototype's v1 looked zoomed in and the client rejected it.
- The facts block (`difference.facts`) follows the chapter as a normal block in the same
  component.

- [ ] **Step 1: Write the failing tests.**
  - `CompareSlider.test.tsx`:
    - With `drivenBy` set to 30, the range input's value is "30".
    - Setting `drivenBy` to 70 updates the value to "70".
    - After `fireEvent.keyDown(input, { key: "ArrowRight" })`, setting `drivenBy` to 20
      leaves the value unchanged ("visitor wins").
  - `Difference.test.tsx`:
    - The section id is `difference`.
    - Under `ChapterProgressProvider progress={0.5}` the slider value is "50".
    - At `progress={0.08}` it is "10".
    - The facts list still renders its three items.
- [ ] **Step 2:** Run them. They should FAIL. Implement. Run them again. They should PASS.
  The existing slider tests (drag, keys, labels) still pass.
- [ ] **Step 3:** Take screenshots at 1440 and 390 at p 0.15 and 0.6. The photo must be at its
  natural shape, with no zoom crop.
- [ ] **Step 4:** Run the gate, then commit with "Difference chapter: scroll drives the slider until the visitor takes over".

---

### Task 5: Process chapter

**Files:**
- Replace stub: `src/components/story/ProcessChapter.tsx`. Create `ProcessStage.tsx` (client)
  and `ProcessChapter.test.tsx`.
- Delete: `src/components/sections/Process.tsx` and `src/components/sections/ProcessTimeline.tsx`,
  with any tests of them.

**Interfaces:**
- Consumes: `ScrollChapter`, `useChapter`, `activeIndex`, `processCopy`, `site.warrantyYears`,
  `site.email`, `fillTemplate`/`fillText`, `textLink`, and the photos `headlight-unpolished.jpg`,
  `projector-bench.jpg`, `retrofit-in-progress.jpg` and `hero-headlight.jpg`.
- Produces: `ProcessStage({ steps: { id, title, body: ReactNode, tag, photo: StaticImageData }[] })`.

**Layout:**
- `ScrollChapter id="process" labelledBy="process-title" length={{ base: 300, md: 360 }}`.
- The stage is a full-bleed photo per step, `alt=""`.
  - The photos crossfade (opacity transition 0.7 s, `var(--ease-out-expo)`) as
    `k = activeIndex(p, 4)` changes.
  - The scrim is
    `linear-gradient(0deg, bg/97 0%, bg/82 38%, bg/20 75%, bg/55 100%)`.
- At the bottom: the kicker (`processCopy.eyebrow`), the h2 `processCopy.title`, the step
  number (`01`–`04`, light, `clamp(64px,10vw,128px)`), the step title, body and mono tag.
- Below that, four 2 px segments. Segment i is `scaleX(clamp(4p − i, 0, 1))`.
- Only step k is visible; the other steps carry `data-pinned-hidden` and opacity 0 in pinned
  mode.
- Only step 1's photo is eager; the rest are lazy.
- In static mode the steps are listed in order, each with its photo above it (`aspect-[16/9]`),
  and the segments are hidden.

- [ ] **Step 1: Write the failing tests** (both locales).
  - The four step titles are in DOM order.
  - At `progress={0.6}` the step with `aria-current="step"` is "Paigaldus" / "Installation".
  - At `progress={0}` it is step 1.
  - The step-1 body contains a `mailto:` link to `site.email`.
  - The h2 has id `process-title`.
  - With `animated={false}` there is no `aria-current` and every step is visible.
- [ ] **Step 2:** Run them. They should FAIL. Implement and delete the old files. Run them again.
  They should PASS.
- [ ] **Step 3:** Check AA contrast per word over the photos at 390, 1024 and 1440, in et and
  en, for every step. Use the probe with selector `#process`, scrolled to p = 0.1, 0.35, 0.6 and
  0.85 by a small script. Strengthen the scrim if any word is below 4.5:1.
- [ ] **Step 4:** Run the gate, then commit with "Process chapter: one full-screen photo per step".

---

### Task 6: Catalog strip

**Files:**
- Modify: `src/components/sections/CatalogTeaser.tsx`, `src/components/sections/CatalogTeaser.test.tsx`
- Create: `src/components/story/CatalogStrip.tsx` (client)
- Modify: `src/content/catalog.ts`. Add the tile copy for complete headlights and the closing card.

**Interfaces:**
- Consumes: `ScrollChapter`, `useChapter`, `segment`, `products`, `categories`,
  `filterProducts`, `filtersToQuery`, `ProductMedia` (the product photo frame), and the current
  tile data.
- Produces: `CatalogStrip({ children })`. It translates its track by
  `−max(0, trackWidth − viewportWidth) · segment(p, 0.10, 0.92)`.
  - The track width is measured with a `ResizeObserver` and the viewport width on `resize`.
  - It translates only from 1024 px (`lg`) when animated.
  - Below that the track is `overflow-x: auto`, with `scroll-snap-type: x mandatory`,
    `snap-start` tiles and no transform.

**Layout:**
- `ScrollChapter id="catalog-teaser" labelledBy="catalog-teaser-title" pinFrom="lg"
  length={{ base: 0, md: 280 }}`. `base: 0` is unused because it does not pin below `lg`.
  The spec says 900 px; this plan uses `lg` (1024 px), so tablets get the swipe row as well.
  Note this in the spec in Task 7.
- The tiles, in this order:
  1. Lenses.
  2. **Complete headlights**: title et "Komplektsed tuled", en "Complete headlights". Use the
     first product with an `image` in category `headlights`, in its `ProductMedia` frame; the
     count and link come from the data.
  3. LED group.
  4. Xenon group.
  5. A closing card: "Vaata kogu kataloogi" / "View the whole catalog", with `(N toodet)`.
- Tiles are `w-[min(78vw,400px)] lg:w-[30vw] lg:max-w-[420px]` at `aspect-[4/5]`.
- Sub-links, counts and multi-category hrefs stay as today.

- [ ] **Step 1: Write the failing tests.**
  - The section id is `catalog-teaser`.
  - There are five tile links in order.
  - The complete-headlights tile's count equals
    `filterProducts(products, parseFilters(href), "et").length`.
  - The closing card shows `products.length`.
  - For `CatalogStrip`, with mocked `scrollWidth` 3000, `innerWidth` 1440 and
    `matchMedia('(min-width: 1024px)')` true, `progress={0.92}` gives `translateX(-1560px)` and
    `progress={0.10}` gives `translateX(0px)`.
  - After a mocked resize to `innerWidth` 2000, the translation at 0.92 is `-1000px`.
- [ ] **Step 2:** Run them. They should FAIL. Implement. Run them again. They should PASS.
- [ ] **Step 3:** Take screenshots at 1440 (p 0.1, 0.5, 0.92) and 390 (swipe row).
  `document.documentElement.scrollWidth ≤ innerWidth` at 360 and 390.
- [ ] **Step 4:** Run the gate, then commit with "Catalog strip: tiles move sideways on desktop, swipe on phones".

---

### Task 7: QA, e2e, docs, final review and deploy

**Files:**
- Modify: `e2e/site.spec.ts`, `docs/CONTENT-TODO.md`, `docs/superpowers/specs/…` (only if the
  build deviated), and `CLAUDE.md` (one line on chapters and `ScrollChapter`).
- Fix anything the checks below surface, in the owning files.

- [ ] **Step 1: Extend the e2e tests.**
  - The reduced-motion headings test covers `problem`, `anatomy`, `process` and `catalog-teaser`.
  - With JS disabled (`test.use({ javaScriptEnabled: false })`), `/et` shows every beat title
    of the problem chapter and all four process step titles as visible.
  - With JS, at load, the problem beat-2 title is not visible (Review Focus 2).
  - Scrolling to the middle of `#problem` makes the "Pärast poleerimist" caption visible.
  - Scrolling to the end of `#anatomy` gives the item with `aria-current="step"` the text
    "Korpus".
  - At 1440, the catalog track's transform changes between the start and the end of
    `#catalog-teaser`. At 390 the row scrolls horizontally inside its own box, and
    `document.documentElement.scrollWidth ≤ innerWidth`.
  - Resizing 1440 → 390 → 1440 mid-page causes no page overflow (Review Focus 4).
  - A full scroll of `/et` and `/en` logs no console errors.
  - The existing header-navigation tests pass (`#services`, `#process`, `#contact`), plus
    `#anatomy` through the chapter index at 1440 (Review Focus 1).
- [ ] **Step 2:** Run `npm run build && npm run e2e`. Expect everything to pass.
- [ ] **Step 3: Measure.**
  - AA per word for `#top`, `#process` and `#contact` at 360/390/768/1024/1440 in both locales.
  - LCP and CLS on `/et` at 390 (4× CPU, slow network) and 1440. Expect LCP ≤ 1.1 s locally
    and CLS ≤ 0.05.
  - Hero image bytes no larger than today's 30 KB and 49 KB.
- [ ] **Step 4:** Take a full screenshot set: each chapter at p 0, 0.5 and 1, at 1440 and 390,
  in et and en. Fix spacing and timing so the chapters match the approved prototype.
- [ ] **Step 5:** Add the new copy to `CONTENT-TODO` §7 ("copy to confirm").
- [ ] **Step 6:** Run a final whole-branch review (the most capable model), fix the findings,
  re-run the gate and e2e, then push and confirm the Vercel deployment is READY.
