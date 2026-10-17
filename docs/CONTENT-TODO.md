# Content to-do: what we still need before launch

The new site is built from what could be found about Retrofit Parts online on 2026-10-17
(search-engine snapshots of the old retrofitparts.ee, business registries and the Facebook page).
The old site itself could not be downloaded, so some facts conflict, some are approximate, and
there are no photos at all.

This list is for **the client** (Retrofit Parts) and **the agency**. Tick items off as they are
done. Each item says where the answer goes, so whoever updates the site knows which file to edit.

- Company facts, opening hours, address and installation prices: `src/content/site.ts`
  (one place; every page reads from it).
- Page text: `src/content/<section>.ts`, each with an Estonian (`et`) and English (`en`) version.
- Products: `src/data/products.ts`.

---

## 1. Brand assets (client)

- [ ] **Logo** as SVG (and a PNG fallback). The header, footer and mobile menu show a typed
      placeholder ("● RETROFIT PARTS", `src/components/layout/Wordmark.tsx`); the favicon
      (`src/app/icon.svg`) and the social sharing image (`src/app/[locale]/opengraph-image.tsx`)
      are placeholders too.
- [ ] **Brand colours and fonts**, if Retrofit Parts has any. The site uses near-black with one
      ice-blue accent; we can adapt it.
- [ ] **Morimoto, Bimmerjakes and Strands** logos from their dealer media kits, plus written
      confirmation that Retrofit Parts may show them as their official Estonian representative
      ("ametlik esindaja"). Today the brand strip shows the names as plain text, not their logos.
- [ ] **The Retrofit Source**: older listings called Retrofit Parts an official distributor. The
      site lists it only as a brand they work with. Confirm whether "ametlik esindaja" applies.
- [ ] **Facebook** link is correct: <https://www.facebook.com/p/Retrofit-Parts-100057357583960/>.
      Add Instagram or other profiles if there are any.

## 2. Photos (client)

No images could be downloaded from the old site, so everything visual is drawn in code.

- [ ] **Product photos**, ideally on a plain dark background, at least 1600 px wide. Until then
      every product shows a drawn "studio render" of its category, labelled "Illustreeriv pilt".
      Each photo goes into `public/products/` and its path into that product's `image` field.
- [ ] **Workshop photos** (Pärnu mnt 160F): exterior, interior, work in progress.
- [ ] **Own work**: before/after shots and night shots of beam patterns. These are the strongest
      trust signal the site is missing. The before/after slider is a drawing for now and says so
      ("Illustratsioon, mitte mõõtetulemus").

## 3. Facts to confirm (client)

The site uses the newest snapshot wherever the old site contradicted itself.

