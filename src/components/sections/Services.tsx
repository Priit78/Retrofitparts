import { ArrowRight } from "lucide-react";
import { common } from "@/content/common";
import { formatEur, services } from "@/content/services";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { fillTemplate } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";

const mono = "font-mono text-xs tracking-[0.08em] uppercase text-muted";
const link =
  "text-fg underline decoration-fg/35 underline-offset-4 transition-colors hover:decoration-fg";

/** The installation price "menu": one hairline row per vehicle type, prices from site.ts. */
function PriceMenu({ locale }: { locale: Locale }) {
  const t = services.priceTable;
  const cell = "py-[22px] align-baseline";
  const email = (
    <a href={`mailto:${site.email}`} className={link}>
      {site.email}
    </a>
  );

  return (
    <div>
      <table className="w-full border-collapse text-left tabular-nums">
        <caption className="sr-only">{services.title[locale]}</caption>
        {/* Column names for screen readers only: the cells have no padding, so the row has no height. */}
        <thead>
          <tr>
            <th scope="col" className="p-0 font-normal">
              <span className="sr-only">{t.colVehicle[locale]}</span>
            </th>
            <th scope="col" className="hidden p-0 font-normal sm:table-cell">
              <span className="sr-only">{t.colDuration[locale]}</span>
            </th>
            <th scope="col" className="p-0 font-normal">
              <span className="sr-only">{t.colPrice[locale]}</span>
            </th>
          </tr>
        </thead>
        <tbody className="border-t border-line">
          {site.pricing.map((item) => {
            const duration = item.duration?.[locale] ?? t.durationOnRequest[locale];
            return (
              <tr key={item.id} className="border-b border-line">
                <th scope="row" className={`${cell} pr-4 font-normal sm:pr-6`}>
                  <span className="block text-base leading-snug text-fg md:text-[17px]">
                    {item.label[locale]}
                  </span>
                  <span className="mt-1.5 block text-sm text-muted sm:hidden">{duration}</span>
                </th>
                <td
                  className={`${cell} hidden w-px pr-6 text-right text-sm whitespace-nowrap text-muted sm:table-cell`}
                >
                  {duration}
                </td>
                <td className={`${cell} w-px text-right whitespace-nowrap`}>
                  <span className="block min-w-[6ch] text-xs tracking-[0.06em] text-muted uppercase">
                    {t.from[locale]}
                  </span>
                  <span className="block text-[22px] leading-tight font-semibold text-fg">
                    {formatEur(locale, item.priceEur)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        {fillTemplate(t.notSure[locale], { email })}
      </p>
    </div>
  );
}

export function Services({ locale }: { locale: Locale }) {
  const list = services.list;

  return (
    <section id="services" className="relative py-24 md:py-30">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              eyebrow={services.eyebrow[locale]}
              title={services.title[locale]}
              intro={services.intro[locale]}
            />
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.08}>
            <PriceMenu locale={locale} />
          </Reveal>
        </div>

        <div className="mt-20 grid gap-10 md:mt-28 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <p className={mono}>{list.eyebrow[locale]}</p>
            <h3 className="mt-4 max-w-[22ch] text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance text-fg md:text-[28px]">
              {list.title[locale]}
            </h3>
            <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-pretty text-soft">
              {list.intro[locale]}
            </p>
          </Reveal>

          <Reveal className="lg:col-span-7" delay={0.08}>
            <ul className="grid sm:grid-cols-2 sm:gap-x-10">
              {services.items.map((item) => (
                <li
                  key={item.id}
                  className="border-b border-line py-5 first:border-t sm:nth-2:border-t md:py-6"
                >
                  <h4 className="text-base leading-snug font-semibold text-fg md:text-[17px]">
                    {item.title[locale]}
                  </h4>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-pretty text-muted">
                    {item.body[locale]}
                  </p>
                </li>
              ))}
            </ul>
            <a
              href="#contact"
              className="group/cta mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-fg underline decoration-transparent underline-offset-4 transition-colors hover:decoration-fg/50"
            >
              {common.requestOffer[locale]}
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300 ease-out-expo group-hover/cta:translate-x-1 motion-reduce:transition-none"
              />
            </a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
