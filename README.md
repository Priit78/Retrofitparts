# Retrofit Parts website

Marketing site and showcase catalog for [Retrofit Parts OÜ](https://www.retrofitparts.ee), a
Tallinn workshop that sells and fits headlight retrofits: bi-LED and bi-xenon projectors,
replacement lenses and restoration. Estonian (default, `/et`) and English (`/en`). The catalog
shows prices and a "Request an offer" form; there is no cart.

- Design spec: `docs/superpowers/specs/2026-10-17-retrofitparts-website-design.md`; the current
  look (direction A "Dark refined": graphite, warm white, real photos, no glow) is
  `docs/superpowers/specs/2026-10-18-redesign-direction-a.md`
- Photo, logo and font sources: [`docs/CREDITS.md`](docs/CREDITS.md)
- What the client still has to supply or confirm: [`docs/CONTENT-TODO.md`](docs/CONTENT-TODO.md)

## Stack

Next.js 16 (App Router, every page statically generated), React 19, TypeScript, Tailwind CSS 4,
Motion and Lenis for animation and smooth scrolling, zod and Resend for the inquiry form.
Vitest for unit tests, Playwright for end-to-end tests. Hosted on Vercel (`vercel.json` pins
the functions to Stockholm, `arn1`).

## Commands

```bash
npm ci              # install
npm run dev         # dev server on http://localhost:3000
npm run typecheck   # next typegen + tsc
npm run lint
npm test            # Vitest unit tests
npm run build       # production build
npm run e2e         # Playwright, against `next start` on port 3210; run `npm run build` first
```

The e2e run reuses a server already listening on port 3210, so make sure it serves the current
build. `node scripts/shot.mjs <url> <out.png> [width] [--full] [--reduced]` takes a screenshot.

## Environment variables

Copy `.env.example` to `.env.local` for local work; on Vercel, set them per environment.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | The live address, for example `https://www.retrofitparts.ee`. **Until it is set, every page is `noindex` and robots.txt blocks crawlers**, so set it on Production only. Also the host for canonical URLs, the sitemap and sharing images. |
| `RESEND_API_KEY` | Resend API key for sending inquiries. |
| `INQUIRY_TO_EMAIL` | Where inquiries go, for example `info@retrofitparts.ee`. |
| `INQUIRY_FROM_EMAIL` | Sender on a domain verified in Resend, for example `Retrofit Parts <noreply@retrofitparts.ee>`. Empty means Resend's test sender, which only delivers to the Resend account owner. |

Without `RESEND_API_KEY` and `INQUIRY_TO_EMAIL` the form does not pretend to send: it says the
web form is unavailable and shows the phone number and email instead.

## Where the content lives

- `src/content/site.ts`: company facts, contact details, opening hours, address and
  installation prices. Every page reads them from here, so change them only here.
- `src/content/<section>.ts`: the text of each section and page, as `{ et, en }` pairs.
- `src/data/products.ts`: the catalog (categories and products, with prices including VAT,
  stock, specs and vehicle fitment); `src/data/types.ts` describes the fields.

## Swapping in real images

- **Logo:** replace the placeholder inside `src/components/layout/Wordmark.tsx` with the SVG
  (keep the `site.name` screen-reader text). Also replace `src/app/icon.svg` and check the
  sharing image in `src/app/[locale]/opengraph-image.tsx`.
- **Product photos:** put the file in `public/products/` and set the product's `image` field in
  `src/data/products.ts`, for example `image: "/products/koito-bi-led.jpg"`. Cards and the
  product page then show the photo (4:3, cropped to fill) instead of the drawn category render,
  and the product's structured data includes it. Use at least 1600 × 1200 px.

## Project conventions

See `CLAUDE.md` and `AGENTS.md`: bilingual copy only in content files, theme colour tokens only,
every animation respects `prefers-reduced-motion`, no horizontal scroll at 360 px.
