# Content to-do: what we still need before launch

The new site was first built from what could be found about Retrofit Parts online on 2026-10-17
(search-engine snapshots of the old retrofitparts.ee, business registries and the Facebook page).
On 2026-10-18 the live retrofitparts.ee was checked directly: the contact facts were confirmed,
the catalogue was switched to the live shop's data, and the client's own product photos were
added. Some facts still conflict or need the client's word; they are listed below.

This list is for **the client** (Retrofit Parts) and **the agency**. Tick items off as they are
done. Each item says where the answer goes, so whoever updates the site knows which file to edit.

- Company facts, opening hours, address and installation prices: `src/content/site.ts`
  (one place; every page reads from it).
- Page text: `src/content/<section>.ts`, each with an Estonian (`et`) and English (`en`) version.
- Products: `src/data/products.ts`.

---

## 1. Brand assets (client)

- [ ] **Logo: a brand decision.** The client's current logo is the orange (#FC7D07) blocky
      "RETROFIT PARTS" wordmark in an orange frame, with a white tagline and URL. It exists only
      as small PNGs (the best is 500 × 139 px); there is **no vector** (SVG, AI or EPS) anywhere
      on the old site, and its white text only works on dark backgrounds. The new design uses a
      typed text wordmark in the header, footer and mobile menu
      (`src/components/layout/Wordmark.tsx`); the favicon (`src/app/icon.svg`) and the sharing
      image (`src/app/[locale]/opengraph-image.tsx`) are placeholders. Decide whether to keep
      the text wordmark, or to have the orange logo redrawn as a vector (SVG) and use that. If
      the client has the original vector files from the 2020 agency (Hundikuu), send them.
- [ ] **Brand colours and fonts.** The new design uses graphite and warm white with no brand
      colour; the client's orange does not appear. Confirm this is acceptable, or say where the
      orange should come back.
- [ ] **Morimoto, Bimmerjakes and Strands** logos from their dealer media kits, plus written
      confirmation that Retrofit Parts may show them as their official Estonian representative
      ("ametlik esindaja"). Today the brand strip shows the names as plain text, not their logos.
- [ ] **The Retrofit Source**: older listings called Retrofit Parts an official distributor. The
      site lists it only as a brand they work with. Confirm whether "ametlik esindaja" applies.
- [ ] **Facebook** link is correct: <https://www.facebook.com/p/Retrofit-Parts-100057357583960/>.
      The live site links a different address,
      <https://www.facebook.com/Retrofit-Parts-945225955565587>, and an Instagram profile,
      <https://www.instagram.com/retrofitparts.ee/>. Which should the new site show?

## 2. Photos (client)

The old site's media library has **no photo of the client's finished work**: no before/after,
no workshop, no finished cars. What the site uses now:

- **The 12 complete headlights** in the catalogue show the client's own photos of the actual
  units, taken from the old site's media library (one full-unit shot each, optimised to
  1000 px wide in `public/products/<slug>.jpg`). The part-number label close-ups are not used.
  Every other product shows a drawn "studio render" of its category, labelled "Illustreeriv
  pilt". The old shop's other product images are supplier packshots and press photos (Erply,
  NHK, Morimoto, Hella and others), which are third-party and are not used.
- **Two photos on the landing page** are believed to be the client's own, also from the media
  library: `src/assets/photos/retrofit-in-progress.jpg` (a projector retrofit with the bumper
  off and masking tape on) and `src/assets/photos/projector-bench.jpg` (a lit Morimoto LED
  projector on the workbench). See `docs/CREDITS.md`.
- **The other landing photos are stock** (Pexels, credited in `docs/CREDITS.md`).

- [ ] **Confirm the two landing photos** above are the client's own work and may be used.
- [ ] **Confirm the 12 headlight photos** are the client's own (they look like their own phone
      snapshots of their stock).
- [ ] **Recommended: new photography** of the workshop and of finished cars. This is the
      strongest trust signal the site is missing, and it would replace the stock photos:
  - the workshop at Pärnu mnt 160F: exterior, interior, work in progress;
  - finished cars at night, with the headlights on;
  - before/after pairs of the same car (the before/after slider is a simulation for now and
    says so: "Illustratsioon, mitte mõõtetulemus");
  - product shots of the new parts (projectors, lenses, ballasts) on a plain dark background,
    at least 1600 px wide. Each goes into `public/products/<slug>.jpg` and its path into that
    product's `image` field.

## 3. Facts to confirm (client)

