import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductIllustration } from "@/components/catalog/ProductIllustration";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { GlowCard } from "@/components/ui/GlowCard";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { catalog } from "@/content/catalog";
import { categories, products } from "@/data/products";
import type { Product } from "@/data/types";
import { localePath, type Locale } from "@/lib/i18n";

const mono = "font-mono text-[11px] tracking-[0.16em] uppercase";

/** Up to `n` featured products, one per category first, so the row shows a range of parts. */
function featuredMix(n: number): Product[] {
  const featured = products.filter((p) => p.featured);
  const firstOfEach = featured.filter(
    (p, index) => featured.findIndex((q) => q.category === p.category) === index,
  );
  const rest = featured.filter((p) => !firstOfEach.includes(p));
  return [...firstOfEach, ...rest].slice(0, n);
}

export function CatalogTeaser({ locale }: { locale: Locale }) {
  const t = catalog.teaser;
  const catalogHref = localePath(locale, "/catalog");
  const featured = featuredMix(4);
  const viewAll = t.viewAll[locale](products.length);

  return (
    <section id="catalog-teaser" className="relative isolate overflow-clip py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 left-1/2 -z-10 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_7%,transparent),transparent)]"
      />
      <Container>
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
          </Reveal>
          <Reveal delay={0.1} className="hidden shrink-0 md:block">
            <Button href={catalogHref} variant="ghost">
              {viewAll}
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </Reveal>
        </div>

        <h3 className="sr-only">{t.categoriesLabel[locale]}</h3>
        <ul className="mt-12 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:mt-16 lg:grid-cols-5">
          {categories.map((category, index) => {
            const count = products.filter((p) => p.category === category.id).length;
            return (
              <Reveal as="li" key={category.id} delay={(index % 5) * 0.05} className="min-w-0">
                <GlowCard className="h-full">
                  <Link
                    href={`${catalogHref}?category=${category.id}`}
                    className="flex h-full flex-col rounded-2xl focus-visible:outline-offset-2"
                  >
                    <span className="m-1.5 block overflow-hidden rounded-[0.875rem]">
                      <ProductIllustration
                        category={category.id}
                        className="aspect-[4/3] w-full transition-transform duration-700 ease-out-expo group-hover/glow:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/glow:scale-100"
                      />
                    </span>
                    <span className="flex flex-1 items-end justify-between gap-3 px-3 pt-2 pb-3.5 sm:px-4 sm:pb-4">
                      <span className="min-w-0">
                        <span className="block text-sm leading-snug font-semibold text-pretty text-fg transition-colors duration-300 group-hover/glow:text-light sm:text-[15px]">
                          {category.name[locale]}
                        </span>
                        <span className={`${mono} mt-1.5 block text-muted`}>
                          {catalog.productCount[locale](count)}
                        </span>
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={1.75}
                        className="mb-0.5 size-4 shrink-0 text-muted transition-[color,transform] duration-500 ease-out-expo group-hover/glow:translate-x-0.5 group-hover/glow:-translate-y-0.5 group-hover/glow:text-accent"
                      />
                    </span>
                  </Link>
                </GlowCard>
              </Reveal>
            );
          })}
        </ul>

        <div className="mt-20 md:mt-24">
          {/* A label, not a heading: the cards below carry their own h3s. */}
          <Reveal>
            <p id="featured-products-label" className={`${mono} flex items-center gap-3 text-muted`}>
              <span aria-hidden className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
              {t.featured[locale]}
            </p>
          </Reveal>
          <ul
            aria-labelledby="featured-products-label"
            className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4"
          >
            {featured.map((product, index) => (
              <Reveal as="li" key={product.slug} delay={index * 0.06} className="min-w-0">
                <ProductCard product={product} locale={locale} inquireHref="#contact" />
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal className="mt-10 md:hidden">
          <Button href={catalogHref} variant="ghost" className="w-full">
            {viewAll}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
