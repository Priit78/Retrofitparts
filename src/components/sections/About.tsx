import { about } from "@/content/about";
import { site } from "@/content/site";
import { products } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { Counter } from "@/components/ui/Counter";
import { fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";

interface Stat {
  id: string;
  to: number;
  suffix?: string;
  label: string;
}

export function About({ locale }: { locale: Locale }) {
  // "10+" → 10 with a "+" suffix.
  const experience = Number.parseInt(site.experienceYears, 10);
  const experienceSuffix = site.experienceYears.replace(/^\d+/, "");

  const stats: Stat[] = [
    { id: "founded", to: site.founded, label: about.stats.founded[locale] },
    {
      id: "experience",
      to: experience,
      suffix: experienceSuffix,
      label: about.stats.experience[locale],
    },
    { id: "warranty", to: site.warrantyYears, label: about.stats.warranty[locale] },
    // Hidden until the catalog has products, so it never shows a zero.
    ...(products.length > 0
      ? [{ id: "products", to: products.length, label: about.stats.products[locale] }]
      : []),
  ];

  return (
    <section id="about" className="relative isolate overflow-clip py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 -z-10 h-[40rem] w-[40rem] translate-x-1/3 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_10%,transparent),transparent)]"
      />
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-7">
            <Reveal>
              <SectionHeading eyebrow={about.eyebrow[locale]} title={about.title[locale]} />
            </Reveal>
            <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed text-muted md:text-lg">
              {about.story[locale].map((paragraph, index) => (
                <Reveal as="p" key={index} delay={0.05 * (index + 1)}>
                  {fillText(paragraph, { founded: site.founded })}
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.25} className="mt-12">
              <figure className="relative max-w-2xl border-l-2 border-accent pl-6">
                <blockquote className="font-display text-xl leading-snug font-semibold text-light [font-stretch:125%] md:text-2xl">
                  {about.quote[locale]}
                </blockquote>
              </figure>
            </Reveal>
          </div>

          <div className="lg:col-span-5 lg:pt-24">
            <Reveal delay={0.1}>
              <h3 className="sr-only">{about.statsLabel[locale]}</h3>
              <dl className="grid grid-cols-[auto_1fr] border-t border-line">
                {stats.map((stat) => (
                  <div
                    key={stat.id}
                    className="col-span-2 grid grid-cols-subgrid items-baseline gap-x-6 border-b border-line py-7 md:gap-x-8"
                  >
                    <dt className="order-2 text-sm leading-snug text-muted md:text-base">{stat.label}</dt>
                    <dd className="order-1 font-display text-5xl leading-none font-semibold tracking-tight text-light [font-stretch:125%] [text-shadow:0_0_40px_color-mix(in_oklab,var(--color-accent)_45%,transparent)] md:text-7xl">
                      <Counter to={stat.to} suffix={stat.suffix} />
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
