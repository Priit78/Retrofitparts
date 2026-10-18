import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogBrowser, CatalogBrowserFallback } from "@/components/catalog/CatalogBrowser";
import { Container } from "@/components/ui/Container";
import { monoLabel } from "@/components/ui/styles";
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
    <header className="border-b border-line pt-28 pb-10 sm:pt-32 md:pt-40 md:pb-14">
      <Container className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
        <div className="lg:col-span-8">
          <p className={`${monoLabel} mb-4`}>{t.eyebrow[locale]}</p>
          <h1 className="max-w-[18ch] text-[clamp(2.5rem,6vw,4.5rem)] leading-[1] font-semibold tracking-[-0.035em] text-balance text-fg">
            {t.title[locale]}
          </h1>
          <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-soft md:text-[17px]">
            {t.intro[locale]}
          </p>
        </div>
        <dl className="grid grid-cols-3 border-t border-line max-sm:hidden lg:col-span-4 lg:pb-1">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-2 border-line pt-5 not-first:border-l not-first:pl-5"
            >
              <dt className={`${monoLabel} order-2`}>
                {stat.label(stat.value)}
              </dt>
              <dd className="order-1 text-3xl leading-none font-semibold tracking-[-0.02em] text-fg tabular-nums md:text-4xl">
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
      <Container className="pt-6 pb-24 md:pt-12 md:pb-32">
        {/* Reading the query is client-only; the fallback is the full catalog, so the static
            HTML is never empty. */}
        <Suspense fallback={<CatalogBrowserFallback locale={locale} />}>
          <CatalogBrowser locale={locale} />
        </Suspense>
      </Container>
    </>
  );
}
