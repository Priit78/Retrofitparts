import { Check, X } from "lucide-react";
import Image from "next/image";
import headlightHazed from "@/assets/photos/headlight-hazed.jpg";
import retrofitInProgress from "@/assets/photos/retrofit-in-progress.jpg";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { polish as t } from "@/content/polish";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

/** The section appears once per page, so a fixed id is safe. */
const PARTS_ID = "polish-parts";

const mono = "font-mono text-xs tracking-[0.08em] uppercase";
/** Heading on the left, content on the right, as in the mockup's 5:7 split. */
const split = "grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16";
const subheading = "text-2xl leading-tight font-semibold text-fg md:text-3xl";

const photos = [
  { key: "hazed", src: headlightHazed, position: "object-center", ...t.photos.hazed },
  // A wide 2.35:1 shot: keep the new projector in the middle of the 4:3 crop.
  { key: "retrofit", src: retrofitInProgress, position: "object-[58%_50%]", ...t.photos.retrofit },
];

/**
 * "Polishing is a temporary fix": two photos, the four parts of a headlight front to back, and
 * polishing versus replacing. The id stays `anatomy`, the section's anchor since it began.
 */
export function Polish({ locale }: { locale: Locale }) {
  const columns = [
    { key: "polish", ...t.compare.polish, lasting: false },
    { key: "replace", ...t.compare.replace, lasting: true },
  ];

  return (
    <section id="anatomy" className="border-b border-line py-24 md:py-30">
      <Container>
        <div className={split}>
          <Reveal>
            <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
          </Reveal>
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <Reveal key={photo.key} delay={index * 0.08}>
                <figure>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2px] bg-surface">
                    <Image
                      src={photo.src}
                      alt={photo.alt[locale]}
                      fill
                      sizes="(min-width: 1024px) 340px, (min-width: 640px) 50vw, 100vw"
                      className={cn("object-cover", photo.position)}
                    />
                  </div>
                  <figcaption className={cn(mono, "mt-3 text-muted")}>{photo.caption[locale]}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>

        <div className={cn(split, "mt-20 md:mt-28")}>
          <Reveal>
            <h3 id={PARTS_ID} className={subheading}>
              {t.partsHeading[locale]}
            </h3>
            <p className={cn(mono, "mt-3 text-muted")}>{t.partsNote[locale]}</p>
          </Reveal>
          <ol aria-labelledby={PARTS_ID} className="border-t border-line">
            {t.parts.map((part, index) => (
              <Reveal
                as="li"
                key={part.id}
                delay={index * 0.06}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-line py-5 md:grid-cols-[2.5rem_minmax(0,10rem)_minmax(0,1fr)] md:gap-x-6 md:py-6"
              >
                <span aria-hidden className={cn(mono, "text-muted tabular-nums")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="text-[17px] font-semibold text-fg">{part.name[locale]}</h4>
                <p className="col-start-2 mt-1.5 text-[15px] leading-relaxed text-pretty text-soft md:col-start-3 md:mt-0">
                  {part.body[locale]}
                </p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className={cn(split, "mt-20 md:mt-28")}>
          <Reveal>
            <h3 className={subheading}>{t.compare.heading[locale]}</h3>
          </Reveal>
          <div className="grid gap-12 sm:grid-cols-2 sm:gap-8">
            {columns.map((column, index) => {
              const Icon = column.lasting ? Check : X;
              return (
                <Reveal
                  key={column.key}
                  delay={index * 0.08}
                  className={cn("border-t pt-6", column.lasting ? "border-fg/35" : "border-line")}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="text-lg font-semibold text-fg">{column.title[locale]}</h4>
                    <span className={cn(mono, column.lasting ? "text-fg" : "text-halogen")}>{column.tag[locale]}</span>
                  </div>
                  <ul className="mt-5 space-y-3">
                    {column.points.map((point) => (
                      <li key={point.en} className="flex gap-3 text-[15px] leading-relaxed text-pretty">
                        <Icon
                          aria-hidden
                          className={cn("mt-1 size-4 shrink-0", column.lasting ? "text-fg" : "text-muted")}
                          strokeWidth={1.75}
                        />
                        <span className={column.lasting ? "text-fg" : "text-soft"}>{point[locale]}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
