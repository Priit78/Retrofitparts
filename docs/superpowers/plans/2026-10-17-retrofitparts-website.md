# Retrofit Parts website (phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A dark, cinematic, bilingual (et/en) landing page and showcase catalog for Retrofit Parts, statically generated with Next.js and deployed on Vercel.

**Architecture:** Next.js App Router with a `[locale]` root segment and full static generation. Content lives in typed `{ et, en }` files, one per section, and product data in one typed module. Landing sections are self-contained components, so they can be built in parallel. The catalog filters on the client, from URL query state.

**Tech Stack:** Next.js 16.4.2, React 19.3.1, TypeScript, Tailwind CSS 4.3.3, motion 14.3.0 (`motion/react`), lenis, zod 4, resend, lucide-react, Vitest, @playwright/test 1.56.1 (matches the preinstalled Chromium 1194).

**Spec:** `docs/superpowers/specs/2026-10-17-retrofitparts-website-design.md`
**Content source (read-only):** `/tmp/claude-0/-home-user-Retrofitparts/f4715ac7-c7ad-5f90-ba4a-5d2b841f2de0/scratchpad/research/site-brief.md` and `products.json` in the same folder.

## Global Constraints

- Real facts only. No invented testimonials, ratings, project counts or performance numbers. General physics is allowed, for example halogen at about 3200 K versus LED at about 5500–6000 K.
- All user-visible text exists in natural Estonian (`et`, the default) and English (`en`). No hard-coded UI strings outside content files.
- Contact details, hours, address and installation prices come only from `src/content/site.ts`.
- Colors come from the Tailwind theme tokens defined in Task 1. No ad-hoc hex values in components, except inside SVG illustrations, which may use the token values.
- Every animation respects `prefers-reduced-motion`. In reduced mode the final state shows immediately, and no content stays hidden.
- No horizontal page scroll at 360 px width. Long Estonian words must wrap (`hyphens: auto` with `lang` set, `overflow-wrap: anywhere` on headings).
- Interactive elements are keyboard reachable, with a visible focus ring (`outline` in accent color). Text contrast meets WCAG AA.
- Do not add npm dependencies beyond those installed in Task 1. If one is truly needed, stop and report.
- Client components only where interaction or animation needs them (`"use client"` at the leaf).
- Next.js 16: `params` and `searchParams` in pages and layouts are Promises; `await` them.

## Review Focus

1. **Long Estonian words on a 360 px phone** ("valguslahendused", "paigaldustöökoda") overflow headings and cause horizontal scroll. Expect them to wrap. Covered by the Task 10 e2e no-overflow test on every page.
2. **Reduced motion or slow JS:** a reveal starts at `opacity: 0` and never runs, leaving content invisible. Expect everything visible. Covered by the Task 10 e2e test with `reducedMotion: 'reduce'`, and by `Reveal` rendering visible markup in reduced mode (Task 1 test).
3. **Hand-edited catalog URLs** (`?category=foo&make=Tesla&sort=x`) crash the page or silently misfilter. Expect invalid values to be ignored, and an unknown make to show the empty state with an inquiry CTA. Covered by the Task 2 `parseFilters` tests and the Task 8 empty-state test.
4. **Inquiry without Resend configured**, with the honeypot filled, or with neither email nor phone given. Expect an honest "not configured" error that shows the phone and email; a silent drop for bots; and a field error asking for a way to reply. Covered by the Task 7 tests.
5. **Switching language on a product page**, or an unknown locale or slug. Expect `/et/catalog/x` to become `/en/catalog/x`, and `/de` or an unknown slug to return 404. Covered by the Task 1 `switchLocalePath` test and the Task 10 e2e 404 tests.

---

## Execution waves

- **Wave 0 (lead, sequential):** Task 1.
- **Wave 1 (parallel worktrees):** Tasks 2–7. Each task owns disjoint files.
- **Wave 2 (parallel worktrees):** Tasks 8–9, after wave 1 has merged.
- **Wave 3:** Task 10 (QA), then a whole-branch review, push and deploy.

Every task's verification gate, run from the repo root, is all of: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. A UI task also takes screenshots with `node scripts/shot.mjs`, and its implementer looks at them before committing. Commit messages end with the session's attribution lines.

---

### Task 1: Foundation (lead)

