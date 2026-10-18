import type { Localized } from "@/lib/i18n";

/**
 * Search and social-sharing copy. Company facts (address, phone, hours) are not repeated here;
 * the structured data reads them from `site.ts`.
 */

/** Child pages set only their own title; the brand name is appended to it. */
export const titleTemplate = "%s · Retrofit Parts";

export interface SeoCopy {
  /** Default title, used on the home page. Keep it within about 60 characters. */
  title: string;
  /** Meta description, 80 to 160 characters. */
  description: string;
  /** Open Graph locale. */
  ogLocale: string;
  /** Small line above the hero h1 on the social-sharing image. */
  ogKicker: string;
}

export const seoCopy: Localized<SeoCopy> = {
  et: {
    title: "Retrofit Parts · Esitulede taastamine ja retrofit Tallinnas",
    description:
      "Esitulede retrofit ja taastamine Tallinnas: bi-LED- ja bi-xenon-projektorid ning tuleklaasid. Morimoto, Bimmerjakes ja Strands brändide ametlik esindaja Eestis.",
    ogLocale: "et_EE",
    ogKicker: "Esitulede retrofit · Tallinn",
  },
  en: {
    title: "Retrofit Parts · Headlight retrofit & restoration, Tallinn",
    description:
      "Headlight retrofit and restoration in Tallinn: bi-LED and bi-xenon projectors, lenses, fitting. Official Morimoto, Bimmerjakes and Strands representative.",
    ogLocale: "en_US",
    ogKicker: "Headlight retrofits · Tallinn",
  },
};
