import type { Localized } from "@/lib/i18n";

/**
 * Single source of truth for company facts. Everything that shows contact details,
 * opening hours, the address or installation prices reads it from here.
 * Items the client still has to confirm are tracked in docs/CONTENT-TODO.md.
 */

export type PricingId = "butyl" | "glued" | "moto";

export interface PricingItem {
  id: PricingId;
  label: Localized<string>;
  priceEur: number;
  /** Turnaround, when the old site stated one. */
  duration: Localized<string> | null;
}

export interface OpeningHours {
  days: Localized<string>;
  /** null = closed */
  time: string | null;
}

export interface NavItem {
  id: "services" | "catalog" | "process" | "faq" | "contact";
  href: string;
  label: Localized<string>;
}

const address = {
  street: "Pärnu mnt 160F",
  postalCode: "11317",
  city: "Tallinn",
  country: { et: "Eesti", en: "Estonia" } as Localized<string>,
};

export const site = {
  name: "Retrofit Parts",
  legalName: "Retrofit Parts OÜ",
  regCode: "12908331",
  vat: "EE101821324",
  founded: 2015,

  phone: "+372 5667 0631",
  phoneHref: "tel:+37256670631",
  email: "info@retrofitparts.ee",
  address,
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${address.street}, ${address.postalCode} ${address.city}`,
  )}`,
  hours: [
    { days: { et: "E–N", en: "Mon–Thu" }, time: "09:00–18:00" },
    { days: { et: "R–P", en: "Fri–Sun" }, time: null },
  ] satisfies OpeningHours[],
  facebook: "https://www.facebook.com/p/Retrofit-Parts-100057357583960/",

  tagline: {
    et: "Parimad valguslahendused sinu sõidukile",
    en: "The best lighting solutions for your vehicle",
  } satisfies Localized<string>,

  /** Brands Retrofit Parts officially represents in Estonia. */
  representedBrands: ["Morimoto", "Bimmerjakes", "Strands"],
  /**
   * Canonical car makes; product data uses exactly these strings, and the landing page's make
   * grid shows them in this order. Trucks (Scania) are left out: search still finds them.
   */
  vehicleMakes: [
    "BMW",
    "Audi",
    "Volkswagen",
    "Mercedes-Benz",
    "Lexus",
    "Honda",
    "Ford",
    "Mazda",
    "Volvo",
    "Toyota",
  ],

  /** Indicative installation prices incl. VAT; exact quote on request. */
  pricing: [
    {
      id: "butyl",
      label: {
        et: "Sõiduauto, butüülliimiga tuled",
        en: "Car with butyl-sealed headlights",
      },
      priceEur: 150,
      duration: { et: "1–2 tööpäeva", en: "1–2 working days" },
    },
    {
      id: "glued",
      label: {
        et: "Sõiduauto, kerealiimiga tuled",
        en: "Car with permanently glued headlights",
      },
      priceEur: 300,
      duration: { et: "2–4 tööpäeva", en: "2–4 working days" },
    },
    {
      id: "moto",
      label: {
        et: "Mootorratas, üks esituli",
        en: "Motorcycle, one headlight",
      },
      priceEur: 90,
      duration: null,
    },
  ] satisfies PricingItem[],

  warrantyYears: 2,
  experienceYears: "10+",

  nav: [
    { id: "services", href: "#services", label: { et: "Teenused", en: "Services" } },
    { id: "catalog", href: "/catalog", label: { et: "Kataloog", en: "Catalog" } },
    { id: "process", href: "#process", label: { et: "Tööprotsess", en: "Process" } },
    { id: "faq", href: "#faq", label: { et: "KKK", en: "FAQ" } },
    { id: "contact", href: "#contact", label: { et: "Kontakt", en: "Contact" } },
  ] satisfies NavItem[],
};