**Files:**
- Create: the Next.js scaffold (`package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`), plus `vitest.config.ts` and `playwright.config.ts`
- Create: `src/app/globals.css` (Tailwind v4 `@theme` tokens, base styles, focus ring, `.text-balance` and heading wrap rules)
- Create: `src/app/[locale]/layout.tsx` (root layout: `<html lang>`, fonts, Header, Footer, SmoothScroll), `src/app/[locale]/page.tsx` (composes the sections), and `src/app/[locale]/not-found.tsx`
- Create: `src/lib/i18n.ts`, `src/lib/cn.ts`, `src/content/site.ts`
- Create: `src/data/types.ts`, plus `src/data/products.ts` as a stub that Task 2 replaces
- Create: `src/components/ui/{Container,Button,SectionHeading,Reveal}.tsx` and `src/components/providers/SmoothScroll.tsx`
- Create stubs (each returns a labelled `<section id>` placeholder) for the components the later tasks own: `src/components/layout/{Header,Footer}.tsx`; `src/components/sections/{Hero,BrandMarquee,Difference,Anatomy,Services,Process,CatalogTeaser,CarMakes,About,Faq,Contact}.tsx`
- Create: `scripts/shot.mjs`
- Test: `src/lib/i18n.test.ts`, `src/components/ui/Reveal.test.tsx`

**Interfaces (produced):**
- `src/lib/i18n.ts`:
  - `locales = ['et', 'en'] as const`; `type Locale`; `defaultLocale: Locale = 'et'`; `type Localized<T> = Record<Locale, T>`
  - `isLocale(v: string): v is Locale`
  - `localePath(locale: Locale, path = ''): string`. `localePath('et')` returns `'/et'`; `localePath('en', '/catalog')` returns `'/en/catalog'`.
  - `switchLocalePath(pathname: string, to: Locale): string`. `'/et/catalog/koito-bi-led'` with `'en'` returns `'/en/catalog/koito-bi-led'`; `'/'` with `'en'` returns `'/en'`.
- `src/lib/cn.ts`: `cn(...classes: ClassValue[]): string`, built on clsx.
- `src/content/site.ts`, exporting `site`:
  - Identity: `name: 'Retrofit Parts'`, `legalName: 'Retrofit Parts OÜ'`, `regCode: '12908331'`, `vat: 'EE101821324'`, `founded: 2015`
  - Contact: `phone: '+372 5667 0631'`, `phoneHref: 'tel:+37256670631'`, `email: 'info@retrofitparts.ee'`
  - Location: `address: { street: 'Pärnu mnt 160F', postalCode: '11317', city: 'Tallinn', country: Localized<string> }`, `mapsUrl` (Google Maps search URL for the address)
  - `hours: { days: Localized<string>; time: string | null }[]`, holding Mon–Thu `'09:00–18:00'` and Fri–Sun `null` (closed)
  - `facebook: 'https://www.facebook.com/p/Retrofit-Parts-100057357583960/'`
  - `tagline: Localized<string>`, where et is `'Parimad valguslahendused sinu sõidukile'`
  - Brands: `representedBrands: ['Morimoto', 'Bimmerjakes', 'Strands']`, `workedBrands: ['The Retrofit Source', 'Koito', 'Hella', 'Philips', 'Osram']`
  - `vehicleMakes: ['BMW', 'Audi', 'Volkswagen', 'Mercedes-Benz', 'Lexus', 'Honda', 'Ford', 'Mazda', 'Volvo']`
  - `pricing: { id: 'butyl' | 'glued' | 'moto'; label: Localized<string>; priceEur: number; duration: Localized<string> }[]`, holding 150 € (1–2 working days), 300 € (2–4 working days) and 90 € (motorcycle, one headlight)
  - `warrantyYears: 2`, `experienceYears: '10+'`
  - `nav: { id: string; href: string; label: Localized<string> }[]`, with ids `services`, `catalog`, `process`, `faq` and `contact`. Every href is a hash such as `'#services'`, except catalog, whose href is `'/catalog'`.
- Section anchor ids: `services`, `difference`, `anatomy`, `process`, `catalog-teaser`, `makes`, `about`, `faq`, `contact`.
- Every section and layout component has the signature `export function Name({ locale }: { locale: Locale }): JSX.Element`.
- `src/data/types.ts`, exactly:
  ```ts
  export type CategoryId = 'led-projectors' | 'led-lights' | 'xenon-projectors' | 'xenon-bulbs'
    | 'ballasts' | 'halogen' | 'lenses' | 'shrouds' | 'adapters' | 'fitting';
  export interface Category { id: CategoryId; name: Localized<string>; description: Localized<string> }
  export interface ProductSpec { label: Localized<string>; value: Localized<string> }
  export interface Product {
    slug: string; sku?: string; name: Localized<string>; category: CategoryId; brand?: string;
    makes: string[];            // values from site.vehicleMakes only
    price: number | null;       // EUR incl. 24% VAT; null = ask for price
    stock: 'in-stock' | 'backorder';
    description: Localized<string>; specs: ProductSpec[]; fitment: string[];
    warrantyYears?: number; featured?: boolean; image?: string;
  }
  ```
