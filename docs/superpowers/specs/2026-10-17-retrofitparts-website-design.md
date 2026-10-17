# Retrofit Parts website: phase 1 design

Date: 2026-10-17. Status: approved by the client's agency (chat, 2026-10-17).

## Goal

Replace the current WordPress/WooCommerce site at retrofitparts.ee with a visually striking,
animated, fast site that reads as trustworthy and professional. Phase 1 is the landing page and a
showcase catalog. Built with Next.js, hosted on Vercel.

## Decisions

| Topic | Decision |
|---|---|
| Visual direction | Dark and cinematic: near-black, ice-white light, electric-blue accent |
| Languages | Estonian (default) and English, routed as `/et/...` and `/en/...`; structure ready for Russian |
| Catalog | Showcase with inquiry: filterable grid and product pages, "Request offer" action, no cart |
| Deploy | Vercel project in team "Priit", linked to GitHub repo `Priit78/Retrofitparts` |
| Stack | Next.js 16 (App Router, static generation), TypeScript, Tailwind CSS v4, Motion, Lenis |
| Imagery | Light effects drawn in code (SVG/CSS/Canvas). Category illustrations stand in for product photos until the client supplies real ones |
| Content | Typed TypeScript files in the repo; no CMS in phase 1 |

Rejected: a 3D headlight model with React Three Fiber (no model asset, heavy on phones) and a
headless CMS (deferred to phase 2; the data shapes are kept CMS-friendly).

## Source content

All facts come from the research brief (search-engine snapshots of the old site and public
registries, 2026-10-17). Rules:

- Use only real facts. No invented testimonials, review scores, project counts or performance
  numbers. A reviews section is added only when the client supplies real reviews.
- Where the old site contradicts itself, use the newest snapshot and list the item in
  `docs/CONTENT-TODO.md` for the client to confirm.
- Contact details, hours, address and service prices live in one file (`src/content/site.ts`),
  and every page reads them from there.

Key facts: Retrofit Parts OÜ, reg. 12908331, VAT EE101821324, founded 2015. Workshop at
Pärnu mnt 160F, 11317 Tallinn. Phone +372 5667 0631, info@retrofitparts.ee. Hours Mon–Thu
09:00–18:00. Over 10 years of headlight work. Official Estonian representative of Morimoto,
Bimmerjakes and Strands. 2-year warranty on projectors. Supplies car dealers and insurers.
Installation from 150 € (butyl-sealed, 1–2 working days), 300 € (glued, 2–4 working days),
motorcycle 90 €.

## Visual system

- Colors (CSS variables, Tailwind v4 `@theme`): background `#050607`; surfaces `#0b0d10` and
  `#12151a`; hairline borders at white 8%; text `#f2f4f7`; muted `#8a93a0`; light `#e8f4ff`;
  accent `#4cc3ff`; halogen `#ffc46b`, used only for "before" states.
- Type, all with Latin Extended for õ, ä, ö, ü, š, ž: Archivo at expanded width for display;
  Inter for body; JetBrains Mono for spec labels.
- Motion: reveals on scroll entry, light sweeps, glow pulses. Every animation respects
  `prefers-reduced-motion` and shows the final state instead.
- Layout works from 360 px width up, with no horizontal page scroll.

## Pages

### Landing page `/[locale]`

