import type { Localized } from "@/lib/i18n";
import { polish } from "@/content/polish";

/**
 * New copy for the landing scroll story (docs/superpowers/specs/2026-10-18-landing-story-design.md).
 * Everything else the chapters show comes from the existing content files.
 */

/** Landing page ids the chapter index links to, in page order. */
export type StoryChapterId =
  | "top"
  | "problem"
  | "difference"
  | "anatomy"
  | "services"
  | "process"
  | "catalog-teaser";

interface StoryBeat {
  title: Localized<string>;
  body?: Localized<string>;
}

interface StoryChapter {
  id: StoryChapterId;
  label: Localized<string>;
}

export const story = {
  /** The hero's second line, which fades in as the hero zooms. */
  heroNext: { et: "Aga iga esituli vananeb.", en: "But every headlight ages." },

  problem: {
    kicker: { et: "Probleem", en: "The problem" },
    beats: [
      {
        title: { et: "Tuleklaas vananeb.", en: "Lenses age." },
        body: {
          et: "Päike, kivid ja aastad muudavad tuleklaasi pinna karedaks ja kollakaks. Valgus hajub ja teele jõuab seda vähem.",
          en: "Sun, stones and years make the lens surface rough and yellow. The light scatters, and less of it reaches the road.",
        },
      },
      {
        title: {
          et: "Poleerimine teeb klaasi korraks selgeks.",
          en: "Polishing clears the lens, for a while.",
        },
        body: {
          et: "See on odavaim lahendus, kuid valgust see sageli juurde ei anna.",
          en: "It is the cheapest fix, but it often adds no light at all.",
        },
      },
      // No body: this beat shows the polish.compare columns.
      { title: polish.compare.heading },
    ] satisfies StoryBeat[],
  },

  difference: {
    scrollHint: {
      et: "Keri edasi ja vaata, kuidas valgus muutub.",
      en: "Keep scrolling to see the light change.",
    },
  },

  anatomy: {
    kicker: { et: "Lahendus", en: "The fix" },
    drawingLabel: {
      et: "Esitule neli osa eest taha: tuleklaas, projektori kate, projektor ja korpus",
      en: "The four parts of a headlight, front to back: outer lens, shroud, projector and housing",
    },
  },

  index: {
    label: { et: "Peatükid", en: "Chapters" },
  },

  chapters: [
    { id: "top", label: { et: "Valgus", en: "Light" } },
    { id: "problem", label: { et: "Probleem", en: "Problem" } },
    { id: "difference", label: { et: "Vahe", en: "Difference" } },
    { id: "anatomy", label: { et: "Lahendus", en: "Fix" } },
    { id: "services", label: { et: "Hinnad", en: "Prices" } },
    { id: "process", label: { et: "Töö käik", en: "Process" } },
    { id: "catalog-teaser", label: { et: "Kataloog", en: "Catalog" } },
  ] satisfies StoryChapter[],
};
