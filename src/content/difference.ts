import type { Localized } from "@/lib/i18n";

/**
 * Copy for the "See the difference" section: a before/after slider over one night photo,
 * with the "before" side filtered to simulate a faded halogen light.
 * Facts here are general lighting physics only: no measured or invented figures.
 */

type DifferenceFactId = "temperature" | "cutoff" | "haze";

interface DifferenceFact {
  id: DifferenceFactId;
  title: Localized<string>;
  body: Localized<string>;
  /** Short value for the faded factory light. */
  before: Localized<string>;
  /** Short value for the retrofit. */
  after: Localized<string>;
}

export const difference = {
  eyebrow: { et: "Vaata vahet", en: "See the difference" },
  title: {
    et: "Sama tee. Hoopis teine valgus.",
    // A no-break space, so "A" never ends a line on its own.
    en: "Same road. A\u00a0completely different light.",
  },
  intro: {
    et: "Aastatega tuhmunud tuleklaas ja kulunud reflektor annavad kollaka, hajusa valguse, mis lõpeb liiga vara. Uus projektor selge klaasi taga viib valguse kaugele ja terava piiriga. Lohista liugurit ja võrdle.",
    en: "Over the years a hazy lens and a worn reflector turn the beam yellowish and diffuse, and it ends far too soon. A new projector behind a clear lens throws the light far ahead, with a sharp cutoff. Drag the slider to compare.",
  },

  slider: {
    label: {
      et: "Võrdle valgust enne ja pärast",
      en: "Compare the light before and after",
    },
    /** `{before}` and `{after}` are replaced with the visible share of each side, in percent. */
    valueText: {
      et: "Enne {before}%, pärast {after}%",
      en: "Before {before}%, after {after}%",
    },
    hint: {
      et: "Lohista liugurit või kasuta nooleklahve",
      en: "Drag the handle or use the arrow keys",
    },
    note: {
      et: "Simulatsioon ühe foto põhjal",
      en: "Simulation based on one photo",
    },
  },

  before: {
    label: { et: "Enne", en: "Before" },
    photo: {
      et: "Lumine metsatee öösel, töödeldud nii, nagu valgustaks seda tuhmunud halogeentuli: kollakas, hämar ja udune pilt.",
      en: "A snowy forest road at night, edited to look as if lit by a faded halogen headlight: yellowish, dim and blurred.",
    },
  },
  after: {
    label: { et: "Pärast", en: "After" },
    photo: {
      et: "Sama foto selges valges valguses, nagu uue bi-LED-projektoriga: tee, lumevallid ja puutüved on teravalt näha.",
      en: "The same photo in clear, white light, as with a new bi-LED projector: the road, the snowbanks and the tree trunks show sharply.",
    },
  },

  factsLabel: { et: "Mis vahe tekitab", en: "What makes the difference" },
  beforeShort: { et: "Enne", en: "Before" },
  afterShort: { et: "Pärast", en: "After" },

  facts: [
    {
      id: "temperature",
      title: { et: "Värvustemperatuur", en: "Colour temperature" },
      body: {
        et: "Halogeenpirn helendab umbes 3200 K juures, soojas kollakas toonis. LED-projektori valgus on umbes 5500–6000 K: valge ja päevavalgusele palju lähemal.",
        en: "A halogen bulb glows at about 3200 K, a warm yellowish tone. An LED projector shines at about 5500–6000 K: a white that is much closer to daylight.",
      },
      before: { et: "≈ 3200 K", en: "≈ 3200 K" },
      after: { et: "≈ 5500–6000 K", en: "≈ 5500–6000 K" },
    },
    {
      id: "cutoff",
      title: { et: "Valguspiir", en: "Cutoff line" },
      body: {
        et: "Projektoris koondab lääts valguse varjestuse servale ja see joonistab terava, astmelise lähitule piiri: vastassuunarada valgustatakse vähem kaugele, sinu poolne teeäär kaugemale. Kulunud tulel on piir hägune ja osa valgust pimestab vastutulijaid.",
        en: "In a projector, the lens focuses the light on the edge of a shield, which draws a sharp, stepped low-beam cutoff: the oncoming lane is lit less far ahead, your side of the road further. In a worn light the cutoff blurs, and some of the light dazzles oncoming drivers.",
      },
      before: { et: "Hägune", en: "Blurred" },
      after: { et: "Terav, astmega", en: "Sharp, stepped" },
    },
    {
      id: "haze",
      title: { et: "Tuhmunud klaas", en: "Hazy lens" },
      body: {
        et: "Aja jooksul muutub tuleklaasi pind karedaks ja kollakaks. Iga kriimustus ja hägu hajutab valgust igas suunas: teele jõuab seda vähem ja tule ümber tekib pimestav kuma.",
        en: "Over time the lens surface turns rough and yellowish. Every scratch and patch of haze scatters light in all directions: less of it reaches the road, and a dazzling glow forms around the light.",
      },
      before: { et: "Hajuv kuma", en: "Scattered glow" },
      after: { et: "Selge klaas", en: "Clear lens" },
    },
  ] satisfies DifferenceFact[],
};
