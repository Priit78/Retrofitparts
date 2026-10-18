import { categories, products } from "@/data/products";
import type { CategoryId, Product } from "@/data/types";
import type { Locale } from "@/lib/i18n";

/** Sort options for the catalog UI; the first one is the default. */
export const sorts = ["featured", "price-asc", "price-desc"] as const;

export type CatalogSort = (typeof sorts)[number];

export interface CatalogFilters {
  /**
   * One or more categories (a product matches if it is in any of them), never empty, without
   * duplicates and in the display order of `categories`. Absent means every category.
   */
  category?: CategoryId[];
  brand?: string;
  make?: string;
  q?: string;
  sort?: CatalogSort;
}

type RawParams = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: RawParams, key: string): string | undefined {
  const raw = params instanceof URLSearchParams ? params.get(key) : params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * The categories in a `category` param (`lenses` or `led-projectors,led-lights`): known ids
 * only, each once, in display order, so every spelling of a set reads (and writes) the same.
 * `undefined` when none is left, which means every category.
 */
function parseCategories(raw: string | undefined): CategoryId[] | undefined {
  if (!raw) return undefined;
  const wanted = new Set(raw.split(",").map((id) => id.trim()));
  const ids = categories.map((c) => c.id).filter((id) => wanted.has(id));
  return ids.length > 0 ? ids : undefined;
}

/**
 * Reads catalog filters from URL params. Unknown categories and sort values are dropped;
 * brand, make and q are kept as text (a stale link then simply shows no results).
 */
export function parseFilters(params: RawParams): CatalogFilters {
  const filters: CatalogFilters = {};

  const category = parseCategories(readParam(params, "category"));
  if (category) filters.category = category;

  const brand = readParam(params, "brand");
  if (brand) filters.brand = brand;

  const make = readParam(params, "make");
  if (make) filters.make = make;

  const q = readParam(params, "q");
  if (q) filters.q = q;

  const sort = readParam(params, "sort");
  if (sort && (sorts as readonly string[]).includes(sort)) {
    filters.sort = sort as CatalogSort;
  }

  return filters;
}

/**
 * Serialises filters to `''`, `'?category=lenses&make=BMW'` or
 * `'?category=led-projectors,led-lights'`, keys in a fixed order. Commas stay readable: they
 * need no escaping in a query, and `parseFilters` only splits the category on them.
 */
export function filtersToQuery(f: CatalogFilters): string {
  const params = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    ["category", f.category?.join(",")],
    ["brand", f.brand],
    ["make", f.make],
    ["q", f.q],
    ["sort", f.sort],
  ];
  for (const [key, value] of entries) {
    if (value) params.set(key, value);
  }
  const query = params.toString().replace(/%2C/gi, ",");
  return query ? `?${query}` : "";
}

/** Lower-cases and strips diacritics so "butuul" finds "butüülliim" and "ohuti" finds "Õhuti". */
function normalize(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function searchText(p: Product): string {
  return normalize(
    [p.name.et, p.name.en, p.brand, p.sku, ...p.fitment.flatMap((f) => [f.et, f.en])]
      .filter(Boolean)
      .join(" "),
  );
}

function compareName(a: Product, b: Product, locale: Locale): number {
  return a.name[locale].localeCompare(b.name[locale], locale);
}

/** Cheapest first (or dearest first); products without a price always come last. */
function comparePrice(direction: 1 | -1, locale: Locale) {
  return (a: Product, b: Product): number => {
    if (a.price === null && b.price === null) return compareName(a, b, locale);
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return direction * (a.price - b.price) || compareName(a, b, locale);
  };
}

export function filterProducts(
  list: Product[],
  f: CatalogFilters,
  locale: Locale,
): Product[] {
  const brand = f.brand ? normalize(f.brand) : undefined;
  const make = f.make ? normalize(f.make) : undefined;
  const words = f.q ? normalize(f.q).split(/\s+/).filter(Boolean) : [];

  const result = list.filter((p) => {
    if (f.category && !f.category.includes(p.category)) return false;
    if (brand && (!p.brand || normalize(p.brand) !== brand)) return false;
    if (make && !p.makes.some((m) => normalize(m) === make)) return false;
    if (words.length > 0) {
      const text = searchText(p);
      if (!words.every((word) => text.includes(word))) return false;
    }
    return true;
  });

  // Array.prototype.sort is stable, so "featured" keeps the data order within each group.
  switch (f.sort) {
    case "price-asc":
      return result.sort(comparePrice(1, locale));
    case "price-desc":
      return result.sort(comparePrice(-1, locale));
    default:
      return result.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
  }
}

function uniqueSorted(values: (string | undefined)[]): string[] {
  const clean = values.filter((v): v is string => Boolean(v && v.trim()));
  return [...new Set(clean)].sort((a, b) => a.localeCompare(b, "en"));
}

export function getBrands(list: Product[]): string[] {
  return uniqueSorted(list.map((p) => p.brand));
}

export function getMakes(list: Product[]): string[] {
  return uniqueSorted(list.flatMap((p) => p.makes));
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Related products for a product page: same category first (those for the same car make
 * ahead of the rest), then products of other categories that fit the same make.
 * Never includes `p` itself.
 */
export function getRelated(p: Product, n = 4): Product[] {
  const others = products.filter((x) => x.slug !== p.slug);
  const sharesMake = (x: Product) => x.makes.some((m) => p.makes.includes(m));
  const sameCategory = others.filter((x) => x.category === p.category);
  const sameMakeElsewhere = others.filter((x) => x.category !== p.category && sharesMake(x));
  return [
    ...sameCategory.filter(sharesMake),
    ...sameCategory.filter((x) => !sharesMake(x)),
    ...sameMakeElsewhere,
  ].slice(0, Math.max(0, n));
}
