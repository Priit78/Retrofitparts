import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import {
  filterProducts,
  filtersToQuery,
  getBrands,
  getMakes,
  getProduct,
  getRelated,
  parseFilters,
  sorts,
  type CatalogFilters,
  type CatalogSort,
} from "./catalog";

describe("sorts", () => {
  it("lists the sort options for the catalog UI, default first", () => {
    const list: readonly CatalogSort[] = sorts;
    expect(list).toEqual(["featured", "price-asc", "price-desc"]);
  });

  it("are all accepted by parseFilters", () => {
    for (const sort of sorts) {
      expect(parseFilters({ sort })).toEqual({ sort });
    }
  });
});

describe("parseFilters", () => {
  it("drops unknown categories and sorts but keeps a free-text make", () => {
    expect(parseFilters({ category: "foo", sort: "x", make: "Tesla" })).toEqual({
      make: "Tesla",
    });
  });

  it("reads valid values from a plain record", () => {
    expect(
      parseFilters({
        category: "lenses",
        brand: "Hella",
        make: "BMW",
        q: "e90",
        sort: "price-desc",
      }),
    ).toEqual({
      category: "lenses",
      brand: "Hella",
      make: "BMW",
      q: "e90",
      sort: "price-desc",
    });
  });

  it("reads URLSearchParams", () => {
    const params = new URLSearchParams("category=adapters&make=Ford&sort=featured");
    expect(parseFilters(params)).toEqual({
      category: "adapters",
      make: "Ford",
      sort: "featured",
    });
  });

  it("takes the first value of repeated params and ignores undefined", () => {
    expect(parseFilters({ make: ["BMW", "Audi"], brand: undefined })).toEqual({
      make: "BMW",
    });
  });

  it("trims the search text and drops empty values", () => {
    expect(parseFilters({ q: "  ohuti  ", brand: "", make: "   " })).toEqual({
      q: "ohuti",
    });
  });
});

describe("filtersToQuery", () => {
  it("returns an empty string for no filters", () => {
    expect(filtersToQuery({})).toBe("");
  });

  it("writes keys in a fixed order", () => {
    expect(filtersToQuery({ make: "BMW", category: "lenses" })).toBe(
      "?category=lenses&make=BMW",
    );
    expect(
      filtersToQuery({
        sort: "price-asc",
        q: "e90",
        make: "BMW",
        brand: "Hella",
        category: "lenses",
      }),
    ).toBe("?category=lenses&brand=Hella&make=BMW&q=e90&sort=price-asc");
  });

  it("skips empty values", () => {
    expect(filtersToQuery({ q: "", brand: undefined })).toBe("");
  });

  it("round-trips through parseFilters", () => {
    const samples: CatalogFilters[] = [
      {},
      { category: "lenses", make: "BMW" },
      { category: "xenon-bulbs", brand: "The Retrofit Source", sort: "price-asc" },
      { make: "Mercedes-Benz", q: "õhuti & sild/ääris", sort: "price-desc" },
      { sort: "featured" },
    ];
    for (const filters of samples) {
      const query = filtersToQuery(filters);
      expect(parseFilters(new URLSearchParams(query))).toEqual(filters);
    }
  });
});

