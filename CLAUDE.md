# Retrofit Parts website

Marketing site and showcase catalog for Retrofit Parts OÜ (headlight retrofits, Tallinn).
Spec: `docs/superpowers/specs/2026-10-17-retrofitparts-website-design.md`.
Plan: `docs/superpowers/plans/2026-10-17-retrofitparts-website.md`.

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
- Colors come from theme tokens only (`bg`, `surface`, `surface-2`, `line`, `fg`, `muted`, `light`,
  `accent`, `halogen`), defined in `src/app/globals.css`. Fonts: `font-display` (Archivo, expanded),
  `font-sans` (Inter), `font-mono` (JetBrains Mono).
- Animation uses `motion/react` and CSS. Every animation respects `prefers-reduced-motion`, and no
  content may stay hidden if JS or animation doesn't run. Use `Reveal` for simple scroll entrances.
- Add `"use client"` only on leaf components that need it.
- Use real facts only. No invented reviews, ratings, counts or performance figures.
- No horizontal scroll at 360 px. Keep visible focus states and AA contrast.
- Don't add npm dependencies without asking the lead.