- `src/data/products.ts` (stub): `export const categories: Category[] = []`, `export const products: Product[] = []`.
- `Container({ children, className })` sets max width 1280 px with 16 px side padding (24 px from `md`).
- `Button`: props `{ href?: string; variant?: 'primary' | 'ghost'; size?: 'md' | 'lg' } & (anchor | button props)`. It renders a Next `Link` when `href` is set.
- `SectionHeading({ eyebrow, title, intro, align })` with `align: 'left' | 'center'`.
- `Reveal({ children, delay = 0, y = 24, className, as })` is a client component. It fades and slides children in when they enter the viewport, once. When `useReducedMotion()` is true it renders plain visible markup.
- `scripts/shot.mjs` usage: `node scripts/shot.mjs <url> <out.png> [width=1440] [--full]`. It launches `/opt/pw-browsers/chromium`, waits for network idle plus 1200 ms, and writes the PNG.
- npm scripts: `dev`, `build`, `start`, `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `e2e` (`playwright test`).

**Theme tokens** (`@theme` in `globals.css`):
- Colors: `--color-bg: #050607`, `--color-surface: #0b0d10`, `--color-surface-2: #12151a`, `--color-line: rgb(255 255 255 / 0.08)`, `--color-fg: #f2f4f7`, `--color-muted: #8a93a0`, `--color-light: #e8f4ff`, `--color-accent: #4cc3ff`, `--color-halogen: #ffc46b`
- Fonts: `--font-display` (Archivo with the `wdth` axis; headings use `font-stretch: 125%`), `--font-sans` (Inter), `--font-mono` (JetBrains Mono). Load them through `next/font/google` with subsets `latin` and `latin-ext`.

- [ ] **Step 1:** Scaffold with `create-next-app@16.4.2` (TypeScript, Tailwind, ESLint, App Router, `src/`, alias `@/*`, npm), then pin the versions above and install `motion lenis zod resend clsx lucide-react`, with dev dependencies `vitest @vitejs/plugin-react jsdom @testing-library/react @playwright/test@1.56.1`.
- [ ] **Step 2:** Write `src/lib/i18n.test.ts`, asserting the `localePath` and `switchLocalePath` examples above and that `isLocale('de')` is false. Write `Reveal.test.tsx`: with `matchMedia` reporting reduced motion, the child text is in the document and its wrapper has no `opacity: 0` inline style. Run `npm test` and expect a FAIL (modules missing).
- [ ] **Step 3:** Implement `i18n.ts`, `cn.ts`, `site.ts`, `types.ts`, the products stub, the UI primitives, SmoothScroll (Lenis, off when reduced motion is set), the layout with `generateStaticParams` for both locales and `dynamicParams = false`, the page composing the stubs in spec order, `not-found.tsx`, the redirect `/` → `/et` in `next.config.ts`, and `shot.mjs`.
- [ ] **Step 4:** Run the verification gate. Expect all of it to pass, with the build listing `/et` and `/en` as static. Screenshot `/et` and check that the dark theme and stubs render.
- [ ] **Step 5:** Commit: "Scaffold Next.js app with theme, i18n and section stubs".

---

### Task 2: Product data and catalog logic

**Files:**
- Replace: `src/data/products.ts`
- Create: `src/lib/catalog.ts`, `src/lib/format.ts`
- Test: `src/data/products.test.ts`, `src/lib/catalog.test.ts`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: `types.ts`, `Locale`, and `site.vehicleMakes` from Task 1.
- Produces:
  - `categories: Category[]`, all 10 ids in this display order: lenses, led-projectors, xenon-projectors, led-lights, xenon-bulbs, ballasts, halogen, shrouds, adapters, fitting
  - `products: Product[]`
  - `formatPrice(value: number | null, locale: Locale): string | null` (`Intl.NumberFormat`, et-EE or en-IE, EUR)
  - `interface CatalogFilters { category?: CategoryId; brand?: string; make?: string; q?: string; sort?: 'featured' | 'price-asc' | 'price-desc' }`
  - `parseFilters(params: URLSearchParams | Record<string, string | string[] | undefined>): CatalogFilters`
  - `filtersToQuery(f: CatalogFilters): string` (returns `''` or `'?category=lenses&make=BMW'`, keys in fixed order category, brand, make, q, sort)
  - `filterProducts(list: Product[], f: CatalogFilters, locale: Locale): Product[]`
  - `getBrands(list: Product[]): string[]` and `getMakes(list: Product[]): string[]`, both sorted, unique and non-empty
  - `getProduct(slug: string): Product | undefined`
  - `getRelated(p: Product, n = 4): Product[]` (same category first, never including `p`)

