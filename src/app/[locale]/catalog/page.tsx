import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogBrowser, CatalogBrowserFallback } from "@/components/catalog/CatalogBrowser";
import { Container } from "@/components/ui/Container";
import { catalog } from "@/content/catalog";
import { categories, products } from "@/data/products";
import { getBrands } from "@/lib/catalog";
import { isLocale, type Locale } from "@/lib/i18n";
import { alternates } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[locale]/catalog">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Title, description and canonical are set here so this page never inherits the home page's;
  // Open Graph fills its title and description from them (see the layout).
  return {
    title: catalog.meta.title[locale],
    description: catalog.meta.description[locale],
    alternates: alternates("/catalog", locale),
  };
}

function CatalogHero({ locale }: { locale: Locale }) {
  const t = catalog.hero;
  const stats = [
    { id: "products", value: products.length, label: t.stats.products[locale] },
    { id: "categories", value: categories.length, label: t.stats.categories[locale] },
    { id: "brands", value: getBrands(products).length, label: t.stats.brands[locale] },
  ];

  return (
    <header className="relative isolate overflow-hidden pt-24 pb-8 sm:pt-28 sm:pb-10 md:pt-36 md:pb-12">
      {/* A cold light falling from above, and the hairline it lands on. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] bg-radial-[50%_60%_at_50%_0%] from-accent/[0.13] via-accent/[0.03] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-px bg-linear-to-r from-transparent via-fg/15 to-transparent"
      />
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
            <span aria-hidden className="h-px w-8 bg-accent/60" />
            {t.eyebrow[locale]}
          </p>
          <h1 className="text-[2.125rem] leading-[1.02] font-semibold tracking-tight text-balance text-fg sm:text-5xl lg:text-[3.5rem]">
            {t.title[locale]}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted md:text-lg">
            {t.intro[locale]}
          </p>
        </div>
        <dl className="grid grid-cols-3 border-t border-line pt-5 max-sm:hidden lg:col-span-5 lg:flex lg:justify-end lg:border-t-0 lg:pt-0 lg:pb-1 xl:col-span-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-2 border-line not-first:border-l not-first:pl-4 sm:not-first:pl-6 lg:px-7 lg:first:pl-0 lg:last:pr-0"
            >
              <dt className="order-2 font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                {stat.label(stat.value)}
              </dt>
              <dd className="order-1 font-display text-3xl leading-none font-semibold text-light tabular-nums [font-stretch:125%] md:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </header>
  );
}

export default async function CatalogPage({ params }: PageProps<"/[locale]/catalog">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <CatalogHero locale={locale} />
      <Container className="pt-6 pb-24 md:pt-10 md:pb-32">
        {/* Reading the query is client-only; the fallback is the full catalog, so the static
            HTML is never empty. */}
        <Suspense fallback={<CatalogBrowserFallback locale={locale} />}>
          <CatalogBrowser locale={locale} />
        </Suspense>
      </Container>
    </>
  );
}
