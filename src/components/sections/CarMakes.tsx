import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { common } from "@/content/common";
import { makes } from "@/content/makes";
import { formatEur, services } from "@/content/services";
import { site } from "@/content/site";
import { products } from "@/data/products";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { monoLabel } from "@/components/ui/styles";
import { localePath, type Locale } from "@/lib/i18n";

function catalogHref(locale: Locale, make: string) {
  return localePath(locale, "/catalog") + "?make=" + encodeURIComponent(make);
}

export function CarMakes({ locale }: { locale: Locale }) {
  const moto = site.pricing.find((item) => item.id === "moto");

  return (
    <section id="makes" className="border-t border-line py-18 md:py-30">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={makes.eyebrow[locale]}
            title={makes.title[locale]}
            intro={makes.intro[locale]}
          />
        </Reveal>

        <Reveal delay={0.08} className="mt-12 md:mt-16">
          {/* A hairline table: rules above and below, and between the tiles. Each tile draws its
              top and left edge; the list clips the ones that would sit on its outer edge.
              Ten makes: one column on phones, 2 × 5 on tablets, 5 × 2 from lg, so no row is
              left with an orphan tile. */}
          <ul className="grid grid-cols-1 overflow-hidden border-y border-line sm:grid-cols-2 lg:grid-cols-5">
            {site.vehicleMakes.map((make) => {
              const count = products.filter((product) => product.makes.includes(make)).length;
              const label = count > 0 ? makes.productCount[locale](count) : makes.viewParts[locale];
              return (
                <li key={make} className="-mt-px -ml-px border-t border-l border-line">
                  <Link
                    href={catalogHref(locale, make)}
                    // Ten links to the same page: prefetching each one only wastes requests.
                    prefetch={false}
                    // Phones: a plain list, the make over its count, flush with the heading, and the
                    // arrow on the right. Wider: tiles, the make on top, the count and the arrow
                    // along the bottom.
                    className="group/make grid h-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-5 transition-colors duration-300 focus-visible:outline-offset-[-2px] sm:min-h-36 sm:grid-rows-[1fr_auto] sm:gap-y-6 sm:p-6 sm:hover:bg-surface md:min-h-40 md:p-8 lg:p-6 xl:p-7"
                  >
                    <span className="min-w-0 self-start text-2xl leading-tight font-semibold tracking-[-0.02em] text-fg underline decoration-transparent decoration-1 underline-offset-[6px] transition-colors duration-300 group-hover/make:decoration-fg/60 sm:col-span-2 md:text-[32px] lg:text-2xl xl:text-[26px]">
                      {make}
                    </span>
                    <span className={`${monoLabel} col-start-1 row-start-2 tabular-nums`}>{label}</span>
                    <ArrowUpRight
                      aria-hidden
                      className="col-start-2 row-span-2 row-start-1 size-4 text-muted transition-[color,translate] duration-300 ease-out-expo group-hover/make:translate-x-0.5 group-hover/make:-translate-y-0.5 group-hover/make:text-fg motion-reduce:transition-none sm:row-span-1 sm:row-start-2"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.12} className="mt-12 md:mt-16">
          {/* Its divider lines up with the grid above: after the first column on tablets, after
              the second from lg. */}
          <div className="grid border-y border-line sm:grid-cols-2 lg:grid-cols-5">
            {moto ? (
              <div className="flex items-end justify-between gap-6 py-6 sm:p-6 md:p-8 lg:col-span-2 lg:p-6 xl:p-7">
                <div className="min-w-0">
                  <p className={monoLabel}>{makes.motoTitle[locale]}</p>
                  <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-soft">
                    {makes.motoBody[locale]}
                  </p>
                </div>
                <p className="shrink-0 text-right tabular-nums">
                  <span className="block text-xs tracking-[0.06em] text-muted uppercase">
                    {services.priceTable.from[locale]}
                  </span>
                  <span className="block text-[22px] leading-tight font-semibold text-fg">
                    {formatEur(locale, moto.priceEur)}
                  </span>
                </p>
              </div>
            ) : null}
            <a
              href="#contact"
              className={
                moto
                  ? "group/any flex flex-col justify-between gap-5 border-t border-line py-6 transition-colors duration-300 focus-visible:outline-offset-[-2px] sm:border-t-0 sm:border-l sm:p-6 sm:hover:bg-surface md:p-8 lg:col-span-3 lg:p-6 xl:p-7"
                  : "group/any flex flex-col justify-between gap-5 py-6 transition-colors duration-300 focus-visible:outline-offset-[-2px] sm:col-span-2 sm:p-6 sm:hover:bg-surface md:p-8 lg:col-span-5 lg:p-6 xl:p-7"
              }
            >
              <span className="block">
                <span className="block text-xl leading-snug font-semibold tracking-[-0.02em] text-balance text-fg md:text-2xl">
                  {makes.anyCar[locale]}
                </span>
                <span className="mt-2 block text-[15px] leading-relaxed text-soft">
                  {makes.anyCarBody[locale]}
                </span>
              </span>
              <span className="inline-flex items-center gap-2 text-[15px] font-medium text-fg underline decoration-transparent underline-offset-4 transition-colors group-hover/any:decoration-fg/50">
                {common.requestOffer[locale]}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover/any:translate-x-1 motion-reduce:transition-none"
                />
              </span>
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
