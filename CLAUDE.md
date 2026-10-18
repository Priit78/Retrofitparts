# Retrofit Parts website

Marketing site and showcase catalog for Retrofit Parts OÜ (headlight retrofits, Tallinn).
Spec: `docs/superpowers/specs/2026-10-17-retrofitparts-website-design.md`.
Plan: `docs/superpowers/plans/2026-10-17-retrofitparts-website.md`.
Redesign (direction A, current look): `docs/superpowers/specs/2026-10-18-redesign-direction-a.md`,
plan `docs/superpowers/plans/2026-10-18-redesign-direction-a.md`.

Read `AGENTS.md` too: this is Next.js 16.4. Check `node_modules/next/dist/docs/` before relying on
memory of Next.js APIs.

## Commands

- `npm run dev`: dev server
- `npm run typecheck`: `next typegen && tsc --noEmit`
- `npm run lint`, `npm test` (Vitest), `npm run build`, `npm run e2e` (Playwright, after a build)
- `node scripts/shot.mjs <url> <out.png> [width] [--full] [--reduced]` takes a screenshot with the
  preinstalled Chromium. Put screenshots in `screenshots/` (git-ignored).

## Conventions

- Routes live under `src/app/[locale]/`, with locales `et` (default) and `en`. Static generation
  only. `cacheComponents` is deliberately off.
- Every visible string is bilingual. Copy lives in `src/content/<area>.ts` as `{ et, en }` objects
  (`Localized<T>` from `@/lib/i18n`). Company facts, hours, address and prices come only from
  `src/content/site.ts`.
- Sections are `export function Name({ locale }: { locale: Locale })` in
  `src/components/sections/`. Each is self-contained.
- Design direction A "Dark refined" (`docs/superpowers/specs/2026-10-18-redesign-direction-a.md`):
  graphite and warm white, photo-led, calm. **No glow**: no coloured box-shadow glows, text glow,
  bloom, neon gradients, cursor-follow light or canvas effects. Radius 2 px. Prefer hairline
  dividers over boxed cards.
- Colors come from theme tokens only (`bg`, `surface`, `surface-2`, `line`, `fg`, `soft`, `muted`,
  `light`, `accent`, `halogen` for "before" states, `danger` for errors, `brand` (the client's
  orange) for the logo only), defined in
  `src/app/globals.css`. Fonts: `font-display` and `font-sans` (Albert Sans), `font-mono` (IBM Plex
  Mono, small uppercase labels).
- Photos live in `src/assets/photos/` and render through `next/image` (static imports), with
  bilingual alt text from content files. Sources are listed in `docs/CREDITS.md`.
- Animation is quiet: `Reveal` entrances, the before/after slider, the process progress line and
  the FAQ accordion. Every animation respects `prefers-reduced-motion`, and no content may stay
  hidden if JS or animation doesn't run. Never wrap above-the-fold or LCP content (the hero h1) in
  `Reveal`, and put hover transitions on a child of a `Reveal` rather than on the element itself.
- The landing page is a scroll story (`docs/superpowers/specs/2026-10-18-landing-story-design.md`):
  pinned chapters are `ScrollChapter`s in `src/components/story/`, whose leaves read
  `useChapter()` (progress, `animated`, `seek`) and fade text with `Beat`; style the pinned layout
  with `pinned:` / `pinned-lg:` and leave the unprefixed static layout showing everything (no JS,
  reduced motion, short screens). Per frame, animate only transform, opacity and clip-path.
- Add `"use client"` only on leaf components that need it.
- Use real facts only. No invented reviews, ratings, counts or performance figures.
- No horizontal scroll at 360 px. Keep visible focus states and AA contrast.
- Don't add npm dependencies without asking the lead.