The site uses the newest source wherever the old site contradicted itself. The live site was
checked on 2026-10-18.

- [x] **Opening hours** are confirmed by the live site: **E–N 09:00–18:00; R, L, P suletud**
      (Mon–Thu 09–18, Fri–Sun closed).
- [ ] **Installation prices are unconfirmed.** The site shows **150 €** (butyl-sealed lights,
      1–2 tööpäeva), **300 €** (glued lights, 2–4 tööpäeva) and **90 €** (motorcycle, per
      headlight) in `site.pricing`. None of these prices appears anywhere on the live site: not
      on /teenused/, the other main pages, the terms, or any of the 115 product descriptions. The
      only earlier source, the Yike I-Lens 2.0 product page, now returns 404. An older snapshot
      also said 150 € and 2–3 tööpäeva for glued lights. **Do not launch with these prices until
      the client confirms them** (or remove the price table). Is there a typical turnaround for
      motorcycles? (The table says "Kokkuleppel".)
- [ ] **VAT rate.** The live terms (/muugitingimused/) say prices include **20% VAT**, but the
      shop's figures are net prices times **1.24** (for example 24.59 € × 1.24 = 30.49 €), which
      matches Estonia's 24% rate since 1 July 2025. The new site takes the shop's prices as they
      are and says only "hind sisaldab käibemaksu" / "Hinnad sisaldavad käibemaksu", without a
      rate. Confirm that the prices include 24% VAT, and fix the 20% in the old terms.
- [ ] **Experience.** The site says **10+ years** ("10+ aastat kogemust esitulede taastamisel";
      About: "Tulede taastamine ja remont on olnud meie põhitöö üle kümne aasta"). The live
      site still contradicts itself: /teenused/ says "üle 5-aastane kogemus" and "viie
      tegutsemisaasta jooksul", while the home page says "üle 10 aasta". The company was
      registered in 2015.
- [ ] **Warranty.** The site says **2 years on projectors** ("2-aastane garantii projektoritele"),
      as the product pages did. Is there a warranty on the installation work too?
- [ ] **Business customers.** The About section says customers include car dealerships and
      insurers and that they work with several Estonian repair shops ("Meie klientide seas on
      automarkide esindused ja kindlustusseltsid…"). OK to say publicly? Partner logos welcome.
- [x] **Address** confirmed: the live site's footer says "Paigaldustöökoda, Pärnu mnt. 160f,
      11317 Tallinn", and the new site uses **Pärnu mnt 160F, 11317 Tallinn** everywhere.
- [ ] **The old address is still live.** "Kopli 25, Boks 8, 10412 Tallinn" still appears on
      the live site: in the body of /kontakt/, in the /kkk/ answer ("…paigaldustöökojas
      aadressil Kopli 25 boks 8, Tallinn"), in the structured data (JSON-LD), in the /kontakt/
      meta description ("Asume Kopli 25, Tallinn"), and on the map sharing image. If the old
      site stays up until launch, fix these there so search engines and customers don't see
      two addresses.
- [x] **Phone +372 5667 0631 and info@retrofitparts.ee** are confirmed by the live site. (Its
      footer phone links use a broken `tel:+56670631` without the 372; the new site is correct.)

## 4. Catalogue (client)

The catalogue now holds **114 products**: the live shop's 115 (WooCommerce Store API,
2026-10-18) minus the €0 placeholder "Toode". Names, prices, stock, product codes and
categories are the shop's. The text of the 58 products that were already on the site was kept;
the 56 new ones were written from the shop's own text, in Estonian and English. A new category,
**Komplektsed tuled** (complete headlights), holds the 12 new and used OEM headlights. Prices
are exactly the shop's (see the VAT item in section 3). The catalogue is a copy: it does not
follow the shop by itself.

- [x] **Full product list**, taken from the live shop. The product codes ("Tootekood") are the
      shop's own; many are Erply-style codes such as 2000000001081.
- [ ] **Keeping the catalogue current.** Who tells the agency when products, prices or stock
      change? This matters most for the complete headlights, which look like single units: when
      one is sold it has to come off the site (`src/data/products.ts`).
- [ ] **Morimoto, Bimmerjakes and Strands products.** The live shop has none, even though these
      are the represented brands. Which of their products should be listed?
- [ ] **Price changes.** These products have a different price from the earlier capture; the
      site now shows the live price. Five of them were approximate before ("about €…"); no price
      on the site is approximate any more.

      | Product | Before | Now (live shop) |
      |---|---|---|
      | Tuleklaasid BMW X5 E53 facelift | 320,00 € | 325,25 € |
      | Tuleklaasid Audi A6 C6 4F | about 100,00 € | 100,62 € |
      | Tuleklaasid Audi A6 C7 4G pre-facelift | about 222,00 € | 222,59 € |
      | Tuleklaasid Mercedes-Benz R-klass W251 pre-facelift | about 290,00 € | 289,67 € |
      | Tuleklaasid Honda CR-V 3. põlvkond | about 139,00 € | 141,28 € |
      | Tuleklaasid Lexus RX XU30 | about 183,00 € | 182,95 € |
      | Yeaky LBS D2S 5500K xenon lamp | 39,00 € | 39,64 € |
      | Tuleklaasid Volvo S60 III | no price | 325,25 € |
      | E46R Extender (pikendatud kate) | no price | 30,49 € |

      The prices that snapshots disagreed on before are confirmed by the shop: Koito BI-LED
      projektor 284,59 €, LED rõngad lõikega BMW-le 79,28 €, Yeaky D2S 6000K 36,59 €.
- [ ] **Lens sets also sold one at a time.** For the BMW 5 F10/F11, 5 F07 GT, X5 E70 and X6
      E71 lenses, the shop's headline price is the price of one lens (45,74 €, 70,13 €, 66,07 €
      and 76,23 €). The site shows the price of the pair (87,41 €, 128,07 €, 121,97 € and
      142,30 €), with the single lens as a spec. Is that right?
