import { Check, X } from "lucide-react";
import { ExplodedHeadlight } from "@/components/anatomy/ExplodedHeadlight";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { anatomy as t } from "@/content/anatomy";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

/**
 * "Headlight anatomy": a scroll-driven exploded view of the four parts (pinned on desktop,
 * static below md or with reduced motion), then why polishing is only a temporary fix.
 */
export function Anatomy({ locale }: { locale: Locale }) {
  const { polish, replace } = t.compare;
  const columns = [
    { key: "polish", ...polish, good: false },
    { key: "replace", ...replace, good: true },
  ];

  return (
    <section
      id="anatomy"
      className={cn(
        "relative overflow-x-clip border-b border-line py-24 md:py-32",
        // In the pinned layout (ExplodedHeadlight's PINNED_QUERY) the full-height stage centres
        // its content, which already gives the section its top spacing.
        "[@media(min-width:64rem)_and_(min-height:45rem)_and_(prefers-reduced-motion:no-preference)]:pt-0",
      )}
    >
      <ExplodedHeadlight
        figureLabel={t.figureLabel[locale]}
        scrollHint={t.scrollHint[locale]}
        parts={t.parts.map((part) => ({ id: part.id, name: part.name[locale], body: part.body[locale] }))}
        heading={
          <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
        }
      />

      <Container className="mt-20 md:mt-28">
        <Reveal>
          <h3 className="text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {t.compare.heading[locale]}
          </h3>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2 md:gap-6">
          {columns.map((column, index) => {
            const Icon = column.good ? Check : X;
            return (
              <Reveal
                key={column.key}
                delay={index * 0.08}
                className={cn(
                  "rounded-2xl border p-6 md:p-8",
                  column.good
                    ? "border-accent/25 bg-[radial-gradient(120%_100%_at_100%_0%,color-mix(in_oklab,var(--color-accent)_10%,transparent),transparent_60%)] bg-surface"
                    : "border-line bg-surface/60",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-lg font-semibold tracking-tight text-fg">{column.title[locale]}</h4>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.16em] uppercase",
                      column.good ? "border-accent/40 text-accent" : "border-halogen/30 text-halogen",
                    )}
                  >
                    {column.tag[locale]}
                  </span>
                </div>
                <ul className="mt-6 space-y-3.5">
                  {column.points.map((point) => (
                    <li key={point.en} className="flex gap-3 text-sm leading-relaxed text-pretty md:text-[15px]">
                      <Icon
                        aria-hidden
                        className={cn("mt-0.5 size-4 shrink-0", column.good ? "text-accent" : "text-muted")}
                        strokeWidth={2}
                      />
                      <span className={column.good ? "text-fg" : "text-muted"}>{point[locale]}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