- [ ] **Opening hours.** The site shows **E–N 09:00–18:00, R–P suletud** (Mon–Thu 09–18,
      Fri–Sun closed), from the newest snapshot ("E–N: 09:00–18:00, R: Suletud, L: Suletud,
      P: Suletud"). Older pages said Mon–Fri 09–18, the LED page Mon–Fri 9–17, and the
      structured data 08–17. Which is right? Is Friday really closed?
- [ ] **Installation price for glued lights.** The site shows **300 €, 2–4 tööpäeva**
      ("Sõiduauto, kerealiimiga tuled"). An older page said **150 €, 2–3 tööpäeva**.
- [ ] **Butyl-sealed lights 150 €, 1–2 tööpäeva** and **motorcycle 90 € per headlight**: still
      current? Is there a typical turnaround for motorcycles? (The table says "Kokkuleppel".)
- [ ] **Experience.** The site says **10+ years** ("10+ aastat kogemust esitulede taastamisel";
      About: "Tulede taastamine ja remont on olnud meie põhitöö üle kümne aasta"). An older
      services page said "üle 5-aastane kogemus". The company was registered in 2015.
- [ ] **Warranty.** The site says **2 years on projectors** ("2-aastane garantii projektoritele"),
      as the product pages did. Is there a warranty on the installation work too?
- [ ] **Business customers.** The About section says customers include car dealerships and
      insurers and that they work with several Estonian repair shops ("Meie klientide seas on
      automarkide esindused ja kindlustusseltsid…"). OK to say publicly? Partner logos welcome.
- [ ] **Address.** The site uses **Pärnu mnt 160F, 11317 Tallinn** everywhere. The old site still
      had "Kopli 25" on many product pages and a banner "Alates 30. augustist asume uuel
      aadressil". Confirm the move is final.
- [ ] **Phone +372 5667 0631 and info@retrofitparts.ee** are the right public contacts.

## 4. Catalogue (client)

63 products were captured from search snapshots; the real shop probably has 60–120. All prices
on the site include 24% VAT.

- [ ] **Full product list.** Send an export from the old shop if possible (WooCommerce can
      export CSV), so nothing is missing and the names and codes are exact. Many product codes
      ("Tootekood") are Erply-style placeholders such as 2000000001081.
- [ ] **Morimoto, Bimmerjakes and Strands products.** None were found on the old site, even
      though these are the represented brands. Which of their products should be listed?
- [ ] **Approximate prices.** The snapshot only gave an approximate price ("about €…"):

      | Product | Price on the site |
      |---|---|
      | Tuleklaasid Audi A6 C6 4F | 100,00 € (snapshot: "about €100") |
      | Tuleklaasid Audi A6 C7 4G pre-facelift | 222,00 € |
      | Tuleklaasid Mercedes-Benz R-klass W251 pre-facelift | 290,00 € |
      | Tuleklaasid Honda CR-V 3. põlvkond | 139,00 € (snapshots: €139 to about €141) |
      | Tuleklaasid Lexus RX XU30 | 183,00 € |

- [ ] **Inconsistent prices.** Snapshots disagreed; the site uses the product-page price:

      | Product | Price on the site | Also seen |
      |---|---|---|
      | Koito BI-LED projektor | 284,59 € | 330 € on a category page (229,51 € in metadata is the same price without VAT) |
      | LED rõngad lõikega BMW-le | 79,28 € | 78 € |
      | Yeaky D2S 6000K xenon lambid | 36,59 € | 36 € |

- [ ] **Missing prices.** These show "Küsi hinda" (ask for price) until a price is added:
      Tuleklaasid Volvo S60 III; 4TL-R bi-xenon projektorid; Osram D1S 66140CBI Xenarc Cool Blue
      Intense; Osram Cool Blue Intense H1 12 V 55 W; E46R Extender (pikendatud kate). Are all of
      them still sold?
- [ ] **Stock.** Only 21 of the 63 products had a stock line in the snapshots: 3 in stock
      ("Laos": Bosch 2,5" xenon lähitulede adapterid, Lexus RX330 AFS adapterid, BMW E36
      adapterid) and 18 on backorder. The other 42 were not captured and show as **"Tellimisel"**
      (made to order) by default. Mark what is actually in stock.
- [ ] **Delivery time for ordered items.** Product pages on backorder say "Tellime sinu jaoks.
      Tarneaeg on pikem, küsi meilt täpset aega." A typical window (for example "tarne 1–3
      nädalat") would be more useful. What is realistic?
- [ ] **Fitment.** Some products have no vehicle list ("Sobivus sõidukile"); their page says
      "Ei ole seotud kindla automudeliga…". Add the cars where they are known.

## 5. Terms and legal pages (client)

The old footer linked to "Müügitingimused" and a privacy policy, but their text could not be
read. The new site has no such pages yet.

- [ ] **Sales terms** (müügitingimused): ordering, prices, payment methods, delivery (carriers,
      parcel lockers, pickup, costs), the 14-day return right and its exceptions, warranty claims.
- [ ] **Privacy policy** (privaatsuspoliitika): the inquiry form sends name, email, phone, car
      and message by email to info@retrofitparts.ee. Nothing else is collected. There are no
      analytics or cookies, and fonts are self-hosted, so no cookie banner is needed today.
- [ ] Where should these pages live: footer links only, or also next to the inquiry form?

## 6. Reviews (client)

- [ ] **Google reviews.** The site has no reviews section on purpose: it shows only real
      reviews. If Retrofit Parts has a Google Business Profile, send the link, and say whether
      we may quote reviews (with first names only). A Saab club forum post said "vahe on väga
      suur" about EVO-XR projectors; we can quote it only with the author's permission.

## 7. Copy to confirm (client)

The Estonian below was written for the new site, not taken from the old one. Please read it as a
native speaker and correct anything that sounds off. Text quoted from the old site (the FAQ
answers, "Hobist ettevõtteks – südamega asja juures", "Kõik tooted on meil endal ära testitud")
is not listed. The service descriptions are rewritten from the old site's texts, so please read
all eight in `src/content/services.ts`.

- Hero: "Bi-LED ja bi-xenon · Tallinn"; "Projektorite paigaldus, tuleklaaside vahetus ja
  esitulede taastamine – meie Tallinna töökojas alates 2015. aastast."
- Trust strip: "10+ aastat kogemust / esitulede taastamisel"; "Töökoda Tallinnas".
- Brands: "Brändid, millega töötame"; "Ametlik esindaja".
- Before/after: "Sama tee. Hoopis teine valgus."; "Lohista liugurit ja võrdle."; the three
  facts "Värvustemperatuur", "Valguspiir", "Tuhmunud klaas" and their texts.
- Services: "Tulede taastamine ja remont kindlalt partnerilt"; table column "Valmimisaeg";
  "Hinnakiri on orienteeruv – täpse pakkumise teeme sinu auto põhjal."; "Ei tea, millised
  tuled sinu autol on? Saada foto aadressil info@retrofitparts.ee."; "Xenon-süsteemi rike?
  Vahetame ballasti, süüturi või pirni."; "…paigaldame vajadusel õhuti, mis hoiab
  kondensatsiooni eemal."
- Anatomy: "Esitule anatoomia"; "Miks poleerimine ei aita kauaks"; "Keri alla ja vaata, millest
  esituli koosneb"; the part names "Tuleklaas", "Projektori kate", "Projektor", "Korpus" and
  their one-line descriptions; "Poleerida või vahetada?" with the tags "Ajutine" and "Püsiv".
- Process: "Neli sammu päringust valmis tuledeni"; "Enne töö algust tead täpselt, mida teeme ja
  mis see maksab."; step tags "E-post või vorm", "Konkreetne hind", "1–4 tööpäeva".
- Catalogue: "Projektorid, tuleklaasid ja kõik, mis esitulle kuulub"; "Kõik, mida esituli
  vajab"; "Vali oma automark"; "Töötame pea kõigi automarkidega – küsi julgelt"; stock badges
  "Laos" and "Tellimisel"; "Hind: odavamad enne" / "Hind: kallimad enne"; "Sobivaid tooteid ei
  leitud".
- Product page: "Tellime sinu jaoks. Tarneaeg on pikem, küsi meilt täpset aega."; "Küsi
  sellele tootele pakkumist"; "Toote nimi on vormis juba olemas. Lisa oma auto andmed ja
  saadame pakkumise koos tarneajaga." (does every offer include a delivery time?); "Ei ole
  seotud kindla automudeliga. Kirjuta meile oma auto mark ja mudel, ja kontrollime sobivuse
  üle."; "Sobib kokku"; "Illustreeriv pilt".
- Inquiry form: "Vähemalt üks: e-post või telefon, et saaksime sulle vastata."; "Mida täpsem
  info auto kohta, seda täpsema pakkumise saame teha."; "Veebivorm ei ole praegu kasutusel";
  "Päring on saadetud – Aitäh! Oleme sinu sõnumi kätte saanud ja võtame sinuga ühendust."
- The site addresses visitors as "sina" (sinu auto, kirjuta meile). The old site used "Teie" in
  places. Confirm "sina" is the tone you want.

## 8. Launch checklist (agency)

- [ ] On Vercel, set **`NEXT_PUBLIC_SITE_URL`** to the live address (for example
      `https://www.retrofitparts.ee`) for Production only. **Without it the site stays
      `noindex`** (robots.txt disallows everything and every page carries
      `<meta name="robots" content="noindex, nofollow">`). It is also the host used for canonical
      URLs, hreflang, the sitemap and the sharing image (without it: Vercel's production URL,
      else `https://www.retrofitparts.ee`). Redeploy after setting it.
- [ ] Inquiry email, in Vercel's Production environment:
  - [ ] **`RESEND_API_KEY`**: an API key from a Resend account the client owns.
  - [ ] **`INQUIRY_TO_EMAIL`**: where inquiries go (`info@retrofitparts.ee`).
  - [ ] **`INQUIRY_FROM_EMAIL`**: a sender on a **domain verified in Resend** (add Resend's DNS
        records for retrofitparts.ee), for example `Retrofit Parts <noreply@retrofitparts.ee>`.
        Without it the form uses Resend's test sender, which only delivers to the Resend
        account owner.
  - [ ] Send a test inquiry from the live site in both languages and check that it arrives and
        that "Reply" goes to the visitor. Until the key and recipient are set, the form says it
        is not available and shows the phone and email instead; it never pretends to send.
- [ ] **Domain.** Add `retrofitparts.ee` and `www.retrofitparts.ee` to the Vercel project, pick
      one as primary (the other redirects), and point DNS at Vercel. Lower the DNS TTL a day
      ahead. Keep the email (MX) records unchanged.
- [ ] **Region.** `vercel.json` pins functions to `arn1` (Stockholm), close to Estonian visitors.
- [ ] **301 redirects** from the old WooCommerce and Erply URLs, so search rankings and old links
      carry over. Add them to `redirects()` in `next.config.ts` (or to `vercel.json`) before the
      domain switches. Get the full list of old URLs from Google Search Console (Pages report) or
      the old sitemap, so nothing is missed. Draft map:

      | Old URL | New URL |
      |---|---|
      | `/product/<slug>/` | `/et/catalog/<slug>` (54 of the 63 captured products keep their old slug; the old URLs of the other 9 were not captured) |
      | `/pood/` | `/et/catalog` |
      | `/pood/led/led-projektorid/` | `/et/catalog?category=led-projectors` |
      | `/pood/led/led-kaugtuled/` | `/et/catalog?category=led-lights` |
      | `/pood/xenon/projektorid/` | `/et/catalog?category=xenon-projectors` |
      | other `/pood/…` category pages (exact URLs not captured) | the matching category: `lenses`, `led-lights`, `xenon-bulbs`, `ballasts`, `halogen`, `shrouds`, `adapters` or `fitting`; else `/et/catalog` |
      | `/teenused/` | `/et#services` |
      | `/meist/` | `/et#about` |
      | `/kkk/` | `/et#faq` |
      | `/kontakt/` | `/et#contact` |
      | `/et/a/evox-r` (Erply) | `/et/catalog/evox-r-2-0` |
      | `/et/a/tuleklaasid-bmw-x5-e70` (Erply) | `/et/catalog/tuleklaasid-e70-x5` |
      | `/et/a/osram-d1s-66140cbi-xenarc-cool-blue-intense` (Erply) | `/et/catalog/osram-d1s-66140cbi-xenarc-cool-blue-intense` |
      | other `/et/a/<slug>` (Erply) | the matching product, else `/et/catalog` |
      | `/müügitingimused/`, privacy policy | the new terms pages (section 5) |

      In `next.config.ts`, `permanent: true` sends a 308, which search engines treat like a 301;
      use `statusCode: 301` if a literal 301 is required. The old URLs end in `/`, and Next
      first strips the slash, so check with `curl -I` that each lands in at most two hops.
- [ ] After launch: add the site to **Google Search Console**, submit `/sitemap.xml`, and
      request indexing of `/et` and `/en`. Update the website link on the Google Business
      Profile and Facebook.
- [ ] Run **Lighthouse** on the live landing page (targets: performance 90+, accessibility 95+).
- [ ] Remove anything still marked as a placeholder (logo, product renders) once the real
      assets are in.
