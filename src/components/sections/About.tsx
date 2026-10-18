import Image from "next/image";
import type { CSSProperties } from "react";
import projectorBench from "@/assets/photos/projector-bench.jpg";
import { about } from "@/content/about";
import { site } from "@/content/site";
import { products } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { monoLabel } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

interface Stat {
  id: string;
  /** A count, which counts up once in view; a year is shown as it is. */
  value: { count: number; suffix?: string } | { year: number };
  label: string;
}

export function About({ locale }: { locale: Locale }) {
  // "10+" → 10 with a "+" suffix.
  const experience = Number.parseInt(site.experienceYears, 10);
  const experienceSuffix = site.experienceYears.replace(/^\d+/, "");

  const stats: Stat[] = [
    { id: "founded", value: { year: site.founded }, label: about.stats.founded[locale] },
    {
      id: "experience",
      value: { count: experience, suffix: experienceSuffix },
      label: about.stats.experience[locale],
    },
    { id: "warranty", value: { count: site.warrantyYears }, label: about.stats.warranty[locale] },
    // Hidden until the catalog has products, so it never shows a zero.
    ...(products.length > 0
      ? [{ id: "products", value: { count: products.length }, label: about.stats.products[locale] }]
      : []),
  ];

  return (
    <section id="about" className="border-t border-line py-18 md:py-30">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={about.eyebrow[locale]} title={about.title[locale]} />
        </Reveal>
        <div className="mt-10 grid gap-12 md:mt-14 md:gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal delay={0.05} className="space-y-5 text-base leading-relaxed text-pretty text-soft md:text-[17px]">
              {about.story[locale].map((paragraph, index) => (
                <p key={index}>{fillText(paragraph, { founded: site.founded })}</p>
              ))}
            </Reveal>
            <Reveal delay={0.1} className="mt-10">
              <figure className="border-l border-fg/40 pl-5">
                <blockquote className="text-xl leading-snug font-medium tracking-[-0.01em] text-fg md:text-[22px]">
                  {about.quote[locale]}
                </blockquote>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-7 lg:pt-1.5">
            <Reveal delay={0.05}>
              <figure>
                <Image
                  src={projectorBench}
                  alt={about.photo.alt[locale]}
                  // On phones the cropped frame shows the middle of an image about 1.5 screens wide.
                  sizes="(min-width: 1280px) 690px, (min-width: 1024px) 56vw, (min-width: 640px) 100vw, 150vw"
                  // Phones crop the wide frame to a taller one, so the projectors stay legible.
                  // From `sm` the photo keeps its own shape, given here rather than left to the
                  // image (`aspect-auto`): that box stays 0 px high until the file arrives, and
                  // the sections below then jump.
                  style={{ "--photo-ratio": `${projectorBench.width} / ${projectorBench.height}` } as CSSProperties}
                  className="aspect-[16/10] h-auto w-full rounded-[2px] bg-surface object-cover object-[62%_50%] sm:aspect-(--photo-ratio)"
                />
                <figcaption className={`${monoLabel} mt-3`}>
                  {about.photo.caption[locale]}
                </figcaption>
              </figure>
            </Reveal>

            <Reveal delay={0.1} className="mt-12 md:mt-16">
              <h3 className="sr-only">{about.statsLabel[locale]}</h3>
              {/* Two by two on phones and in the narrower lg column, one row of four otherwise. */}
              <dl className="grid grid-cols-2 border-t border-line md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat, index) => (
                  <div
                    key={stat.id}
                    className={cn(
                      "flex flex-col-reverse justify-end gap-2 py-6 pr-4 md:pt-7 md:pb-0 lg:pb-6 xl:pb-0",
                      index < 2 && "border-b border-line md:border-b-0 lg:border-b xl:border-b-0",
                    )}
                  >
                    <dt className="text-sm leading-snug text-muted">{stat.label}</dt>
                    <dd className="text-[44px] leading-none font-semibold tracking-[-0.03em] text-fg tabular-nums md:text-5xl">
                      {"year" in stat.value ? (
                        stat.value.year
                      ) : (
                        <Counter to={stat.value.count} suffix={stat.value.suffix} duration={1.2} />
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