- [ ] **Products no longer in the shop.** Five products from the earlier capture are gone from
      the live shop (their pages return 404), so they are no longer on the site: Yike (Profile)
      I-Lens 2.0 projector (was 280 €), 4TL-R bi-xenon projectors, Yeaky D1S 4300K xenon bulbs
      (was 55 €), Osram D1S 66140CBI Xenarc Cool Blue Intense, and Osram Cool Blue Intense H1
      12 V 55 W. Confirm they are no longer sold. (The Bosch 2,5" adapters' text still names the
      4TL-R projectors they are made for.)
- [ ] **Stock.** The shop marks 25 products as in stock, shown as **"Laos"**: the 12 complete
      headlights; the BMW X5 E70, X6 E71 and 5 F07 GT lenses; the Bosch 2,5", Lexus RX330 AFS
      and BMW E36 adapters; the shroud adapter rings; Yeaky D4S 4300K bulbs; the D2S–AMP
      adapter; the H7 and T10 CAN-bus error cancellers and the CAN-bus error cancellers; and the
      HB4 splitter. The other 89 are "Saadaval järeltellimisel" in the shop and show as
      **"Tellimisel"**. The shop gives no quantities, so the site shows none.
- [ ] **Products with no description in the shop.** 37 products have only a name in the shop,
      so the site describes them in one line, from the name or the earlier capture. Details would help
      (what it is, what it fits, what is in the box): the NHK BRT and NHK VIP G5 projectors;
      the Hella 5R H7 projector; the LED lisakaugtuled 60 W; the LED demonid; the Iris, Ocular,
      Bullet, Panamera LED, E46R, E55-R and E46R Extender shrouds; the Valeo 1, Valeo 2,
      Valeo 2 AFS, AL/Bosch, Lexus RX330 AFS, Lexus GS AFS, BMW E36, BMW E39 pre-facelift and
      BMW E70 non-AFS adapters; the Xenus igniters (Hella and AL); the D2S–AMP and AMP–D2S
      adapters; the HB4 splitter and HB4/9006 socket; the three CAN-bus error cancellers; the
      ferrite rings; the DRL tubes (Toyota Avensis T27, Scania R) and DRL plate (Scania R); and
      the Volvo XC90 2016+, Scania R450 and Mercedes-Benz W211 lenses.
- [ ] **Errors in the shop's own text.** The site works around these; fix them in the shop too:
  - Volkswagen Golf 7 lenses: the short text says model years 2013–2020, the long text
    2013–2017. The site shows 2013–2020.
  - BMW E39 pre-facelift (1995–2000) adjuster rods: the description says "facelift". The site
    follows the product name.
  - Honda CR-V Gen 3 lenses: the text says "4. põlvkonna mudelile (2007–2011)". The site says
    3rd generation, as the product name does.
  - Yeaky LBS 5500K bulbs (D1S and D2S): the long text says 4300 K.
  - NHK V: the high-beam total is "1260000 lm" (6300 lm per projector). NHK Pro+: the high-beam
    total is 8200 lm, but 4200 lm per projector. The site shows only the per-projector
    figures. The NHK pages also list the certificates "CE, ECD"; the site leaves them out until
    they are confirmed (ECE?).
