import type { Localized } from "@/lib/i18n";

export interface ProcessStep {
  id: "request" | "offer" | "installation" | "warranty";
  title: Localized<string>;
  /** `{years}` is replaced with site.warrantyYears. */
  body: Localized<string>;
  /** Short fact in mono type. `{years}` comes from site.ts. */
  tag: Localized<string>;
}

export const processCopy = {
  eyebrow: { et: "Tööprotsess", en: "Process" },
  title: {
    et: "Neli sammu päringust valmis tuledeni",
    en: "Four steps from request to finished lights",
  },
  intro: {
    et: "Enne töö algust tead täpselt, mida teeme, mis see maksab ja kui kaua aega võtab.",
    en: "Before any work starts, you know exactly what we'll do, what it costs and how long it takes.",
  },
  steps: [
    {
      id: "request",
      title: { et: "Päring", en: "Request" },
      body: {
        et: "Saada meile auto mark, mudel ja foto tuledest – e-postiga või kontaktivormi kaudu.",
        en: "Send us your car's make and model with a photo of the headlights, by email or through the contact form.",
      },
      tag: { et: "E-post või vorm", en: "Email or form" },
    },
    {
      id: "offer",
      title: { et: "Pakkumine", en: "Offer" },
      body: {
        et: "Vaatame info üle ja saadame konkreetse pakkumise koos hinna ja tööajaga.",
        en: "We review the details and send a firm quote with the price and turnaround.",
      },
      tag: { et: "Konkreetne hind", en: "A firm price" },
    },
    {
      id: "installation",
      title: { et: "Paigaldus", en: "Installation" },
      body: {
        et: "Töö tehakse meie Tallinna töökojas. Olenevalt tuledest kulub selleks 1–4 tööpäeva.",
        en: "We do the work at our Tallinn workshop. Depending on the headlights, it takes 1–4 working days.",
      },
      tag: { et: "1–4 tööpäeva", en: "1–4 working days" },
    },
    {
      id: "warranty",
      title: { et: "Garantii", en: "Warranty" },
      body: {
        et: "Projektoritele kehtib {years}-aastane garantii. Kõik tooted, mida paigaldame, oleme ise läbi testinud.",
        en: "Projectors carry a {years}-year warranty, and we test every product we fit ourselves.",
      },
      tag: { et: "{years} aastat", en: "{years} years" },
    },
  ] satisfies ProcessStep[],
};
