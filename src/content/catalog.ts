import type { CatalogSort } from "@/lib/catalog";
import type { Localized } from "@/lib/i18n";
import type { CategoryId, Product } from "@/data/types";

type Count = Localized<(n: number) => string>;

const productCount: Count = {
  et: (n) => (n === 1 ? "1 toode" : `${n} toodet`),
  en: (n) => (n === 1 ? "1 product" : `${n} products`),
};

/**
 * Copy for the catalog page, product pages, catalog cards and the landing-page teaser.
 * Product names, descriptions and specs live in `src/data/products.ts`.
 */
export const catalog = {
  productCount,

  /** Metadata for `/[locale]/catalog`. The layout appends the brand name to the title. */
  meta: {
    title: { et: "Tootekataloog", en: "Product catalog" },
    description: {
      et: "Bi-LED- ja bi-xenon-projektorid, tuleklaasid, komplektsed esituled, xenon-lambid, ballastid ja paigaldustarvikud. Hinnad sisaldavad käibemaksu. Küsi pakkumist otse tootelehelt.",
      en: "Bi-LED and bi-xenon projectors, headlight lenses, complete headlights, xenon bulbs, ballasts and fitting parts. Prices include VAT. Request an offer straight from the product page.",
    },
  },

  hero: {
    eyebrow: { et: "Kataloog", en: "Catalog" },
    title: {
      et: "Projektorid, tuleklaasid ja kõik, mis esitulle kuulub",
      en: "Projectors, lenses and everything a headlight needs",
    },
    intro: {
      et: "Müüme ja paigaldame oma töökojas kõike alates komplektsetest esituledest kuni paigaldustarvikuteni. Hinnad sisaldavad käibemaksu. Morimoto, Bimmerjakes ja Strands kataloogidest tellime ka tooteid, mida siin ei ole.",
      en: "We sell all of it and fit it in our own workshop, from complete headlight units to fitting parts. Prices include VAT. We can also order products from the Morimoto, Bimmerjakes and Strands catalogs that are not listed here.",
    },
    /** Labels under the figures (the number itself is shown separately). */
    stats: {
      products: {
        et: (n: number) => (n === 1 ? "toode" : "toodet"),
        en: (n: number) => (n === 1 ? "product" : "products"),
      },
      categories: {
        et: (n: number) => (n === 1 ? "kategooria" : "kategooriat"),
        en: (n: number) => (n === 1 ? "category" : "categories"),
      },
      brands: {
        et: (n: number) => (n === 1 ? "bränd" : "brändi"),
        en: (n: number) => (n === 1 ? "brand" : "brands"),
      },
    },
  },

  filters: {
    title: { et: "Filtrid", en: "Filters" },
    open: { et: "Filtrid", en: "Filters" },
    /** Screen-reader suffix on the Filters button, e.g. "Filters, 2 active". */
    activeCount: {
      et: (n: number) => (n === 1 ? "1 aktiivne" : `${n} aktiivset`),
      en: (n: number) => `${n} active`,
    },
    close: { et: "Sulge filtrid", en: "Close filters" },
    category: { et: "Kategooria", en: "Category" },
    all: { et: "Kõik", en: "All" },
    brand: { et: "Bränd", en: "Brand" },
    allBrands: { et: "Kõik brändid", en: "All brands" },
    make: { et: "Automark", en: "Car make" },
    allMakes: { et: "Kõik automargid", en: "All makes" },
    search: { et: "Otsi", en: "Search" },
    searchPlaceholder: {
      et: "Toode, mudel või kood",
      en: "Product, model or code",
    },
    clearSearch: { et: "Tühjenda otsing", en: "Clear search" },
    sort: { et: "Järjestus", en: "Sort" },
    sorts: {
      featured: { et: "Esiletõstetud", en: "Featured" },
      "price-asc": { et: "Hind: odavamad enne", en: "Price: low to high" },
      "price-desc": { et: "Hind: kallimad enne", en: "Price: high to low" },
    } satisfies Record<CatalogSort, Localized<string>>,
    clear: { et: "Tühjenda filtrid", en: "Clear filters" },
    showResults: {
      et: (n: number) => (n === 0 ? "Tooteid ei leitud" : `Näita ${productCount.et(n)}`),
      en: (n: number) => (n === 0 ? "No products found" : `Show ${productCount.en(n)}`),
    },
    remove: {
      et: (label: string) => `Eemalda filter: ${label}`,
      en: (label: string) => `Remove filter: ${label}`,
    },
    /** The search text on its filter pill, in each language's quotation marks. */
    queryPill: {
      et: (q: string) => `„${q}“`,
      en: (q: string) => `“${q}”`,
    },
    /** Announced to screen readers when the result list changes. */
    results: productCount,
  },

  results: {
    /** Visually hidden heading above the grid. */
    heading: { et: "Tooted", en: "Products" },
  },

  empty: {
    title: { et: "Sobivaid tooteid ei leitud", en: "No products match" },
    body: {
      et: "Proovi teisi filtreid või kirjuta meile. Leiame lahenduse ka siis, kui sinu autole sobivat toodet kataloogis veel ei ole.",
      en: "Try other filters, or write to us. We can find a solution even when the catalog has nothing listed for your car yet.",
    },
    reset: { et: "Tühjenda filtrid", en: "Clear filters" },
    anyCar: {
      et: "Töötame pea kõigi automarkidega",
      en: "We work with almost every make",
    },
    anyCarBody: {
      et: "Kirjuta oma auto mark ja mudel ning saadame pakkumise.",
      en: "Tell us your car's make and model and we'll send you an offer.",
    },
    inquire: { et: "Küsi pakkumist", en: "Request an offer" },
  },

  card: {
    askPrice: { et: "Küsi hinda", en: "Ask for price" },
    vat: { et: "hind sisaldab käibemaksu", en: "incl. VAT" },
    inquire: { et: "Küsi pakkumist", en: "Request offer" },
    stock: {
      "in-stock": { et: "Laos", en: "In stock" },
      backorder: { et: "Tellimisel", en: "Made to order" },
    } satisfies Record<Product["stock"], Localized<string>>,
  },

  drawer: {
    title: { et: "Küsi pakkumist", en: "Request an offer" },
    close: { et: "Sulge", en: "Close" },
    intro: {
      et: "Kirjuta, millisele autole toodet vajad, ja saadame pakkumise.",
      en: "Tell us which car it is for and we'll send you an offer.",
    },
    general: {
      et: "Kirjuta oma auto ja soovi kohta. Mida täpsem info, seda täpsem pakkumine.",
      en: "Tell us about your car and what you need. The more detail you give, the more precise the offer.",
    },
  },

  product: {
    breadcrumb: { et: "Asukoht", en: "Breadcrumb" },
    catalog: { et: "Kataloog", en: "Catalog" },
    brand: { et: "Bränd", en: "Brand" },
    category: { et: "Kategooria", en: "Category" },
    sku: { et: "Tootekood", en: "SKU" },
    price: { et: "Hind", en: "Price" },
    inquire: { et: "Küsi pakkumist", en: "Request an offer" },
    warranty: {
      et: (n: number) => `Garantii ${n} aastat`,
      en: (n: number) => `${n}-year warranty`,
    },
    delivery: {
      "in-stock": {
        et: "Saadaval meie laost.",
        en: "Available from our stock.",
      },
      backorder: {
        et: "Tellime sinu jaoks. Tarneaeg on pikem, küsi meilt täpset aega.",
        en: "We order it in for you. Delivery takes longer, so ask us for the exact time.",
      },
    } satisfies Record<Product["stock"], Localized<string>>,
    specs: { et: "Tehnilised andmed", en: "Specifications" },
    fitment: { et: "Sobivus sõidukile", en: "Vehicle fitment" },
    fitmentNone: {
      et: "Ei ole seotud kindla automudeliga. Kirjuta meile oma auto mark ja mudel, ja kontrollime sobivuse üle.",
      en: "Not tied to a specific car model. Send us your car's make and model and we'll check that it fits.",
    },
    inquiryEyebrow: { et: "Päring", en: "Inquiry" },
    inquiryTitle: { et: "Küsi sellele tootele pakkumist", en: "Request an offer for this product" },
    inquiryIntro: {
      et: "Toote nimi on vormis juba olemas. Lisa oma auto andmed ja saadame pakkumise koos tarneajaga.",
      en: "The product is already filled in. Add your car's details and we'll send you an offer with the delivery time.",
    },
    orCall: { et: "Või helista", en: "Or call us" },
    hours: { et: "Lahtiolekuajad", en: "Opening hours" },
    closed: { et: "Suletud", en: "Closed" },
    relatedEyebrow: { et: "Sobib kokku", en: "Goes well with" },
    relatedTitle: { et: "Seotud tooted", en: "Related products" },
    backToCatalog: { et: "Tagasi kataloogi", en: "Back to catalog" },
    /** Caption on the product render: it shows the kind of part, not this exact product. */
    illustration: { et: "Illustreeriv pilt", en: "Illustration" },
  },

  /**
   * The landing page's catalog chapter: four tiles (lenses, complete headlights, LED, xenon) and a
   * closing card to the whole catalog, in a strip that moves sideways on desktop.
   */
  teaser: {
    eyebrow: { et: "Kataloog", en: "Catalog" },
    title: {
      et: "Osad, mida müüme ja paigaldame",
      en: "Parts we sell and fit",
    },
    intro: {
      et: "Projektorid, tuleklaasid, komplektsed esituled, lambid, ballastid ja paigaldustarvikud. Hinnad sisaldavad käibemaksu.",
      en: "Projectors, lenses, complete headlights, bulbs, ballasts and fitting parts. Prices include VAT.",
    },
    tiles: {
      lenses: {
        title: { et: "Tuleklaasid", en: "Headlight lenses" },
        alt: {
          et: "Põlev kaasaegne esituli, klaasil vihmapiisad",
          en: "A lit modern headlight with raindrops on the lens",
        },
      },
      /** Shows the first headlight in the catalog that has a real product photo. */
      headlights: {
        title: { et: "Komplektsed tuled", en: "Complete headlights" },
        alt: {
          et: "Komplektne esituli, foto meie kataloogist",
          en: "A complete headlight unit, a photo from our catalog",
        },
      },
      led: {
        title: { et: "LED-projektorid ja -kaugtuled", en: "LED projectors and high beams" },
        alt: {
          et: "Matthalli auto LED-esituli lähivaates",
          en: "A matte grey car's LED headlight, close up",
        },
      },
      xenon: {
        title: { et: "Xenon", en: "Xenon" },
        alt: {
          et: "Öösel põlev esituli, autol vihmapiisad",
          en: "A headlight shining at night, raindrops on the car",
        },
      },
    } satisfies Record<string, { title: Localized<string>; alt: Localized<string> }>,
    /** Short names for the categories a tile groups, listed under its title with their counts. */
    parts: {
      "led-projectors": { et: "Projektorid", en: "Projectors" },
      "led-lights": { et: "Kaugtuled ja rõngad", en: "High beams and rings" },
      "xenon-projectors": { et: "Projektorid", en: "Projectors" },
      "xenon-bulbs": { et: "Lambid", en: "Bulbs" },
      ballasts: { et: "Ballastid ja süütajad", en: "Ballasts and igniters" },
    } satisfies Partial<Record<CategoryId, Localized<string>>>,
    /** The card that closes the strip. */
    closing: {
      title: { et: "Vaata kogu kataloogi", en: "View the whole catalog" },
      count: {
        et: (n: number) => `(${productCount.et(n)})`,
        en: (n: number) => `(${productCount.en(n)})`,
      },
    },
  },
};
