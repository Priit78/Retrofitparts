import type { Localized } from "@/lib/i18n";
import { site } from "@/content/site";

/**
 * Copy for the "Polishing is a temporary fix" section. The polishing story follows the old
 * site's KKK and Teenused pages (research brief): polishing is temporary, the surface is more
 * vulnerable afterwards, dirt inside stays, and new parts give factory-or-better output.
 */

type PolishPartId = "lens" | "shroud" | "projector" | "housing";

interface PolishPart {
  id: PolishPartId;
  name: Localized<string>;
  body: Localized<string>;
}

export const polish = {
  eyebrow: { et: "Miks mitte poleerida", en: "Why not just polish" },
  title: {
    et: "Poleerimine on ajutine lahendus",
    en: "Polishing is a temporary fix",
  },
  intro: {
    et: "See on odavaim lahendus, kuid valgust see sageli juurde ei anna. Meie vahetame kahjustatud osad välja: ette uue tuleklaasi, sisse uue projektori.",
    en: "It is the cheapest fix, but it often adds no light at all. We replace the damaged parts instead: a new lens in front, a new projector inside.",
  },

  photos: {
    hazed: {
      alt: {
        et: "Vana auto esituli, mille klaas on tuhmunud ja kollaseks muutunud",
        en: "An old car headlight with a hazed, yellowed lens",
      },
      caption: { et: "Tuhmunud klaas", en: "Hazed lens" },
    },
    retrofit: {
      alt: {
        et: "Esituli autol, mille kaitseraud on eemaldatud: korpuses on uus projektor ja kere on kaitstud maalriteibiga",
        en: "A headlight on a car with the bumper removed: a new projector sits in the housing, and the bodywork is protected with masking tape",
      },
      caption: { et: "Projektori paigaldus meie töökojas", en: "Projector retrofit in our workshop" },
    },
  },

  partsHeading: { et: "Millest esituli koosneb", en: "What a headlight is made of" },
  partsNote: { et: "Eest taha", en: "Front to back" },

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
  ] satisfies PolishPart[],

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
