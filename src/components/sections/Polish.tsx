import { Check, X } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import headlightPolished from "@/assets/photos/headlight-polished.jpg";
import headlightUnpolished from "@/assets/photos/headlight-unpolished.jpg";
import retrofitInProgress from "@/assets/photos/retrofit-in-progress.jpg";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mono, monoLabel } from "@/components/ui/styles";
import { polish as t } from "@/content/polish";
import { cn } from "@/lib/cn";
import type { Locale, Localized } from "@/lib/i18n";

/** The section appears once per page, so a fixed id is safe. */
const PARTS_ID = "polish-parts";

/** Heading on the left, content on the right, as in the mockup's 5:7 split. */
const split = "grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16";
const subheading = "text-2xl leading-tight font-semibold text-fg md:text-3xl";

/** The same headlight before and after polishing, unpolished first. */
const pair = [
  { key: "unpolished", src: headlightUnpolished, ...t.photos.unpolished },
  { key: "polished", src: headlightPolished, ...t.photos.polished },
];

function Photo({
  src,
  alt,
  caption,
  sizes,
  frame,
  locale,
}: {
  src: StaticImageData;
  alt: Localized<string>;
  caption: Localized<string>;
  sizes: string;
  /** Aspect ratio and crop: `object-position` on the photo. */
  frame: { aspect: string; position: string };
  locale: Locale;
}) {
  return (
    <figure>
      <div className={cn("relative overflow-hidden rounded-[2px] bg-surface", frame.aspect)}>
        <Image src={src} alt={alt[locale]} fill sizes={sizes} className={cn("object-cover", frame.position)} />
      </div>
      <figcaption className={cn(monoLabel, "mt-3")}>{caption[locale]}</figcaption>
    </figure>
  );
}

/**
 * "Polishing is a temporary fix": the same headlight before and after polishing, the four parts
 * of a headlight front to back beside a retrofit in progress, and polishing versus replacing.
 * The id stays `anatomy`, the section's anchor since it began.
 */
export function Polish({ locale }: { locale: Locale }) {
  const columns = [
    { key: "polish", ...t.compare.polish, lasting: false },
    { key: "replace", ...t.compare.replace, lasting: true },
  ];

  return (
    <section id="anatomy" className="border-t border-line py-18 md:py-30">
      <Container>
        <div className={split}>
          {/* From lg the heading stays beside the tall pair while it scrolls, as in Process. */}
          <div>
            <Reveal className="lg:sticky lg:top-32">
              <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
            </Reveal>
          </div>
          {/* One comparison: matching frames, the same crop on both, so the headlight lines up.
              Side by side on tablets, where the pair spans the container; stacked in the
              narrower 7/12 column from lg and on phones, so the haze stays easy to see. */}
          <div className="grid gap-x-3 gap-y-5 sm:max-lg:grid-cols-2">
            {pair.map((photo, index) => (
              <Reveal key={photo.key} delay={index * 0.08}>
                <Photo
                  src={photo.src}
                  alt={photo.alt}
                  caption={photo.caption}
                  sizes="(min-width: 1280px) 690px, (min-width: 1024px) 56vw, (min-width: 640px) 50vw, 100vw"
                  frame={{ aspect: "aspect-[32/15]", position: "object-center" }}
                  locale={locale}
                />
              </Reveal>
            ))}
          </div>
        </div>

        <div className={cn(split, "mt-20 md:mt-28")}>
          <Reveal>
            <h3 id={PARTS_ID} className={subheading}>
              {t.partsHeading[locale]}
            </h3>
            <p className={cn(monoLabel, "mt-3")}>{t.partsNote[locale]}</p>
            <div className="mt-8">
              <Photo
                src={retrofitInProgress}
                alt={t.photos.retrofit.alt}
                caption={t.photos.retrofit.caption}
                sizes="(min-width: 1280px) 475px, (min-width: 1024px) 38vw, 100vw"
                // A wide 2.35:1 shot: the 4:3 crop keeps the projector near the middle and the
                // indicator whole. Tablets, where it spans the container, show a wider 2:1 slice.
                frame={{ aspect: "aspect-[4/3] sm:max-lg:aspect-[2/1]", position: "object-[70%_50%]" }}
                locale={locale}
              />
            </div>
          </Reveal>
          <ol aria-labelledby={PARTS_ID} className="border-t border-line lg:self-start">
            {t.parts.map((part, index) => (
              <Reveal
                as="li"
                key={part.id}
                delay={index * 0.06}
                className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-line py-5 md:grid-cols-[2.5rem_minmax(0,10rem)_minmax(0,1fr)] md:gap-x-6 md:py-6"
              >
                <span aria-hidden className={cn(monoLabel, "tabular-nums")}>
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
              const titleId = `polish-compare-${column.key}`;
              return (
                <Reveal
                  key={column.key}
                  delay={index * 0.08}
                  className={cn("border-t pt-6", column.lasting ? "border-fg/35" : "border-line")}
                >
                  <div role="group" aria-labelledby={titleId}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 id={titleId} className="text-lg font-semibold text-fg">
                        {column.title[locale]}
                      </h4>
                      <span className={cn(mono, column.lasting ? "text-fg" : "text-halogen")}>
                        {column.tag[locale]}
                      </span>
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
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
