import { describe, expect, it } from "vitest";
import { categories, products } from "@/data/products";
import type { Product } from "@/data/types";
import { clamp, facetCounts, selectOptions } from "./catalog-ui";

const ids = categories.map((c) => c.id);

describe("facetCounts", () => {
  it("counts every product per category when nothing is filtered", () => {
    const counts = facetCounts(products, ids, {}, "et");
    expect(counts.all).toBe(products.length);
    expect(Object.keys(counts.byCategory).sort()).toEqual([...ids].sort());
    expect(Object.values(counts.byCategory).reduce((a, b) => a + b, 0)).toBe(products.length);
    expect(counts.byCategory.lenses).toBe(products.filter((p) => p.category === "lenses").length);
  });

  it("ignores the selected category, so every toggle shows what it would give", () => {
    const withCategory = facetCounts(products, ids, { category: ["lenses"], make: "BMW" }, "et");
    const without = facetCounts(products, ids, { make: "BMW" }, "et");
    expect(withCategory).toEqual(without);
    expect(withCategory.byCategory.lenses).toBe(
      products.filter((p) => p.category === "lenses" && p.makes.includes("BMW")).length,
    );
  });

  it("applies the other filters and keeps zero counts", () => {
    const counts = facetCounts(products, ids, { make: "Tesla" }, "et");
    expect(counts.all).toBe(0);
    expect(Object.values(counts.byCategory).every((n) => n === 0)).toBe(true);
  });

  it("applies the search text", () => {
    const counts = facetCounts(products, ids, { q: "e46" }, "et");
    expect(counts.all).toBeGreaterThan(0);
    expect(counts.byCategory.lenses).toBeGreaterThan(0);
    expect(counts.byCategory.ballasts).toBe(0);
  });

  it("works on any list", () => {
    const one = products.slice(0, 1) as Product[];
    expect(facetCounts(one, ids, {}, "en").all).toBe(1);
  });
});

describe("selectOptions", () => {
  const makes = ["Audi", "BMW", "Mercedes-Benz"];

  it("selects nothing without a value", () => {
    expect(selectOptions(makes, undefined)).toEqual({ options: makes, selected: "" });
  });

  it("maps a URL value onto the canonical option, ignoring case and accents", () => {
    expect(selectOptions(makes, "bmw")).toEqual({ options: makes, selected: "BMW" });
    expect(selectOptions(makes, "MERCEDES-BENZ").selected).toBe("Mercedes-Benz");
    expect(selectOptions(["Škoda"], "skoda").selected).toBe("Škoda");
  });

  it("adds an unlisted value as an extra option", () => {
    expect(selectOptions(makes, "Tesla")).toEqual({
      options: [...makes, "Tesla"],
      selected: "Tesla",
    });
  });

  it("does not modify the given options", () => {
    const list = ["BMW"];
    selectOptions(list, "Tesla");
    expect(list).toEqual(["BMW"]);
  });
});

describe("clamp", () => {
  it("leaves short text alone", () => {
    expect(clamp("Bi-LED projektor", 160)).toBe("Bi-LED projektor");
    expect(clamp("12345", 5)).toBe("12345");
  });

  it("cuts at a word boundary within the limit and adds an ellipsis", () => {
    const text = "Integreeritud juhtplokiga 3-tolline bi-LED projektor, mis annab nii lähi- kui ka kaugtule.";
    const result = clamp(text, 60);
    expect(result.length).toBeLessThanOrEqual(60);
    expect(result.endsWith("…")).toBe(true);
    expect(text.startsWith(result.slice(0, -1))).toBe(true);
    expect(result).toBe("Integreeritud juhtplokiga 3-tolline bi-LED projektor, mis…");
  });

  it("drops trailing punctuation before the ellipsis", () => {
    expect(clamp("Komplektis kaks projektorit. Sobib paljudele autodele.", 30)).toBe(
      "Komplektis kaks projektorit…",
    );
  });

  it("cuts inside a single long word when there is no space", () => {
    expect(clamp("abcdefghij", 5)).toBe("abcd…");
  });
});
