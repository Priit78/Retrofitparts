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
  eyebrow: { et: "Teenused ja hinnad", en: "Services and prices" },
  title: {
    et: "Tulede taastamine ja remont kindlalt partnerilt",
    en: "Headlight restoration and repair you can rely on",
  },
  intro: {
    et: "Vahetame tuleklaase ning paigaldame uusi projektoreid ja lisatulesid. Paigaldusteenus on olemas kõigile toodetele, mida müüme.",
    en: "We replace lenses and fit new projectors and auxiliary lights. Installation is available for every product we sell.",
  },

  priceTable: {
    caption: { et: "Projektorite paigaldus", en: "Projector installation" },
    vatBadge: { et: "sh käibemaks", en: "incl. VAT" },
    colVehicle: { et: "Sõiduk", en: "Vehicle" },
    colDuration: { et: "Tööaeg", en: "Turnaround" },
    colPrice: { et: "Hind", en: "Price" },
    from: { et: "alates", en: "from" },
    /** Shown when site.pricing has no stated turnaround. */
    durationOnRequest: { et: "Kokkuleppel", en: "On request" },
    footnote: {
      et: "Hinnad sisaldavad käibemaksu. Hinnakiri on orienteeruv – täpse pakkumise teeme sinu auto põhjal.",
      en: "Prices include VAT. They are indicative; we quote exactly for your car.",
    },
    /** `{email}` is replaced with the address from site.ts. */
    notSure: {
      et: "Ei tea, millised tuled sinu autol on? Saada foto aadressil {email}.",
      en: "Not sure which kind your car has? Send a photo to {email}.",
    },
  },

  items: [
    {
      id: "projector-retrofit",
      title: { et: "Projektorite paigaldus", en: "Projector retrofit" },
      body: {
        et: "Paigaldame bi-LED-, bi-xenon- ja halogeenprojektoreid nii reflektor- kui ka projektortuledesse. Projektor annab ühtlase valgusvihu ja terava valguspiiri.",
        en: "We fit bi-LED, bi-xenon and halogen projectors into reflector and projector headlights alike, for an even beam with a sharp cutoff.",
      },
    },
    {
      id: "lens-replacement",
      title: { et: "Tuleklaaside vahetus", en: "Lens replacement" },
      body: {
        et: "Kollaseks tõmbunud või kriimuline tuleklaas asendub uuega. Poleerimine on ajutine lahendus, uus klaas annab pimedas oluliselt parema nähtavuse.",
        en: "A yellowed or scratched lens is replaced with a new one. Polishing only buys time; a new lens gives much better visibility in the dark.",
      },
    },
    {
      id: "restoration",
      title: { et: "Tulede taastamine", en: "Headlight restoration" },
      body: {
        et: "Kuumus kahjustab aja jooksul reflektori pinda ja valgus muutub tuhmiks. Vahetame kulunud projektori uue vastu ja tulemus on vähemalt sama hea kui tehasest tulles.",
        en: "Heat wears down the reflector surface over time and the light grows dim. We replace the worn projector, for results at least as good as factory.",
      },
    },
    {
      id: "led-high-beams",
      title: { et: "LED-lisakaugtuled", en: "LED auxiliary high beams" },
      body: {
        et: "Kiireim ja odavaim viis kaugtulede nähtavust parandada. Paigaldame lisatuled ilma esitulesid ümber ehitamata.",
        en: "The quickest, most affordable way to improve high-beam visibility. We fit them without rebuilding your headlights.",
      },
    },
    {
      id: "afs",
      title: { et: "AFS-tulede projektorid", en: "AFS projector swaps" },
      body: {
        et: "Adaptiivsetesse AFS-tuledesse saab adapteri abil paigaldada Hella 5R projektori. Adapterid on olemas BMW, Lexuse ja Fordi tuledele.",
        en: "With the right adapter, adaptive AFS headlights can take a Hella 5R projector. We have adapters for BMW, Lexus and Ford units.",
      },
    },
    {
      id: "resealing",
      title: { et: "Tihendamine ja niiskus", en: "Resealing and moisture" },
      body: {
        et: "Kui tule sisse koguneb niiskus, tihendame korpuse uuesti butüüliga ja paigaldame vajadusel õhuti, mis hoiab kondensi eemal.",
        en: "If moisture gets into a headlight, we reseal the housing with butyl and fit a breather vent where needed to keep condensation out.",
      },
    },
    {
      id: "xenon-repair",
      title: { et: "Xenon-süsteemi remont", en: "Xenon repair" },
      body: {
        et: "Xenon vilgub või ei sütti? Vahetame ballasti, süüturi või pirni. Kasutame Hella, Philipsi, Osrami ja Hyluxi osi.",
        en: "Xenon flickering or refusing to ignite? We replace the ballast, igniter or bulb, using parts from Hella, Philips, Osram and Hylux.",
      },
    },
    {
      id: "special-orders",
      title: { et: "Eritellimused", en: "Special orders" },
      body: {
        et: "Oleme Morimoto, Bimmerjakes ja Strands brändide ametlik esindaja Eestis. Nende kataloogist saab tellida kõike, mis on tootja laos olemas.",
        en: "We are the official Estonian representative of Morimoto, Bimmerjakes and Strands. Anything in their catalogs can be ordered while the maker has stock.",
      },
    },
  ] satisfies ServiceItem[],
};
