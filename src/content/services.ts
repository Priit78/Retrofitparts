import type { Locale, Localized } from "@/lib/i18n";

export type ServiceId =
  | "projector-retrofit"
  | "lens-replacement"
  | "restoration"
  | "led-high-beams"
  | "afs"
  | "resealing"
  | "xenon-repair"
  | "special-orders";

export interface ServiceItem {
  id: ServiceId;
  title: Localized<string>;
  body: Localized<string>;
}

/** A whole-euro price in the locale's style: "150 €" in Estonian, "€150" in English. */
export function formatEur(locale: Locale, eur: number): string {
  return new Intl.NumberFormat(locale === "et" ? "et-EE" : "en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(eur);
}

export const services = {
  eyebrow: { et: "Hinnad", en: "Prices" },
  title: { et: "Projektorite paigaldus", en: "Projector installation" },
  intro: {
    et: "Hinnad sisaldavad käibemaksu ja on orienteeruvad. Täpse pakkumise teeme sinu auto põhjal: saada mark, mudel ja foto tuledest.",
    en: "Prices include VAT and are indicative. We quote exactly for your car: send us its make, model and a photo of the headlights.",
  },

  priceTable: {
    colVehicle: { et: "Sõiduk", en: "Vehicle" },
    colDuration: { et: "Valmimisaeg", en: "Turnaround" },
    colPrice: { et: "Hind", en: "Price" },
    from: { et: "alates", en: "from" },
    /** Shown when site.pricing has no stated turnaround. */
    durationOnRequest: { et: "kokkuleppel", en: "by arrangement" },
    /** `{email}` is replaced with the address from site.ts. */
    notSure: {
      et: "Ei tea, millised tuled sinu autol on? Saada foto aadressil {email}.",
      en: "Not sure which kind your car has? Send a photo to {email}.",
    },
  },

  /** The service list below the prices. */
  list: {
    eyebrow: { et: "Teenused", en: "Services" },
    title: {
      et: "Tulede taastamine ja remont kindlalt partnerilt",
      en: "Headlight restoration and repair you can rely on",
    },
    intro: {
      et: "Vahetame tuleklaase ning paigaldame uusi projektoreid ja lisatulesid. Paigaldusteenus on olemas kõigile toodetele, mida müüme.",
      en: "We replace lenses and fit new projectors and auxiliary lights. Installation is available for every product we sell.",
    },
  },

  /** Each body is one line: the essentials of the service, kept faithful to the old site. */
  items: [
    {
      id: "projector-retrofit",
      title: { et: "Projektorite paigaldus", en: "Projector retrofit" },
      body: {
        et: "Bi-LED-, bi-xenon- ja halogeenprojektorid nii reflektor- kui ka projektortuledesse, terava valguspiiriga.",
        en: "Bi-LED, bi-xenon and halogen projectors for reflector and projector headlights alike, with a sharp cutoff.",
      },
    },
    {
      id: "lens-replacement",
      title: { et: "Tuleklaaside vahetus", en: "Lens replacement" },
      body: {
        et: "Kollase või kriimulise klaasi asemele uus, mis annab pimedas oluliselt parema nähtavuse.",
        en: "A new lens in place of a yellowed or scratched one, for much better visibility in the dark.",
      },
    },
    {
      id: "restoration",
      title: { et: "Tulede taastamine", en: "Headlight restoration" },
      body: {
        et: "Kuumusest kulunud projektori asemele uus, tulemus vähemalt sama hea kui tehasest tulles.",
        en: "A new projector in place of a heat-worn one, for results at least as good as factory.",
      },
    },
    {
      id: "led-high-beams",
      title: { et: "LED-lisakaugtuled", en: "LED auxiliary high beams" },
      body: {
        et: "Kiireim ja odavaim viis kaugtulede nähtavust parandada, ilma esitulesid ümber ehitamata.",
        en: "The quickest, most affordable way to better high beams, without rebuilding your headlights.",
      },
    },
    {
      id: "afs",
      title: { et: "AFS-tulede projektorid", en: "AFS projector swaps" },
      body: {
        et: "Adapteriga Hella 5R projektor AFS-tuledesse; adapterid on olemas BMW, Lexuse ja Fordi tuledele.",
        en: "A Hella 5R projector for AFS headlights via an adapter; we have adapters for BMW, Lexus and Ford.",
      },
    },
    {
      id: "resealing",
      title: { et: "Tihendamine ja niiskus", en: "Resealing and moisture" },
      body: {
        et: "Niiske tule korpuse tihendame uuesti butüüliga ja paigaldame vajadusel õhuti.",
        en: "We reseal a damp housing with butyl and fit a breather vent where needed.",
      },
    },
    {
      id: "xenon-repair",
      title: { et: "Xenon-süsteemi remont", en: "Xenon repair" },
      body: {
        et: "Ballasti, süüturi või pirni vahetus Hella, Philipsi, Osrami ja Hyluxi osadega.",
        en: "A new ballast, igniter or bulb, with parts from Hella, Philips, Osram and Hylux.",
      },
    },
    {
      id: "special-orders",
      title: { et: "Eritellimused", en: "Special orders" },
      body: {
        et: "Morimoto, Bimmerjakes ja Strands ametliku esindajana Eestis tellime kõike, mis on tootja laos olemas.",
        en: "As the official Estonian representative of Morimoto, Bimmerjakes and Strands, we order anything the maker has in stock.",
      },
    },
  ] satisfies ServiceItem[],
};