- [ ] **Brands.** The shop names the brand of only a few products. The site shows DJ Auto for
      the BMW E39 facelift lenses (the only lens set with a brand in the shop), Ether for the
      20 W LED high beams, and Xenus as the maker of the Xenus ballast and igniters (the shop
      says the ballast is made by Xenus). Who makes the other lens sets?
- [ ] **Car makes in the filter.** The make filter lists only the makes in `site.vehicleMakes`
      (BMW, Audi, Volkswagen, Mercedes-Benz, Lexus, Honda, Ford, Mazda, Volvo). The shop now
      also has parts for the Toyota Avensis T27 and Scania R trucks. Search finds them, the make
      filter does not. Should Toyota and Scania be added?
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
- Products: the Estonian names and descriptions of the 56 products that are new in the
  catalogue (`src/data/products.ts`) were rewritten from the shop's text, and the new category
  "Komplektsed tuled" ("Terviklikud esituled otse vahetamiseks: uued või kasutatud ja taastatud
  originaaltuled (OEM)."). Please read the 12 complete headlights in particular: the condition
  "Kasutatud, täielikult taastatud", "Tehtud tööd" and "Juhtmoodulid: Saab tellida juurde".
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
      | `/product/<slug>/` | `/et/catalog/<slug>` (all 114 products use their live shop slug, so this maps one to one) |
      | `/product/<slug>/` of the 5 products no longer sold (section 4) | their category, for example `/et/catalog?category=xenon-bulbs` |
      | `/pood/` | `/et/catalog` |
      | `/pood/49/` (Komplektsed tuled) | `/et/catalog?category=headlights` |
      | `/pood/4/` and everything under it (Tuleklaasid, by make and BMW series) | `/et/catalog?category=lenses` |
      | `/pood/3/11/` (LED projektorid) | `/et/catalog?category=led-projectors` |
      | `/pood/3/42/` (LED kaugtuled), `/pood/3/45/` (LED rõngad ja ribad) | `/et/catalog?category=led-lights` |
      | `/pood/1/6/` (Xenon projektorid) | `/et/catalog?category=xenon-projectors` |
      | `/pood/1/7/` (Xenon lambid) | `/et/catalog?category=xenon-bulbs` |
      | `/pood/1/8/` (Xenon ballastid) | `/et/catalog?category=ballasts` |
      | `/pood/2/47/` (Halogeen projektorid) | `/et/catalog?category=halogen` |
      | `/pood/5/39/` (Projektorite katted) | `/et/catalog?category=shrouds` |
      | `/pood/5/37/` (Adapterid) | `/et/catalog?category=adapters` |
      | `/pood/5/` (Tarvikud) | `/et/catalog?category=fitting` |
      | other `/pood/…` pages, and older readable URLs seen in snapshots such as `/pood/led/led-projektorid/` | the matching category, else `/et/catalog` |
      | `/teenused/` | `/et#services` |
      | `/meist/` | `/et#about` |
      | `/kkk/` | `/et#faq` |
      | `/kontakt/` | `/et#contact` |
      | `/et/a/evox-r` (Erply) | `/et/catalog/evox-r-2-0` |
      | `/et/a/tuleklaasid-bmw-x5-e70` (Erply) | `/et/catalog/tuleklaasid-e70-x5` |
      | `/et/a/osram-d1s-66140cbi-xenarc-cool-blue-intense` (Erply; no longer sold) | `/et/catalog?category=xenon-bulbs` |
      | other `/et/a/<slug>` (Erply) | the matching product, else `/et/catalog` |
      | `/muugitingimused/`, privacy policy | the new terms pages (section 5) |

      In `next.config.ts`, `permanent: true` sends a 308, which search engines treat like a 301;
      use `statusCode: 301` if a literal 301 is required. The old URLs end in `/`, and Next
      first strips the slash, so check with `curl -I` that each lands in at most two hops.
- [ ] After launch: add the site to **Google Search Console**, submit `/sitemap.xml`, and
      request indexing of `/et` and `/en`. Update the website link on the Google Business
      Profile and Facebook.
- [ ] Run **Lighthouse** on the live landing page (targets: performance 90+, accessibility 95+).
- [ ] Remove anything still marked as a placeholder (logo, product renders) once the real
      assets are in.
