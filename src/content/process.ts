import type { Localized } from "@/lib/i18n";

export interface ProcessStep {
  id: "request" | "offer" | "installation" | "warranty";
  title: Localized<string>;
  /** `{years}` is replaced with site.warrantyYears, `{email}` with a link to site.email. */
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
    et: "Enne töö algust tead täpselt, mida teeme ja mis see maksab.",
    en: "Before any work starts, you know exactly what we'll do and what it costs.",
  },
  steps: [
    {
      id: "request",
      title: { et: "Päring", en: "Request" },
      body: {
        // The form takes no files, so the photo goes by email.
        et: "Kirjuta meile auto mark ja mudel kontaktivormi kaudu või e-postiga. Foto tuledest saada aadressil {email}.",
        en: "Tell us your car's make and model through the contact form or by email. Send a photo of the headlights to {email}.",
      },
      tag: { et: "E-post või vorm", en: "Email or form" },
    },
    {
      id: "offer",
      title: { et: "Pakkumine", en: "Offer" },
      body: {
        et: "Vaatame info üle ja saadame sulle konkreetse pakkumise.",
        en: "We review the details and send you a firm quote.",
      },
      tag: { et: "Konkreetne hind", en: "A firm price" },
    },
    {
      id: "installation",
      title: { et: "Paigaldus", en: "Installation" },
      body: {
        et: "Töö tehakse meie Tallinna töökojas. Olenevalt tuledest kulub selleks 1–4\u00a0tööpäeva.",
        en: "We do the work at our Tallinn workshop. Depending on the headlights, it takes 1–4\u00a0working days.",
      },
      tag: { et: "1–4 tööpäeva", en: "1–4 working days" },
    },
    {
      id: "warranty",
      title: { et: "Garantii", en: "Warranty" },
      body: {
        et: "Projektoritele kehtib {years}-aastane garantii. Kõik tooted on meil endal ära testitud.",
        en: "Projectors carry a {years}-year warranty, and we have tested every product ourselves.",
      },
      tag: { et: "{years} aastat", en: "{years} years" },
    },
  ] satisfies ProcessStep[],
};
