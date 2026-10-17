import type { Localized } from "@/lib/i18n";
import { formatPrice } from "@/lib/format";
import type { Category, Product, ProductSpec } from "./types";

/**
 * Product catalog, converted from the 63 entries captured from the old WooCommerce shop.
 *
 * - Prices are EUR including 24% VAT, as captured; `null` means "ask for price".
 * - `stock` is "in-stock" only where the capture said so; everything else is ordered in
 *   ("backorder").
 * - `makes` only holds values from `site.vehicleMakes`; it is derived from the product name
 *   or the fitment text. Universal parts have none.
 * - `fitment` is model text from the old site's fitment lists, one string per vehicle, in
 *   the Estonian model naming ("3. seeria"). `Product.fitment` is not localized. Model
 *   years are only given where the old site stated them.
 * - Brands are normalised for the brand filter ("Hella (replica)" and "Hella (OEM)" are
 *   both "Hella"; the replica/OEM distinction stays in the product name).
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
  lensDiameter: { et: "Läätse läbimõõt", en: "Lens diameter" },
  dimensions: { et: "Mõõdud", en: "Dimensions" },
  bulbs: { et: "Sobivad lambid", en: "Compatible bulbs" },
  base: { et: "Sokkel", en: "Bulb base" },
  cutOff: { et: "Lõikejoon", en: "Cut-off" },
  colorTemperature: { et: "Värvustemperatuur", en: "Color temperature" },
  luminousFlux: { et: "Valgusvoog", en: "Luminous flux" },
  lightGain: { et: "Valgust võrreldes standardlambiga", en: "Light vs. standard bulb" },
  power: { et: "Võimsus", en: "Power" },
  voltage: { et: "Pinge", en: "Voltage" },
  lifetime: { et: "Eluiga", en: "Service life" },
  diameter: { et: "Läbimõõt", en: "Diameter" },
  length: { et: "Pikkus", en: "Length" },
  hole: { et: "Paigaldusauk", en: "Mounting hole" },
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

export const categories: Category[] = [
  {
    id: "lenses",
    name: { et: "Tuleklaasid", en: "Headlight lenses" },
    description: {
      et: "Uued tuleklaasid paarina, millega saab tuhmunud või kahjustatud esitule välisklaasi välja vahetada.",
      en: "New replacement headlight lenses, sold as left-and-right pairs, for replacing hazed or damaged outer lenses.",
    },
  },
  {
    id: "led-projectors",
    name: { et: "LED projektorid", en: "LED projectors" },
    description: {
      et: "Bi-LED projektorid esitulede uuendamiseks, mis annavad lähi- ja kaugtule ühest moodulist.",
      en: "Bi-LED projectors for upgrading headlights, with low and high beam from a single unit.",
    },
  },
  {
    id: "xenon-projectors",
    name: { et: "Xenon projektorid", en: "Xenon projectors" },
    description: {
      et: "Bi-xenon projektorid, mis annavad lähi- ja kaugtule ühes moodulis ning sobivad õigete adapteritega paljudesse esituledesse.",
      en: "Bi-xenon projectors with low and high beam in one unit, fitting many headlights with the right adapters.",
    },
  },
  {
    id: "led-lights",
    name: { et: "LED kaugtuled ja rõngad", en: "LED high beams & rings" },
    description: {
      et: "LED lisakaugtuled kaugtulede nähtavuse parandamiseks ja LED rõngad BMW esitulede jaoks.",
      en: "Auxiliary LED high beams for better high-beam visibility, and LED rings for BMW headlights.",
    },
  },
  {
    id: "xenon-bulbs",
    name: { et: "Xenon lambid", en: "Xenon bulbs" },
    description: {
      et: "Xenon- ja HID-lambid D1S-, D2S- ja H7-sokliga esitulede uuendamiseks ja asendamiseks.",
      en: "Xenon and HID bulbs with D1S, D2S and H7 bases, for upgrading or replacing headlight bulbs.",
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
      et: "Halogeenlambid esitulede lampide asendamiseks.",
      en: "Halogen bulbs for replacing headlight bulbs.",
    },
  },
  {
    id: "shrouds",
    name: { et: "Projektorite katted", en: "Projector shrouds" },
    description: {
      et: "Projektorite katted (shroud), mis annavad ümberehitatud esitulele tehaseliku, viimistletud välimuse.",
      en: "Projector shrouds that give a retrofitted headlight a clean, factory-finished look.",
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
      et: "Paigaldustarvikud: butüülliim, õhutid, ferriitrõngad ja pistikuadapterid.",
      en: "Installation accessories: butyl sealant, breather vents, ferrite rings and connector adapters.",
    },
  },
];

export const products: Product[] = [
  // ---------------------------------------------------------------------------------------
  // Headlight lenses (Tuleklaasid): sold as a left/right pair
  // ---------------------------------------------------------------------------------------
  {
    slug: "tuleklaasid-e90-e91-xenon-tuledele",
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
    fitment: ["BMW 3. seeria E90/E91 (xenon)"],
    featured: true,
  },
  {
    slug: "tuleklaasid-e90-e91-halogeen-tuledele",
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
    fitment: ["BMW 3. seeria E90/E91 (halogeen)"],
  },
  {
    slug: "tuleklaasid-e46-kupee",
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
    fitment: ["BMW 3. seeria E46 Coupe/Cabrio"],
  },
  {
    slug: "tuleklaasid-e46-sedaan-touring",
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
    fitment: ["BMW 3. seeria E46 Sedan/Touring"],
  },
  {
    slug: "tuleklaasid-e46-fl-sedaan-touring",
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
    fitment: ["BMW 3. seeria E46 facelift Sedan/Touring"],
  },
  {
    slug: "tuleklaasid-e46-fl-kupee",
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
    fitment: ["BMW 3. seeria E46 facelift Coupe/Cabrio"],
  },
  {
    slug: "tuleklaasid-e39-fl",
    name: {
      et: "Tuleklaasid BMW 5. seeria E39 facelift",
      en: "Headlight lenses BMW 5 Series E39 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 162.62,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria E39 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series E39 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2001–2003"), lensPair],
    fitment: ["BMW 5. seeria E39 facelift"],
  },
  {
    slug: "tuleklaasid-e60",
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
    fitment: ["BMW 5. seeria E60/E61"],
  },
  {
    slug: "tuleklaasid-f10",
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
    fitment: ["BMW 5. seeria F10/F11"],
  },
  {
    slug: "tuleklaasid-f07-gt",
    name: {
      et: "Tuleklaasid BMW 5. seeria F07 GT",
      en: "Headlight lenses BMW 5 Series F07 GT",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 128.07,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW 5. seeria F07 GT. Sobivad xenon-tuledele; ei sobi Full Adaptive LED tuledele. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW 5 Series F07 GT. Suitable for xenon headlights; not suitable for Full Adaptive LED headlights. ${lensInstall.en}`,
    },
    specs: [modelYears("2009–2016"), lensPair, singleLens(70.13)],
    fitment: ["BMW 5. seeria F07 GT (xenon)"],
  },
  {
    slug: "tuleklaasid-e65-fl",
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
    fitment: ["BMW 7. seeria E65 facelift"],
  },
  {
    slug: "tuleklaasid-bmw-7-seeria-f01-f02",
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
    fitment: ["BMW 7. seeria F01/F02 (xenon ja LED)"],
  },
  {
    slug: "tuleklaasid-e70-x5",
    name: {
      et: "Tuleklaasid BMW X5 E70",
      en: "Headlight lenses BMW X5 E70",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 121.97,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X5 E70. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X5 E70. ${lensInstall.en}`,
    },
    specs: [modelYears("2006–2013"), lensPair, singleLens(66.07)],
    fitment: ["BMW X5 E70"],
  },
  {
    slug: "tuleklaasid-e53-x5-pre-fl",
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
    fitment: ["BMW X5 E53 pre-facelift"],
  },
  {
    slug: "tuleklaasid-e53-x5-fl",
    name: {
      et: "Tuleklaasid BMW X5 E53 facelift",
      en: "Headlight lenses BMW X5 E53 facelift",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 320,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X5 E53 facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X5 E53 facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2004–2006"), lensPair],
    fitment: ["BMW X5 E53 facelift"],
  },
  {
    slug: "tuleklaasid-e71-x6",
    name: {
      et: "Tuleklaasid BMW X6 E71",
      en: "Headlight lenses BMW X6 E71",
    },
    category: "lenses",
    makes: ["BMW"],
    price: 142.3,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile BMW X6 E71. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the BMW X6 E71. ${lensInstall.en}`,
    },
    specs: [modelYears("2008–2014"), lensPair, singleLens(76.23)],
    fitment: ["BMW X6 E71"],
  },
  {
    slug: "tuleklaasid-e84-x1",
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
    specs: [modelYears("2008–2015"), lensPair],
    fitment: ["BMW X1 E84"],
  },
  {
    slug: "tuleklaasid-golf-7",
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
    fitment: ["Volkswagen Golf 7"],
  },
  {
    slug: "tuleklaasid-a6-c6-4f",
    name: {
      et: "Tuleklaasid Audi A6 C6 4F",
      en: "Headlight lenses Audi A6 C6 4F",
    },
    category: "lenses",
    makes: ["Audi"],
    price: 100, // approximate in the source ("about €100")
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Audi A6 C6 (4F). ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Audi A6 C6 (4F). ${lensInstall.en}`,
    },
    specs: [modelYears("2004–2011"), lensPair],
    fitment: ["Audi A6 C6 (4F)"],
  },
  {
    slug: "tuleklaasid-a6-c7-pre-facelift",
    name: {
      et: "Tuleklaasid Audi A6 C7 4G pre-facelift",
      en: "Headlight lenses Audi A6 C7 4G pre-facelift",
    },
    category: "lenses",
    makes: ["Audi"],
    price: 222, // approximate in the source
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Audi A6 C7 (4G) pre-facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Audi A6 C7 (4G) pre-facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2011–2014"), lensPair],
    fitment: ["Audi A6 C7 (4G) pre-facelift"],
  },
  {
    slug: "tuleklaasid-w251-pre-fl",
    name: {
      et: "Tuleklaasid Mercedes-Benz R-klass W251 pre-facelift",
      en: "Headlight lenses Mercedes-Benz R-Class W251 pre-facelift",
    },
    category: "lenses",
    makes: ["Mercedes-Benz"],
    price: 290, // approximate in the source
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Mercedes-Benz R-klass W251 pre-facelift. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Mercedes-Benz R-Class W251 pre-facelift. ${lensInstall.en}`,
    },
    specs: [modelYears("2006–2010"), lensPair],
    fitment: ["Mercedes-Benz R-klass W251 pre-facelift"],
  },
  {
    slug: "tuleklaasid-w211",
    name: {
      et: "Tuleklaasid Mercedes-Benz E-klass W211",
      en: "Headlight lenses Mercedes-Benz E-Class W211",
    },
    category: "lenses",
    makes: ["Mercedes-Benz"],
    price: 142.3,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Mercedes-Benz E-klass W211. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Mercedes-Benz E-Class W211. ${lensInstall.en}`,
    },
    specs: [lensPair],
    fitment: ["Mercedes-Benz E-klass W211"],
  },
  {
    slug: "tuleklaasid-crv-gen-3",
    name: {
      et: "Tuleklaasid Honda CR-V 3. põlvkond",
      en: "Headlight lenses Honda CR-V Gen 3",
    },
    category: "lenses",
    makes: ["Honda"],
    price: 139, // approximate in the source (€139 to about €141 in different snapshots)
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Honda CR-V 3. põlvkond. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the third-generation Honda CR-V. ${lensInstall.en}`,
    },
    specs: [modelYears("2007–2011"), lensPair],
    fitment: ["Honda CR-V 3. põlvkond"],
  },
  {
    slug: "tuleklaasid-rx",
    name: {
      et: "Tuleklaasid Lexus RX XU30",
      en: "Headlight lenses Lexus RX XU30",
    },
    category: "lenses",
    makes: ["Lexus"],
    price: 183, // approximate in the source
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Lexus RX XU30. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Lexus RX XU30. ${lensInstall.en}`,
    },
    specs: [modelYears("2003–2008"), lensPair],
    fitment: ["Lexus RX XU30"],
  },
  {
    slug: "tuleklaasid-s60-iii",
    name: {
      et: "Tuleklaasid Volvo S60 III",
      en: "Headlight lenses Volvo S60 III",
    },
    category: "lenses",
    makes: ["Volvo"],
    price: null,
    stock: "backorder",
    description: {
      et: `Uute tuleklaaside komplekt (parem ja vasak) mudelile Volvo S60 III. ${lensInstall.et}`,
      en: `Set of new replacement headlight lenses (left and right) for the Volvo S60 III. ${lensInstall.en}`,
    },
    specs: [modelYears("2019+"), lensPair],
    fitment: ["Volvo S60 III"],
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
      et: "Integreeritud juhtplokiga 3-tolline bi-LED projektor, mis annab nii lähi- kui ka kaugtule ning lisaks päevatule (DRL) režiimi. Komplektis kaks projektorit. Sobib paljudele Jaapani päritolu sõidukitele alates 2015. aastast.",
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
    fitment: ["Jaapani autod 2015+ / Japanese cars 2015+"],
    warrantyYears: 2,
    featured: true,
  },
  {
    slug: "yike-profile-i-lens-2-0",
    name: {
      et: "Yike (Profile) I-Lens 2.0 projektor",
      en: "Yike (Profile) I-Lens 2.0 projector",
    },
    category: "led-projectors",
    brand: "Yike",
    makes: [],
    price: 280,
    stock: "backorder",
    description: {
      et: "Bi-LED projektor Yike (Profile) I-Lens 2.0, mis annab nii lähi- kui ka kaugtule.",
      en: "The Yike (Profile) I-Lens 2.0 bi-LED projector, giving both low and high beam.",
    },
    specs: [spec(label.function, same("Bi-LED"))],
    fitment: [],
    featured: true,
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
      et: "Edasiarendatud koopia varasematest Hella projektoritest: lai ja ere valgusmuster ning sinaka peegeldusvastase kattega läätsed, mis vähendavad lõikejoone hägusust. Universaalne bi-xenon projektor, mis sobib õigete adapteritega enamikule autodest. Komplektis kaks projektorit.",
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
      et: "Kvaliteetne 3-tolline bi-xenon projektor, mida saab kasutada D1S, D2S, D3S ja D4S xenon-lampidega. Saadaval ainult DOT lõikejoonega. Müüakse paarina.",
      en: "A premium 3-inch bi-xenon projector that works with D1S, D2S, D3S and D4S xenon bulbs. Available with the DOT cut-off only. Sold as a pair.",
    },
    specs: [
      spec(label.lensDiameter, same("76 mm")),
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
    slug: "4tl-r",
    name: { et: "4TL-R bi-xenon projektorid", en: "4TL-R bi-xenon projectors" },
    category: "xenon-projectors",
    makes: [],
    price: null,
    stock: "backorder",
    description: {
      et: 'Bi-xenon projektorid 4TL-R. Bosch 2,5" projektorite asendamiseks on neile saadaval sobivad Bosch 2,5" adapterid.',
      en: 'The 4TL-R bi-xenon projectors. Matching Bosch 2.5" adapters are available for replacing Bosch 2.5" projectors with them.',
    },
    specs: [spec(label.function, same("Bi-xenon"))],
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
      et: "LED lisakaugtuled on kiireim ja soodsaim viis kaugtulede nähtavuse parandamiseks. Paigaldatavad enamikule sõidukitele ilma esitulesid ümber ehitamata.",
      en: "Auxiliary LED high beams: the fastest and most affordable way to improve high-beam visibility. They can be fitted to most vehicles without rebuilding the headlights.",
    },
    specs: [spec(label.power, same("60 W"))],
    fitment: [],
    featured: true,
  },
  {
    slug: "led-lisakaugtuled-20w",
    name: { et: "LED lisakaugtuled 20 W", en: "20 W auxiliary LED high beams" },
    category: "led-lights",
    makes: [],
    price: 162.62,
    stock: "backorder",
    description: {
      et: "20 W LED lisakaugtuled kaugtulede nähtavuse parandamiseks.",
      en: "20 W auxiliary LED high beams for improving high-beam visibility.",
    },
    specs: [spec(label.power, same("20 W"))],
    fitment: [],
  },
  {
    slug: "hi-lens-led-kaugtuled",
    name: { et: "Hi-Lens LED kaugtuled", en: "Hi-Lens LED high beams" },
    category: "led-lights",
    makes: [],
    price: 80.3,
    stock: "backorder",
    description: {
      et: "Hi-Lens LED kaugtuled kaugtulede nähtavuse parandamiseks.",
      en: "Hi-Lens LED high-beam units for improving high-beam visibility.",
    },
    specs: [],
    fitment: [],
  },
  {
    slug: "loikega-rongad-bmw",
    name: { et: "LED rõngad lõikega BMW-le", en: "LED rings with cut-out for BMW" },
    category: "led-lights",
    makes: ["BMW"],
    price: 79.28,
    stock: "backorder",
    description: {
      et: "Kvaliteetsed LED rõngad (nn angel eyes), mis sobivad erinevatele BMW mudelitele. Piimjas kate ja ühtlane 6000 K valge valgus. Komplektis neli 131 mm rõngast, ühenduskomplekt ja paigaldustarvikud.",
      en: 'Quality LED rings ("angel eyes") for various BMW models, with a cut-out, a milky diffuser and an even 6000 K white light. Includes four 131 mm rings, a connection kit and fitting accessories.',
    },
    specs: [
      spec(label.diameter, same("131 mm")),
      spec(label.colorTemperature, same("6000 K")),
      spec(label.contents, {
        et: "4 LED rõngast (131 mm), ühenduskomplekt, paigaldustarvikud",
        en: "4 LED rings (131 mm), connection kit, fitting accessories",
      }),
    ],
    fitment: ["BMW"],
  },

  // ---------------------------------------------------------------------------------------
  // Xenon bulbs
  // ---------------------------------------------------------------------------------------
  {
    slug: "philips-d2s-85122xv2-x-tremevision-gen2",
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
    slug: "yeaky-d1s-4300k",
    name: { et: "Yeaky D1S 4300K xenon lambid", en: "Yeaky D1S 4300K xenon bulbs" },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 55,
    stock: "backorder",
    description: {
      et: "D1S xenon-lambid tehaselampidega sarnase värvustemperatuuriga 4300 K ja 50% eredamad kui OEM-lambid. Valgusvoog 3800 lm, eluiga 2500 h, võimsus 35 W.",
      en: "D1S xenon bulbs at 4300 K, close to the factory color, and 50% brighter than OEM bulbs. Luminous flux 3800 lm, service life 2500 h, 35 W power.",
    },
    specs: [
      spec(label.base, same("D1S")),
      spec(label.colorTemperature, same("4300 K")),
      spec(label.luminousFlux, same("3800 lm")),
      spec(label.lifetime, same("2500 h")),
      spec(label.power, same("35 W")),
    ],
    fitment: [],
  },
  {
    slug: "yeaky-lbs-d2s-5500k",
    name: {
      et: "Yeaky LBS D2S 5500K xenon lamp",
      en: "Yeaky LBS D2S 5500K xenon bulb",
    },
    category: "xenon-bulbs",
    brand: "Yeaky",
    makes: [],
    price: 39,
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
      et: "Võrreldes H7 halogeenlambiga on HID lambi valgustugevus kolm korda suurem ja eluiga kümme korda pikem. Metallsokliga, 4300 K, 35 W, 3200 lm.",
      en: "Compared with an H7 halogen bulb, this HID bulb gives three times the light output and ten times the service life. Metal base, 4300 K, 35 W, 3200 lm.",
    },
    specs: [
      spec(label.base, { et: "H7 (metallsokkel)", en: "H7 (metal base)" }),
      spec(label.colorTemperature, same("4300 K")),
      spec(label.power, same("35 W")),
      spec(label.luminousFlux, same("3200 lm")),
    ],
    fitment: [],
  },
  {
    slug: "osram-d1s-66140cbi-xenarc-cool-blue-intense",
    name: {
      et: "Osram D1S 66140CBI Xenarc Cool Blue Intense",
      en: "Osram D1S 66140CBI Xenarc Cool Blue Intense",
    },
    category: "xenon-bulbs",
    brand: "Osram",
    makes: [],
    price: null,
    stock: "backorder",
    description: {
      et: "Osram Xenarc Cool Blue Intense D1S xenon-lamp.",
      en: "Osram Xenarc Cool Blue Intense D1S xenon bulb.",
    },
    specs: [spec(label.base, same("D1S"))],
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
    makes: ["BMW", "Volkswagen"],
    price: 60.98,
    stock: "backorder",
    description: {
      et: "Soodsam alternatiiv Hella originaalballastile 5DV 009. Sobib nii D1S kui ka D1R lampidega ning paljudele BMW, Volkswageni, Škoda jt autodele.",
      en: "An affordable replica of the original Hella 5DV 009 xenon ballast. Works with both D1S and D1R bulbs and fits many BMW, VW, Škoda and other cars.",
    },
    specs: [spec(label.bulbs, same("D1S, D1R"))],
    fitment: ["BMW", "Volkswagen", "Škoda"],
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
      "Mercedes-Benz E-klass W211 (2003–2006)",
      "Mercedes-Benz ML W164",
      "BMW",
    ],
  },
  {
    slug: "xenus-suutaja-hella",
    sku: "2000000001364",
    name: { et: "Xenus süütaja (Hella)", en: "Xenus-type igniter (Hella)" },
    category: "ballasts",
    brand: "Hella",
    makes: [],
    price: 35.57,
    stock: "backorder",
    description: {
      et: "Xenus tüüpi xenon-süütaja Hella ballastsüsteemidele.",
      en: "Xenus-type xenon igniter for Hella ballast systems.",
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
    slug: "canbus-ballast-9-32v-35w",
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
    ],
    fitment: [],
  },

  // ---------------------------------------------------------------------------------------
  // Halogen
  // ---------------------------------------------------------------------------------------
  {
    slug: "osram-cool-blue-intense-h1-12v-55w",
    name: {
      et: "Osram Cool Blue Intense H1 12 V 55 W",
      en: "Osram Cool Blue Intense H1 12 V 55 W",
    },
    category: "halogen",
    brand: "Osram",
    makes: [],
    price: null,
    stock: "backorder",
    description: {
      et: "Osram Cool Blue Intense H1 halogeenlamp, 12 V, 55 W.",
      en: "Osram Cool Blue Intense H1 halogen bulb, 12 V, 55 W.",
    },
    specs: [
      spec(label.base, same("H1")),
      spec(label.voltage, same("12 V")),
      spec(label.power, same("55 W")),
    ],
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
    name: {
      et: "E46R Extender (pikendatud kate)",
      en: "E46R Extender (extended shroud)",
    },
    category: "shrouds",
    brand: "The Retrofit Source",
    makes: [],
    price: null,
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

  // ---------------------------------------------------------------------------------------
  // Adapters
  // ---------------------------------------------------------------------------------------
  {
    slug: "zkw-g3-afs-adapterid",
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
    fitment: ["ZKW G3 AFS"],
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
      et: 'AL/Bosch 3" bi-xenon projektorite asendamiseks Hella 5R projektoritega AFS-tuledes; sobivad ka mitte-AFS tuledele. Komplektis kõik adapterid ja kinnitusvahendid.',
      en: "For replacing AL/Bosch 3-inch bi-xenon projectors with Hella 5R projectors in AFS headlights; also suitable for non-AFS headlights. Includes all adapters and fixings.",
    },
    specs: [
      spec(label.contents, {
        et: "Kõik adapterid ja kinnitusvahendid",
        en: "All adapters and fixings",
      }),
    ],
    fitment: ['AL/Bosch AFS, 3"'],
  },
  {
    slug: "hella-e55-afs-adapterid",
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
    fitment: ["Hella E55 AFS (gen 2 / gen 4)"],
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
      et: 'Bosch 2,5" läätsega lähitule projektorite asendamiseks 4TL-R projektoritega. Komplektis adapterid ja kõik kinnitusvahendid. Sobivus näiteks Audi A4 B5, BMW E38, BMW E46, Ford Mondeo MK3 ja Mazda 6 GG1.',
      en: 'For replacing Bosch 2.5" low-beam projectors with 4TL-R projectors. Includes the adapters and all fixings. Suits, for example, the Audi A4 B5, BMW E38, BMW E46, Ford Mondeo MK3 and Mazda 6 GG1.',
    },
    specs: [
      spec(label.contents, {
        et: "Adapterid ja kõik kinnitusvahendid",
        en: "Adapters and all fixings",
      }),
    ],
    fitment: [
      "Audi A4 B5",
      "BMW E38",
      "BMW E46",
      "Ford Mondeo MK3",
      "Mazda 6 GG1",
    ],
  },
  {
    slug: "rx330-afs-adapterid",
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
    fitment: ["Lexus RX330 AFS"],
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
    fitment: ["BMW E36"],
  },
  {
    slug: "ford-mondeo-mk4",
    name: { et: "Ford Mondeo MK4 adapterid", en: "Ford Mondeo MK4 adapters" },
    category: "adapters",
    makes: ["Ford"],
    price: 20.33,
    stock: "backorder",
    description: {
      et: "Adapterid Ford Mondeo MK4 (2007–2014) tehase bi-xenon projektorite asendamiseks Hella 5R projektoritega.",
      en: "Adapters for replacing the factory bi-xenon projectors of the Ford Mondeo MK4 (2007–2014) with Hella 5R projectors.",
    },
    specs: [],
    fitment: ["Ford Mondeo MK4 (2007–2014)"],
  },

  // ---------------------------------------------------------------------------------------
  // Installation accessories (Paigaldustarvikud)
  // ---------------------------------------------------------------------------------------
  {
    slug: "oci-butuulliim",
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
    name: { et: "D2S–AMP üleminek", en: "D2S-to-AMP adapter" },
    category: "fitting",
    makes: [],
    price: 15.25,
    stock: "backorder",
    description: {
      et: "D2S–AMP pistiku üleminek HID-juhtmestiku ühendamiseks.",
      en: "D2S-to-AMP connector adapter for HID wiring.",
    },
    specs: [],
    fitment: [],
  },
];