Data rules: convert all 63 entries from `products.json`.
- Map the subcategories onto `CategoryId`. LED kaugtuled and LED rõngad become `led-lights`; Paigaldustarvikud becomes `fitting`.
- Write natural English names and descriptions, and extract `specs` from the description text (lens diameter, color temperature, lumens, dimensions, contents).
- Set `makes` from the product name or fitment text (for example, every "Tuleklaasid BMW…" entry gets `['BMW']`). Use only `site.vehicleMakes` values.
- Keep the price as captured, with `null` where unknown. `stock` is `'in-stock'` only where the JSON says so. Use `warrantyYears: 2` where the description states it.
- Mark about 6 products as `featured`: both LED projectors, EvoX-R 2.0, Hella 5R, the BMW E90 xenon lenses and the 60 W LED high beams.

- [ ] **Step 1:** Write the tests.
  - `products.test.ts`: there are exactly 63 products; slugs are unique and match `/^[a-z0-9-]+$/`; every name and description is non-empty in both locales; every category id appears in `categories`; every price is `null` or above 0; every `makes` entry is in `site.vehicleMakes`; at least 4 products are featured.
  - `format.test.ts`: `formatPrice(284.59, 'et') === '284,59 €'`, `formatPrice(284.59, 'en') === '€284.59'` and `formatPrice(null, 'et') === null`.
  - `catalog.test.ts` covers:
    - `parseFilters({ category: 'foo', sort: 'x', make: 'Tesla' })` equals `{ make: 'Tesla' }`.
    - The category filter returns only that category.
    - The make filter `'BMW'` returns only products whose `makes` include BMW.
    - `q: 'butuul'` matches "OCI butüülliim", which needs diacritic-insensitive and case-insensitive search over name (both locales), brand, sku and fitment.
    - `price-asc` puts `null` prices last.
    - `filtersToQuery({})` returns `''`, and `filtersToQuery` round-trips through `parseFilters`.
    - `getRelated` never contains the product itself.
- [ ] **Step 2:** Run `npm test` and expect FAIL.
- [ ] **Step 3:** Implement the data and libraries.
- [ ] **Step 4:** Run the verification gate and expect PASS.
- [ ] **Step 5:** Commit: "Add product catalog data and filtering logic".

---

### Task 3: Header and footer

**Files:** Replace `src/components/layout/Header.tsx` and `Footer.tsx`. Create `src/components/layout/{MobileMenu,LanguageSwitch}.tsx` and `src/content/layout.ts`.

**Interfaces:** Consumes `site`, `Locale`, `localePath`, `switchLocalePath`, `Button` and `Container`. Produces `Header({ locale })` and `Footer({ locale })`, with signatures unchanged.

Header:
- Fixed and transparent at the top. After 24 px of scroll it becomes a glass bar (surface color at 70% opacity, `backdrop-blur`, bottom hairline).
- A wordmark linking to `localePath(locale)`: "RETROFIT" in display type plus "PARTS" in muted letter-spaced mono, with a small glowing dot.
- Nav from `site.nav`. A hash link points to `localePath(locale) + href`, so it works from catalog pages; the catalog item points to `localePath(locale, '/catalog')`.
- ET/EN switch through `switchLocalePath`, with `hrefLang` set and the current language marked by `aria-current`.
- Phone link, shown from `lg` up, and a "Request offer" button pointing to `#contact`.
- Below `lg`, a menu button (with `aria-expanded`) opens a full-screen sheet that traps focus, closes on Escape and on link click, and locks body scroll.

Footer: wordmark and tagline; navigation; contact block (address, phone, email, hours); legal line "Retrofit Parts OÜ · Reg. 12908331 · KMKR EE101821324"; Facebook link; © year.

