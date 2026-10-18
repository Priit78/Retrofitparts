import type { Localized } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import type { Category, Product, ProductSpec } from "./types";

/**
 * Product catalog, converted from the live WooCommerce shop on retrofitparts.ee (Store API,
 * 2026-10-18): its 115 products minus the €0 placeholder "Toode", so 114.
 *
 * - Prices are EUR including VAT, as the shop shows them (the API's minor units ÷ 100);
 *   `null` means "ask for price". Lens sets that can also be bought one lens at a time show
 *   the price of the pair, with the single-lens price as a spec.
 * - `stock` is "in-stock" where the shop says so; everything else is ordered in ("backorder").
 * - `sku` is the shop's product code ("Tootekood").
 * - `makes` only holds values from `site.vehicleMakes`; it is derived from the product name
 *   or the fitment text. Universal parts, and makes outside that list (the Scania trucks),
 *   have none.
 * - `fitment` is model text from the shop, one entry per vehicle, in both languages
 *   ("3. seeria" / "3 Series"). Entries that are only model codes use the same text in both.
 *   Model years are only given where the shop states them.
 * - Brands are normalised for the brand filter ("Hella (replica)" and "Hella (OEM)" are
 *   both "Hella"; the replica/OEM distinction stays in the product name).
 * - Products carried over from the earlier capture keep their curated text; the rest is
 *   written from the shop's own text. Specs come only from the shop's text.
 * - `image` is the client's own photo of the actual unit (full-unit shots only), optimised
 *   into `public/products/<slug>.jpg`. Supplier packshots are not used.
 * - Products are listed in category display order, which is also the catalog's default
 *   order (after the featured ones).
 */

/** Same text in both languages (numbers, units, part codes). */
const same = (value: string): Localized<string> => ({ et: value, en: value });

/** A euro amount formatted for each language. */
const eur = (amount: number): Localized<string> => ({
  et: formatPrice(amount, "et") ?? "",
  en: formatPrice(amount, "en") ?? "",
});

const label = {
  modelYears: { et: "Mudeliaastad", en: "Model years" },
  contents: { et: "Komplekti sisu", en: "Contents" },
  singleLens: { et: "Üksik klaas", en: "Single lens" },
  function: { et: "Funktsioon", en: "Function" },
  projectorSize: { et: "Projektori suurus", en: "Projector size" },
  shroudSize: { et: "Katte suurus", en: "Shroud size" },
  lensDiameter: { et: "Läätse läbimõõt", en: "Lens diameter" },
  dimensions: { et: "Mõõdud", en: "Dimensions" },
  bulbs: { et: "Sobivad lambid", en: "Compatible bulbs" },
  base: { et: "Sokkel", en: "Bulb base" },
  cutOff: { et: "Lõikejoon", en: "Cut-off" },
  colorTemperature: { et: "Värvustemperatuur", en: "Color temperature" },
  luminousFlux: { et: "Valgusvoog", en: "Luminous flux" },
  lowBeamFlux: { et: "Valgusvoog, lähituli", en: "Luminous flux, low beam" },
  highBeamFlux: { et: "Valgusvoog, kaugtuli", en: "Luminous flux, high beam" },
  lightGain: { et: "Valgust võrreldes standardlambiga", en: "Light vs. standard bulb" },
  power: { et: "Võimsus", en: "Power" },
  lowBeamPower: { et: "Võimsus, lähituli", en: "Power, low beam" },
  highBeamPower: { et: "Võimsus, kaugtuli", en: "Power, high beam" },
  voltage: { et: "Pinge", en: "Voltage" },
  ignitionVoltage: { et: "Süütepinge", en: "Ignition voltage" },
  connector: { et: "Ühendus", en: "Connection" },
  lifetime: { et: "Eluiga", en: "Service life" },
  waterResistance: { et: "Veekindlus", en: "Water resistance" },
  traffic: { et: "Liiklus", en: "Traffic" },
  diameter: { et: "Läbimõõt", en: "Diameter" },
  length: { et: "Pikkus", en: "Length" },
  hole: { et: "Paigaldusauk", en: "Mounting hole" },
  mountingDepth: { et: "Minimaalne paigaldussügavus", en: "Minimum mounting depth" },
  shaftDiameter: { et: "Kinnitusvõlli läbimõõt", en: "Mounting shaft diameter" },
  replaces: { et: "Asendab", en: "Replaces" },
  partNumber: { et: "Varuosa number", en: "Part number" },
  side: { et: "Pool", en: "Side" },
  lightType: { et: "Tule tüüp", en: "Light type" },
  condition: { et: "Seisukord", en: "Condition" },
  workDone: { et: "Tehtud tööd", en: "Work done" },
  modules: { et: "Juhtmoodulid", en: "Control modules" },
} satisfies Record<string, Localized<string>>;

const spec = (l: Localized<string>, value: Localized<string>): ProductSpec => ({
  label: l,
  value,
});

/** Specs shared by every lens set. */
const lensPair = spec(label.contents, {
  et: "2 tuleklaasi (parem ja vasak)",
  en: "2 lenses (left and right)",
});
const modelYears = (years: string) => spec(label.modelYears, same(years));
const singleLens = (amount: number) => spec(label.singleLens, eur(amount));

const lensInstall: Localized<string> = {
  et: "Paigalduse saab tellida meie töökojas.",
  en: "Installation can be booked at our workshop.",
};
const allLightTypes: Localized<string> = {
  et: "Sobib kõikide tuletüüpidega.",
  en: "Suits all headlight types.",
};

/** Specs and text shared by the complete headlights. */
const partNumber = (code: string) => spec(label.partNumber, same(code));
const side = {
  left: spec(label.side, { et: "Vasak", en: "Left" }),
  right: spec(label.side, { et: "Parem", en: "Right" }),
};
const headlightSet = spec(label.contents, {
  et: "2 esitulet (komplekt)",
  en: "2 headlights (set)",
});
const lightType = (type: Localized<string>) => spec(label.lightType, type);
const usedRestored = spec(label.condition, {
  et: "Kasutatud, täielikult taastatud",
  en: "Used, fully restored",
});
const modulesOnRequest = spec(label.modules, {
  et: "Saab tellida juurde",
  en: "Available on request",
});
const modulesNotIncluded = spec(label.modules, { et: "Ei kuulu komplekti", en: "Not included" });
const modulesOffer: Localized<string> = {
  et: "Soovi korral saame pakkuda ka juhtmooduleid.",
  en: "Control modules can be supplied on request.",
};

/** A value given per projector or per light, as the shop's spec sheets state it. */
const perProjector = (value: string): Localized<string> => ({
  et: `${value} projektori kohta`,
  en: `${value} per projector`,
});
const rightHandTraffic = spec(label.traffic, {
  et: "Parempoolne liiklus (vasakrooliga autod)",
  en: "Right-hand traffic (left-hand-drive cars)",
});
const nhkLifetime = spec(label.lifetime, { et: "50 000 h", en: "50,000 h" });
const nhkVoltage = spec(label.voltage, same("10–16 V DC"));
const ip65 = spec(label.waterResistance, same("IP65"));

/** OEM makers whose original ballasts the Hella 5DV 009 replicas replace, per the shop. */
const hella5dv009Makers: Localized<string>[] = [
  "BMW",
  "Chrysler",
  "Citroën",
  "Peugeot",
  "Ford",
  "General Motors",
  "Hyundai",
  "Kia",
  "Mercedes-Benz",
  "Saab",
  "Škoda",
  "Volkswagen",
].map(same);

export const categories: Category[] = [
  {
    id: "lenses",
    name: { et: "Tuleklaasid", en: "Headlight lenses" },
    description: {
      et: "Uued tuleklaasid, enamasti paarina (parem ja vasak), millega saab tuhmunud või kahjustatud esitule välisklaasi välja vahetada.",
      en: "New replacement headlight lenses, mostly sold as left-and-right pairs, for replacing hazed or damaged outer lenses.",
    },
  },
  {
    id: "headlights",
    name: { et: "Komplektsed tuled", en: "Complete headlights" },
    description: {
      et: "Terviklikud esituled otse vahetamiseks: uued või kasutatud ja taastatud originaaltuled (OEM).",
      en: "Complete headlight units for direct replacement: new, or used and restored, original (OEM) headlights.",
    },
  },
  {
    id: "led-projectors",
    name: { et: "LED-projektorid", en: "LED projectors" },
    description: {
      et: "Bi-LED-projektorid esitulede uuendamiseks, mis annavad lähi- ja kaugtule ühest moodulist.",
      en: "Bi-LED projectors for upgrading headlights, with low and high beam from a single unit.",
    },
  },
  {
    id: "xenon-projectors",
    name: { et: "Xenon-projektorid", en: "Xenon projectors" },
    description: {
      et: "Bi-xenon-projektorid, mis annavad lähi- ja kaugtule ühes moodulis ning sobivad õigete adapteritega paljudesse esituledesse.",
      en: "Bi-xenon projectors with low and high beam in one unit, fitting many headlights with the right adapters.",
    },
  },
  {
    id: "led-lights",
    name: { et: "LED-kaugtuled ja -rõngad", en: "LED high beams & rings" },
    description: {
      et: "LED-kaugtuled kaugtulede nähtavuse parandamiseks, LED-rõngad BMW esituledele ja LED-demonid (demon eyes) projektoritele.",
      en: "LED high beams for better high-beam visibility, LED rings for BMW headlights and LED demon eyes for projectors.",
    },
  },
  {
    id: "xenon-bulbs",
    name: { et: "Xenon-lambid", en: "Xenon bulbs" },
    description: {
      et: "Xenon- ja HID-lambid D1S-, D2S-, D4S- ja H7-sokliga esitulede uuendamiseks ja asendamiseks.",
      en: "Xenon and HID bulbs with D1S, D2S, D4S and H7 bases, for upgrading or replacing headlight bulbs.",
    },
  },
  {
    id: "ballasts",
    name: { et: "Ballastid ja süütajad", en: "Ballasts & igniters" },
    description: {
      et: "Xenon-ballastid ja süütajad, sealhulgas CANbus-ballastid, mis kustutavad lambi veateate.",
      en: "Xenon ballasts and igniters, including CANbus ballasts that cancel bulb-out error messages.",
    },
  },
  {
    id: "halogen",
    name: { et: "Halogeen", en: "Halogen" },
    description: {
      et: "Projektorid halogeenlampidele, millega saab uuendada halogeentuledega esitulesid.",
      en: "Projectors for halogen bulbs, for upgrading headlights that use halogen bulbs.",
    },
  },
  {
    id: "shrouds",
    name: { et: "Projektorite katted", en: "Projector shrouds" },
    description: {
      et: "Projektorite katted (shroud), mis annavad ümberehitatud esitulele tehaseliku, viimistletud välimuse, ja nende paigaldusrõngad.",
      en: "Projector shrouds that give a retrofitted headlight a clean, factory-finished look, and the rings for fitting them.",
    },
  },
  {
    id: "adapters",
    name: { et: "Adapterid", en: "Adapters" },
    description: {
      et: "Adapterid projektorite paigaldamiseks konkreetsetesse esitulemudelitesse, sealhulgas AFS-tuledesse.",
      en: "Adapters for fitting projectors into specific headlight models, including AFS headlights.",
    },
  },
  {
    id: "fitting",
    name: { et: "Paigaldustarvikud", en: "Installation accessories" },
    description: {
      et: "Paigaldustarvikud ja varuosad: butüülliim, õhutid, ferriitrõngad, CAN-bus veaeemaldajad, pistikud ja üleminekud, reguleervardad ning DRL-torud.",
      en: "Installation accessories and spare parts: butyl sealant, breather vents, ferrite rings, CAN-bus error cancellers, connectors and adapters, adjuster rods and DRL light tubes.",
    },
  },
];

