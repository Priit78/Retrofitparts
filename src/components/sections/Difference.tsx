import type { ReactNode } from "react";
import { CompareSlider } from "@/components/difference/CompareSlider";
import { RoadPhoto } from "@/components/difference/RoadPhoto";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { difference as t } from "@/content/difference";
import type { Locale } from "@/lib/i18n";

/** The section appears once per page, so fixed ids are safe. */
const HINT_ID = "difference-slider-hint";
const FACTS_ID = "difference-facts";

const mono = "font-mono text-xs tracking-[0.08em] uppercase";

/** Small dark tag in a top corner of the slider. */
function SideTag({ children }: { children: ReactNode }) {
  return (
    <span className={`${mono} block rounded-[2px] bg-bg/75 px-2.5 py-1.5 leading-none text-fg`}>{children}</span>
  );
}

/** "See the difference": a before/after slider on one night photo, plus three plain-physics facts. */
export function Difference({ locale }: { locale: Locale }) {
  return (
    <section id="difference" className="border-b border-line py-24 md:py-30">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
        </Reveal>

        <Reveal className="mt-12 md:mt-14">
          <figure>
            <CompareSlider
              className="aspect-[4/3] rounded-[2px] bg-surface md:aspect-[3/2]"
              label={t.slider.label[locale]}
              valueText={t.slider.valueText[locale]}
              describedBy={HINT_ID}
              before={<RoadPhoto variant="before" alt={t.before.photo[locale]} />}
              after={<RoadPhoto variant="after" alt={t.after.photo[locale]} />}
              beforeLabel={<SideTag>{t.before.label[locale]}</SideTag>}
              afterLabel={<SideTag>{t.after.label[locale]}</SideTag>}
            />
            <figcaption className={`${mono} mt-3.5 flex flex-wrap justify-between gap-x-6 gap-y-1.5 text-muted`}>
              <span>{t.slider.note[locale]}</span>
              <span id={HINT_ID}>{t.slider.hint[locale]}</span>
            </figcaption>
          </figure>
        </Reveal>

        <div className="mt-20 md:mt-28">
          <Reveal>
            <p id={FACTS_ID} className={`${mono} text-muted`}>
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
                    <dt className={`${mono} text-muted`}>{t.beforeShort[locale]}</dt>
                    <dd className="mt-1.5 text-[15px] font-medium text-halogen">{fact.before[locale]}</dd>
                  </div>
                  <div>
                    <dt className={`${mono} text-muted`}>{t.afterShort[locale]}</dt>
                    <dd className="mt-1.5 text-[15px] font-medium text-fg">{fact.after[locale]}</dd>
                  </div>
                </dl>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
