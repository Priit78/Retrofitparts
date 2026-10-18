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

  /** Each body is one sentence in the "we" voice: the essentials of the service, kept faithful to the old site. */
  items: [
    {
      id: "projector-retrofit",
      title: { et: "Projektorite paigaldus", en: "Projector retrofit" },
      body: {
        et: "Paigaldame bi-LED-, bi-xenon- ja halogeenprojektoreid nii reflektor- kui ka projektortuledesse – valguspiir on terav.",
        en: "We fit bi-LED, bi-xenon and halogen projectors into reflector and projector headlights alike, for a sharp cutoff.",
      },
    },
    {
      id: "lens-replacement",
      title: { et: "Tuleklaaside vahetus", en: "Lens replacement" },
      body: {
        et: "Kolletunud või kriimulise tuleklaasi asemele paigaldame uue, mis annab pimedas oluliselt parema nähtavuse.",
        en: "We replace a yellowed or scratched lens with a new one, for much better visibility in the dark.",
      },
    },
    {
      id: "restoration",
      title: { et: "Tulede taastamine", en: "Headlight restoration" },
      body: {
        et: "Kuumusest kulunud projektori asemele paigaldame uue; tulemus on vähemalt tehasetasemel.",
        en: "We replace a heat-worn projector with a new one; the result is at least as good as factory.",
      },
    },
    {
      id: "led-high-beams",
      title: { et: "LED-lisakaugtuled", en: "LED auxiliary high beams" },
      body: {
        et: "Paigaldame lisakaugtuled ilma esitulesid ümber ehitamata – see on kiireim ja odavaim viis kaugtulede nähtavust parandada.",
        en: "We fit auxiliary high beams without rebuilding your headlights: the quickest, most affordable way to better high beams.",
      },
    },
    {
      id: "afs",
      title: { et: "AFS-tulede projektorid", en: "AFS projector swaps" },
      body: {
        et: "Hella 5R projektori saab AFS-tuledesse paigaldada adapteriga; adapterid on olemas BMW, Lexuse ja Fordi tuledele.",
        en: "A Hella 5R projector fits AFS headlights with an adapter; we have adapters for BMW, Lexus and Ford units.",
      },
    },
    {
      id: "resealing",
      title: { et: "Tihendamine ja niiskus", en: "Resealing and moisture" },
      body: {
        et: "Niiskuse sattumisel tulle tihendame korpuse uuesti butüüliga ja paigaldame vajadusel õhuti.",
        en: "If moisture gets into a headlight, we reseal the housing with butyl and fit a breather vent where needed.",
      },
    },
    {
      id: "xenon-repair",
      title: { et: "Xenon-süsteemi remont", en: "Xenon repair" },
      body: {
        et: "Vahetame ballasti, süüturi või pirni; kasutame Hella, Philipsi, Osrami ja Hyluxi osi.",
        en: "We replace the ballast, igniter or bulb, using parts from Hella, Philips, Osram and Hylux.",
      },
    },
    {
      id: "special-orders",
      title: { et: "Eritellimused", en: "Special orders" },
      body: {
        et: "Morimoto, Bimmerjakes ja Strands brändide ametliku esindajana Eestis tellime kõike, mis on tootja laos olemas.",
        en: "As the official representative of the Morimoto, Bimmerjakes and Strands brands in Estonia, we order anything the maker has in stock.",
      },
    },
  ] satisfies ServiceItem[],
};
