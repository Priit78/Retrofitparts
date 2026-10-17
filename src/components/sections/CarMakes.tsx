import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { makes } from "@/content/makes";
import { formatEur, services } from "@/content/services";
import { site } from "@/content/site";
import { products } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { localePath, type Locale } from "@/lib/i18n";

const mono = "font-mono text-[11px] tracking-[0.18em] uppercase";

function catalogHref(locale: Locale, make: string) {
  return localePath(locale, "/catalog") + "?make=" + encodeURIComponent(make);
}

export function CarMakes({ locale }: { locale: Locale }) {
  const moto = site.pricing.find((item) => item.id === "moto");

  return (
    <section id="makes" className="relative py-24 md:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={makes.eyebrow[locale]}
            title={makes.title[locale]}
            intro={makes.intro[locale]}
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14 md:mt-16">
          {/* Shared hairlines: each tile draws its top and left edge, the list clips the outer ones. */}
          <ul className="grid grid-cols-1 overflow-hidden rounded-2xl border border-line sm:grid-cols-2 lg:grid-cols-3">
            {site.vehicleMakes.map((make, index) => {
              const count = products.filter((product) => product.makes.includes(make)).length;
              const label = count > 0 ? makes.productCount[locale](count) : makes.viewParts[locale];
              return (
                <li
                  key={make}
                  className="-mt-px -ml-px border-t border-l border-line sm:last:col-span-2 lg:last:col-span-1"
                >
                  <Link
                    href={catalogHref(locale, make)}
                    // Nine links to the same page: prefetching each one only wastes requests.
                    prefetch={false}
                    className="group/make @container relative flex h-full min-h-24 items-center justify-between gap-4 overflow-hidden px-6 py-6 transition-colors duration-500 hover:bg-surface focus-visible:outline-offset-[-2px] sm:min-h-40 sm:flex-col sm:items-stretch md:min-h-44 md:p-8"
                  >
                    {/* A sweep of light across the tile on hover. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-accent/10 to-transparent opacity-0 transition-[translate,opacity] duration-1000 ease-out-expo group-hover/make:translate-x-[300%] group-hover/make:opacity-100 motion-reduce:hidden"
                    />
                    <span className="relative min-w-0 font-display text-3xl leading-[0.95] font-semibold tracking-tight text-fg uppercase [font-stretch:125%] transition-colors duration-500 group-hover/make:text-light sm:text-[clamp(1.5rem,9cqi,3rem)]">
                      {make}
                    </span>
                    <span className="relative flex shrink-0 items-center justify-between gap-4">
                      <span
                        className={`${mono} flex items-center gap-2 text-muted transition-colors duration-500 group-hover/make:text-accent`}
                      >
                        <span className="sr-only sm:not-sr-only">{label}</span>
                        <ArrowUpRight
                          aria-hidden
                          className="size-5 transition-transform duration-500 ease-out-expo group-hover/make:translate-x-0.5 group-hover/make:-translate-y-0.5 sm:size-4"
                        />
                      </span>
                      <span aria-hidden className="hidden font-mono text-xs text-muted sm:block">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {moto ? (
            <Reveal
              delay={0.15}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center md:p-8"
            >
              <div>
                <p className={`${mono} text-accent`}>{makes.motoTitle[locale]}</p>
                <p className="mt-3 max-w-xs text-base leading-relaxed text-muted">
                  {makes.motoBody[locale]}
                </p>
              </div>
              <p className="shrink-0 sm:text-right">
                <span className={`${mono} block text-muted`}>{services.priceTable.from[locale]}</span>
                <span className="mt-1 block font-display text-3xl leading-none font-semibold text-light [font-stretch:125%]">
                  {formatEur(locale, moto.priceEur)}
                </span>
                <span className={`${mono} mt-2 block text-muted`}>{services.priceTable.vatBadge[locale]}</span>
              </p>
            </Reveal>
          ) : null}
          <Reveal delay={0.2} className={moto ? undefined : "md:col-span-2"}>
            <a
              href="#contact"
              className="group/any relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-accent/25 bg-linear-to-br from-accent/10 via-surface to-surface p-6 transition-colors duration-500 hover:border-accent/50 md:p-8"
            >
              <span className="font-display text-xl leading-snug font-semibold text-balance text-fg [font-stretch:125%] md:text-2xl">
                {makes.anyCar[locale]}
              </span>
              <span className="flex items-end justify-between gap-4">
                <span className="text-sm leading-relaxed text-muted">{makes.anyCarBody[locale]}</span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-light text-bg transition-transform duration-500 ease-out-expo group-hover/any:translate-x-1">
                  <ArrowRight aria-hidden className="size-4" />
                </span>
              </span>
            </a>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
