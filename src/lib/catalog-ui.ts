import type { CategoryId, Product } from "@/data/types";
import { filterProducts, type CatalogFilters } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

/** Pure helpers behind the catalog UI (filters, cards and product pages). */

export interface FacetCounts {
  /** Products matching every filter except the category. */
  all: number;
  byCategory: Record<CategoryId, number>;
}

/**
 * Per-category counts for everything else that is filtered (make, brand, search), so each
 * category toggle shows how many products it would give. Every category id gets a count.
 */
export function facetCounts(
  list: Product[],
  categoryIds: readonly CategoryId[],
  filters: CatalogFilters,
  locale: Locale,
): FacetCounts {
  const base = filterProducts(list, { ...filters, category: undefined, sort: undefined }, locale);
  const byCategory = Object.fromEntries(categoryIds.map((id) => [id, 0])) as Record<CategoryId, number>;
  for (const product of base) byCategory[product.category] += 1;
  return { all: base.length, byCategory };
}

/** Case- and accent-insensitive equality, as the catalog filter itself compares. */
function sameText(a: string, b: string) {
  return a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;
}

/**
 * Options for a filter select and the value to show as selected. A URL value is mapped onto
 * its canonical spelling (`bmw` selects "BMW"); a value that isn't listed (`Tesla`, from a
 * hand-edited link) is added as an extra option so the select shows what is being filtered.
 */
export function selectOptions(
  options: readonly string[],
  value: string | undefined,
): { options: string[]; selected: string } {
  if (!value) return { options: [...options], selected: "" };
  const match = options.find((option) => sameText(option, value));
  return match
    ? { options: [...options], selected: match }
    : { options: [...options, value], selected: value };
}

/** Shortens text to at most `max` characters, at a word boundary, ending in "…". */
export function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const words = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${words.replace(/[\s,.;:–-]+$/, "")}…`;
}
