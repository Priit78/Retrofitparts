import { ArrowRight, Check, ChevronRight, Clock, Mail, Phone, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import {
  categoryName,
  Price,
  ProductCard,
  StockBadge,
} from "@/components/catalog/ProductCard";
import { ProductIllustration } from "@/components/catalog/ProductIllustration";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { catalog } from "@/content/catalog";
import { site } from "@/content/site";
import { products } from "@/data/products";
import type { Product } from "@/data/types";
import { getProduct, getRelated } from "@/lib/catalog";
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

const mono = "font-mono text-[11px] tracking-[0.16em] uppercase";

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
  const linkClass = "rounded-sm transition-colors hover:text-fg";
  return (
    <nav aria-label={t.breadcrumb[locale]}>
      <ol className={`${mono} flex flex-wrap items-center gap-x-2 gap-y-1 text-muted`}>
        <li>
          <Link href={catalogHref} className={linkClass}>
            {t.catalog[locale]}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5 text-muted/60" />
        </li>
        <li>
          <Link href={`${catalogHref}?category=${product.category}`} className={linkClass}>
            {categoryName(product, locale)}
          </Link>
        </li>
        <li aria-hidden className="max-md:hidden">
          <ChevronRight className="size-3.5 text-muted/60" />
        </li>
        <li aria-current="page" className="max-w-[28ch] truncate text-fg max-md:sr-only">
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
      <h2 id="specs-title" className={`${mono} text-accent`}>
        {t.specs[locale]}
      </h2>
      <dl className="mt-4 border-t border-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line py-3.5"
          >
            <dt className="text-sm leading-snug text-muted">{row.label}</dt>
            <dd className="text-sm leading-snug text-fg [overflow-wrap:anywhere]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Fitment({ product, locale }: { product: Product; locale: Locale }) {
  const t = catalog.product;
  return (
    <section aria-labelledby="fitment-title">
      <h2 id="fitment-title" className={`${mono} text-accent`}>
        {t.fitment[locale]}
      </h2>
      {product.fitment.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2.5">
          {product.fitment.map((entry) => (
            <li key={entry.en} className="flex items-start gap-3 text-sm leading-snug text-fg">
              <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent/10 text-accent">
                <Check aria-hidden className="size-3" strokeWidth={2.5} />
              </span>
              {entry[locale]}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-relaxed text-pretty text-muted">{t.fitmentNone[locale]}</p>
      )}
    </section>
  );
}

function ContactAside({ locale }: { locale: Locale }) {
  const t = catalog.product;
  const row = "flex items-center gap-3 text-sm text-fg transition-colors hover:text-light";
  return (
    <div className="mt-10 border-t border-line pt-8">
      <p className={`${mono} text-muted`}>{t.orCall[locale]}</p>
      <div className="mt-4 flex flex-col gap-3">
        <a href={site.phoneHref} className={`${row} font-mono text-base tracking-wide`}>
          <Phone aria-hidden className="size-4 text-accent" strokeWidth={1.75} />
          {site.phone}
        </a>
        <a href={`mailto:${site.email}`} className={row}>
          <Mail aria-hidden className="size-4 text-accent" strokeWidth={1.75} />
          {site.email}
        </a>
      </div>
      <dl className="mt-6 flex flex-col gap-1.5 text-sm">
        <dt className="sr-only">{t.hours[locale]}</dt>
        {site.hours.map((h) => (
          <dd key={h.days.en} className="flex items-center gap-3 text-muted">
            <Clock aria-hidden className="size-4 text-muted/70" strokeWidth={1.75} />
            <span className="w-14">{h.days[locale]}</span>
            <span className="font-mono text-fg">{h.time ?? t.closed[locale]}</span>
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

      <div className="relative isolate overflow-clip pt-24 pb-20 md:pt-32 md:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] bg-radial-[45%_55%_at_30%_0%] from-accent/[0.1] to-transparent"
        />
        <Container>
          <Breadcrumb product={product} locale={locale} />

          <div className="mt-6 grid gap-8 md:mt-8 lg:grid-cols-12 lg:gap-14">
            {/* The photo once there is one (`Product.image`), else the category render */}
            <div className="lg:col-span-7">
              <figure className="relative overflow-hidden rounded-3xl border border-line bg-bg lg:sticky lg:top-28">
                {product.image ? (
                  <div className="relative aspect-[4/3] w-full">
                    <Image
                      src={product.image}
                      alt={product.name[locale]}
                      fill
                      priority
                      sizes="(min-width: 1280px) 720px, (min-width: 1024px) 56vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ProductIllustration category={product.category} className="aspect-[4/3] w-full" />
                )}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-light/25 to-transparent"
                />
                {product.image ? null : (
                  <figcaption className={`${mono} absolute right-4 bottom-3.5 text-muted md:right-5 md:bottom-4`}>
                    {t.illustration[locale]}
                  </figcaption>
                )}
              </figure>
            </div>

            {/* The facts */}
            <div className="lg:col-span-5">
              <p className={`${mono} text-muted`}>
                {[product.brand, categoryName(product, locale)].filter(Boolean).join(" · ")}
              </p>
              <h1 className="mt-3 text-[1.75rem] leading-[1.08] font-semibold tracking-tight text-pretty text-fg sm:text-4xl lg:text-[2.5rem]">
                {keepNumbersTogether(product.name[locale])}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <StockBadge stock={product.stock} locale={locale} />
                {product.warrantyYears ? (
                  <span className={`${mono} inline-flex items-center gap-1.5 rounded-full border border-line bg-bg/85 px-2.5 py-1 leading-none text-fg`}>
                    <ShieldCheck aria-hidden className="size-3.5 text-accent" strokeWidth={1.75} />
                    {t.warranty[locale](product.warrantyYears)}
                  </span>
                ) : null}
              </div>

              <div className="mt-7 border-t border-line pt-7">
                <p className={`${mono} mb-3 text-muted`}>{t.price[locale]}</p>
                <Price product={product} locale={locale} size="lg" />
                <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-pretty text-muted">
                  <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
                  {t.delivery[product.stock][locale]}
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button href="#inquiry" size="lg">
                  {t.inquire[locale]}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
                <Button href={site.phoneHref} variant="ghost" size="lg" className="font-mono tracking-wide">
                  <Phone aria-hidden className="size-4 text-accent" strokeWidth={1.75} />
                  {site.phone}
                </Button>
              </div>

              <p className="mt-8 text-base leading-relaxed text-pretty text-muted">
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

      <section id="inquiry" className="relative overflow-hidden border-t border-line py-20 md:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-radial-[55%_45%_at_12%_0%] from-accent/10 to-transparent to-70%"
        />
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
            <div className="relative flex h-full flex-col rounded-3xl border border-line bg-surface/70 p-5 before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-accent/50 before:to-transparent sm:p-8 md:p-10">
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
                <p className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
                  <span aria-hidden className="h-px w-8 bg-accent/60" />
                  {t.relatedEyebrow[locale]}
                </p>
                <h2
                  id="related-title"
                  className="text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-fg md:text-4xl"
                >
                  {t.relatedTitle[locale]}
                </h2>
              </Reveal>
              <Reveal delay={0.05}>
                <Link
                  href={localePath(locale, "/catalog")}
                  className="group/back inline-flex items-center gap-2 rounded-sm text-sm font-medium text-light transition-colors hover:text-accent"
                >
                  {t.backToCatalog[locale]}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 ease-out-expo group-hover/back:translate-x-1"
                  />
                </Link>
              </Reveal>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
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
