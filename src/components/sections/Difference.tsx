import type { ReactNode } from "react";
import { RoadPhoto } from "@/components/difference/RoadPhoto";
import { ScrollDrivenSlider, SliderFigure, SliderHint } from "@/components/difference/ScrollDrivenSlider";
import { ScrollChapter } from "@/components/story/ScrollChapter";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { mono, monoLabel, sectionTitleType } from "@/components/ui/styles";
import { difference as t } from "@/content/difference";
import { story } from "@/content/story";
import type { Locale } from "@/lib/i18n";

/** The section appears once per page, so fixed ids are safe. */
const HEADING_ID = "difference-heading";
const HINT_ID = "difference-slider-hint";
const FACTS_ID = "difference-facts";

/** Small dark tag in a top corner of the slider. */
function SideTag({ children }: { children: ReactNode }) {
  return (
    <span className={`${mono} block rounded-[2px] bg-bg/75 px-2.5 py-1.5 leading-none text-fg`}>{children}</span>
  );
}

/**
 * "See the difference": a pinned chapter in which scroll moves a before/after slider across one
 * night photo, followed by three plain-physics facts. The photo keeps its own 3:2 shape (4:3 on
 * phones) in a frame sized to fit under the heading; it is never cropped to fill the screen.
 * Without the pinned stage (no JS, reduced motion, a short viewport) it is a plain section with
 * a draggable slider that rests at 50%.
 */
export function Difference({ locale }: { locale: Locale }) {
  return (
    <>
      <ScrollChapter
        id="difference"
        labelledBy={HEADING_ID}
        length={{ base: 200, md: 240 }}
        // Pinned, the stage starts at the very top of the viewport, so the hairline would sit under the header.
        className="border-t border-line pinned:border-t-0"
        stageClassName="pinned:flex pinned:flex-col pinned:justify-center"
      >
        {/* Pinned, the content sits under the fixed header (64 px, 80 px from lg) in a stage that is
            exactly one screen high, so it has to be compact: see the notes on the heading and frame. */}
        <Container className="pt-18 md:pt-30 pinned:pt-18 pinned:pb-4 pinned:lg:pt-22">
          {/* The heading's column is as wide as the frame, but never narrower than 52rem: a short
              viewport shrinks the frame, and a narrower heading would wrap into more lines. */}
          <div className="pinned:md:mx-auto pinned:md:w-[min(100%,max(52rem,calc((100svh-290px)*1.5)))]">
            <Reveal>
              {/* The look of SectionHeading. Pinned, the title and the intro sit side by side from md
                  on, and are set smaller, so the heading is about 110 px tall instead of 220 px. */}
              <div className="max-w-3xl pinned:md:grid pinned:md:max-w-none pinned:md:grid-cols-[minmax(0,1fr)_22rem] pinned:md:items-end pinned:md:gap-x-8">
                <div>
                  <p className={`${monoLabel} mb-4 pinned:mb-3`}>{t.eyebrow[locale]}</p>
                  <h2
                    id={HEADING_ID}
                    className={`${sectionTitleType} pinned:text-[28px] md:text-[52px] pinned:md:text-[38px]`}
                  >
                    {t.title[locale]}
                  </h2>
                </div>
                <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft pinned:mt-3 pinned:text-sm pinned:leading-snug md:text-[17px] pinned:md:mt-0 pinned:md:max-w-none pinned:md:text-[15px] pinned:md:leading-normal">
                  {t.intro[locale]}
                </p>
              </div>
            </Reveal>

            <Reveal className="mt-12 md:mt-14 pinned:mt-5 pinned:md:mt-6">
              {/* The frame keeps its own shape: 4:3 on phones, 3:2 from md. Pinned, it is sized to
                  fit the screen under the heading (and never cropped to fill it): the width is
                  (screen height − the space the rest of the stage needs) × the aspect ratio. */}
              <SliderFigure className="pinned:mx-auto pinned:w-[min(100%,calc((100svh-370px)*1.3333))] pinned:md:w-[min(100%,calc((100svh-290px)*1.5))]">
                <ScrollDrivenSlider
                  className="aspect-[4/3] rounded-[2px] bg-surface md:aspect-[3/2]"
                  label={t.slider.label[locale]}
                  valueText={t.slider.valueText[locale]}
                  describedBy={HINT_ID}
                  before={<RoadPhoto variant="before" alt={t.before.photo[locale]} />}
                  after={<RoadPhoto variant="after" alt={t.after.photo[locale]} />}
                  beforeLabel={<SideTag>{t.before.label[locale]}</SideTag>}
                  afterLabel={<SideTag>{t.after.label[locale]}</SideTag>}
                />
                <figcaption className={`${monoLabel} mt-3.5 flex flex-wrap justify-between gap-x-6 gap-y-1.5`}>
                  <span>{t.slider.note[locale]}</span>
                  <SliderHint id={HINT_ID} scroll={story.difference.scrollHint[locale]} drag={t.slider.hint[locale]} />
                </figcaption>
              </SliderFigure>
            </Reveal>
          </div>
        </Container>
      </ScrollChapter>

      {/* The facts follow the chapter as a normal block. */}
      <Container className="pt-20 pb-18 md:pt-28 md:pb-30">
        <Reveal>
          <p id={FACTS_ID} className={monoLabel}>
            {t.factsLabel[locale]}
          </p>
        </Reveal>
        <ul aria-labelledby={FACTS_ID} className="mt-5 grid border-t border-line md:grid-cols-3">
          {t.facts.map((fact, index) => (
            <Reveal
              as="li"
              key={fact.id}
              delay={index * 0.08}
              className="flex flex-col border-line py-8 not-first:border-t md:px-8 md:py-10 md:not-first:border-t-0 md:not-first:border-l md:first:pl-0 md:last:pr-0"
            >
              <h3 className="text-xl font-semibold text-fg">{fact.title[locale]}</h3>
              <p className="mt-3 mb-7 text-[15px] leading-relaxed text-pretty text-soft">{fact.body[locale]}</p>
              <dl className="mt-auto grid grid-cols-2 gap-4">
                <div>
                  <dt className={monoLabel}>{t.beforeShort[locale]}</dt>
                  <dd className="mt-1.5 text-[15px] font-medium text-halogen">{fact.before[locale]}</dd>
                </div>
                <div>
                  <dt className={monoLabel}>{t.afterShort[locale]}</dt>
                  <dd className="mt-1.5 text-[15px] font-medium text-fg">{fact.after[locale]}</dd>
                </div>
              </dl>
            </Reveal>
          ))}
        </ul>
      </Container>
    </>
  );
}