1. **Header:** sticky glass bar with a wordmark (placeholder until the client's logo arrives), nav
   (Services, Catalog, Process, FAQ, Contact), ET/EN switch, phone and a "Request offer" button.
   Mobile menu as a full-screen sheet.
2. **Hero:** full viewport. A code-drawn projector lens ignites on load like a bi-LED (flicker,
   then bloom), sending a volumetric beam with drifting dust particles (Canvas); slight cursor
   parallax. Headline "Parimad valguslahendused sinu sõidukile". Primary CTA to the contact
   section, secondary CTA to the catalog. Trust strip: 10+ years, 2-year warranty, official
   Morimoto representative, Tallinn workshop.
3. **Brand marquee:** Morimoto, Bimmerjakes, Strands, The Retrofit Source, Koito, Hella, Philips,
   Osram, as typographic wordmarks (no copied logos).
4. **See the difference:** night-road scene with a drag slider from a faded factory light
   (yellow, diffuse, short reach) to a retrofit (white, sharp cutoff, long reach). Keyboard
   accessible.
5. **Services and prices:** service cards with prices and turnaround times, and a border light
   sweep on hover.
6. **Headlight anatomy:** an exploded view where lens, shroud, projector and housing separate as
   the user scrolls, with labels. Explains why polishing is a temporary fix.
7. **Process:** request, offer, installation, warranty. A beam line draws down as the user
   scrolls.
8. **Catalog teaser:** category tiles linking to filtered catalog views, plus featured products.
9. **Car makes:** the makes they work on; each links to the catalog filtered by that make.
10. **About:** "Hobist ettevõtteks" story with animated counters of real figures (founded 2015,
    10+ years, 2-year warranty, number of catalog products).
11. **FAQ:** accordion with the five real questions.
12. **Contact:** inquiry form, contact details, hours, address, map link.
13. **Footer:** company and legal details, navigation, Facebook link.

### Catalog `/[locale]/catalog`

- Filters: category, brand, car make, sort by price; text search. Filter state lives in the URL
  query, so filtered views can be shared and linked from the landing page.
- The grid animates as filters change (Motion layout animations).
- Cards: category illustration, name, brand, price including 24% VAT ("Ask for price" when
  unknown), stock badge (backorder or in stock), "Request offer" button.
- "Request offer" opens a drawer with the inquiry form, already filled in with the product.

### Product page `/[locale]/catalog/[slug]`

Statically generated for every product: illustration, name, brand, price, stock, description,
specs, vehicle fitment, warranty, inquiry CTA, related products from the same category.

## Inquiry form

- Fields: name, email, phone, car (make, model, year), service or product, message.
- A server action validates the input with zod. A honeypot field catches bots.
- Delivery goes through Resend when `RESEND_API_KEY` and `INQUIRY_TO_EMAIL` are set on Vercel.
  Without them the action returns a clear "not configured" error, and the form shows the phone
  and email instead. It never pretends to have sent.

## Internationalisation

- Locales `et` (default) and `en`. `/` redirects to `/et`. Each page sets `<html lang>` and
  hreflang alternates.
- Text lives in typed content files, one per section, each exporting `{ et, en }`. Products carry
  both languages in their own fields.

## SEO and metadata

Per-page titles and descriptions, Open Graph tags, `sitemap.xml`, `robots.txt`, schema.org
`AutoRepair` (LocalBusiness) on the landing page and `Product` on product pages. Redirecting the
old WooCommerce and Erply URLs is phase 2 (it needs the live URL list).

## Code structure

```
src/app/[locale]/layout.tsx               fonts, html lang, header, footer, smooth scroll
src/app/[locale]/page.tsx                 landing page, composes the sections
src/app/[locale]/catalog/page.tsx         catalog
src/app/[locale]/catalog/[slug]/page.tsx  product page
src/app/actions/inquiry.ts                server action
src/content/*.ts                          site facts and per-section copy, {et, en}
src/data/products.ts                      typed product data
src/lib/i18n.ts                           locales and helpers
src/components/ui/*                       shared primitives (Button, Container, Reveal, ...)
src/components/sections/*                 one landing section per file or folder
src/components/catalog/*                  filters, grid, card, drawer, illustrations
```

Each section is self-contained: it takes `locale`, reads its own content file, and has no
dependencies on other sections. That lets agents build sections in parallel without file
conflicts.

## Quality bar

- `next build` passes with no type or lint errors.
- Playwright screenshots of every page at 1440 px and 390 px, in both locales, reviewed before
  shipping.
- Lighthouse targets on the landing page: 90+ performance, 95+ accessibility.
- Visible keyboard focus everywhere; color contrast at WCAG AA or better.

## Out of scope for phase 1

Cart and checkout, a CMS, Russian, a gallery of real work, blog or guides, redirects for old URLs,
Google reviews integration, analytics.

## Client inputs needed

Logo (SVG), brand colors if any, work and workshop photos, product photos, shipping, payment and
returns terms, confirmed opening hours and prices, and the Resend sender domain. Tracked in
`docs/CONTENT-TODO.md`.