export const products: Product[] = [
  // ---------------------------------------------------------------------------------------
  // Headlight lenses (Tuleklaasid): sold as a left/right pair
  // ---------------------------------------------------------------------------------------
  {
    slug: "tuleklaasid-e90-e91-xenon-tuledele",
    sku: "2000000000923",
    name: {
      et: "Tuleklaasid BMW 3. seeria E90/E91 (xenon)",
      en: "Headlight lenses BMW 3 Series E90/E91 (xenon)",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 127.05,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E90/E91. Sobib xenon-tuledega autole. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E90/E91. Suits cars with xenon headlights. ${lensInstall.en}`,
    },
    specs: [modelYears("2005–2011"), lensPair],
    fitment: [{ et: "BMW 3. seeria E90/E91 (xenon)", en: "BMW 3 Series E90/E91 (xenon)" }],
    featured: true,
  },
  {
    slug: "tuleklaasid-e90-e91-halogeen-tuledele",
    sku: "2000000000909",
    name: {
      et: "Tuleklaasid BMW 3. seeria E90/E91 (halogeen)",
      en: "Headlight lenses BMW 3 Series E90/E91 (halogen)",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 111.8,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E90/E91. Sobib halogeentuledega autole. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E90/E91. Suits cars with halogen headlights. ${lensInstall.en}`,
    },
    specs: [modelYears("2005–2011"), lensPair],
    fitment: [
      {
        et: "BMW 3. seeria E90/E91 (halogeen)",
        en: "BMW 3 Series E90/E91 (halogen)",
      },
    ],
  },
  {
    slug: "tuleklaasid-e46-kupee",
    sku: "2000000000886",
    name: {
      et: "Tuleklaasid BMW 3. seeria E46 kupee ja kabriolett",
      en: "Headlight lenses BMW 3 Series E46 coupe & convertible",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 91.48,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E46 kupee ja kabriolett. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E46 coupe and convertible. ${lensInstall.en}`,
    },
    specs: [modelYears("1998–2002"), lensPair],
    fitment: [
      {
        et: "BMW 3. seeria E46 kupee ja kabriolett",
        en: "BMW 3 Series E46 coupe & convertible",
      },
    ],
  },
  {
    slug: "tuleklaasid-e46-sedaan-touring",
    sku: "2000000000893",
    name: {
      et: "Tuleklaasid BMW 3. seeria E46 sedaan ja touring",
      en: "Headlight lenses BMW 3 Series E46 sedan & touring",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 76.23,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E46 sedaan ja touring. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E46 sedan and touring. ${lensInstall.en}`,
    },
    specs: [modelYears("1997–2001"), lensPair],
    fitment: [
      {
        et: "BMW 3. seeria E46 sedaan ja touring",
        en: "BMW 3 Series E46 sedan & touring",
      },
    ],
  },
  {
    slug: "tuleklaasid-e46-fl-sedaan-touring",
    sku: "2000000000879",
    name: {
      et: "Tuleklaasid BMW 3. seeria E46 facelift sedaan ja touring",
      en: "Headlight lenses BMW 3 Series E46 facelift sedan & touring",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 91.48,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E46 facelift sedaan ja touring. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E46 facelift sedan and touring. ${lensInstall.en}`,
    },
    specs: [modelYears("2001–2006"), lensPair],
    fitment: [
      {
        et: "BMW 3. seeria E46 facelift sedaan ja touring",
        en: "BMW 3 Series E46 facelift sedan & touring",
      },
    ],
  },
  {
    slug: "tuleklaasid-e46-fl-kupee",
    sku: "2000000000916",
    name: {
      et: "Tuleklaasid BMW 3. seeria E46 facelift kupee ja kabriolett",
      en: "Headlight lenses BMW 3 Series E46 facelift coupe & convertible",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 202.26,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 3. seeria E46 facelift kupee ja kabriolett. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 3 Series E46 facelift coupe and convertible. ${lensInstall.en}`,
    },
    specs: [modelYears("2003–2006"), lensPair],
    fitment: [
      {
        et: "BMW 3. seeria E46 facelift kupee ja kabriolett",
        en: "BMW 3 Series E46 facelift coupe & convertible",
      },
    ],
  },
  {
    slug: "tuleklaasid-e39-fl",
    sku: "2000000000930",
    name: {
      et: "Tuleklaasid BMW 5. seeria E39 facelift",
      en: "Headlight lenses BMW 5 Series E39 facelift",
    },
    category: "lenses",
    brand: "DJ Auto",
    makes: ["BMW"],
    price: 162.62,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria E39 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series E39 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2001–2003"), lensPair],
    fitment: [{ et: "BMW 5. seeria E39 facelift", en: "BMW 5 Series E39 facelift" }],
  },
  {
    slug: "tuleklaasid-e60",
    sku: "2000000000947",
    name: {
      et: "Tuleklaasid BMW 5. seeria E60/E61",
      en: "Headlight lenses BMW 5 Series E60/E61",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 202.26,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria E60/E61. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series E60/E61. ${lensInstall.en}`,
    },
    specs: [modelYears("2003–2010"), lensPair],
    fitment: [{ et: "BMW 5. seeria E60/E61", en: "BMW 5 Series E60/E61" }],
  },
  {
    slug: "tuleklaasid-f10",
    sku: "2000000001579",
    name: {
      et: "Tuleklaasid BMW 5. seeria F10/F11",
      en: "Headlight lenses BMW 5 Series F10/F11",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 87.41,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria F10/F11. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series F10/F11. ${lensInstall.en}`,
    },
    specs: [modelYears("2009–2016"), lensPair, singleLens(45.74)],
    fitment: [{ et: "BMW 5. seeria F10/F11", en: "BMW 5 Series F10/F11" }],
  },
  {
    slug: "tuleklaasid-f07-gt",
    sku: "2000000001487",
    name: {
      et: "Tuleklaasid BMW 5. seeria F07 GT",
      en: "Headlight lenses BMW 5 Series F07 GT",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 128.07,
    stock: "in-stock",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria F07 GT. Sobivad xenon-tuledele; ei sobi Full Adaptive LED-tuledele. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series F07 GT. Suitable for xenon headlights; not suitable for Full Adaptive LED headlights. ${lensInstall.en}`,
    },
    specs: [modelYears("2009–2016"), lensPair, singleLens(70.13)],
    fitment: [{ et: "BMW 5. seeria F07 GT (xenon)", en: "BMW 5 Series F07 GT (xenon)" }],
  },
  {
    slug: "e63-64-facelift-tuleklaasid",
    sku: "2000000001258",
    name: {
      et: "Tuleklaasid BMW 6. seeria E63/E64 facelift",
      en: "Headlight lenses BMW 6 Series E63/E64 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 364.89,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 6. seeria E63/E64 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 6 Series E63/E64 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2007–2010"), lensPair],
    fitment: [{ et: "BMW 6. seeria E63/E64 facelift", en: "BMW 6 Series E63/E64 facelift" }],
  },
  {
    slug: "tuleklaasid-e38-fl",
    sku: "2000000000954",
    name: {
      et: "Tuleklaasid BMW 7. seeria E38 facelift",
      en: "Headlight lenses BMW 7 Series E38 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 141.28,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 7. seeria E38 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 7 Series E38 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("1999–2001"), lensPair],
    fitment: [{ et: "BMW 7. seeria E38 facelift", en: "BMW 7 Series E38 facelift" }],
  },
  {
    slug: "tuleklaasid-e65-fl",
    sku: "2000000000961",
    name: {
      et: "Tuleklaasid BMW 7. seeria E65 facelift",
      en: "Headlight lenses BMW 7 Series E65 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 181.93,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 7. seeria E65 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 7 Series E65 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2005–2008"), lensPair],
    fitment: [{ et: "BMW 7. seeria E65 facelift", en: "BMW 7 Series E65 facelift" }],
  },
  {
    slug: "tuleklaasid-bmw-7-seeria-f01-f02",
    sku: "2000000001593",
    name: {
      et: "Tuleklaasid BMW 7. seeria F01/F02",
      en: "Headlight lenses BMW 7 Series F01/F02",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 89,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 7. seeria F01/F02. Sobib nii xenon- kui ka LED-tuledega versioonile. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 7 Series F01/F02. Suits both the xenon and the LED headlight versions. ${lensInstall.en}`,
    },
    specs: [modelYears("2007–2015"), lensPair],
    fitment: [
      {
        et: "BMW 7. seeria F01/F02 (xenon ja LED)",
        en: "BMW 7 Series F01/F02 (xenon and LED)",
      },
    ],
  },
  {
    slug: "tuleklaasid-e70-x5",
    sku: "2000000000985",
    name: {
      et: "Tuleklaasid BMW X5 E70",
      en: "Headlight lenses BMW X5 E70",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 121.97,
    stock: "in-stock",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X5 E70. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X5 E70. ${lensInstall.en}`,
    },
    specs: [modelYears("2006–2013"), lensPair, singleLens(66.07)],
    fitment: [same("BMW X5 E70")],
  },
  {
    slug: "tuleklaasid-e53-x5-pre-fl",
    sku: "2000000001395",
    name: {
      et: "Tuleklaasid BMW X5 E53 pre-facelift",
      en: "Headlight lenses BMW X5 E53 pre-facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 254.1,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X5 E53 pre-facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X5 E53 pre-facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("1999–2003"), lensPair],
    fitment: [same("BMW X5 E53 pre-facelift")],
  },
  {
    slug: "tuleklaasid-e53-x5-fl",
    sku: "2000000000992",
    name: {
      et: "Tuleklaasid BMW X5 E53 facelift",
      en: "Headlight lenses BMW X5 E53 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 325.25,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X5 E53 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X5 E53 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2004–2006"), lensPair],
    fitment: [same("BMW X5 E53 facelift")],
  },
  {
    slug: "tuleklaasid-e71-x6",
    sku: "2000000001005",
    name: {
      et: "Tuleklaasid BMW X6 E71",
      en: "Headlight lenses BMW X6 E71",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 142.3,
    stock: "in-stock",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X6 E71. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X6 E71. ${lensInstall.en}`,
    },
    specs: [modelYears("2008–2014"), lensPair, singleLens(76.23)],
    fitment: [same("BMW X6 E71")],
  },
  {
    slug: "tuleklaasid-e84-x1",
    sku: "2000000001012",
    name: {
      et: "Tuleklaasid BMW X1 E84",
      en: "Headlight lenses BMW X1 E84",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 171.77,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X1 E84. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X1 E84. ${lensInstall.en}`,
    },
    specs: [modelYears("2009–2016"), lensPair],
    fitment: [same("BMW X1 E84")],
  },
  {
    slug: "tuleklaasid-golf-6",
    sku: "KLGO6",
    name: {
      et: "Tuleklaasid Volkswagen Golf 6",
      en: "Headlight lenses Volkswagen Golf 6",
    },
    category: "lenses",
    makes: ["Volkswagen"],
    price: 141.28,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Volkswagen Golf 6. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volkswagen Golf 6. ${lensInstall.en}`,
    },
    specs: [modelYears("2009–2013"), lensPair],
    fitment: [same("Volkswagen Golf 6")],
  },
  {
    slug: "tuleklaasid-golf-7",
    sku: "KLGO7",
    name: {
      et: "Tuleklaasid Volkswagen Golf 7",
      en: "Headlight lenses Volkswagen Golf 7",
    },
    category: "lenses",
    makes: ["Volkswagen"],
    price: 151.44,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Volkswagen Golf 7. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volkswagen Golf 7. ${lensInstall.en}`,
    },
    specs: [modelYears("2013–2020"), lensPair],
    fitment: [same("Volkswagen Golf 7")],
  },
  {
    slug: "tuleklaasid-passat-cc-3c",
    sku: "KLCC3C",
    name: {
      et: "Tuleklaasid Volkswagen Passat CC 3C",
      en: "Headlight lenses Volkswagen Passat CC 3C",
    },
    category: "lenses",
    makes: ["Volkswagen"],
    price: 177.87,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Volkswagen Passat CC (3C). ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volkswagen Passat CC (3C). ${lensInstall.en}`,
    },
    specs: [modelYears("2008–2011"), lensPair],
    fitment: [same("Volkswagen Passat CC (3C)")],
  },
  {
    slug: "tuleklaasid-a6-c6-4f",
    sku: "KLA6C6",
    name: {
      et: "Tuleklaasid Audi A6 C6 4F",
      en: "Headlight lenses Audi A6 C6 4F",
    },
    category: "lenses",
    makes: ["Audi"],
    price: 100.62,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Audi A6 C6 (4F). ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Audi A6 C6 (4F). ${lensInstall.en}`,
    },
    specs: [modelYears("2004–2011"), lensPair],
    fitment: [same("Audi A6 C6 (4F)")],
  },
  {
    slug: "tuleklaasid-a6-c7-pre-facelift",
    sku: "2000000001562",
    name: {
      et: "Tuleklaasid Audi A6 C7 4G pre-facelift",
      en: "Headlight lenses Audi A6 C7 4G pre-facelift",
    },
    category: "lenses",
    makes: ["Audi"],
    price: 222.59,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Audi A6 C7 (4G) pre-facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Audi A6 C7 (4G) pre-facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2011–2014"), lensPair],
    fitment: [same("Audi A6 C7 (4G) pre-facelift")],
  },
  {
    slug: "tuleklaasid-w251-pre-fl",
    sku: "KLW251",
    name: {
      et: "Tuleklaasid Mercedes-Benz R-klass W251 pre-facelift",
      en: "Headlight lenses Mercedes-Benz R-Class W251 pre-facelift",
    },
    category: "lenses",
    makes: ["Mercedes-Benz"],
    price: 289.67,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Mercedes-Benz R-klass W251 pre-facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Mercedes-Benz R-Class W251 pre-facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2006–2010"), lensPair],
    fitment: [
      {
        et: "Mercedes-Benz R-klass W251 pre-facelift",
        en: "Mercedes-Benz R-Class W251 pre-facelift",
      },
    ],
  },
  {
    slug: "w211-tuleklaasid",
    sku: "2000000001685",
    name: {
      et: "Tuleklaasid Mercedes-Benz E-klass W211",
      en: "Headlight lenses Mercedes-Benz E-Class W211",
    },
    category: "lenses",
    makes: ["Mercedes-Benz"],
    price: 142.3,
    stock: "backorder",
    description: {
      // The shop gives no description, so nothing says whether this is a pair (CONTENT-TODO).
      et: `Uued tuleklaasid mudelile Mercedes-Benz E-klass W211. ${lensInstall.et}`,
      en: `New replacement headlight lenses for the Mercedes-Benz E-Class W211. ${lensInstall.en}`,
    },
    specs: [],
    fitment: [{ et: "Mercedes-Benz E-klass W211", en: "Mercedes-Benz E-Class W211" }],
  },
  {
    slug: "tuleklaasid-crv-gen-3",
    sku: "KLCR3",
    name: {
      et: "Tuleklaasid Honda CR-V 3. põlvkond",
      en: "Headlight lenses Honda CR-V Gen 3",
    },
    category: "lenses",
    makes: ["Honda"],
    price: 141.28,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Honda CR-V 3. põlvkond. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the third-generation Honda CR-V. ${lensInstall.en}`,
    },
    specs: [modelYears("2007–2011"), lensPair],
    fitment: [{ et: "Honda CR-V 3. põlvkond", en: "Honda CR-V Gen 3" }],
  },
  {
    slug: "tuleklaasid-cr-v-gen-4",
    sku: "KLCR4",
    name: {
      et: "Tuleklaasid Honda CR-V 4. põlvkond",
      en: "Headlight lenses Honda CR-V Gen 4",
    },
    category: "lenses",
    makes: ["Honda"],
    price: 100.62,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Honda CR-V 4. põlvkond. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the fourth-generation Honda CR-V. ${lensInstall.en}`,
    },
    specs: [modelYears("2012–2016"), lensPair],
    fitment: [{ et: "Honda CR-V 4. põlvkond", en: "Honda CR-V Gen 4" }],
  },
  {
    slug: "tuleklaasid-rx",
    sku: "2000000001616",
    name: {
      et: "Tuleklaasid Lexus RX XU30",
      en: "Headlight lenses Lexus RX XU30",
    },
    category: "lenses",
    makes: ["Lexus"],
    price: 182.95,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Lexus RX XU30. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Lexus RX XU30. ${lensInstall.en}`,
    },
    specs: [modelYears("2003–2008"), lensPair],
    fitment: [same("Lexus RX XU30")],
  },
  {
    slug: "tuleklaasid-s60",
    sku: "KLS60",
    name: {
      et: "Tuleklaasid Volvo S60 III",
      en: "Headlight lenses Volvo S60 III",
    },
    category: "lenses",
    makes: ["Volvo"],
    price: 325.25,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Volvo S60 III. ${allLightTypes.et} ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volvo S60 III. ${allLightTypes.en} ${lensInstall.en}`,
    },
    specs: [modelYears("2019+"), lensPair],
    fitment: [same("Volvo S60 III")],
  },
  {
    slug: "v70-xc70-s80-p3-tuleklaasid",
    sku: "2000000001692",
    name: {
      et: "Tuleklaasid Volvo V70/XC70/S80 (P3)",
      en: "Headlight lenses Volvo V70/XC70/S80 (P3)",
    },
    category: "lenses",
    makes: ["Volvo"],
    price: 202.26,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelitele Volvo V70, XC70 ja S80 (P3 platvorm). ${allLightTypes.et} ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volvo V70, XC70 and S80 (P3 platform). ${allLightTypes.en} ${lensInstall.en}`,
    },
    specs: [modelYears("2008–2016"), lensPair],
    fitment: [same("Volvo V70 (P3)"), same("Volvo XC70 (P3)"), same("Volvo S80 (P3)")],
  },
  {
    slug: "tuleklaasi-xc90-2016",
    sku: "2000000001784",
    name: {
      et: "Tuleklaasid Volvo XC90 (2016+)",
      en: "Headlight lenses Volvo XC90 (2016+)",
    },
    category: "lenses",
    makes: ["Volvo"],
    price: 250.48,
    stock: "backorder",
    description: {
      et: "Uued tuleklaasid mudelile Volvo XC90, alates 2016. mudeliaastast.",
      en: "New replacement headlight lenses for the Volvo XC90, from the 2016 model year on.",
    },
    specs: [modelYears("2016+")],
    fitment: [same("Volvo XC90 (2016+)")],
  },
  {
    slug: "tuleklaasid-scania-r450",
    sku: "2000000002101",
    name: {
      et: "Tuleklaasid Scania R450",
      en: "Headlight lenses Scania R450",
    },
    category: "lenses",
    makes: [],
    price: 111.6,
    stock: "backorder",
    description: {
      et: "Uued tuleklaasid veokile Scania R450.",
      en: "New replacement headlight lenses for the Scania R450 truck.",
    },
    specs: [],
    fitment: [same("Scania R450")],
  },

  // ---------------------------------------------------------------------------------------
  // Complete headlights (Komplektsed tuled): the client's own units, with their own photos
  // ---------------------------------------------------------------------------------------
  {
    slug: "bmw-g30-pre-lci-vasak-esituli-7439193-04",
    sku: "2000000002071",
    name: {
      et: "BMW G30 pre-LCI vasak esituli 7439193-04",
      en: "BMW G30 pre-LCI left headlight 7439193-04",
    },
    category: "headlights",
    makes: ["BMW"],
    price: 535.68,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud ja ideaalses seisukorras BMW G30 (pre-LCI) vasak adaptiivne LED-esituli. Tuleklaas ja valgusjuhid on vahetatud. ${modulesOffer.et}`,
      en: `A fully restored BMW G30 (pre-LCI) left adaptive LED headlight in excellent condition. The lens and the light guides have been replaced. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("7439193-04"),
      side.left,
      lightType({ et: "Adaptiivne LED", en: "Adaptive LED" }),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas ja valgusjuhid vahetatud",
        en: "Lens and light guides replaced",
      }),
      modulesOnRequest,
    ],
    fitment: [{ et: "BMW 5. seeria G30 (pre-LCI)", en: "BMW 5 Series G30 (pre-LCI)" }],
    image: "/products/bmw-g30-pre-lci-vasak-esituli-7439193-04.jpg",
  },
  {
    slug: "bmw-f15-xenon-esitulede-komplekt-7290055-7290056",
    sku: "2000000002064",
    name: {
      et: "BMW F15 xenon esitulede komplekt 7290055, 7290056",
      en: "BMW F15 xenon headlight set 7290055, 7290056",
    },
    category: "headlights",
    makes: ["BMW"],
    price: 1091.2,
    stock: "in-stock",
    description: {
      et: "Täielikult taastatud BMW F15 xenon-esitulede komplekt. Tuledele on tehtud RHD–LHD konversioon (paremroolilt vasakroolile) ja need on täiskomplektsed.",
      en: "A fully restored set of BMW F15 xenon headlights. They have been converted from right-hand drive to left-hand drive (RHD to LHD) and are complete units.",
    },
    specs: [
      partNumber("7290055, 7290056"),
      headlightSet,
      lightType(same("Xenon")),
      usedRestored,
      spec(label.workDone, { et: "RHD–LHD konversioon", en: "RHD-to-LHD conversion" }),
    ],
    fitment: [same("BMW X5 F15")],
    image: "/products/bmw-f15-xenon-esitulede-komplekt-7290055-7290056.jpg",
  },
  {
    slug: "bmw-f10-vasak-halogeen-esituli-uus-originaal",
    sku: "2000000002057",
    name: {
      et: "BMW F10 vasak halogeen-esituli, uus originaal",
      en: "BMW F10 left halogen headlight, new original",
    },
    category: "headlights",
    makes: ["BMW"],
    price: 403,
    stock: "in-stock",
    description: {
      et: "Uus originaalne BMW F10 vasak halogeen-esituli.",
      en: "A new, original BMW F10 left halogen headlight.",
    },
    specs: [
      side.left,
      lightType({ et: "Halogeen", en: "Halogen" }),
      spec(label.condition, { et: "Uus, originaal", en: "New, original" }),
    ],
    fitment: [{ et: "BMW 5. seeria F10", en: "BMW 5 Series F10" }],
    image: "/products/bmw-f10-vasak-halogeen-esituli-uus-originaal.jpg",
  },
  {
    slug: "bmw-f10-lci-parem-esituli-731713211",
    sku: "2000000002026",
    name: {
      et: "BMW F10 LCI parem esituli 731713211",
      en: "BMW F10 LCI right headlight 731713211",
    },
    category: "headlights",
    makes: ["BMW"],
    price: 420,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud ja ideaalses seisukorras BMW F10 (LCI) parem bi-xenon-esituli. Tuleklaas on vahetatud, juhtmestik testitud ja reflektor asendatud korralikuga. ${modulesOffer.et}`,
      en: `A fully restored BMW F10 (LCI) right bi-xenon headlight in excellent condition. The lens has been replaced, the wiring tested and the reflector swapped for a sound one. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("731713211"),
      side.right,
      lightType(same("Bi-xenon")),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas ja reflektor vahetatud, juhtmestik testitud",
        en: "Lens and reflector replaced, wiring tested",
      }),
      modulesOnRequest,
    ],
    fitment: [{ et: "BMW 5. seeria F10 (LCI)", en: "BMW 5 Series F10 (LCI)" }],
    image: "/products/bmw-f10-lci-parem-esituli-731713211.jpg",
  },
  {
    slug: "bmw-f01-pre-lci-vasak-esituli-7182137",
    sku: "2000000002033",
    name: {
      et: "BMW F01 pre-LCI vasak esituli 7182137",
      en: "BMW F01 pre-LCI left headlight 7182137",
    },
    category: "headlights",
    makes: ["BMW"],
    price: 305,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud ja ideaalses seisukorras BMW F01 (pre-LCI) vasak bi-xenon-esituli. Tuleklaas on vahetatud ja reflektor asendatud korralikuga. ${modulesOffer.et}`,
      en: `A fully restored BMW F01 (pre-LCI) left bi-xenon headlight in excellent condition. The lens has been replaced and the reflector swapped for a sound one. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("7182137"),
      side.left,
      lightType(same("Bi-xenon")),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas ja reflektor vahetatud",
        en: "Lens and reflector replaced",
      }),
      modulesOnRequest,
    ],
    fitment: [{ et: "BMW 7. seeria F01 (pre-LCI)", en: "BMW 7 Series F01 (pre-LCI)" }],
    image: "/products/bmw-f01-pre-lci-vasak-esituli-7182137.jpg",
  },
  {
    slug: "mb-c-klass-w205-parem-led-ils-esituli-a2059063204",
    sku: "2000000002095",
    name: {
      et: "Mercedes-Benz C-klass W205 parem LED ILS esituli A2059063204",
      en: "Mercedes-Benz C-Class W205 right LED ILS headlight A2059063204",
    },
    category: "headlights",
    makes: ["Mercedes-Benz"],
    price: 694.4,
    stock: "in-stock",
    description: {
      et: "Täielikult taastatud Mercedes-Benz C-klassi (W205) parem LED ILS esituli. Müüakse ilma juhtmooduliteta.",
      en: "A fully restored Mercedes-Benz C-Class (W205) right LED ILS headlight. Sold without control modules.",
    },
    specs: [
      partNumber("A2059063204"),
      side.right,
      lightType(same("LED ILS")),
      usedRestored,
      modulesNotIncluded,
    ],
    fitment: [{ et: "Mercedes-Benz C-klass W205", en: "Mercedes-Benz C-Class W205" }],
    image: "/products/mb-c-klass-w205-parem-led-ils-esituli-a2059063204.jpg",
  },
  {
    slug: "mb-e-klass-w213-vasak-esituli-a2139066501",
    sku: "2000000001982",
    name: {
      et: "Mercedes-Benz E-klass W213 vasak esituli A2139066501",
      en: "Mercedes-Benz E-Class W213 left headlight A2139066501",
    },
    category: "headlights",
    makes: ["Mercedes-Benz"],
    price: 798.56,
    stock: "in-stock",
    description: {
      et: "Täielikult taastatud Mercedes-Benz E-klassi (W213) vasak LED-esituli, millel on uus tuleklaas ja korpus.",
      en: "A fully restored Mercedes-Benz E-Class (W213) left LED headlight, with a new lens and housing.",
    },
    specs: [
      partNumber("A2139066501"),
      side.left,
      lightType(same("LED")),
      usedRestored,
      spec(label.workDone, { et: "Uus tuleklaas ja korpus", en: "New lens and housing" }),
    ],
    fitment: [{ et: "Mercedes-Benz E-klass W213", en: "Mercedes-Benz E-Class W213" }],
    image: "/products/mb-e-klass-w213-vasak-esituli-a2139066501.jpg",
  },
  {
    slug: "mb-gls-x166-parem-esituli-a1669069002",
    sku: "2000000002002",
    name: {
      et: "Mercedes-Benz GLS X166 parem esituli A1669069002",
      en: "Mercedes-Benz GLS X166 right headlight A1669069002",
    },
    category: "headlights",
    makes: ["Mercedes-Benz"],
    price: 996.96,
    stock: "in-stock",
    description: {
      et: "Täielikult taastatud Mercedes-Benz GLS (X166) parem LED-esituli. Müüakse ilma juhtmooduliteta.",
      en: "A fully restored Mercedes-Benz GLS (X166) right LED headlight. Sold without control modules.",
    },
    specs: [
      partNumber("A1669069002"),
      side.right,
      lightType(same("LED")),
      usedRestored,
      modulesNotIncluded,
    ],
    fitment: [same("Mercedes-Benz GLS X166")],
    image: "/products/mb-gls-x166-parem-esituli-a1669069002.jpg",
  },
  {
    slug: "audi-a6-c7-parem-esituli-4g0941006c",
    sku: "2000000002040",
    name: {
      et: "Audi A6 C7 parem esituli 4G0941006C",
      en: "Audi A6 C7 right headlight 4G0941006C",
    },
    category: "headlights",
    makes: ["Audi"],
    price: 341,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud ja ideaalses seisukorras Audi A6 C7 (pre-facelift) parem bi-xenon-esituli. Tuleklaas on vahetatud, juhtmestik testitud ja reflektor asendatud korralikuga. ${modulesOffer.et}`,
      en: `A fully restored Audi A6 C7 (pre-facelift) right bi-xenon headlight in excellent condition. The lens has been replaced, the wiring tested and the reflector swapped for a sound one. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("4G0941006C"),
      side.right,
      lightType(same("Bi-xenon")),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas ja reflektor vahetatud, juhtmestik testitud",
        en: "Lens and reflector replaced, wiring tested",
      }),
      modulesOnRequest,
    ],
    fitment: [same("Audi A6 C7 pre-facelift")],
    image: "/products/audi-a6-c7-parem-esituli-4g0941006c.jpg",
  },
  {
    slug: "ford-galaxy-s-max-taastatud-esitulede-komplekt-1zs009250-41-1zs009250-42",
    sku: "2000000002088",
    name: {
      et: "Ford Galaxy/S-Max esitulede komplekt 1ZS009250-41, 1ZS009250-42",
      en: "Ford Galaxy/S-Max headlight set 1ZS009250-41, 1ZS009250-42",
    },
    category: "headlights",
    makes: ["Ford"],
    price: 483.6,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud ja heas seisukorras Ford Galaxy/S-Max bi-xenon-esitulede komplekt. Tuleklaasid on taastatud ja projektorid vahetatud uute vastu. ${modulesOffer.et}`,
      en: `A fully restored set of Ford Galaxy/S-Max bi-xenon headlights in good condition. The lenses have been restored and the projectors replaced with new ones. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("1ZS009250-41, 1ZS009250-42"),
      headlightSet,
      lightType(same("Bi-xenon")),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaasid taastatud, projektorid vahetatud uute vastu",
        en: "Lenses restored, projectors replaced with new ones",
      }),
      modulesOnRequest,
    ],
    fitment: [same("Ford Galaxy"), same("Ford S-Max")],
    image:
      "/products/ford-galaxy-s-max-taastatud-esitulede-komplekt-1zs009250-41-1zs009250-42.jpg",
  },
  {
    slug: "ford-mondeo-mkv-vasak-esituli-es7313d155af",
    sku: "2000000002019",
    name: {
      et: "Ford Mondeo MKV vasak esituli ES7313D155AF",
      en: "Ford Mondeo MKV left headlight ES7313D155AF",
    },
    category: "headlights",
    makes: ["Ford"],
    price: 539,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud Ford Mondeo MKV vasak täis-LED-esituli. Tuleklaas on vahetatud ja funktsioonid kontrollitud. ${modulesOffer.et}`,
      en: `A fully restored Ford Mondeo MKV left full-LED headlight. The lens has been replaced and its functions checked. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("ES7313D155AF"),
      side.left,
      lightType({ et: "Täis-LED", en: "Full LED" }),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas vahetatud, funktsioonid kontrollitud",
        en: "Lens replaced, functions checked",
      }),
      modulesOnRequest,
    ],
    fitment: [same("Ford Mondeo MK5")],
    image: "/products/ford-mondeo-mkv-vasak-esituli-es7313d155af.jpg",
  },
  {
    slug: "volvo-s-v90-parem-esituli-32342465",
    sku: "2000000001975",
    name: {
      et: "Volvo S90/V90 parem esituli 32342465",
      en: "Volvo S90/V90 right headlight 32342465",
    },
    category: "headlights",
    makes: ["Volvo"],
    price: 770,
    stock: "in-stock",
    description: {
      et: `Täielikult taastatud Volvo S90/V90 parem täis-LED-esituli. Tuleklaas on vahetatud ja funktsioonid kontrollitud. ${modulesOffer.et}`,
      en: `A fully restored Volvo S90/V90 right full-LED headlight. The lens has been replaced and its functions checked. ${modulesOffer.en}`,
    },
    specs: [
      partNumber("32342465"),
      side.right,
      lightType({ et: "Täis-LED", en: "Full LED" }),
      usedRestored,
      spec(label.workDone, {
        et: "Tuleklaas vahetatud, funktsioonid kontrollitud",
        en: "Lens replaced, functions checked",
      }),
      modulesOnRequest,
    ],
    fitment: [same("Volvo S90"), same("Volvo V90")],
    image: "/products/volvo-s-v90-parem-esituli-32342465.jpg",
  },

  // ---------------------------------------------------------------------------------------
  // LED projectors
  // ---------------------------------------------------------------------------------------
  {
    slug: "koito-bi-led",
    sku: "KBLED",
    name: { et: "Koito BI-LED projektor", en: "Koito bi-LED projector" },
    category: "led-projectors",
    brand: "Koito",
    makes: [],
    price: 284.59,
    stock: "backorder",
    description: {
      et: "Integreeritud juhtplokiga 3-tolline bi-LED-projektor, mis annab nii lähi- kui ka kaugtule ning lisaks päevatule (DRL) režiimi. Komplektis kaks projektorit. Sobib paljudele Jaapani päritolu sõidukitele alates 2015. aastast.",
      en: 'A 3" bi-LED projector with an integrated driver, giving both low and high beam plus a daytime running light (DRL) mode. Supplied as a pair. Suits many vehicles of Japanese origin from 2015 onwards.',
    },
    specs: [
      spec(label.function, {
        et: "Bi-LED (lähi- ja kaugtuli) + päevatule (DRL) režiim",
        en: "Bi-LED (low and high beam) + daytime running light (DRL) mode",
      }),
      spec(label.projectorSize, same('3"')),
      spec(label.luminousFlux, same("2000 lm")),
      spec(label.colorTemperature, same("5500 K")),
      spec(label.dimensions, same("90 × 115 × 120 mm")),
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [{ et: "Jaapani autod 2015+", en: "Japanese cars 2015+" }],
    warrantyYears: 2,
    featured: true,
  },
  {
    slug: "nhk-v",
    sku: "2000000001944",
    name: { et: "NHK V bi-LED projektorid", en: "NHK V bi-LED projectors" },
    category: "led-projectors",
    brand: "NHK",
    makes: [],
    price: 354.72,
    stock: "backorder",
    description: {
      et: "NHK viienda põlvkonna 3-tollised G5-tüüpi bi-LED-projektorid. Mõeldud parempoolsesse liiklusse (vasakrooliga autodele). Komplektis kaks projektorit.",
      en: "NHK fifth-generation 3-inch G5-type bi-LED projectors. Made for right-hand traffic (left-hand-drive cars). Supplied as a pair.",
    },
    specs: [
      spec(label.function, {
        et: "Bi-LED (lähi- ja kaugtuli)",
        en: "Bi-LED (low and high beam)",
      }),
      spec(label.lensDiameter, same('3"')),
      spec(label.lowBeamFlux, perProjector("4800 lm")),
      spec(label.highBeamFlux, perProjector("6300 lm")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.lowBeamPower, perProjector("50 W")),
      spec(label.highBeamPower, perProjector("55 W")),
      nhkVoltage,
      nhkLifetime,
      ip65,
      spec(label.dimensions, {
        et: "146 × 105 mm (pikkus × laius)",
        en: "146 × 105 mm (length × width)",
      }),
      rightHandTraffic,
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [],
  },
  {
    slug: "nhk-iv-plus",
    sku: "2000000001661",
    name: { et: "NHK IV+ bi-LED projektorid", en: "NHK IV+ bi-LED projectors" },
    category: "led-projectors",
    brand: "NHK",
    makes: [],
    price: 325.25,
    stock: "backorder",
    description: {
      et: "NHK neljanda põlvkonna G5-tüüpi bi-LED-projektorite edasiarendus, mille valgusvihk on eelmise mudeliga võrreldes laiem ja tugevam. Sobivad kõigi G5-kinnitusega projektorite asendamiseks ning adapteritega ka teistesse esituledesse. Mõeldud parempoolsesse liiklusse (vasakrooliga autodele).",
      en: "A further development of NHK's fourth-generation G5-type bi-LED projectors, with a wider and stronger beam than the previous model. They replace any projector with a G5 mount, and fit other headlights with adapters. Made for right-hand traffic (left-hand-drive cars).",
    },
    specs: [
      spec(label.function, {
        et: "Bi-LED (lähi- ja kaugtuli)",
        en: "Bi-LED (low and high beam)",
      }),
      spec(label.lensDiameter, same('3"')),
      spec(label.lowBeamFlux, perProjector("3900 lm")),
      spec(label.highBeamFlux, perProjector("5600 lm")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.lowBeamPower, perProjector("50 W")),
      spec(label.highBeamPower, perProjector("55 W")),
      nhkVoltage,
      nhkLifetime,
      ip65,
      spec(label.dimensions, {
        et: "145 × 105 mm (pikkus × laius)",
        en: "145 × 105 mm (length × width)",
      }),
      rightHandTraffic,
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [],
  },
  {
    slug: "nhk-pro",
    sku: "2000000001968",
    name: { et: "NHK Pro+ bi-LED projektorid", en: "NHK Pro+ bi-LED projectors" },
    category: "led-projectors",
    brand: "NHK",
    makes: [],
    price: 253.08,
    stock: "backorder",
    description: {
      et: "NHK 2,5-tollised G5-tüüpi bi-LED-projektorid, mis annavad oma suuruse kohta väga hea valguse. Sobivad kõigi G5-kinnitusega projektorite asendamiseks ning adapteritega ka teistesse esituledesse. Mõeldud parempoolsesse liiklusse (vasakrooliga autodele).",
      en: "NHK 2.5-inch G5-type bi-LED projectors with very good light output for their size. They replace any projector with a G5 mount, and fit other headlights with adapters. Made for right-hand traffic (left-hand-drive cars).",
    },
    specs: [
      spec(label.function, {
        et: "Bi-LED (lähi- ja kaugtuli)",
        en: "Bi-LED (low and high beam)",
      }),
      spec(label.lensDiameter, { et: '2,5"', en: '2.5"' }),
      spec(label.lowBeamFlux, perProjector("2500 lm")),
      spec(label.highBeamFlux, perProjector("4200 lm")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.lowBeamPower, perProjector("35 W")),
      spec(label.highBeamPower, perProjector("45 W")),
      nhkVoltage,
      nhkLifetime,
      ip65,
      spec(label.dimensions, {
        et: "130 × 105 mm (pikkus × laius)",
        en: "130 × 105 mm (length × width)",
      }),
      rightHandTraffic,
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [],
  },
  {
    slug: "nhk-brt",
    sku: "2000000001951",
    name: { et: "NHK BRT LED projektor", en: "NHK BRT LED projector" },
    category: "led-projectors",
    brand: "NHK",
    makes: [],
    price: 253.08,
    stock: "backorder",
    description: {
      et: "NHK BRT LED-projektor esitulede uuendamiseks.",
      en: "The NHK BRT LED projector, for upgrading headlights.",
    },
    specs: [],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Xenon projectors
  // ---------------------------------------------------------------------------------------
  {
    slug: "hella-5r",
    sku: "HL5R",
    name: {
      et: "Hella 5R projektorid (koopia)",
      en: "Hella 5R-style projectors (replica)",
    },
    category: "xenon-projectors",
    brand: "Hella",
    makes: [],
    price: 142.3,
    stock: "backorder",
    description: {
      et: "Edasiarendatud koopia varasematest Hella projektoritest: lai ja ere valgusmuster ning sinaka peegeldusvastase kattega läätsed, mis vähendavad lõikejoone hägusust. Universaalne bi-xenon-projektor, mis sobib õigete adapteritega enamikule autodest. Komplektis kaks projektorit.",
      en: "A further-developed replica of earlier Hella projectors, with a wide, bright beam pattern and blue-tinted anti-reflective lenses that reduce blur along the cut-off line. A universal bi-xenon projector that fits most cars with the right adapters. Supplied as a pair.",
    },
    specs: [
      spec(label.lensDiameter, same('3" (76 mm)')),
      spec(label.dimensions, same("137 × 101 × 85 mm")),
      spec(label.function, {
        et: "Bi-xenon (lähi- ja kaugtuli)",
        en: "Bi-xenon (low and high beam)",
      }),
      spec(label.bulbs, same("D1S, D2S, D3S, D4S")),
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [],
    warrantyYears: 2,
    featured: true,
  },
  {
    slug: "evox-r-2-0",
    sku: "EVOXR2",
    name: { et: "EvoX-R 2.0 projektorid", en: "EvoX-R 2.0 projectors" },
    category: "xenon-projectors",
    brand: "The Retrofit Source",
    makes: [],
    price: 155,
    stock: "backorder",
    description: {
      et: "Kvaliteetne 3-tolline bi-xenon-projektor, mida saab kasutada D1S, D2S, D3S ja D4S xenon-lampidega. Saadaval ainult DOT lõikejoonega. Müüakse paarina.",
      en: "A premium 3-inch bi-xenon projector that works with D1S, D2S, D3S and D4S xenon bulbs. Available with the DOT cut-off only. Sold as a pair.",
    },
    specs: [
      spec(label.lensDiameter, same("76 mm")),
      spec(label.dimensions, same("157 × 108 × 96 mm")),
      spec(label.function, {
        et: "Bi-xenon (lähi- ja kaugtuli)",
        en: "Bi-xenon (low and high beam)",
      }),
      spec(label.bulbs, same("D1S, D2S, D3S, D4S")),
      spec(label.cutOff, { et: "Ainult DOT", en: "DOT only" }),
      spec(label.contents, { et: "2 projektorit", en: "2 projectors" }),
    ],
    fitment: [],
    warrantyYears: 2,
    featured: true,
  },
  {
    slug: "nhk-g5",
    sku: "2000000001739",
    name: { et: "NHK VIP G5 xenon projektor", en: "NHK VIP G5 xenon projector" },
    category: "xenon-projectors",
    brand: "NHK",
    makes: [],
    price: 162.62,
    stock: "backorder",
    description: {
      et: "NHK VIP G5 xenon-projektor esitulede uuendamiseks.",
      en: "The NHK VIP G5 xenon projector, for upgrading headlights.",
    },
    specs: [],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // LED high beams and rings (Tuled: LED kaugtuled, LED rõngad ja ribad)
  // ---------------------------------------------------------------------------------------
  {
    slug: "led-lisakaugtuled-60w",
    sku: "2000000001531",
    name: { et: "LED lisakaugtuled 60 W", en: "60 W auxiliary LED high beams" },
    category: "led-lights",
    makes: [],
    price: 264.26,
    stock: "backorder",
    description: {
      et: "LED-lisakaugtuled on kiireim ja soodsaim viis kaugtulede nähtavuse parandamiseks. Paigaldatavad enamikule sõidukitele ilma esitulesid ümber ehitamata.",
      en: "Auxiliary LED high beams: the fastest and most affordable way to improve high-beam visibility. They can be fitted to most vehicles without rebuilding the headlights.",
    },
    specs: [spec(label.power, same("60 W"))],
    fitment: [],
    featured: true,
  },
  {
    slug: "led-lisakaugtuled-20w",
    sku: "2000000000800",
    name: { et: "LED lisakaugtuled 20 W", en: "20 W auxiliary LED high beams" },
    category: "led-lights",
    brand: "Ether",
    makes: [],
    price: 162.62,
    stock: "backorder",
    description: {
      et: "20 W LED-lisakaugtuled kaugtulede nähtavuse parandamiseks. Lihtne paigaldada enamikule sõidukitele ilma esitulesid ümber ehitamata. E-märgisega, seega lubatud avalikel teedel.",
      en: "20 W auxiliary LED high beams for improving high-beam visibility. Easy to fit to most vehicles without rebuilding the headlights. E-marked, so road legal.",
    },
    specs: [
      spec(label.power, same("20 W")),
      spec(label.luminousFlux, same("1800 lm")),
      spec(label.voltage, same("10–30 V")),
      spec(label.dimensions, same("208 × 61 × 78 mm")),
      spec(label.contents, {
        et: "2 LED-kaugtuld, paigaldustarvikud",
        en: "2 LED high beams, fitting accessories",
      }),
    ],
    fitment: [],
  },
  {
    slug: "hi-lens-led",
    sku: "2000000001050",
    name: { et: "Hi-Lens LED kaugtuled", en: "Hi-Lens LED high beams" },
    category: "led-lights",
    makes: [],
    price: 80.3,
    stock: "backorder",
    description: {
      et: "Esitule sisse paigaldatavad 3-tollised LED-kaugtuled päevatule (DRL) funktsiooniga. Annavad väga ühtlase punktvalguse ja sobivad hästi lisakaugtuleks bi-LED- või bi-xenon-süsteemile. Need on väga lihtne paigaldada H7-soklisse ja väikese ümbertegemisega sobivad peaaegu igasse soklisse. Komplektis kinnitusvahendid H7-sokli jaoks.",
      en: "3-inch LED high beams with a daytime running light (DRL) function, fitted inside the headlight. They give a very even spot beam and suit bi-LED or bi-xenon systems well as an additional high beam. They fit an H7 socket very easily, and almost any socket with a small modification. Includes fixings for an H7 socket.",
    },
    specs: [
      spec(label.power, { et: "25 W (DRL-režiimis 2,5 W)", en: "25 W (2.5 W in DRL mode)" }),
      spec(label.diameter, same('3" (78 mm)')),
      spec(label.dimensions, same("78 × 78 × 92 mm")),
      spec(label.mountingDepth, same("66 mm")),
    ],
    fitment: [],
  },
  {
    slug: "nhk-yg30-kaugtuli",
    sku: "2000000001937",
    name: { et: "NHK YG30 LED kaugtuled", en: "NHK YG30 LED high beams" },
    category: "led-lights",
    brand: "NHK",
    makes: [],
    price: 141.28,
    stock: "backorder",
    description: {
      et: "NHK kolmanda põlvkonna LED-kaugtuled gabariiditule funktsiooniga. Annavad väga ühtlase punktvalguse ja sobivad hästi lisakaugtuleks bi-LED- või bi-xenon-süsteemile. Need on väga lihtne paigaldada H7-soklisse ja väikese ümbertegemisega sobivad peaaegu igasse soklisse.",
      en: "NHK third-generation LED high beams with a position-light function. They give a very even spot beam and suit bi-LED or bi-xenon systems well as an additional high beam. They fit an H7 socket very easily, and almost any socket with a small modification.",
    },
    specs: [
      spec(label.lensDiameter, same('3"')),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.power, { et: "30 W tule kohta", en: "30 W per light" }),
      nhkVoltage,
      nhkLifetime,
      ip65,
      spec(label.dimensions, {
        et: "109 × 75 mm (pikkus × laius)",
        en: "109 × 75 mm (length × width)",
      }),
      spec(label.shaftDiameter, same("21 mm")),
      spec(label.contents, { et: "2 kaugtuld", en: "2 high beams" }),
    ],
    fitment: [],
  },
  {
    slug: "loikega-rongad-bmw",
    sku: "2000000001180",
    name: { et: "LED rõngad lõikega BMW-le", en: "LED rings with cut-out for BMW" },
    category: "led-lights",
    makes: ["BMW"],
    price: 79.28,
    stock: "backorder",
    description: {
      et: "Kvaliteetsed LED-rõngad (nn angel eyes), mis sobivad erinevatele BMW mudelitele. Piimjas kate ja ühtlane 6000 K valge valgus. Komplektis neli 131 mm rõngast, ühenduskomplekt ja paigaldustarvikud.",
      en: 'Quality LED rings ("angel eyes") for various BMW models, with a cut-out, a milky diffuser and an even 6000 K white light. Includes four 131 mm rings, a connection kit and fitting accessories.',
    },
    specs: [
      spec(label.diameter, same("131 mm")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.contents, {
        et: "4 LED-rõngast (131 mm), ühenduskomplekt, paigaldustarvikud",
        en: "4 LED rings (131 mm), connection kit, fitting accessories",
      }),
    ],
    fitment: [same("BMW")],
  },
  {
    slug: "rongad-bmw-x5-e53-pre-facelift",
    sku: "2000000001265",
    name: {
      et: "LED rõngad BMW X5 E53 pre-facelift",
      en: "LED rings for BMW X5 E53 pre-facelift",
    },
    category: "led-lights",
    makes: ["BMW"],
    price: 86.39,
    stock: "backorder",
    description: {
      et: "LED-rõngad (nn angel eyes) esimese põlvkonna BMW X5-le (E53 pre-facelift). Piimjas kate hajutab LED-ide valguse ühtlaseks 6000 K valgeks valguseks. Komplektis kaks 127 mm ja kaks 158 mm rõngast, ühenduskomplekt ja paigaldustarvikud.",
      en: 'LED rings ("angel eyes") for the first-generation BMW X5 (E53 pre-facelift). A milky diffuser spreads the light of the LEDs into an even 6000 K white. Includes two 127 mm and two 158 mm rings, a connection kit and fitting accessories.',
    },
    specs: [
      spec(label.diameter, { et: "127 mm ja 158 mm", en: "127 mm and 158 mm" }),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.contents, {
        et: "2 LED-rõngast (127 mm), 2 LED-rõngast (158 mm), ühenduskomplekt, paigaldustarvikud",
        en: "2 LED rings (127 mm), 2 LED rings (158 mm), connection kit, fitting accessories",
      }),
    ],
    fitment: [same("BMW X5 E53 pre-facelift")],
  },
  {
    slug: "led-demonid-3-luubile-valge",
    sku: "2000000001388",
    name: {
      et: 'LED demonid 3" läätsele, valge',
      en: 'LED demon eyes for 3" lenses, white',
    },
    category: "led-lights",
    makes: [],
    price: 12.2,
    stock: "backorder",
    description: {
      et: "Valged LED-demonid (demon eyes) 3-tollise projektori läätse jaoks.",
      en: "White LED demon eyes for a 3-inch projector lens.",
    },
    specs: [spec(label.lensDiameter, same('3"'))],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Xenon bulbs
  // ---------------------------------------------------------------------------------------
  {
    slug: "philips-d2s-85122xv2-x-tremevision-gen2",
    sku: "85122XV2",
    name: {
      et: "Philips D2S 85122XV2 X-tremeVision Gen2 xenon lamp",
      en: "Philips D2S 85122XV2 X-tremeVision Gen2 xenon bulb",
    },
    category: "xenon-bulbs",
    brand: "Philips",
    makes: [],
    price: 86.39,
    stock: "backorder",
    description: {
      et: "Kuni 150% rohkem valgust kui standardsel xenon-lambil, värvustemperatuur 4800 K. Lambid tuleb vahetada paaris.",
      en: "Up to 150% more light than a standard xenon bulb, at 4800 K. Bulbs should be replaced in pairs.",
    },
    specs: [
      spec(label.base, same("D2S")),
      spec(label.colorTemperature, same("4800 K")),
      spec(label.lightGain, { et: "kuni +150%", en: "up to +150%" }),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-d2s-6000k",
    sku: "2000000001609",
    name: { et: "Yeaky D2S 6000K xenon lambid", en: "Yeaky D2S 6000K xenon bulbs" },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 36.59,
    stock: "backorder",
    description: {
      et: "D2S xenon-lambid värvustemperatuuriga 6000 K. Valgusvoog 3800 lm, eluiga 2500 h, võimsus 35 W.",
      en: "D2S xenon bulbs at 6000 K, with a luminous flux of 3800 lm, a service life of 2500 h and 35 W power.",
    },
    specs: [
      spec(label.base, same("D2S")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.luminousFlux, same("3800 lm")),
      spec(label.lifetime, same("2500 h")),
      spec(label.power, same("35 W")),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-d2s-4300k",
    sku: "2000000000787",
    name: { et: "Yeaky D2S 4300K xenon lambid", en: "Yeaky D2S 4300K xenon bulbs" },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 36.59,
    stock: "backorder",
    description: {
      et: "D2S xenon-lambid värvustemperatuuriga 4300 K (valge valgus), 50% eredamad kui tehaselambid. Valgusvoog 3800 lm, eluiga 2500 h, võimsus 35 W.",
      en: "D2S xenon bulbs at 4300 K (white light), 50% brighter than factory-fitted bulbs. Luminous flux 3800 lm, service life 2500 h, 35 W power.",
    },
    specs: [
      spec(label.base, same("D2S")),
      spec(label.colorTemperature, same("4300 K")),
      spec(label.luminousFlux, same("3800 lm")),
      spec(label.lifetime, same("2500 h")),
      spec(label.power, same("35 W")),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-d4s-4300k",
    sku: "2000000001425",
    name: { et: "Yeaky D4S 4300K xenon lambid", en: "Yeaky D4S 4300K xenon bulbs" },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 36.59,
    stock: "in-stock",
    description: {
      et: "D4S xenon-lambid värvustemperatuuriga 4300 K (valge valgus), 50% eredamad kui tehaselambid. Valgusvoog 3800 lm, eluiga 2500 h, võimsus 35 W.",
      en: "D4S xenon bulbs at 4300 K (white light), 50% brighter than factory-fitted bulbs. Luminous flux 3800 lm, service life 2500 h, 35 W power.",
    },
    specs: [
      spec(label.base, same("D4S")),
      spec(label.colorTemperature, same("4300 K")),
      spec(label.luminousFlux, same("3800 lm")),
      spec(label.lifetime, same("2500 h")),
      spec(label.power, same("35 W")),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-lbs-d2s-5500k",
    sku: "2000000001418",
    name: {
      et: "Yeaky LBS D2S 5500K xenon lamp",
      en: "Yeaky LBS D2S 5500K xenon bulb",
    },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 39.64,
    stock: "backorder",
    description: {
      et: "Yeaky LBS seeria D2S xenon-lamp värvustemperatuuriga 5500 K.",
      en: "Yeaky LBS series D2S xenon bulb at 5500 K.",
    },
    specs: [
      spec(label.base, same("D2S")),
      spec(label.colorTemperature, same("5500 K")),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-lbs-d1s-5500k",
    sku: "2000000001401",
    name: {
      et: "Yeaky LBS D1S 5500K xenon lamp",
      en: "Yeaky LBS D1S 5500K xenon bulb",
    },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 59.97,
    stock: "backorder",
    description: {
      et: "Yeaky LBS seeria D1S xenon-lamp värvustemperatuuriga 5500 K.",
      en: "Yeaky LBS series D1S xenon bulb at 5500 K.",
    },
    specs: [
      spec(label.base, same("D1S")),
      spec(label.colorTemperature, same("5500 K")),
    ],
    fitment: [],
  },
  {
    slug: "h7-4300k-lamp-metall-sokkel",
    sku: "2000000001227",
    name: {
      et: "H7 4300K HID lamp, metallsokkel",
      en: "H7 4300K HID bulb, metal base",
    },
    category: "xenon-bulbs",
    makes: [],
    price: 10.16,
    stock: "backorder",
    description: {
      et: "Võrreldes H7 halogeenlambiga on HID lambi valgustugevus kolm korda suurem ja eluiga kümme korda pikem. Metallsokliga, 4300 K, 35 W, 3200 lm. E-märgis puudub, seega on lamp mõeldud kasutamiseks väljaspool avalikke teid.",
      en: "Compared with an H7 halogen bulb, this HID bulb gives three times the light output and ten times the service life. Metal base, 4300 K, 35 W, 3200 lm. It has no E-mark, so it is for off-road use only.",
    },
    specs: [
      spec(label.base, { et: "H7 (metallsokkel)", en: "H7 (metal base)" }),
      spec(label.colorTemperature, same("4300 K")),
      spec(label.power, same("35 W")),
      spec(label.luminousFlux, same("3200 lm")),
    ],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Ballasts and igniters
  // ---------------------------------------------------------------------------------------
  {
    slug: "hella-5dv-009-replica",
    sku: "2000000001159",
    name: {
      et: "Hella 5DV 009 ballast (koopia)",
      en: "Hella 5DV 009 ballast (replica)",
    },
    category: "ballasts",
    brand: "Hella",
    makes: ["BMW", "Ford", "Mercedes-Benz", "Volkswagen"],
    price: 60.98,
    stock: "backorder",
    description: {
      et: "Soodsam alternatiiv Hella originaalballastile 5DV 009. Sobib nii D1S kui ka D1R lampidega ning paljudele BMW, Volkswageni, Škoda jt autodele.",
      en: "An affordable replica of the original Hella 5DV 009 xenon ballast. Works with both D1S and D1R bulbs and fits many BMW, VW, Škoda and other cars.",
    },
    specs: [spec(label.bulbs, same("D1S, D1R"))],
    fitment: hella5dv009Makers,
  },
  {
    slug: "xenus-5dv009-ballast",
    sku: "2000000001104",
    name: { et: "Xenus 5DV009 ballast", en: "Xenus 5DV009 ballast" },
    category: "ballasts",
    brand: "Xenus",
    makes: ["BMW", "Ford", "Mercedes-Benz", "Volkswagen"],
    price: 66.07,
    stock: "backorder",
    description: {
      et: "Xenuse toodetud soodsam asendus Hella 5DV 009 ballastile ja samaväärsetele originaalballastidele. Sobib nii D1S- kui ka D1R-lampidega ning paljudele Euroopa automudelitele.",
      en: "An affordable Xenus-made replacement for the Hella 5DV 009 and equivalent original ballasts. Works with both D1S and D1R bulbs and suits many European car models.",
    },
    specs: [
      spec(label.bulbs, same("D1S, D1R")),
      spec(label.replaces, same("Hella 5DV009000-00")),
    ],
    fitment: hella5dv009Makers,
  },
  {
    slug: "hella-5dv-008-290-ballast-replica",
    sku: "2000000000831",
    name: {
      et: "Hella 5DV 008 290 ballast (koopia)",
      en: "Hella 5DV 008 290 ballast (replica)",
    },
    category: "ballasts",
    brand: "Hella",
    makes: ["Audi", "BMW", "Ford", "Mercedes-Benz", "Volkswagen"],
    price: 55.9,
    stock: "backorder",
    description: {
      et: "Soodsam koopia Hella originaalballastist 5DV 008 290, millega saab originaali asendada paljudes Euroopa automudelites.",
      en: "An affordable replica of the original Hella 5DV 008 290 xenon ballast, for replacing the original in many European car models.",
    },
    specs: [],
    fitment: [
      same("Audi A6 C6 (2004–2008)"),
      same("Audi A8 D3 (4E) (2002–2010)"),
      { et: "BMW 5. seeria E60/E61 (2003–2005)", en: "BMW 5 Series E60/E61 (2003–2005)" },
      { et: "BMW 7. seeria E65/E66/E67 (2001–2005)", en: "BMW 7 Series E65/E66/E67 (2001–2005)" },
      same("BMW X5 E53 (2003–2006)"),
      same("BMW Z4 E85 (2002–2008)"),
      same("Chrysler Pacifica (2003–2006)"),
      same("Ford C-Max (2003–2007)"),
      same("Ford Focus 1 (1998–2001)"),
      same("Ford Focus 1 (2001–2004)"),
      same("Jaguar S-Type (1999–2007)"),
      same("Jaguar XJ (2003–2006)"),
      same("Jaguar X-Type (2001–2007)"),
      same("Land Rover Range Rover Sport I SE (2005–2010)"),
      same("Maybach 240 (2002–2012)"),
      same("Mercedes-Benz CLS C219 (2004–2010)"),
      { et: "Mercedes-Benz E-klass W211 (2002–2006)", en: "Mercedes-Benz E-Class W211 (2002–2006)" },
      same("Mercedes-Benz GL X164 (2006–2009)"),
      same("Mercedes-Benz ML W163 (2001–2005)"),
      same("Mercedes-Benz ML W164 (2005–2008)"),
      { et: "Mercedes-Benz R-klass W251 (2005–2010)", en: "Mercedes-Benz R-Class W251 (2005–2010)" },
      same("Mercedes-Benz SLK R171 (2004–2011)"),
      same("MG ZT (2001–2005)"),
      same("Nissan Primera P12 (2002–2007)"),
      same("Nissan Qashqai (2007–2010)"),
      same("Opel Astra G (1998–2004)"),
      same("Opel Astra H (2004–2009)"),
      same("Opel Signum (2003–2005)"),
      same("Opel Vectra C (2002–2005)"),
      same("Renault Clio II B (2001–2005)"),
      same("Renault Espace 4 JK (2002–2006)"),
      same("Renault Espace 4 JK Phase I (2006–2010)"),
      same("Renault Scenic II JM (2003–2006)"),
      same("Saab 9-3 (2002–2007)"),
      same("Škoda Superb 3U (2001–2008)"),
      same("Volkswagen Multivan T5 (2003–2009)"),
    ],
  },
  {
    slug: "hella-5dd-008-319-50-suutaja",
    sku: "2000000000824",
    name: {
      et: "Hella 5DD 008 319-50 süütaja (OEM)",
      en: "Hella 5DD 008 319-50 igniter (OEM)",
    },
    category: "ballasts",
    brand: "Hella",
    makes: ["Mercedes-Benz", "BMW"],
    price: 55.9,
    stock: "backorder",
    description: {
      et: "Hella originaalsüütaja (OEM) D1S ja D2S xenon-lampidele. Sobib paljudele Euroopa turu autodele, näiteks Mercedes-Benz E-klass W211 (2003–2006), ML W164 ja BMW.",
      en: "Genuine Hella (OEM) igniter for D1S and D2S xenon bulbs. Suits many European-market cars, for example the Mercedes-Benz E-Class W211 (2003–2006), the ML W164 and BMW.",
    },
    specs: [spec(label.bulbs, same("D1S, D2S"))],
    fitment: [
      {
        et: "Mercedes-Benz E-klass W211 (2003–2006)",
        en: "Mercedes-Benz E-Class W211 (2003–2006)",
      },
      same("Mercedes-Benz ML W164"),
      same("BMW"),
    ],
  },
  {
    slug: "xenus-suutaja-hella",
    sku: "2000000001364",
    name: { et: "Xenus süütaja (Hella)", en: "Xenus igniter (Hella)" },
    category: "ballasts",
    brand: "Xenus",
    makes: [],
    price: 35.57,
    stock: "backorder",
    description: {
      et: "Xenuse xenon-süütaja Hella ballastsüsteemidele.",
      en: "A Xenus xenon igniter for Hella ballast systems.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "xenus-suutaja-al",
    sku: "2000000001340",
    name: { et: "Xenus süütaja (AL)", en: "Xenus igniter (AL)" },
    category: "ballasts",
    brand: "Xenus",
    makes: [],
    price: 35.57,
    stock: "backorder",
    description: {
      et: "Xenuse xenon-süütaja AL ballastsüsteemidele.",
      en: "A Xenus xenon igniter for AL ballast systems.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "hylux-2a88-canbus",
    sku: "2000000001432",
    name: { et: "Hylux 2A88 CANbus ballast", en: "Hylux 2A88 CANbus ballast" },
    category: "ballasts",
    brand: "Hylux",
    makes: [],
    price: 86.39,
    stock: "backorder",
    description: {
      et: "35 W HID ballast, mis sobib paljude järelturu xenon-lampidega. CANbus-funktsioon kustutab lambi veakoodi.",
      en: "A 35 W HID ballast compatible with many aftermarket xenon bulbs. The CANbus function cancels bulb-out error codes.",
    },
    specs: [
      spec(label.power, same("35 W")),
      spec(label.function, {
        et: "CANbus (kustutab veakoodi)",
        en: "CANbus (cancels error codes)",
      }),
    ],
    fitment: [],
  },
  {
    slug: "9-32v-35w-canbus-ballast",
    sku: "2000000001210",
    name: { et: "9–32 V 35 W CANbus ballast", en: "9–32 V 35 W CANbus ballast" },
    category: "ballasts",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "35 W CANbus xenon-ballast toitepingega 9–32 V.",
      en: "A 35 W CANbus xenon ballast for a 9–32 V supply.",
    },
    specs: [
      spec(label.power, same("35 W")),
      spec(label.voltage, same("9–32 V")),
      spec(label.function, same("CANbus")),
      spec(label.ignitionVoltage, same("23 kV")),
      spec(label.connector, {
        et: "9006 pistik; AMP-ühendusega lambid",
        en: "9006 plug; bulbs with an AMP connector",
      }),
      spec(label.lifetime, same("2500 h")),
    ],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Halogen (Halogeen projektorid)
  // ---------------------------------------------------------------------------------------
  {
    slug: "hella-5r-h7",
    sku: "2000000001500",
    name: { et: "Hella 5R H7 projektor", en: "Hella 5R H7 projector" },
    category: "halogen",
    brand: "Hella",
    makes: [],
    price: 142.3,
    stock: "backorder",
    description: {
      et: "Hella 5R projektor H7 halogeenlambile.",
      en: "A Hella 5R projector for an H7 halogen bulb.",
    },
    specs: [spec(label.bulbs, same("H7"))],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Projector shrouds (Projektorite katted)
  // ---------------------------------------------------------------------------------------
  {
    slug: "e46r",
    sku: "E46R",
    name: { et: "E46R projektori kate", en: "E46R projector shroud" },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) E46R, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The E46R projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "e46r-extender",
    sku: "E46REX",
    name: {
      et: "E46R Extender (pikendatud kate)",
      en: "E46R Extender (extended shroud)",
    },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "E46R pikendatud projektori kate (shroud).",
      en: "The extended version of the E46R projector shroud.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "e55-r",
    sku: "S180",
    name: { et: "E55-R projektori kate", en: "E55-R projector shroud" },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) E55-R, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The E55-R projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "ocular",
    sku: "S150",
    name: { et: "Ocular projektori kate", en: "Ocular projector shroud" },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) Ocular, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The Ocular projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "iris",
    sku: "IRIS",
    name: { et: "Iris projektori kate", en: "Iris projector shroud" },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) Iris, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The Iris projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "bullet",
    sku: "S140",
    name: { et: "Bullet projektori kate", en: "Bullet projector shroud" },
    category: "shrouds",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) Bullet, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The Bullet projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "panamera-led",
    sku: "SHPNLD",
    name: { et: "Panamera LED projektori kate", en: "Panamera LED projector shroud" },
    category: "shrouds",
    makes: [],
    price: 60.98,
    stock: "backorder",
    description: {
      et: "Projektori kate (shroud) Panamera LED, mis annab projektorile tehaseliku, viimistletud välimuse.",
      en: "The Panamera LED projector shroud, giving a retrofitted projector a clean, factory-finished look.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "projektorite-katete-adapterid",
    sku: "TSRING",
    name: {
      et: "Projektorite katete adapterid",
      en: "Projector shroud adapter rings",
    },
    category: "shrouds",
    makes: [],
    price: 10.16,
    stock: "in-stock",
    description: {
      et: "Tsentreerivad rõngad, millega saab 2,5-tollistele projektoritele paigaldada 3-tollised katted. Lisatugevuse saamiseks soovitame need ka liimiga kinnitada.",
      en: "Centering rings for fitting 3-inch shrouds to 2.5-inch projectors. For extra strength, we recommend gluing them in place as well.",
    },
    specs: [
      spec(label.projectorSize, { et: '2,5"', en: '2.5"' }),
      spec(label.shroudSize, same('3"')),
    ],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Adapters
  // ---------------------------------------------------------------------------------------
  {
    slug: "zkw-g3-afs-adapterid",
    sku: "2000000001173",
    name: { et: "ZKW G3 AFS adapterid", en: "ZKW G3 AFS adapters" },
    category: "adapters",
    makes: [],
    price: 86.39,
    stock: "backorder",
    description: {
      et: "Adapterid Hella 5R projektorite paigaldamiseks ZKW 3. generatsiooni (G3) AFS-tuledesse.",
      en: "Adapters for fitting Hella 5R projectors into ZKW third-generation (G3) AFS headlights.",
    },
    specs: [],
    fitment: [same("ZKW G3 AFS")],
  },
  {
    slug: "al-bosch-afs-adapterid",
    sku: "2000000001326",
    name: { et: "AL/Bosch AFS adapterid", en: "AL/Bosch AFS adapters" },
    category: "adapters",
    makes: [],
    price: 40.66,
    stock: "backorder",
    description: {
      et: 'AL/Bosch 3" bi-xenon-projektorite asendamiseks Hella 5R projektoritega AFS-tuledes; sobivad ka mitte-AFS-tuledele. Komplektis kõik adapterid ja kinnitusvahendid.',
      en: "For replacing AL/Bosch 3-inch bi-xenon projectors with Hella 5R projectors in AFS headlights; also suitable for non-AFS headlights. Includes all adapters and fixings.",
    },
    specs: [
      spec(label.contents, {
        et: "Kõik adapterid ja kinnitusvahendid",
        en: "All adapters and fixings",
      }),
    ],
    fitment: [same('AL/Bosch AFS, 3"')],
  },
  {
    slug: "al-bosch-adapterid",
    sku: "2000000001456",
    name: { et: "AL/Bosch adapterid", en: "AL/Bosch adapters" },
    category: "adapters",
    makes: [],
    price: 25.41,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks AL/Boschi projektoriga esituledesse.",
      en: "Adapters for fitting projectors into headlights with an AL/Bosch projector.",
    },
    specs: [],
    fitment: [same("AL/Bosch")],
  },
  {
    slug: "hella-e55-afs-adapterid",
    sku: "2000000001319",
    name: { et: "Hella E55 AFS adapterid", en: "Hella E55 AFS adapters" },
    category: "adapters",
    makes: [],
    price: 55.9,
    stock: "backorder",
    description: {
      et: "Levinud Hella 2. ja 4. generatsiooni projektorite asendamiseks Hella 5R projektoritega AFS-tuledes.",
      en: "For replacing the common Hella gen. 2 and gen. 4 projectors with Hella 5R projectors in AFS headlights.",
    },
    specs: [],
    fitment: [
      {
        et: "Hella E55 AFS (2. ja 4. generatsioon)",
        en: "Hella E55 AFS (gen. 2 and gen. 4)",
      },
    ],
  },
  {
    slug: "valeo-1-adapterid",
    sku: "2000000001555",
    name: { et: "Valeo 1 adapterid", en: "Valeo 1 adapters" },
    category: "adapters",
    makes: [],
    price: 25.41,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks Valeo 1 projektoriga esituledesse.",
      en: "Adapters for fitting projectors into headlights with a Valeo 1 projector.",
    },
    specs: [],
    fitment: [same("Valeo 1")],
  },
  {
    slug: "valeo-2-adapterid",
    sku: "VALG2",
    name: { et: "Valeo 2 adapterid", en: "Valeo 2 adapters" },
    category: "adapters",
    makes: [],
    price: 25.41,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks Valeo 2 projektoriga esituledesse.",
      en: "Adapters for fitting projectors into headlights with a Valeo 2 projector.",
    },
    specs: [],
    fitment: [same("Valeo 2")],
  },
  {
    slug: "valeo-2-afs-adapterid",
    sku: "VALG2AF",
    name: { et: "Valeo 2 AFS adapterid", en: "Valeo 2 AFS adapters" },
    category: "adapters",
    makes: [],
    price: 45.74,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks Valeo 2 AFS-esituledesse.",
      en: "Adapters for fitting projectors into Valeo 2 AFS headlights.",
    },
    specs: [],
    fitment: [same("Valeo 2 AFS")],
  },
  {
    slug: "koito-xenon-lahitulede-adapterid",
    sku: "2000000001166",
    name: { et: "Koito xenon lähitulede adapterid", en: "Koito xenon low-beam adapters" },
    category: "adapters",
    makes: [],
    price: 25.41,
    stock: "backorder",
    description: {
      et: "Paigaldusadapterid Koito originaalsete lähitule projektorite asendamiseks Hella 5R bi-xenon-projektoritega. Komplektis adapterid ja kinnitustarvikud.",
      en: "Adapters for replacing original Koito low-beam projectors with Hella 5R bi-xenon projectors. Includes the adapters and fixings.",
    },
    specs: [
      spec(label.contents, {
        et: "Adapterid ja kinnitustarvikud",
        en: "Adapters and fixings",
      }),
    ],
    fitment: [{ et: "Koito xenon lähituli", en: "Koito xenon low beam" }],
  },
  {
    slug: "bosch-25-xenon-lahitulede-adapterid",
    sku: "2000000001081",
    name: {
      et: 'Bosch 2,5" xenon lähitulede adapterid',
      en: 'Bosch 2.5" xenon low-beam adapters',
    },
    category: "adapters",
    makes: ["Audi", "BMW", "Ford", "Mazda"],
    price: 35.57,
    stock: "in-stock",
    description: {
      et: 'Bosch 2,5" läätsega lähitule projektorite asendamiseks 4TL-R projektoritega. Komplektis adapterid ja kõik kinnitusvahendid. Sobivus näiteks Audi A4 B5, Audi A8 D2, BMW E38, BMW E46, Ford Mondeo MK3 ja Mazda 6 GG1.',
      en: 'For replacing Bosch 2.5" low-beam projectors with 4TL-R projectors. Includes the adapters and all fixings. Suits, for example, the Audi A4 B5, Audi A8 D2, BMW E38, BMW E46, Ford Mondeo MK3 and Mazda 6 GG1.',
    },
    specs: [
      spec(label.contents, {
        et: "Adapterid ja kõik kinnitusvahendid",
        en: "Adapters and all fixings",
      }),
    ],
    fitment: [
      same("Audi A4 B5"),
      {
        et: "Audi A8 D2 (xenon-projektoriga tuled)",
        en: "Audi A8 D2 (xenon projector headlights)",
      },
      same("BMW E38"),
      {
        et: "BMW E46 (pre-facelift, xenon-lähituledega)",
        en: "BMW E46 (pre-facelift, xenon low beams)",
      },
      same("Ford Mondeo MK3"),
      same("Mazda 6 GG1"),
    ],
  },
  {
    slug: "rx330-afs-adapterid",
    sku: "2000000001548",
    name: { et: "Lexus RX330 AFS adapterid", en: "Lexus RX330 AFS adapters" },
    category: "adapters",
    makes: ["Lexus"],
    price: 39.64,
    stock: "in-stock",
    description: {
      et: "Projektorite adapterid Lexus RX330 AFS-esitulede jaoks.",
      en: "Projector adapters for Lexus RX330 AFS headlights.",
    },
    specs: [],
    fitment: [same("Lexus RX330 AFS")],
  },
  {
    slug: "lexus-gs-afs-adapterid",
    sku: "2000000001647",
    name: { et: "Lexus GS AFS adapterid", en: "Lexus GS AFS adapters" },
    category: "adapters",
    makes: ["Lexus"],
    price: 45.74,
    stock: "backorder",
    description: {
      et: "Projektorite adapterid Lexus GS AFS-esitulede jaoks.",
      en: "Projector adapters for Lexus GS AFS headlights.",
    },
    specs: [],
    fitment: [same("Lexus GS AFS")],
  },
  {
    slug: "bmw-e36-adapterid",
    sku: "AD36FX",
    name: { et: "BMW E36 adapterid", en: "BMW E36 adapters" },
    category: "adapters",
    makes: ["BMW"],
    price: 30.49,
    stock: "in-stock",
    description: {
      et: "Adapterid projektorite paigaldamiseks BMW E36 esituledesse.",
      en: "Projector retrofit adapters for BMW E36 headlights.",
    },
    specs: [],
    fitment: [same("BMW E36")],
  },
  {
    slug: "bmw-e39-pre-fl-adapterid",
    sku: "PR39G5",
    name: { et: "BMW E39 pre-facelift adapterid", en: "BMW E39 pre-facelift adapters" },
    category: "adapters",
    makes: ["BMW"],
    price: 25.41,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks BMW 5. seeria E39 pre-facelift esituledesse.",
      en: "Adapters for fitting projectors into BMW 5 Series E39 pre-facelift headlights.",
    },
    specs: [],
    fitment: [{ et: "BMW 5. seeria E39 pre-facelift", en: "BMW 5 Series E39 pre-facelift" }],
  },
  {
    slug: "bmw-e70-non-afs-adapterid",
    sku: "2000000001678",
    name: { et: "BMW E70 non-AFS adapterid", en: "BMW E70 non-AFS adapters" },
    category: "adapters",
    makes: ["BMW"],
    price: 35.57,
    stock: "backorder",
    description: {
      et: "Adapterid projektorite paigaldamiseks BMW X5 E70 AFS-ita esituledesse.",
      en: "Adapters for fitting projectors into BMW X5 E70 headlights without AFS.",
    },
    specs: [],
    fitment: [{ et: "BMW X5 E70 (AFS-ita)", en: "BMW X5 E70 (non-AFS)" }],
  },
  {
    slug: "ford-mondeo-mk4",
    sku: "2000000000855",
    name: { et: "Ford Mondeo MK4 adapterid", en: "Ford Mondeo MK4 adapters" },
    category: "adapters",
    makes: ["Ford"],
    price: 20.33,
    stock: "backorder",
    description: {
      et: "Adapterid Ford Mondeo MK4 (2007–2014) tehase bi-xenon-projektorite asendamiseks Hella 5R projektoritega.",
      en: "Adapters for replacing the factory bi-xenon projectors of the Ford Mondeo MK4 (2007–2014) with Hella 5R projectors.",
    },
    specs: [],
    fitment: [same("Ford Mondeo MK4 (2007–2014)")],
  },

  // ---------------------------------------------------------------------------------------
  // Installation accessories and spare parts (Tarvikud)
  // ---------------------------------------------------------------------------------------
  {
    slug: "oci-butuulliim",
    sku: "OCIB",
    name: { et: "OCI butüülliim", en: "OCI butyl sealant" },
    category: "fitting",
    brand: "OCI",
    makes: [],
    price: 30.49,
    stock: "backorder",
    description: {
      et: "Butüülliim esitulede uuesti tihendamiseks, köis pikkusega 4,5 m.",
      en: "Butyl sealant rope, 4.5 m, for resealing headlight housings.",
    },
    specs: [spec(label.length, { et: "4,5 m", en: "4.5 m" })],
    fitment: [],
  },
  {
    slug: "ohuti",
    sku: "2000000000862",
    name: { et: "Õhuti", en: "Headlight breather vent" },
    category: "fitting",
    makes: [],
    price: 10.16,
    stock: "backorder",
    description: {
      et: "Lahendus esitulede sisse koguneva niiskuse vastu: suurendab õhuringlust tule sees. Paigaldatakse 12 mm auku tule korpuse ülaosas ja kinnitatakse mutriga. Komplektis 2 tk.",
      en: "A solution for moisture building up inside headlights: it improves air circulation. Fitted into a 12 mm hole in the top of the headlight housing and secured with a nut. Includes 2 pieces.",
    },
    specs: [
      spec(label.hole, same("12 mm")),
      spec(label.contents, { et: "2 tk", en: "2 pieces" }),
    ],
    fitment: [],
  },
  {
    slug: "ferriit-rongad",
    sku: "EMIFR",
    name: { et: "Ferriitrõngad", en: "Ferrite rings" },
    category: "fitting",
    makes: [],
    price: 10.16,
    stock: "backorder",
    description: {
      et: "Ferriitrõngad häirete ja CANbus-vigade vähendamiseks HID- ja LED-valgustite juures.",
      en: "Ferrite (EMI) rings that suppress interference and CANbus errors with HID and LED lighting.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "d2s-amp-uleminek",
    sku: "D2AMP",
    name: { et: "D2S–AMP üleminek", en: "D2S-to-AMP adapter" },
    category: "fitting",
    makes: [],
    price: 15.25,
    stock: "in-stock",
    description: {
      et: "D2S–AMP pistiku üleminek HID-juhtmestiku ühendamiseks.",
      en: "D2S-to-AMP connector adapter for HID wiring.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "amp-d2s-uleminek",
    sku: "AMPD2",
    name: { et: "AMP–D2S üleminek", en: "AMP-to-D2S adapter" },
    category: "fitting",
    makes: [],
    price: 15.25,
    stock: "backorder",
    description: {
      et: "AMP–D2S pistiku üleminek HID-juhtmestiku ühendamiseks.",
      en: "AMP-to-D2S connector adapter for HID wiring.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "hb4-9006-pesa",
    sku: "2000000001234",
    name: { et: "HB4/9006 pesa", en: "HB4/9006 socket" },
    category: "fitting",
    makes: [],
    price: 1.22,
    stock: "backorder",
    description: {
      et: "HB4/9006 pistikupesa juhtmestiku ühendamiseks.",
      en: "An HB4/9006 connector socket for wiring.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "hb4-jagur",
    sku: "2000000001074",
    name: { et: "HB4 jagur", en: "HB4 splitter" },
    category: "fitting",
    makes: [],
    price: 15.25,
    stock: "in-stock",
    description: {
      et: "Jagur HB4-ühenduse jaoks.",
      en: "A splitter for an HB4 connection.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "can-bus-veateate-eemaldid",
    sku: "2000000001463",
    name: { et: "CAN-bus veateate eemaldajad", en: "CAN-bus error cancellers" },
    category: "fitting",
    makes: [],
    price: 15.25,
    stock: "in-stock",
    description: {
      et: "CAN-bus-veaeemaldajad, mis kustutavad lambi rikketeate.",
      en: "CAN-bus error cancellers that clear the bulb-out error message.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "h7-can-bus-veaeemaldi",
    sku: "2000000001524",
    name: { et: "H7 CAN-bus veaeemaldi", en: "H7 CAN-bus error canceller" },
    category: "fitting",
    makes: [],
    price: 12.1,
    stock: "in-stock",
    description: {
      et: "CAN-bus veaeemaldi H7-lampidele, mis kustutab lambi veateate.",
      en: "A CAN-bus error canceller for H7 bulbs that clears the bulb-out error message.",
    },
    specs: [spec(label.base, same("H7"))],
    fitment: [],
  },
  {
    slug: "t10-can-bus-veaeemaldi",
    sku: "2000000001517",
    name: { et: "T10 CAN-bus veaeemaldi", en: "T10 CAN-bus error canceller" },
    category: "fitting",
    makes: [],
    price: 10.06,
    stock: "in-stock",
    description: {
      et: "CAN-bus veaeemaldi T10-lampidele, mis kustutab lambi veateate.",
      en: "A CAN-bus error canceller for T10 bulbs that clears the bulb-out error message.",
    },
    specs: [spec(label.base, same("T10"))],
    fitment: [],
  },
  {
    slug: "reguleervardad-bmw-e39-pre-fl-95-00",
    sku: "PRE39RV",
    name: {
      et: "Reguleervardad BMW E39 pre-facelift (1995–2000)",
      en: "Headlight adjuster rods BMW E39 pre-facelift (1995–2000)",
    },
    category: "fitting",
    makes: ["BMW"],
    price: 10.16,
    stock: "backorder",
    description: {
      et: "Tulede reguleervardad mudelile BMW 5. seeria E39 pre-facelift. Komplektis 2 varrast ehk ühe tule remondikomplekt.",
      en: "Headlight adjuster rods for the BMW 5 Series E39 pre-facelift. Includes 2 rods, a repair kit for one headlight.",
    },
    specs: [
      modelYears("1995–2000"),
      spec(label.contents, {
        et: "2 varrast (ühe tule remondikomplekt)",
        en: "2 rods (repair kit for one headlight)",
      }),
    ],
    fitment: [{ et: "BMW 5. seeria E39 pre-facelift", en: "BMW 5 Series E39 pre-facelift" }],
  },
  {
    slug: "reguleervardad-bmw-e39-fl",
    sku: "E39RGV",
    name: {
      et: "Reguleervardad BMW E39 facelift",
      en: "Headlight adjuster rods BMW E39 facelift",
    },
    category: "fitting",
    makes: ["BMW"],
    price: 10.16,
    stock: "backorder",
    description: {
      et: "Tulede reguleervardad mudelile BMW 5. seeria E39 facelift. Komplektis 2 varrast ehk ühe tule remondikomplekt.",
      en: "Headlight adjuster rods for the BMW 5 Series E39 facelift. Includes 2 rods, a repair kit for one headlight.",
    },
    specs: [
      spec(label.contents, {
        et: "2 varrast (ühe tule remondikomplekt)",
        en: "2 rods (repair kit for one headlight)",
      }),
    ],
    fitment: [{ et: "BMW 5. seeria E39 facelift", en: "BMW 5 Series E39 facelift" }],
  },
  {
    slug: "drl-torud-avensis-t27",
    sku: "2000000002132",
    name: { et: "DRL torud Toyota Avensis T27", en: "DRL light tubes Toyota Avensis T27" },
    category: "fitting",
    makes: ["Toyota"],
    price: 156.24,
    stock: "backorder",
    description: {
      et: "Päevatulede (DRL) torud mudelile Toyota Avensis T27.",
      en: "Daytime running light (DRL) light tubes for the Toyota Avensis T27.",
    },
    specs: [],
    fitment: [same("Toyota Avensis T27")],
  },
  {
    slug: "drl-torud-scania-r",
    sku: "2000000002118",
    name: { et: "DRL torud Scania R", en: "DRL light tubes Scania R" },
    category: "fitting",
    makes: [],
    price: 91.76,
    stock: "backorder",
    description: {
      et: "Päevatulede (DRL) torud Scania R-seeria veokile.",
      en: "Daytime running light (DRL) light tubes for the Scania R-series truck.",
    },
    specs: [],
    fitment: [same("Scania R")],
  },
  {
    slug: "drl-plaat-scania-r",
    sku: "2000000002125",
    name: { et: "DRL plaat Scania R", en: "DRL plate Scania R" },
    category: "fitting",
    makes: [],
    price: 57.04,
    stock: "backorder",
    description: {
      et: "Päevatulede (DRL) plaat Scania R-seeria veokile.",
      en: "Daytime running light (DRL) plate for the Scania R-series truck.",
    },
    specs: [],
    fitment: [same("Scania R")],
  },
];