describe("filterProducts", () => {
  it("returns every product when no filter is set", () => {
    expect(filterProducts(products, {}, "et")).toHaveLength(products.length);
  });

  it("does not mutate the list it is given", () => {
    const copy = [...products];
    filterProducts(products, { sort: "price-asc" }, "en");
    expect(products).toEqual(copy);
  });

  it("filters by category", () => {
    const result = filterProducts(products, { category: "lenses" }, "et");
    expect(result.length).toBe(products.filter((p) => p.category === "lenses").length);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "lenses")).toBe(true);
  });

  it("filters by car make", () => {
    const result = filterProducts(products, { make: "BMW" }, "et");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.makes.includes("BMW"))).toBe(true);
    expect(result.length).toBe(products.filter((p) => p.makes.includes("BMW")).length);
  });

  it("filters by brand", () => {
    const result = filterProducts(products, { brand: "Koito" }, "et");
    expect(result.map((p) => p.slug)).toEqual(["koito-bi-led"]);
  });

  it("combines filters", () => {
    const result = filterProducts(products, { category: "adapters", make: "Ford" }, "et");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === "adapters" && p.makes.includes("Ford"))).toBe(
      true,
    );
  });

  describe("text search", () => {
    const names = (q: string) =>
      filterProducts(products, { q }, "et").map((p) => p.name.et);

    it("ignores diacritics and case in the name", () => {
      expect(names("butuul")).toContain("OCI butüülliim");
      expect(names("BUTÜÜL")).toContain("OCI butüülliim");
      expect(names("ohuti")).toContain("Õhuti");
    });

    it("searches the English name too, whatever the page locale", () => {
      expect(names("breather")).toContain("Õhuti");
      expect(
        filterProducts(products, { q: "sealant" }, "en").map((p) => p.name.et),
      ).toContain("OCI butüülliim");
    });

    it("searches brand, sku and fitment", () => {
      expect(names("koito")).toContain("Koito BI-LED projektor");
      expect(filterProducts(products, { q: "kbled" }, "et").map((p) => p.slug)).toEqual([
        "koito-bi-led",
      ]);
      expect(filterProducts(products, { q: "mondeo mk3" }, "et").length).toBeGreaterThan(0);
    });

    it("searches the fitment text in both languages without leaking object markup", () => {
      const slugs = (q: string) =>
        filterProducts(products, { q }, "en").map((p) => p.slug);
      // These words are only in the fitment text, not in either name. Both Hella parts list
      // the E-Class W211 and a 2003 model year among the cars they fit.
      const w211 = ["hella-5dv-008-290-ballast-replica", "hella-5dd-008-319-50-suutaja"];
      expect(slugs("e-class w211 2003")).toEqual(w211);
      expect(slugs("e-klass w211 2003")).toEqual(w211);
      expect(slugs("e55 gen. 4")).toEqual(["hella-e55-afs-adapterid"]);
      expect(slugs("e55 generatsioon")).toEqual(["hella-e55-afs-adapterid"]);
      expect(slugs("japanese cars")).toEqual(["koito-bi-led"]);
      expect(slugs("jaapani autod")).toEqual(["koito-bi-led"]);
      expect(slugs("object")).toEqual([]);
    });

    it("requires every word to match", () => {
      const result = filterProducts(products, { q: "tuleklaasid e46" }, "et");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.category === "lenses")).toBe(true);
      expect(filterProducts(products, { q: "tuleklaasid zzzz" }, "et")).toEqual([]);
    });

    it("treats a blank query as no search", () => {
      expect(filterProducts(products, { q: "   " }, "et")).toHaveLength(products.length);
    });
  });

  describe("sorting", () => {
    // Every live product has a price, so two "ask for price" products are added to check
    // that unknown prices sort last.
    const withUnpriced = [
      { ...products[0], slug: "no-price-a", price: null },
      ...products,
      { ...products[1], slug: "no-price-b", price: null },
    ];

    it("price-asc is ascending with unknown prices last", () => {
      const result = filterProducts(withUnpriced, { sort: "price-asc" }, "et");
      const prices = result.map((p) => p.price);
      const firstNull = prices.indexOf(null);
      expect(firstNull).toBe(products.length);
      expect(prices.slice(firstNull).every((p) => p === null)).toBe(true);
      const known = prices.slice(0, firstNull) as number[];
      expect(known).toEqual([...known].sort((a, b) => a - b));
    });

    it("price-desc is descending with unknown prices last", () => {
      const result = filterProducts(withUnpriced, { sort: "price-desc" }, "et");
      const prices = result.map((p) => p.price);
      const firstNull = prices.indexOf(null);
      expect(firstNull).toBe(products.length);
      expect(prices.slice(firstNull).every((p) => p === null)).toBe(true);
      const known = prices.slice(0, firstNull) as number[];
      expect(known).toEqual([...known].sort((a, b) => b - a));
    });

    it("breaks price ties by the name in the page locale", () => {
      const result = filterProducts(products, { category: "shrouds", sort: "price-asc" }, "en");
      const same = result.filter((p) => p.price === 30.49).map((p) => p.name.en);
      expect(same.length).toBeGreaterThan(1);
      expect(same).toEqual([...same].sort((a, b) => a.localeCompare(b, "en")));
    });

    it("featured (and the default) puts featured products first, keeping data order", () => {
      const featured = products.filter((p) => p.featured);
      for (const sort of [undefined, "featured" as const]) {
        const result = filterProducts(products, { sort }, "et");
        expect(result.slice(0, featured.length).map((p) => p.slug)).toEqual(
          featured.map((p) => p.slug),
        );
        expect(result.slice(featured.length).some((p) => p.featured)).toBe(false);
      }
    });
  });
});

