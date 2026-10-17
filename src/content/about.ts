import type { Localized } from "@/lib/i18n";

export const about = {
  eyebrow: { et: "Meist", en: "About us" },
  title: {
    et: "Hobist ettevõtteks – südamega asja juures",
    en: "From hobby to company, with heart in the work",
  },
  /** `{founded}` is replaced with site.founded. */
  story: {
    et: [
      "Retrofit Parts sai alguse hobist. Märkasime, et välismaa tarnijad pakuvad häid tulede komponente, kuid Eestis tegeles nende paigalduse ja edasimüügiga väga vähe ettevõtteid. {founded}. aastal sai hobist ettevõte.",
      "Tulede taastamine ja remont on olnud meie põhitöö üle kümne aasta. Selleks on meil spetsiaalsed tööriistad ja oskusteave ning oleme vahetanud tulede sisu suurel hulgal autodel.",
      "Meie klientide seas on automarkide esindused ja kindlustusseltsid ning teeme koostööd mitme Eesti autoremonditöökojaga.",
    ],
    en: [
      "Retrofit Parts started as a hobby. We noticed that suppliers abroad offered excellent headlight components, yet very few businesses in Estonia fitted or resold them. In {founded} the hobby became a company.",
      "Headlight restoration and repair has been our core work for over ten years. We have the specialist tools and know-how for it, and we have replaced the headlight internals of a great many cars.",
      "Our customers include car dealerships and insurance companies, and we work with several Estonian repair shops.",
    ],
  } satisfies Localized<string[]>,
  quote: {
    et: "Kõik tooted on meil endal ära testitud.",
    en: "We have tested every product ourselves.",
  },
  stats: {
    founded: { et: "Asutatud", en: "Founded" },
    experience: { et: "aastat tulede taastamist", en: "years restoring headlights" },
    warranty: { et: "aastat garantiid projektoritele", en: "years of warranty on projectors" },
    products: { et: "toodet kataloogis", en: "products in the catalog" },
  },
  statsLabel: { et: "Retrofit Parts arvudes", en: "Retrofit Parts in numbers" },
};
