import type { Localized } from "@/lib/i18n";

export const makes = {
  eyebrow: { et: "Automargid", en: "Car makes" },
  title: { et: "Vali oma automark", en: "Find parts for your make" },
  intro: {
    et: "Tuleklaasid, projektorid ja adapterid on kataloogis automarkide kaupa. Vali mark ja näed, mis sinu autole sobib.",
    en: "Our catalog sorts lenses, projectors and adapters by make. Pick yours to see what fits.",
  },
  viewParts: { et: "Vaata tooteid", en: "View parts" },
  productCount: {
    et: (n: number) => (n === 1 ? "1 toode" : `${n} toodet`),
    en: (n: number) => (n === 1 ? "1 product" : `${n} products`),
  } satisfies Localized<(n: number) => string>,

  motoTitle: { et: "Mootorrattad", en: "Motorcycles" },
  /** The price itself comes from site.pricing ("moto"). */
  motoBody: {
    et: "Paigaldame projektoreid ka mootorrataste esituledesse. Hind on ühe esitule kohta.",
    en: "We fit projectors into motorcycle headlights too. The price is per headlight.",
  },

  anyCar: {
    et: "Töötame pea kõigi automarkidega – küsi julgelt",
    en: "We work with almost every make — just ask",
  },
  anyCarBody: {
    et: "Olenemata auto päritolust, vanusest või tulede ehitusest.",
    en: "Whatever its origin, age or headlight design.",
  },
} satisfies Record<string, Localized<unknown>>;
