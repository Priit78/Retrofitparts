import { ArrowRight, Check, ChevronRight, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { categoryName, Price, ProductCard, StockBadge } from "@/components/catalog/ProductCard";
import { ProductMedia } from "@/components/catalog/ProductMedia";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { mono, monoLabel } from "@/components/ui/styles";
import { catalog } from "@/content/catalog";
import { site } from "@/content/site";
import { products } from "@/data/products";
import type { Product } from "@/data/types";
import { getProduct, getRelated } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { clamp } from "@/lib/catalog-ui";
import { keepNumbersTogether } from "@/lib/format";
import { isLocale, localePath, type Locale } from "@/lib/i18n";
import { absoluteUrl, alternates } from "@/lib/seo";

// Every product page is generated at build time (for each locale from the layout); any other
// slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/catalog/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProduct(slug);
  if (!isLocale(locale) || !product) return {};
  // Own title, description and canonical, so the page never inherits the home page's.
  return {
    title: product.name[locale],
    description: clamp(product.description[locale], 160),
    alternates: alternates(`/catalog/${product.slug}`, locale),
  };
}

function productJsonLd(product: Product, locale: Locale) {
  const url = absoluteUrl(localePath(locale, `/catalog/${product.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.description[locale],
    sku: product.sku,
    category: categoryName(product, locale),
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: product.image ? absoluteUrl(product.image) : undefined,
    url,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "EUR",
      ...(product.price !== null ? { price: product.price.toFixed(2) } : {}),
      availability:
        product.stock === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/BackOrder",
      seller: { "@type": "Organization", name: site.legalName },
    },
  };
}

function Breadcrumb({ product, locale }: { product: Product; locale: Locale }) {
  const t = catalog.product;
  const catalogHref = localePath(locale, "/catalog");
  const linkClass = "rounded-[2px] underline-offset-4 transition-colors hover:text-fg hover:underline";
  return (
    <nav aria-label={t.breadcrumb[locale]}>
      <ol className={`${monoLabel} flex flex-wrap items-center gap-x-2 gap-y-1`}>
        <li>
          <Link href={catalogHref} className={linkClass}>
            {t.catalog[locale]}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5" strokeWidth={1.5} />
        </li>
        <li>
          <Link href={`${catalogHref}?category=${product.category}`} className={linkClass}>
            {categoryName(product, locale)}
          </Link>
        </li>
        <li aria-hidden className="max-md:hidden">
          <ChevronRight className="size-3.5" strokeWidth={1.5} />
        </li>
        <li aria-current="page" className="max-w-[28ch] truncate text-soft max-md:sr-only">
          {product.name[locale]}
        </li>
      </ol>
    </nav>
  );
}

function SpecTable({ product, locale }: { product: Product; locale: Locale }) {
  const t = catalog.product;
  const rows: { label: string; value: string }[] = [
    ...(product.sku ? [{ label: t.sku[locale], value: product.sku }] : []),
    ...(product.brand ? [{ label: t.brand[locale], value: product.brand }] : []),
    { label: t.category[locale], value: categoryName(product, locale) },
    ...product.specs.map((spec) => ({ label: spec.label[locale], value: spec.value[locale] })),
  ];
  return (
    <section aria-labelledby="specs-title">
      <h2 id="specs-title" className={monoLabel}>
        {t.specs[locale]}
      </h2>
      <dl className="mt-4 border-t border-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line py-3.5"
          >
            <dt className="text-sm leading-snug text-muted">{row.label}</dt>
            <dd className="text-sm leading-snug text-fg tabular-nums [overflow-wrap:anywhere]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Above this many vehicles the fitment list runs in two tighter columns (from `sm`). */
const LONG_FITMENT = 6;

/** "BMW X5 E53 (2003–2006)" as the model and its trailing year range, if it has one. */
function splitYears(text: string): [string, string | null] {
  const match = /^(.*\S)\s+(\([^()]*\d{4}[^()]*\))$/.exec(text);
  return match ? [match[1], match[2]] : [text, null];
}

function Fitment({ product, locale }: { product: Product; locale: Locale }) {
  const t = catalog.product;
  const long = product.fitment.length > LONG_FITMENT;
  return (
    <section aria-labelledby="fitment-title">
      <h2 id="fitment-title" className={monoLabel}>
        {t.fitment[locale]}
      </h2>
      {product.fitment.length > 0 ? (
        // Columns (not a grid) so an alphabetical list reads down the first column, then the next.
        <ul className={cn("mt-4 border-t border-line", long && "sm:columns-2 sm:gap-x-6")}>
          {product.fitment.map((entry) => {
            const [model, years] = splitYears(entry[locale]);
            return (
              <li
                key={entry.en}
                className={cn(
                  "flex min-w-0 break-inside-avoid items-start gap-3 border-b border-line text-sm leading-snug text-fg [overflow-wrap:anywhere]",
                  long ? "py-2.5" : "py-3",
                )}
              >
                <Check aria-hidden className="mt-px size-4 shrink-0 text-muted" strokeWidth={1.75} />
                <span>
                  {model}
                  {years ? (
                    <>
                      {" "}
                      <span className="whitespace-nowrap">{years}</span>
                    </>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-pretty text-soft">{t.fitmentNone[locale]}</p>
      )}
    </section>
  );
}

function ContactAside({ locale }: { locale: Locale }) {
  const t = catalog.product;
  const row =
    "flex items-center gap-3 rounded-[2px] text-sm text-fg underline-offset-4 transition-colors hover:underline";
  return (
    <div className="mt-10 border-t border-line pt-8">
      <p className={monoLabel}>{t.orCall[locale]}</p>
      <div className="mt-4 flex flex-col gap-3">
        <a href={site.phoneHref} className={`${row} text-base tabular-nums`}>
          <Phone aria-hidden className="size-4 text-muted" strokeWidth={1.5} />
          {site.phone}
        </a>
        <a href={`mailto:${site.email}`} className={row}>
          <Mail aria-hidden className="size-4 text-muted" strokeWidth={1.5} />
          {site.email}
        </a>
      </div>
      <dl className="mt-6 flex flex-col gap-1.5 text-sm">
        <dt className="sr-only">{t.hours[locale]}</dt>
        {site.hours.map((h) => (
          <dd key={h.days.en} className="flex items-center gap-3 text-muted">
            <Clock aria-hidden className="size-4" strokeWidth={1.5} />
            <span className="w-14">{h.days[locale]}</span>
            <span className="text-fg tabular-nums">{h.time ?? t.closed[locale]}</span>
          </dd>
        ))}
      </dl>
    </div>
  );
}

export default async function ProductPage({ params }: PageProps<"/[locale]/catalog/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = getProduct(slug);
  if (!product) notFound();

  const t = catalog.product;
  const related = getRelated(product, 4);
  const jsonLd = JSON.stringify(productJsonLd(product, locale)).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <div className="pt-24 pb-20 md:pt-32 md:pb-28">
        <Container>
          <Breadcrumb product={product} locale={locale} />

          <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:gap-14">
            {/* The photo once there is one (`Product.image`), else the category render */}
            <div className="lg:col-span-7">
              <figure className="relative overflow-hidden rounded-[2px] lg:sticky lg:top-28">
                <ProductMedia
                  product={product}
                  alt={product.name[locale]}
                  preload={Boolean(product.image)}
                  sizes="(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw"
                />
                {product.image ? null : (
                  <figcaption className={`${monoLabel} absolute right-4 bottom-3.5 md:right-5 md:bottom-4`}>
                    {t.illustration[locale]}
                  </figcaption>
                )}
              </figure>
            </div>

            {/* The facts */}
            <div className="lg:col-span-5">
              <p className={monoLabel}>
                {[product.brand, categoryName(product, locale)].filter(Boolean).join(" · ")}
              </p>
              <h1 className="mt-3 text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-pretty text-fg sm:text-4xl lg:text-[44px]">
                {keepNumbersTogether(product.name[locale])}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StockBadge stock={product.stock} locale={locale} variant="inline" />
                {product.warrantyYears ? (
                  <span
                    className={`${mono} inline-flex items-center gap-1.5 rounded-[2px] border border-line px-2 py-1.5 leading-none text-fg`}
                  >
                    <ShieldCheck aria-hidden className="size-3.5 text-muted" strokeWidth={1.5} />
                    {t.warranty[locale](product.warrantyYears)}
                  </span>
                ) : null}
              </div>

              <div className="mt-7 border-t border-line pt-7">
                <p className={`${monoLabel} mb-3`}>{t.price[locale]}</p>
                <Price product={product} locale={locale} size="lg" />
                <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-pretty text-soft">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.5} />
                  {t.delivery[product.stock][locale]}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="#inquiry" size="lg">
                  {t.inquire[locale]}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
                <Button href={site.phoneHref} variant="ghost" size="lg" className="tabular-nums">
                  <Phone aria-hidden className="size-4" strokeWidth={1.5} />
                  {site.phone}
                </Button>
              </div>

              <p className="mt-8 text-base leading-relaxed text-pretty text-soft md:text-[17px]">
                {product.description[locale]}
              </p>

              <div className="mt-10 flex flex-col gap-10">
                <SpecTable product={product} locale={locale} />
                <Fitment product={product} locale={locale} />
              </div>
            </div>
          </div>
        </Container>
      </div>

      <section id="inquiry" className="border-t border-line py-20 md:py-28">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-5">
            <SectionHeading
              eyebrow={t.inquiryEyebrow[locale]}
              title={t.inquiryTitle[locale]}
              intro={t.inquiryIntro[locale]}
            />
            <ContactAside locale={locale} />
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="flex h-full flex-col rounded-[2px] border border-line bg-surface p-5 sm:p-8 md:p-10">
              <InquiryForm locale={locale} defaultTopic={product.name[locale]} />
            </div>
          </Reveal>
        </Container>
      </section>

      {related.length > 0 ? (
        <section aria-labelledby="related-title" className="border-t border-line py-20 md:py-28">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <Reveal>
                <p className={`${monoLabel} mb-4`}>{t.relatedEyebrow[locale]}</p>
                <h2
                  id="related-title"
                  className="text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[44px]"
                >
                  {t.relatedTitle[locale]}
                </h2>
              </Reveal>
              <Reveal delay={0.05}>
                <Link
                  href={localePath(locale, "/catalog")}
                  className="group/back inline-flex min-h-11 items-center gap-2 rounded-[2px] text-sm font-semibold text-fg underline-offset-4 hover:underline"
                >
                  {t.backToCatalog[locale]}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:translate-x-1 motion-reduce:transition-none"
                  />
                </Link>
              </Reveal>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal as="li" key={item.slug} delay={index * 0.05} className="min-w-0">
                  <ProductCard
                    product={item}
                    locale={locale}
                    inquireHref={localePath(locale, `/catalog/${item.slug}#inquiry`)}
                  />
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
