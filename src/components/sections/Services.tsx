import {
  Aperture,
  ArrowRight,
  Droplets,
  Focus,
  PackageSearch,
  Rotate3d,
  SunMedium,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { common } from "@/content/common";
import { formatEur, services, type ServiceId } from "@/content/services";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { fillTemplate } from "@/components/ui/fillTemplate";
import { GlowCard } from "@/components/ui/GlowCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";

const icons: Record<ServiceId, LucideIcon> = {
  "projector-retrofit": Aperture,
  "lens-replacement": Focus,
  restoration: Wrench,
  "led-high-beams": SunMedium,
  afs: Rotate3d,
  resealing: Droplets,
  "xenon-repair": Zap,
  "special-orders": PackageSearch,
};

const mono = "font-mono text-[11px] tracking-[0.18em] uppercase";

function PriceTable({ locale }: { locale: Locale }) {
  const t = services.priceTable;
  const emailLink = (
    <a
      href={`mailto:${site.email}`}
      className="text-light underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
    >
      {site.email}
    </a>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface">
      {/* A strip of light along the top edge, and a faint pool of it below. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/80 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-3/4 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
      />

      <table className="relative w-full border-collapse text-left">
        <caption className="px-5 pt-6 pb-2 text-left sm:px-7 sm:pt-7">
          <span className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-semibold text-fg [font-stretch:125%] font-display">
              {t.caption[locale]}
            </span>
            <span className={`${mono} rounded-full border border-accent/30 px-3 py-1 text-accent`}>
              {t.vatBadge[locale]}
            </span>
          </span>
        </caption>
        <thead>
          <tr className={`${mono} border-b border-line text-muted`}>
            <th scope="col" className="px-5 py-3 font-normal sm:px-7">
              {t.colVehicle[locale]}
            </th>
            <th scope="col" className="hidden px-4 py-3 font-normal sm:table-cell">
              {t.colDuration[locale]}
            </th>
            <th scope="col" className="px-5 py-3 text-right font-normal sm:px-7">
              {t.colPrice[locale]}
            </th>
          </tr>
        </thead>
        <tbody>
          {site.pricing.map((item) => {
            const duration = item.duration?.[locale] ?? t.durationOnRequest[locale];
            return (
              <tr key={item.id} className="border-b border-line last:border-b-0">
                <th scope="row" className="px-5 py-5 align-middle font-normal sm:px-7">
                  <span className="block text-[15px] leading-snug text-fg">{item.label[locale]}</span>
                  <span className="mt-1.5 block font-mono text-xs text-muted sm:hidden">{duration}</span>
                </th>
                <td className="hidden px-4 py-5 align-middle font-mono text-[13px] whitespace-nowrap text-muted sm:table-cell">
                  {duration}
                </td>
                <td className="px-5 py-5 text-right align-middle whitespace-nowrap sm:px-7">
                  <span className={`${mono} block text-muted`}>{t.from[locale]}</span>
                  <span className="font-display text-2xl leading-none font-semibold text-light [font-stretch:125%] md:text-3xl">
                    {formatEur(locale, item.priceEur)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="relative space-y-1.5 border-t border-line bg-bg/40 px-5 py-5 text-sm leading-relaxed text-muted sm:px-7">
        <p>{t.footnote[locale]}</p>
        <p>{fillTemplate(t.notSure[locale], { email: emailLink })}</p>
      </div>
    </div>
  );
}

export function Services({ locale }: { locale: Locale }) {
  return (
    <section id="services" className="relative py-24 md:py-36">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <Reveal className="lg:col-span-6">
            <SectionHeading
              eyebrow={services.eyebrow[locale]}
              title={services.title[locale]}
              intro={services.intro[locale]}
            />
          </Reveal>
          <Reveal className="lg:col-span-6" delay={0.1}>
            <PriceTable locale={locale} />
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4">
          {services.items.map((item, index) => {
            const Icon = icons[item.id];
            const titleId = `service-${item.id}`;
            return (
              <Reveal as="li" key={item.id} delay={(index % 4) * 0.06} className="h-full">
                <GlowCard className="h-full">
                  <article className="flex h-full flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-xl border border-line bg-surface-2 text-accent transition-colors duration-500 group-hover/glow:border-accent/40">
                        <Icon aria-hidden className="size-5" strokeWidth={1.5} />
                      </span>
                      <span aria-hidden className="font-mono text-xs text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 id={titleId} className="mt-5 text-lg leading-snug font-semibold text-fg sm:mt-8">
                      {item.title[locale]}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{item.body[locale]}</p>
                    <a
                      href="#contact"
                      aria-describedby={titleId}
                      className="group/cta mt-auto inline-flex items-center gap-2 self-start pt-5 text-sm font-medium text-light transition-colors hover:text-accent sm:pt-7"
                    >
                      {common.requestOffer[locale]}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform duration-300 ease-out-expo group-hover/cta:translate-x-1"
                      />
                    </a>
                  </article>
                </GlowCard>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
