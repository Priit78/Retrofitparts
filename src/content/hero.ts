import { site } from "@/content/site";
import type { Locale, Localized } from "@/lib/i18n";

/** Joins a list as natural prose: "A, B ja C" / "A, B and C". */
function joinList(items: readonly string[], locale: Locale): string {
  if (items.length < 2) return items.join("");
  const and = locale === "et" ? "ja" : "and";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

export type TrustIcon = "experience" | "warranty" | "representative" | "workshop";

export interface TrustItem {
  icon: TrustIcon;
  title: Localized<string>;
  detail: Localized<string>;
}

/** Copy for the hero and the brand marquee. The h1 is `site.tagline`. */
export const hero = {
  eyebrow: {
    et: "Bi-LED ja bi-xenon · Tallinn",
    en: "Bi-LED and bi-xenon · Tallinn",
  } satisfies Localized<string>,

  subline: {
    et: `Projektorite paigaldus, tuleklaaside vahetus ja esitulede taastamine – meie Tallinna töökojas alates ${site.founded}. aastast.`,
    en: `Projector retrofits, lens replacement and headlight restoration – at our Tallinn workshop since ${site.founded}.`,
  } satisfies Localized<string>,

  /** Accessible name for the trust strip list. */
  trustLabel: {
    et: "Miks Retrofit Parts",
    en: "Why Retrofit Parts",
  } satisfies Localized<string>,

  trust: [
    {
      icon: "experience",
      title: {
        et: `${site.experienceYears} aastat kogemust`,
        en: `${site.experienceYears} years of experience`,
      },
      detail: {
        et: "esitulede taastamisel",
        en: "in headlight restoration",
      },
    },
    {
      icon: "warranty",
      title: {
        et: `${site.warrantyYears}-aastane garantii`,
        en: `${site.warrantyYears}-year warranty`,
      },
      detail: {
        et: "projektoritele",
        en: "on projectors",
      },
    },
    {
      icon: "representative",
      title: {
        et: "Ametlik esindaja",
        en: "Official representative",
      },
      detail: {
        et: joinList(site.representedBrands, "et"),
        en: joinList(site.representedBrands, "en"),
      },
    },
    {
      icon: "workshop",
      title: {
        et: "Töökoda Tallinnas",
        en: "Workshop in Tallinn",
      },
      detail: {
        et: site.address.street,
        en: site.address.street,
      },
    },
  ] satisfies TrustItem[],

  marquee: {
    heading: {
      et: "Brändid, millega töötame",
      en: "Brands we work with",
    },
    representative: {
      et: "Ametlik esindaja",
      en: "Official representative",
    },
    pause: {
      et: "Peata brändide liikumine",
      en: "Pause brand scrolling",
    },
  } satisfies Record<string, Localized<string>>,
};