describe("getBrands and getMakes", () => {
  it("returns sorted, unique, non-empty brands", () => {
    const brands = getBrands(products);
    expect(brands.length).toBeGreaterThan(5);
    expect(brands.every((b) => b.trim() !== "")).toBe(true);
    expect(new Set(brands).size).toBe(brands.length);
    expect(brands).toEqual([...brands].sort((a, b) => a.localeCompare(b, "en")));
    expect(brands).toContain("Koito");
  });

  it("returns sorted, unique, non-empty makes", () => {
    const makes = getMakes(products);
    expect(makes.length).toBeGreaterThan(5);
    expect(makes.every((m) => m.trim() !== "")).toBe(true);
    expect(new Set(makes).size).toBe(makes.length);
    expect(makes).toEqual([...makes].sort((a, b) => a.localeCompare(b, "en")));
    expect(makes).toContain("BMW");
  });

  it("copes with empty lists and products without a brand", () => {
    expect(getBrands(products.filter((p) => !p.brand))).toEqual([]);
    expect(getMakes([])).toEqual([]);
  });
});

describe("getProduct", () => {
  it("finds a product by slug", () => {
    expect(getProduct("koito-bi-led")?.sku).toBe("KBLED");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProduct("no-such-product")).toBeUndefined();
  });
});

describe("getRelated", () => {
  it("never includes the product itself, for any product", () => {
    for (const product of products) {
      const related = getRelated(product);
      expect(
        related.some((p) => p.slug === product.slug),
        product.slug,
      ).toBe(false);
      expect(new Set(related.map((p) => p.slug)).size).toBe(related.length);
      expect(related.length).toBeLessThanOrEqual(4);
    }
  });

  it("puts the same category first, preferring the same car make", () => {
    const product = getProduct("tuleklaasid-f10")!;
    const related = getRelated(product);
    expect(related).toHaveLength(4);
    expect(related.every((p) => p.category === product.category)).toBe(true);
    expect(related.every((p) => p.makes.includes("BMW"))).toBe(true);
  });

  it("respects the requested count", () => {
    const product = getProduct("tuleklaasid-f10")!;
    expect(getRelated(product, 2)).toHaveLength(2);
    expect(getRelated(product, 0)).toEqual([]);
  });

  it("tops up a small category with products of the same make", () => {
    const rings = getProduct("loikega-rongad-bmw")!;
    const sameCategory = products.filter(
      (p) => p.category === rings.category && p.slug !== rings.slug,
    );
    // Ask for more than the category holds, so the list has to be topped up.
    const related = getRelated(rings, sameCategory.length + 2);
    expect(related.slice(0, sameCategory.length).map((p) => p.slug).sort()).toEqual(
      sameCategory.map((p) => p.slug).sort(),
    );
    expect(related.length).toBe(sameCategory.length + 2);
    expect(
      related
        .slice(sameCategory.length)
        .every((p) => p.category !== rings.category && p.makes.includes("BMW")),
    ).toBe(true);
  });

  it("returns only same-category products for a part with no make", () => {
    const hella = getProduct("hella-5r")!;
    const related = getRelated(hella);
    expect(related.length).toBeGreaterThan(0);
    expect(related.every((p) => p.category === hella.category)).toBe(true);
  });
});
