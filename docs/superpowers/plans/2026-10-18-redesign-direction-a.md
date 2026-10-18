# Redesign Direction A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the whole site to direction A ("Dark refined", photo-led, no glow), and switch the catalog to the live 115-product data.

**Architecture:** Same Next.js app, routes, content model and behaviour. R1 swaps the design tokens, fonts and shared primitives, and adds the photo assets. Wave R2 restyles the areas in parallel worktrees with disjoint file ownership. R3 runs QA and the art-direction pass.

**Tech Stack:** unchanged (Next.js 16.4, Tailwind 4, motion, Lenis), plus `next/image` with static imports.

**Spec:** `docs/superpowers/specs/2026-10-18-redesign-direction-a.md`, which amends `docs/superpowers/specs/2026-10-17-retrofitparts-website-design.md`.

**Reference mockup:** `/tmp/claude-0/-home-user-Retrofitparts/f4715ac7-c7ad-5f90-ba4a-5d2b841f2de0/scratchpad/mockups/template.html` (the `.a` direction, without the inlined images). Screenshot: `/tmp/claude-0/-home-user-Retrofitparts/f4715ac7-c7ad-5f90-ba4a-5d2b841f2de0/scratchpad/scripts/mock-a-d.png`.

## Global Constraints

Everything in the original plan's Global Constraints still applies (real facts only, bilingual content files, `site.ts` as the source of truth, tokens only, reduced motion with nothing hidden, no overflow at 360 px, AA contrast, visible focus, no new dependencies, `"use client"` only at leaves). In addition:
- No glow: no coloured `box-shadow` glows, text glow, bloom, neon gradients, cursor-follow light or canvas particles.
- Fonts are Albert Sans (display and body) and IBM Plex Mono (labels) only.
- Border radius is 2 px on buttons, photos and cards. Prefer hairline dividers to boxed cards.
- Photos come only from `src/assets/photos/` through `next/image`. Every one has bilingual alt text from content files, or `alt=""` when purely decorative.
- Keep each behaviour and its test unless the spec deletes the feature. When a feature is deleted, delete its files and tests too.
- `npm run typecheck && npm run lint && npm test && npm run build` passes. `npm run e2e` passes at the end of R3.

## Review Focus

1. **Text over photos:** contrast of text on the hero, the CTA band and the photo tiles must hold AA at every width. Expect a gradient scrim strong enough at 360 px.
2. **LCP:** the hero photo must not delay the h1 or make LCP slow. Expect `priority` and `sizes` on the hero image, an h1 that is never hidden, and a reasonable file size.
3. **Before/after legibility:** the "before" side must stay readable (not black), and the "after" side natural (not blown out), at both 1440 and 390 px.
4. **Live data integrity:** prices are in minor units (convert ÷100), there are 115 products minus the junk row, slugs are unique, makes come only from `site.vehicleMakes`, and both languages are filled.
5. **Deleted-feature leftovers:** no dead imports, unused content keys, orphaned tests or unused assets remain after deleting the lens, beam, marquee, road SVG and exploded headlight.

---

### Task R1: Foundation restyle (lead)

**Files:**
- Modify: `src/app/globals.css` (tokens), `src/app/[locale]/layout.tsx` and `src/app/global-not-found.tsx` (fonts)
- Modify: `src/components/ui/{Button,SectionHeading}.tsx`, `src/app/[locale]/page.tsx` (composition), `src/data/types.ts` (adds `headlights`), `CLAUDE.md`
- Create: `src/assets/photos/*.jpg` (optimized), `docs/CREDITS.md`, `src/components/sections/Polish.tsx` (stub)

**Interfaces (produced):**
- Tokens: `bg` #0e1013, `surface` #15181c, `surface-2` #1b1f24, `line` rgb(255 255 255 / .11), `fg` #eeece8, `soft` #c9cdd2, `muted` #a2a6ac, `light` #eeece8, `accent` #d6d3cc, `halogen` #d9a35b, `danger` #ff8a80.
- Fonts: `font-display` and `font-sans` both use Albert Sans; `font-mono` uses IBM Plex Mono. Headings have `font-stretch: normal`, weight 600, tracking −0.02 em.
- `Button`:
  - primary: `bg-light text-bg`, rounded 2 px, 46 px tall, no shadow
  - ghost: `border border-white/35 text-fg`
  - the props are unchanged
