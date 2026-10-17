import type { Localized } from "@/lib/i18n";
import { site } from "@/content/site";

/**
 * Copy for the "Headlight anatomy" section. The polishing story follows the old site's
 * KKK and Teenused pages (research brief): polishing is temporary, the surface is more
 * vulnerable afterwards, dirt inside stays, and new parts give factory-or-better output.
 */

export type AnatomyPartId = "lens" | "shroud" | "projector" | "housing";

export interface AnatomyPart {
  id: AnatomyPartId;
  name: Localized<string>;
  body: Localized<string>;
}

export const anatomy = {
  eyebrow: { et: "Esitule anatoomia", en: "Headlight anatomy" },
  title: {
    et: "Miks poleerimine ei aita kauaks",
    en: "Why polishing doesn’t last",
  },
  intro: {
    et: "Poleerimine on odavaim, kuid ajutine lahendus ja sageli ei anna see valgust juurde. Meie vahetame kahjustatud osad välja: ette uue tuleklaasi, sisse uue projektori.",
    en: "Polishing is the cheapest fix, but a temporary one, and it often adds no light at all. We replace the damaged parts instead: a new lens in front, a new projector inside.",
  },
  scrollHint: {
    et: "Keri alla ja vaata, millest esituli koosneb",
    en: "Scroll down to see what a headlight is made of",
  },
  figureLabel: {
    et: "Lahtivõetud esitule joonis: tuleklaas, projektori kate, projektor ja korpus",
    en: "Exploded headlight drawing: outer lens, shroud, projector and housing",
  },

  /** Front to back. */
  parts: [
    {
      id: "lens",
      name: { et: "Tuleklaas", en: "Outer lens" },
      body: {
        et: "Aja jooksul muutub klaas tuhmiks ja kollakaks ning hajutab valgust. Uus klaas laseb valguse jälle selgelt läbi.",
        en: "Over time the lens turns hazy and yellow and scatters the light. A new lens lets it through cleanly again.",
      },
    },
    {
      id: "shroud",
      name: { et: "Projektori kate", en: "Shroud" },
      body: {
        et: "Katab projektori ümbruse ja annab tule sisemusele viimistletud, ühtlase ilme.",
        en: "Covers the area around the projector and gives the inside of the light a clean, finished look.",
      },
    },
    {
      id: "projector",
      name: { et: "Projektor", en: "Projector" },
      body: {
        et: "Lääts ja varjestus koondavad valguse terava, astmelise piiriga vihuks. Bi-LED või bi-xenon.",
        en: "Its lens and shield focus the light into a beam with a sharp, stepped cutoff. Bi-LED or bi-xenon.",
      },
    },
    {
      id: "housing",
      name: { et: "Korpus", en: "Housing" },
      body: {
        et: "Korpus jääb alles. Kuumus kahjustab aja jooksul selle reflektorpinda, seepärast paigaldame sisse uue projektori.",
        en: "The housing stays. Over time heat damages its reflector surface, which is why a new projector goes inside.",
      },
    },
  ] satisfies AnatomyPart[],

  compare: {
    heading: { et: "Poleerida või vahetada?", en: "Polish or replace?" },
    polish: {
      title: { et: "Poleerimine", en: "Polishing" },
      tag: { et: "Ajutine", en: "Temporary" },
      points: [
        { et: "Odavaim, kuid ajutine lahendus", en: "The cheapest fix, but a temporary one" },
        {
          et: "Pärast poleerimist on klaasi pind välistele kahjustustele palju vastuvõtlikum",
          en: "Afterwards the lens surface is far more vulnerable to damage",
        },
        {
          et: "Tule sisse kogunenud mustus jääb alles",
          en: "Dirt inside the light stays where it is",
        },
        { et: "Sageli ei anna see valgust juurde", en: "It often adds no light at all" },
      ] satisfies Localized<string>[],
    },
    replace: {
      title: { et: "Uus klaas ja projektor", en: "New lens and projector" },
      tag: { et: "Püsiv", en: "Lasting" },
      points: [
        {
          et: "Ette uus tuleklaas, sisse uus projektor",
          en: "A new lens in front, a new projector inside",
        },
        {
          et: "Tulemus on tehase omaga võrdne või parem",
          en: "Output equal to or better than factory",
        },
        {
          et: "Oluliselt parem nähtavus pimedas",
          en: "Much better visibility in the dark",
        },
        {
          et: `Projektoritele ${site.warrantyYears}-aastane garantii`,
          en: `${site.warrantyYears}-year warranty on projectors`,
        },
      ] satisfies Localized<string>[],
    },
  },
};
