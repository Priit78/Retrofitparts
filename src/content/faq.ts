import type { Localized } from "@/lib/i18n";

export interface FaqItem {
  id: "fitment" | "out-of-stock" | "not-in-catalog" | "dim-lights" | "polish-or-replace";
  question: Localized<string>;
  /** `{email}` is replaced with the address from site.ts (a link on the page). */
  answer: Localized<string>;
}

export const faq = {
  eyebrow: { et: "KKK", en: "FAQ" },
  title: { et: "Korduma kippuvad küsimused", en: "Frequently asked questions" },
  /** `{email}` and `{phone}` come from site.ts. */
  more: {
    et: "Ei leidnud vastust? Kirjuta {email} või helista {phone}.",
    en: "Didn't find your answer? Email {email} or call {phone}.",
  },
  items: [
    {
      id: "fitment",
      question: {
        et: "Kuidas ma tean, kas toode sobib minu autole?",
        en: "How do I know a product fits my car?",
      },
      answer: {
        et: "Toodete juures on välja toodud autod, millele toode sobib. Kui sa oma autot nimekirjast ei leia, kirjuta meile aadressil {email} ja vastame esimesel võimalusel.",
        en: "The product pages list the cars a product fits. If yours isn't on the list, email us at {email} and we'll reply as soon as we can.",
      },
    },
    {
      id: "out-of-stock",
      question: {
        et: "Kas saan tellida toodet, mis on laost otsas?",
        en: "Can I order a product that's out of stock?",
      },
      answer: {
        et: "Jah. Tellimuse võtame vastu ja täidame olenemata laoseisust, tarneaeg on siis lihtsalt pikem. Iga toote juures on näha, kas see on laos või saadaval järeltellimisel.",
        en: "Yes. We accept and fulfill the order regardless of stock; delivery just takes longer. Each product shows whether it is in stock or available on backorder.",
      },
    },
    {
      id: "not-in-catalog",
      question: {
        et: "Mida teha, kui vajalikku toodet kataloogis pole?",
        en: "What if the product I need isn't in the catalog?",
      },
      answer: {
        et: "Morimoto, Bimmerjakes ja Strands brändide kataloogidest saab tellida kõiki tooteid, mis on tootja laos saadaval. Võta meiega ühendust ja saadame konkreetse pakkumise.",
        en: "Anything in the Morimoto, Bimmerjakes and Strands catalogs can be ordered while the manufacturer has it in stock. Get in touch and we'll send you a firm quote.",
      },
    },
    {
      id: "dim-lights",
      question: {
        et: "Miks mu esituled nii nõrgalt valgustavad?",
        en: "Why are my headlights so dim?",
      },
      answer: {
        et: "Aja jooksul teeb kuumus oma töö: reflektori pind saab kahjustada ja valgus muutub tuhmiks. Lahenduseks on projektori väljavahetamine. Kui tules projektorit pole ja valgust suunab ainult reflektor, on ainus lahendus terve tule vahetus.",
        en: "Heat takes its toll over time: the reflector surface degrades and the light turns dull. The fix is a new projector. If the headlight has no projector and relies on a reflector alone, the only solution is replacing the whole unit.",
      },
    },
    {
      id: "polish-or-replace",
      question: {
        et: "Kas tuled tasub poleerida või vahetada?",
        en: "Should I polish my headlights or replace them?",
      },
      answer: {
        et: "Poleerimine on kõige odavam, kuid ajutine lahendus. Pärast poleerimist on klaasi pind välistele kahjustustele palju vastuvõtlikum, tule seest mustust kätte ei saa ja sageli valgust juurde ei tulegi. Meie vahetame kahjustatud osad – ette uue tuleklaasi, sisse uue projektori – ning tulemus on vähemalt sama hea kui tehasest tulles.",
        en: "Polishing is the cheapest fix, but only a temporary one. Afterwards the lens surface is far more vulnerable to damage, dirt inside the light can't be reached, and often you gain no light at all. We replace the damaged parts instead: a new lens in front and a new projector inside, for results at least as good as factory.",
      },
    },
  ] satisfies FaqItem[],
};