- `SectionHeading`: a mono eyebrow in `muted`, no accent rule; the props are unchanged.
- Photos (static imports in `src/assets/photos/`):
  - `hero-headlight.jpg`
  - `road-night.jpg`
  - `headlight-hazed.jpg`
  - `retrofit-in-progress.jpg` (the client's own)
  - `projector-bench.jpg` (the client's own)
  - `cat-lens.jpg`, `cat-led.jpg`, `cat-xenon.jpg`
  - `forest-drive.jpg`
- `CategoryId` adds `"headlights"`.
- Page order: Hero, Services, Difference, Polish, Process, CatalogTeaser, CarMakes, About, Faq, Contact. `BrandMarquee` and `Anatomy` are no longer imported; their files are deleted in R2.

- [ ] Step 1: Implement. Run the verification gate. Screenshot `/et` and check the new palette and fonts on the old sections.
- [ ] Step 2: Commit: "Switch foundation to direction A tokens, fonts and photo assets".

---

### Task R2a: Header, hero, footer, OG image
Own: `src/components/layout/*`, `src/components/sections/Hero.tsx`, `src/content/{hero,layout}.ts`, `src/app/[locale]/opengraph-image.tsx`. Delete: `src/components/hero/*`, `src/components/sections/BrandMarquee.tsx`, and their tests and content keys.
Spec items: header (1), hero (2) and footer (12). The OG image uses the hero photo with a dark scrim, the wordmark and the tagline. If `next/og` can't embed a local JPEG cleanly, use a solid graphite background with type only; no glow.

### Task R2b: Difference slider on a photo, Polish section
Own: `src/components/sections/{Difference,Polish}.tsx`, `src/components/difference/*`, `src/content/{difference,anatomy}.ts` (rename `anatomy` to `polish` if cleaner). Delete: `src/components/anatomy/*`, `src/components/sections/Anatomy.tsx`, `RoadScene`, and their tests. Spec items 4 and 5.

### Task R2c: Services, process, car makes, about, FAQ
Own: `src/components/sections/{Services,Process,ProcessTimeline,CarMakes,About,Faq,FaqAccordion}.tsx`, `src/components/ui/{GlowCard,Counter}.tsx`, `src/content/{services,process,makes,about,faq}.ts`. `GlowCard` keeps its API but becomes a flat card with a border hover and no cursor light (the catalog uses it). Spec items 3, 6, 8, 9 and 10.

### Task R2d: Contact and inquiry form
Own: `src/components/sections/Contact.tsx`, `src/components/inquiry/*`, `src/content/inquiry.ts`. Spec item 11. The form's behaviour, tests and accessibility stay unchanged.

### Task R2e: Catalog UI restyle and landing teaser
Own: `src/components/catalog/*`, `src/app/[locale]/catalog/**`, `src/components/sections/CatalogTeaser.tsx`, `src/content/catalog.ts`. Spec "Catalog changes" (UI and illustrations, including a `headlights` render) and item 7. Real product photos display through the existing `Product.image` path, with `next/image` (remote patterns are not needed; the images are local).

### Task R2f: Live catalog data
Own: `src/data/products.ts`, `src/data/products.test.ts`, `src/lib/catalog*.ts` (only if needed), `public/products/*` (the client's product photos), `docs/CONTENT-TODO.md`, `docs/CREDITS.md` (append).
- Source: `/tmp/claude-0/-home-user-Retrofitparts/f4715ac7-c7ad-5f90-ba4a-5d2b841f2de0/scratchpad/client-assets/products-live.json` and its `manifest.md` (which photos are usable full-unit shots).
- Convert all 115 products minus the junk row, with prices ÷100 and EUR including VAT. Map them into the 11 categories. Keep the existing bilingual text for unchanged slugs; write natural et/en text for the new ones. Extract specs only from the source.
- Optimize the product photos into `public/products/<slug>.jpg` (about 1200 px wide, quality about 78).
- Update the tests (counts, categories, makes, both languages filled), and the CONTENT-TODO facts from the spec.

### Task R3: QA and art direction (after R2 merges)
Run e2e and update it for the deleted and changed sections. Take a full screenshot set at 1440 and 390 px in both locales, and compare it against the mockup. Fix spacing, rhythm, contrast and overflow. Run a Lighthouse-style check of image sizes and LCP. Then the final whole-branch review, push and deploy.
