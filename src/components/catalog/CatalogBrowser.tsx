"use client";

import { ArrowRight, SearchX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { catalog } from "@/content/catalog";
import { categories, products } from "@/data/products";
import type { Product } from "@/data/types";
import {
  filterProducts,
  filtersToQuery,
  getBrands,
  getMakes,
  parseFilters,
  type CatalogFilters,
} from "@/lib/catalog";
import { facetCounts } from "@/lib/catalog-ui";
import type { Locale } from "@/lib/i18n";
import { clearFilters, FilterBar, FilterSidebar, ResultsHeader } from "./FilterBar";
import { InquiryDrawer, type InquiryRequest } from "./InquiryDrawer";
import { ProductCard } from "./ProductCard";

const EASE = [0.16, 1, 0.3, 1] as const;
const brands = getBrands(products);
const makes = getMakes(products);
const categoryIds = categories.map((c) => c.id);
const noFilters: CatalogFilters = {};

/** Cards that stay on screen when the filters change don't re-render (props are stable). */
const GridCard = memo(ProductCard);

function EmptyState({
  locale,
  reduceMotion,
  onReset,
  onInquire,
}: {
  locale: Locale;
  reduceMotion: boolean;
  onReset: () => void;
  onInquire: () => void;
}) {
  const t = catalog.empty;
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="rounded-[2px] border border-line bg-surface"
    >
      <div className="flex flex-col items-start px-5 pt-10 pb-9 sm:px-10 md:pt-12">
        <span className="grid size-12 place-items-center rounded-[2px] border border-line text-muted">
          <SearchX aria-hidden className="size-5" strokeWidth={1.5} />
        </span>
        <h3 className="mt-6 text-2xl leading-tight font-semibold tracking-[-0.02em] text-balance text-fg md:text-[28px]">
          {t.title[locale]}
        </h3>
        <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-pretty text-soft">{t.body[locale]}</p>
        <Button variant="ghost" onClick={onReset} className="mt-7">
          {t.reset[locale]}
        </Button>
      </div>

      <div className="flex flex-col gap-5 border-t border-line px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 md:py-7">
        <div>
          <p className="text-lg leading-snug font-semibold tracking-[-0.01em] text-balance text-fg md:text-xl">
            {t.anyCar[locale]}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-soft">{t.anyCarBody[locale]}</p>
        </div>
        <Button aria-haspopup="dialog" onClick={onInquire} className="group/cta shrink-0">
          {t.inquire[locale]}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 ease-out-expo group-hover/cta:translate-x-0.5"
          />
        </Button>
      </div>
    </motion.div>
  );
}

/** The catalog for a given set of filters: facets, results header, grid, empty state, drawer. */
function CatalogView({
  locale,
  filters,
  onFiltersChange,
}: {
  locale: Locale;
  filters: CatalogFilters;
  onFiltersChange?: (patch: Partial<CatalogFilters>) => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const resultsRef = useRef<HTMLDivElement>(null);
  const [request, setRequest] = useState<InquiryRequest | null>(null);

  // Bumped by every Clear, so the search boxes also drop a query still waiting to be applied.
  const [searchReset, setSearchReset] = useState(0);

  const list = useMemo(() => filterProducts(products, filters, locale), [filters, locale]);
  const counts = useMemo(
    () => facetCounts(products, categoryIds, filters, locale),
    [filters, locale],
  );

  /** Scrolls back up to the results when a filter changes while they are scrolled past. */
  const reveal = useCallback(() => {
    const el = resultsRef.current;
    if (!el || el.getBoundingClientRect().top >= 0) return;
    el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [reduceMotion]);

  const change = useCallback(
    (patch: Partial<CatalogFilters>, options?: { reveal?: boolean }) => {
      onFiltersChange?.(patch);
      if (options?.reveal) reveal();
    },
    [onFiltersChange, reveal],
  );

  const clear = useCallback(
    (options?: { reveal?: boolean }) => {
      setSearchReset((n) => n + 1);
      change(clearFilters, options);
    },
    [change],
  );

  const inquire = useCallback(
    (product: Product) => setRequest({ key: product.slug, product }),
    [],
  );

  const facetProps = {
    locale,
    filters,
    onChange: change,
    onClear: clear,
    searchReset,
    counts,
    brands,
    makes,
  };

  return (
    <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[16.5rem_minmax(0,1fr)] xl:gap-16">
      <FilterSidebar {...facetProps} />

      <div className="min-w-0">
        <FilterBar {...facetProps} resultCount={list.length} onReveal={reveal} />

        <div ref={resultsRef} className="scroll-mt-36 lg:scroll-mt-28">
          <ResultsHeader
            locale={locale}
            filters={filters}
            onChange={change}
            brands={brands}
            makes={makes}
            resultCount={list.length}
          />
          <h2 className="sr-only">{catalog.results.heading[locale]}</h2>

          {list.length > 0 ? (
            <ul className="relative grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence initial={false} mode="popLayout">
                {list.map((product) => (
                  <motion.li
                    key={product.slug}
                    layout={reduceMotion ? false : "position"}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: EASE }}
                    className="min-w-0"
                  >
                    <GridCard product={product} locale={locale} onInquire={inquire} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <EmptyState
              locale={locale}
              reduceMotion={reduceMotion}
              onReset={() => clear()}
              onInquire={() => setRequest({ key: "general" })}
            />
          )}
        </div>
      </div>

      <InquiryDrawer locale={locale} request={request} onClose={() => setRequest(null)} />
    </div>
  );
}

/**
 * The interactive catalog. Filter state lives in the URL query (`?category=lenses&make=BMW`),
 * so views can be shared and linked; invalid values in a hand-edited URL are ignored by
 * `parseFilters`. Reading the query makes this part client-rendered, so the page wraps it in
 * `<Suspense>` with `CatalogBrowserFallback` and stays static.
 *
 * Filter changes replace the URL with `history.replaceState`, which the App Router syncs into
 * `useSearchParams` without a navigation: the page is static and filters on the client, so
 * `router.replace` would only add a server round trip (and a request) to every chip or keystroke.
 * The scroll position is untouched, as with `router.replace(…, { scroll: false })`.
 */
export function CatalogBrowser({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  // Patches apply to the URL as it is now, not to the last render: two quick changes (a chip,
  // then a select) both stick even if React hasn't re-rendered in between.
  const setFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      const current = parseFilters(new URLSearchParams(window.location.search));
      const query = filtersToQuery({ ...current, ...patch });
      window.history.replaceState(null, "", `${pathname}${query}`);
    },
    [pathname],
  );

  return <CatalogView locale={locale} filters={filters} onFiltersChange={setFilters} />;
}

/** Server-rendered stand-in: the full, unfiltered catalog, until the query has been read. */
export function CatalogBrowserFallback({ locale }: { locale: Locale }) {
  return <CatalogView locale={locale} filters={noFilters} />;
}