- [ ] **Step 1:** Implement the header, footer and content.
- [ ] **Step 2:** Run the verification gate. Take screenshots of `/et` at 1440 px and 390 px, and with the mobile menu open (add `?menu=open` handling only if it's useful for the screenshot; otherwise click it in a one-off Playwright script). Review the screenshots.
- [ ] **Step 3:** Commit: "Add header with language switch and footer".

---

### Task 4: Hero and brand marquee

**Files:** Replace `src/components/sections/Hero.tsx` and `BrandMarquee.tsx`. Create `src/components/hero/{ProjectorLens,BeamCanvas}.tsx` and `src/content/hero.ts`.

**Interfaces:** Consumes `site` (tagline, brands, warrantyYears, experienceYears), `Button` and `Container`. Produces `Hero({ locale })` and `BrandMarquee({ locale })`.

Hero:
- `min-h-[100svh]`, with the headline on the left (desktop) or top (mobile) and the lens visual on the right or behind.
- `ProjectorLens` is an SVG: housing ring, chrome bezel, glass lens with specular highlights, and an inner LED glow.
- On mount it ignites: two quick flickers within about 400 ms, then a bloom over about 1.2 s, built with motion keyframes on the glow opacity and blur. The visual also responds to cursor parallax of at most 12 px.
- `BeamCanvas` is a client Canvas that draws a soft volumetric cone of light from the lens with 60–120 slowly drifting dust particles. It is sized with devicePixelRatio (capped at 2), pauses through `IntersectionObserver` when offscreen and on `visibilitychange`, and draws one static frame under reduced motion.
- Copy:
  - The h1 is `site.tagline`. It must be visible at first paint: transform-only entrance, no opacity 0, for LCP.
  - The subline names projector retrofits, lens replacement and restoration, at the Tallinn workshop since 2015.
  - Primary CTA to `#contact`, secondary to the catalog.
- Trust strip of four items with lucide icons: 10+ years of experience, 2-year warranty, official Morimoto / Bimmerjakes / Strands representative, workshop in Tallinn.

BrandMarquee:
- Infinite CSS marquee of `representedBrands` and `workedBrands` as typographic wordmarks, with a label reading "Official representative" (et: "Ametlik esindaja") next to the represented ones.
- Edges fade with a mask gradient; it pauses on hover; under reduced motion it becomes a static wrapped row.

- [ ] **Step 1:** Implement the hero, lens, canvas, marquee and content.
- [ ] **Step 2:** Run the verification gate. Screenshot `/et` and `/en` at 1440 px and 390 px. Confirm the lens glows and the h1 is visible.
- [ ] **Step 3:** Commit: "Add animated hero and brand marquee".

---

### Task 5: Difference slider and headlight anatomy

**Files:** Replace `src/components/sections/Difference.tsx` and `Anatomy.tsx`. Create `src/components/difference/{RoadScene,CompareSlider}.tsx`, `src/components/anatomy/ExplodedHeadlight.tsx`, `src/content/difference.ts` and `src/content/anatomy.ts`.

**Interfaces:** Consumes `SectionHeading`, `Container` and `Reveal`. Produces `Difference({ locale })` and `Anatomy({ locale })`.

Difference:
- `RoadScene` is an SVG night road in perspective, with lane markings, roadside posts and a sign, rendered in two variants:
  - `before`: a short, diffuse, warm `--color-halogen` light pool with a smeared cutoff and a dim, yellowed lens.
  - `after`: a long, crisp, cool-white pool with a sharp stepped low-beam cutoff, so the sign and posts are lit further away.
- `CompareSlider` overlays `after` on `before` with a `clip-path` driven by a handle. It supports pointer drag and an `<input type="range">` for keyboard and screen readers, with `aria-label` from content.
  - On first view it sweeps from 15% to 50% once; under reduced motion it starts at 50%.
  - Labels "Enne / Before" and "Pärast / After".
- Below it, three comparison facts with no invented percentages: color temperature (about 3200 K halogen against about 5500–6000 K LED), cutoff sharpness, and how lens haze scatters light.

Anatomy:
- A tall section (`h-[300vh]` on desktop) with a sticky stage. `useScroll` and `useTransform` separate four SVG layers (outer lens, shroud, projector, housing) along a diagonal, each with a label and a one-line explanation.
- Copy explains that polishing is temporary (the surface becomes more vulnerable afterwards and dirt inside stays), and that replacing the lens and projector gives factory-or-better output. Source: the KKK section of the brief.
- Below `md`, or under reduced motion, it shows the exploded state as a normal-height stacked list, with no scroll pinning.

- [ ] **Step 1:** Implement the scene, slider, exploded view and content.
- [ ] **Step 2:** Run the verification gate. Screenshots at 1440 px and 390 px: for Difference, scroll to `#difference`; for Anatomy, take three frames by scrolling to 0%, 50% and 100% of the section in a one-off Playwright script. Check that the slider handle moves with the arrow keys.
- [ ] **Step 3:** Commit: "Add before/after beam slider and exploded headlight".

---

### Task 6: Services, process, car makes, about, FAQ

**Files:** Replace `src/components/sections/{Services,Process,CarMakes,About,Faq}.tsx`. Create `src/content/{services,process,about,faq}.ts` and `src/components/ui/{GlowCard,Counter}.tsx`.

**Interfaces:** Consumes `site` (pricing, vehicleMakes, founded, warrantyYears), `products` (for the product count), `localePath`, `SectionHeading`, `Reveal` and `Button`. Produces the five section components and:
- `GlowCard({ children, className })`, a client card with a border light sweep that follows the cursor (CSS variables `--x`/`--y` and a radial gradient on a mask border).
- `Counter({ to, prefix, suffix, duration = 1.6 })`, which counts up when in view and renders the final value under reduced motion and on the server.

Services: a price table from `site.pricing` (always the "from" price, with duration and VAT note), and GlowCards for:
- projector retrofit
- lens replacement
- headlight restoration
- LED high-beam install
- AFS projector swaps
- resealing and moisture fixes
- xenon repair
- special orders (Morimoto, Bimmerjakes, Strands catalogues)

Each card gets one or two sentences of copy from the brief and an inquiry CTA to `#contact`.

Process: four steps.
1. Request: car, model and a photo, by email or the form.
2. Offer.
3. Installation: 1–4 working days.
4. 2-year warranty on projectors.

A vertical beam line draws down with scroll (`useScroll` on the section; `scaleY`), and each step lights up as the beam reaches it.

CarMakes: a grid of the `site.vehicleMakes` names as large typographic tiles, each linking to `localePath(locale, '/catalog') + '?make=' + encodeURIComponent(make)`, plus a "Motorcycles" note. The line "We fit almost any car — ask" links to `#contact`.

About: the heading "Hobist ettevõtteks – südamega asja juures" (en: "From hobby to company, with heart in the work"), the story from the brief (B2B dealers and insurers, in-house testing), and Counters for founded 2015, 10+ years, 2-year warranty and `products.length` catalogue products (hide this counter when the value is 0).

FAQ: the five real questions and answers from the brief, as an accessible accordion (button with `aria-expanded` and `aria-controls`; panel height animated with motion; instant under reduced motion), plus `FAQPage` JSON-LD in a `<script type="application/ld+json">`.

- [ ] **Step 1:** Write `src/components/ui/Counter.test.tsx`: under reduced motion, `<Counter to={2015} />` renders "2015" immediately. Run it and expect FAIL.
- [ ] **Step 2:** Implement the components and content, then run the test and expect PASS.
- [ ] **Step 3:** Run the verification gate. Screenshot each section at 1440 px and 390 px in et.
- [ ] **Step 4:** Commit: "Add services, process, car makes, about and FAQ sections".

---

### Task 7: Inquiry form and contact section

**Files:**
- Create: `src/lib/inquiry.ts`, `src/app/actions/inquiry.ts`, `src/components/inquiry/InquiryForm.tsx` and `src/content/inquiry.ts`
- Replace: `src/components/sections/Contact.tsx`
- Create: `.env.example` (`RESEND_API_KEY=`, `INQUIRY_TO_EMAIL=info@retrofitparts.ee`, `INQUIRY_FROM_EMAIL=`, `NEXT_PUBLIC_SITE_URL=`)
- Test: `src/lib/inquiry.test.ts`

**Interfaces:** Consumes `site`, `Locale`, `Button` and `Container`. Produces:
- `inquirySchema` (zod) and `type InquiryInput`:
  - `name` (2–100 characters)
  - `email` (a valid email, or empty)
  - `phone` (empty, or 6–20 characters of digits, spaces, `+`, `-` and parentheses)
  - `carMake`, `carModel` and `carYear` (optional, each at most 60)
  - `topic` (optional, at most 200)
  - `message` (1–2000)
  - `locale` (`'et' | 'en'`)
  - `website` (the honeypot)
  - A refinement requires email or phone, and attaches its error to `email`.
- `parseInquiry(fd: FormData): { ok: true; data: InquiryInput } | { ok: false; fieldErrors: Partial<Record<keyof InquiryInput, string>> }`
- `buildInquiryEmail(d: InquiryInput): { subject: string; text: string }`, with subject `Päring: ${topic || 'üldine'} — ${name}`
- `deliverInquiry(d: InquiryInput, env: { RESEND_API_KEY?: string; INQUIRY_TO_EMAIL?: string; INQUIRY_FROM_EMAIL?: string }, send: (msg: { from: string; to: string; replyTo?: string; subject: string; text: string }) => Promise<void>): Promise<InquiryState>`
- `type InquiryState = { status: 'idle' } | { status: 'success' } | { status: 'error'; code: 'invalid' | 'not-configured' | 'send-failed'; fieldErrors?: Partial<Record<keyof InquiryInput, string>> }`
- `submitInquiry(prev: InquiryState, fd: FormData): Promise<InquiryState>`, a `'use server'` function wiring `parseInquiry`, `deliverInquiry` and the Resend SDK
- `InquiryForm({ locale, defaultTopic, compact }: { locale: Locale; defaultTopic?: string; compact?: boolean })`, a client component built on `useActionState`. It disables the submit button while pending, shows field errors under their inputs with `aria-describedby`, and renders the success state in place of the form. On `not-configured` or `send-failed` it shows the phone and email from `site`. Error messages are localized in `content/inquiry.ts`, keyed by error code.

Contact section: a two-column layout with the form and a details card (address with a maps link, phone, email, the hours table from `site.hours` with closed days shown, and the company legal line). Next to the card is a small stylized SVG map pin with a glow, not an embedded map.

- [ ] **Step 1:** Write `inquiry.test.ts`:
  - Valid data parses.
  - Missing both email and phone gives an `email` field error.
  - A message over 2000 characters fails.
  - A filled honeypot: `deliverInquiry` returns `success` and `send` is never called.
  - No `RESEND_API_KEY` returns `{ status: 'error', code: 'not-configured' }` and `send` is not called.
  - A `send` that throws returns `send-failed`.
  - With config, `send` gets `to === INQUIRY_TO_EMAIL`, `replyTo === email`, and a subject containing the topic.
- [ ] **Step 2:** Run it and expect FAIL. Implement. Run it again and expect PASS.
- [ ] **Step 3:** Run the verification gate. Screenshot `#contact` at 1440 px and 390 px. Submit the empty form in a one-off Playwright script and confirm the field errors appear.
- [ ] **Step 4:** Commit: "Add inquiry server action, form and contact section".

---

### Task 8: Catalog pages and landing teaser (wave 2)

**Files:**
- Create: `src/app/[locale]/catalog/page.tsx` and `src/app/[locale]/catalog/[slug]/page.tsx`
- Create: `src/components/catalog/{ProductIllustration,ProductCard,CatalogBrowser,FilterBar,InquiryDrawer}.tsx` and `src/content/catalog.ts`
- Replace: `src/components/sections/CatalogTeaser.tsx`

**Interfaces:** Consumes everything from Task 2, plus `InquiryForm` (Task 7) and `GlowCard` (Task 6). Produces:
- `ProductIllustration({ category, className }: { category: CategoryId; className?: string })`: a "studio render" SVG per category, all sharing one lighting style (dark gradient plinth, rim light in accent, soft reflection). Projector: lens and shroud. Lens: a clear headlight cover shape. Bulb: a D-series capsule. Ballast: a finned box. Shroud: a bezel ring. Adapter: a bracket ring. LED light: a round driving light. Fitting: a butyl roll. When `product.image` is set, `ProductCard` shows that image instead.
- `ProductCard({ product, locale, onInquire })`: the illustration, brand, name, formatted price or "Küsi hinda / Ask for price", the note "hind sisaldab KM-i / incl. VAT", a stock badge, a link to the product page and a "Request offer" button.
- `CatalogBrowser({ locale })`, a client component. It reads `useSearchParams` and `parseFilters`; `FilterBar` updates the URL with `router.replace(pathname + filtersToQuery(f), { scroll: false })`; the grid uses motion `layout` with `AnimatePresence`; it shows a result count.
  - Empty state: "No products match" with a reset button and an inquiry CTA ("We fit almost any car").
  - It is wrapped in `<Suspense>` in the page, so the page stays static.
- `FilterBar`:
  - category chips with "All"
  - brand select, make select (options from `getBrands` and `getMakes`)
  - a search input debounced at 200 ms
  - sort select
  - a "Clear" button
  - On mobile the filters collapse behind a "Filters" button.
- `InquiryDrawer`: a right-side sheet (bottom sheet on mobile) with `InquiryForm compact defaultTopic={product name}`, `role="dialog"`, `aria-modal`, Escape to close, and focus returned to the trigger.
- Product page:
  - `generateStaticParams` over locales × slugs, with `dynamicParams = false`
  - `generateMetadata` (title, description, hreflang alternates)
  - layout: illustration, name, brand, price, stock, description, specs table, fitment list, warranty badge, "Request offer" (inline InquiryForm with `defaultTopic`), related products and a breadcrumb back to the catalog
  - `Product` JSON-LD with `offers.priceCurrency: 'EUR'`, the price included only when it is not null, and availability set to `BackOrder` or `InStock`
- `CatalogTeaser({ locale })`: category tiles (illustration, name and product count) linking to `catalog?category=<id>`, then a row of featured `ProductCard`s whose "Request offer" button links to `#contact`.

- [ ] **Step 1:** Write `src/lib/catalog.test.ts` additions only if new pure helpers are added. UI behaviour is covered by the Task 10 e2e tests.
- [ ] **Step 2:** Implement.
- [ ] **Step 3:** Run the verification gate. The build output must list `/[locale]/catalog/[slug]` as SSG for all 126 paths. Screenshot `/et/catalog`, `/et/catalog?category=lenses&make=BMW`, `/et/catalog?make=Tesla` (empty state) and one product page, at 1440 px and 390 px.
- [ ] **Step 4:** Commit: "Add catalog browser, product pages and landing teaser".

---

### Task 9: SEO and metadata (wave 2)

**Files:** Create `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts` and `src/app/[locale]/opengraph-image.tsx`. Modify `src/app/[locale]/layout.tsx` (add `generateMetadata`) and `src/app/[locale]/page.tsx` (add `AutoRepair` JSON-LD).

**Interfaces:**
- `siteUrl` comes from `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.retrofitparts.ee'`.
- `alternates(path: string): { canonical: string; languages: Record<string, string> }` covers `et`, `en` and `x-default` (pointing to et).
- The sitemap lists `/et`, `/en`, both catalog pages and every product page in both locales.
- `robots` allows everything and links the sitemap.
- The OG image is 1200×630: dark background, a glowing lens circle, the tagline in that locale and the wordmark.
- `AutoRepair` JSON-LD carries name, address, telephone, email, `openingHoursSpecification` (Mo–Th 09:00–18:00), `url` and `sameAs` (Facebook).

- [ ] **Step 1:** Write `src/lib/seo.test.ts`: `alternates('/catalog')` gives canonical `https://www.retrofitparts.ee/et/catalog`, `languages.en` is `.../en/catalog` and `x-default` is the et URL. Run it and expect FAIL.
- [ ] **Step 2:** Implement, then run it and expect PASS.
- [ ] **Step 3:** Run the verification gate. Fetch `/sitemap.xml` and `/et/opengraph-image` from `next start` and check the status is 200.
- [ ] **Step 4:** Commit: "Add metadata, sitemap, robots, OG image and LocalBusiness data".

---

### Task 10: QA, e2e and polish (wave 3)

**Files:** Create `e2e/site.spec.ts` and `docs/CONTENT-TODO.md`. Fix issues anywhere.

- [ ] **Step 1:** Write `e2e/site.spec.ts`, running against `next start`, with these cases:
  1. On `/et`, `/en`, `/et/catalog` and one product page at 360 px width, `document.documentElement.scrollWidth <= innerWidth`.
  2. With `reducedMotion: 'reduce'`, each landing section heading is visible.
  3. `/et/catalog?category=lenses` shows only lens cards; clicking a make chip or select updates the URL; `?make=Tesla` shows the empty state.
  4. The language switch on `/et/catalog/koito-bi-led` leads to `/en/catalog/koito-bi-led`.
  5. `/de` and `/et/catalog/nope` return 404.
  6. The inquiry form submitted empty shows field errors.
  7. No console errors on `/et`.
- [ ] **Step 2:** Run `npm run build && npm run e2e` and fix failures until they pass.
- [ ] **Step 3:** Take a full-page screenshot set of all pages in both locales at 1440 px and 390 px. Review it against the spec's visual system and fix the defects found.
- [ ] **Step 4:** Write `docs/CONTENT-TODO.md`: logo, photos, terms, confirmation of hours (Mon–Thu vs Mon–Fri), the glued-light price (300 € vs 150 €), the experience claim, product prices captured from snapshots, Resend setup, and the redirect map.
- [ ] **Step 5:** Run the verification gate and e2e and expect PASS. Commit: "Add e2e tests, QA fixes and content to-do list".
