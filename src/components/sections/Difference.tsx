import { CompareSlider } from "@/components/difference/CompareSlider";
import { FactVisual } from "@/components/difference/FactVisual";
import { RoadScene } from "@/components/difference/RoadScene";
import { SceneLabel } from "@/components/difference/SceneLabel";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { difference as t } from "@/content/difference";
import type { Locale } from "@/lib/i18n";

/** "See the difference": a before/after night-road slider plus three plain-physics facts. */
export function Difference({ locale }: { locale: Locale }) {
  return (
    <section id="difference" className="relative isolate overflow-x-clip border-b border-line py-24 md:py-36">
      {/* A faint cool spill behind the scene, so it sits in light rather than on flat black. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[60%] max-w-[1100px] rounded-full bg-accent/[0.06] blur-[120px]"
      />
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t.eyebrow[locale]}
            title={t.title[locale]}
            intro={t.intro[locale]}
          />
        </Reveal>

        <Reveal className="mt-12 md:mt-16" y={32}>
          <figure>
            <CompareSlider
              className="aspect-[5/4] rounded-2xl border border-line bg-bg shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] sm:aspect-[16/10] md:aspect-[16/9] md:rounded-3xl"
              label={t.slider.label[locale]}
              valueText={t.slider.valueText[locale]}
              before={
                <RoadScene variant="before" label={t.before.scene[locale]} className="size-full" />
              }
              after={<RoadScene variant="after" label={t.after.scene[locale]} className="size-full" />}
              beforeLabel={
                <SceneLabel
                  variant="before"
                  label={t.before.label[locale]}
                  caption={t.before.caption[locale]}
                />
              }
              afterLabel={
                <SceneLabel
                  variant="after"
                  label={t.after.label[locale]}
                  caption={t.after.caption[locale]}
                />
              }
            />
            <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 font-mono text-xs text-muted">
              <span>{t.slider.hint[locale]}</span>
              <span>{t.slider.note[locale]}</span>
            </figcaption>
          </figure>
        </Reveal>

        <ul
          aria-label={t.factsLabel[locale]}
          className="mt-16 grid gap-4 md:mt-24 md:grid-cols-3 md:gap-6"
        >
          {t.facts.map((fact, index) => (
            <Reveal
              as="li"
              key={fact.id}
              delay={index * 0.08}
              className="flex flex-col rounded-2xl border border-line bg-surface/70 p-6 md:p-7"
            >
              <FactVisual id={fact.id} className="h-[72px] w-full max-w-[280px]" />
              <p className="mt-7 font-mono text-xs tracking-[0.2em] text-accent">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-fg">{fact.title[locale]}</h3>
              <p className="mt-3 mb-6 text-sm leading-relaxed text-pretty text-muted">{fact.body[locale]}</p>
              <dl className="mt-auto grid grid-cols-2 gap-4 border-t border-line pt-5">
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                    {t.beforeShort[locale]}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-halogen">{fact.before[locale]}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                    {t.afterShort[locale]}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-light">{fact.after[locale]}</dd>
                </div>
              </dl>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
