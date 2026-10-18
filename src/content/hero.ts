import { site } from "@/content/site";
import type { Locale, Localized } from "@/lib/i18n";

/** Joins a list as natural prose: "A, B ja C" / "A, B and C". */
function joinList(items: readonly string[], locale: Locale): string {
  if (items.length < 2) return items.join("");
  const and = locale === "et" ? "ja" : "and";
  return `${items.slice(0, -1).join(", ")} ${and} ${items[items.length - 1]}`;
}

export interface TrustItem {
  id: "experience" | "warranty" | "representative" | "workshop";
  title: Localized<string>;
  detail: Localized<string>;
}

/** Copy for the landing hero. Facts come from `site.ts`. */
export const hero = {
  eyebrow: {
    et: "Esitulede retrofit · Tallinn",
    en: "Headlight retrofits · Tallinn",
  } satisfies Localized<string>,

  /** The h1, one sentence per line. */
  title: {
    et: ["Selge valgus.", "Kindel töö."],
    en: ["Clear light.", "Solid work."],
  } satisfies Localized<string[]>,

  lead: {
    et: `Paigaldame bi-LED- ja bi-xenon-projektoreid, vahetame tuhmunud tuleklaase ja taastame esitulesid. Oma töökojas Tallinnas, alates ${site.founded}. aastast.`,
    en: `We fit bi-LED and bi-xenon projectors, replace hazed lenses and restore headlights. All in our own Tallinn workshop, since ${site.founded}.`,
  } satisfies Localized<string>,

  photoAlt: {
    et: "Musta BMW LED-esituli valgete päevatuledega pimedas",
    en: "A black BMW's LED headlight with white daytime running lights, in the dark",
  } satisfies Localized<string>,

  /** Accessible name for the trust row. */
  trustLabel: {
    et: "Miks Retrofit Parts",
    en: "Why Retrofit Parts",
  } satisfies Localized<string>,

  trust: [
    {
      id: "experience",
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
      id: "warranty",
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
      id: "representative",
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
      id: "workshop",
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
};
