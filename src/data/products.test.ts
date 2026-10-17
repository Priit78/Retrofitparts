import { describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n";
import { site } from "@/content/site";
import { categories, products } from "./products";

const categoryOrder = [
  "lenses",
  "led-projectors",
  "xenon-projectors",
  "led-lights",
  "xenon-bulbs",
  "ballasts",
  "halogen",
  "shrouds",
  "adapters",
  "fitting",
];

describe("categories", () => {
  it("lists all 10 categories in display order", () => {
    expect(categories.map((c) => c.id)).toEqual(categoryOrder);
  });

  it("has a name and a description in both locales", () => {
    for (const category of categories) {
      for (const locale of locales) {
        expect(category.name[locale].trim(), `${category.id} name ${locale}`).not.toBe("");
        expect(
          category.description[locale].trim(),
          `${category.id} description ${locale}`,
        ).not.toBe("");
      }
    }
  });

  it("has at least one product each", () => {
    for (const category of categories) {
      expect(
        products.some((p) => p.category === category.id),
        category.id,
      ).toBe(true);
    }
  });
});

describe("products", () => {
  it("contains exactly the 63 captured products", () => {
    expect(products).toHaveLength(63);
  });

  it("has unique, URL-safe slugs", () => {
    const slugs = products.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("has a non-empty name and description in both locales", () => {
    for (const product of products) {
      for (const locale of locales) {
        expect(product.name[locale].trim(), `${product.slug} name ${locale}`).not.toBe("");
        expect(
          product.description[locale].trim(),
          `${product.slug} description ${locale}`,
        ).not.toBe("");
      }
    }
  });

  it("writes real descriptions per language, with no leftover ET:/EN: markers", () => {
    for (const product of products) {
      expect(product.description.et, product.slug).not.toBe(product.description.en);
      for (const locale of locales) {
        expect(product.description[locale], `${product.slug} ${locale}`).not.toMatch(
          /\b(ET|EN):/,
        );
      }
    }
  });

  it("files every product under a known category", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const product of products) {
      expect(ids.has(product.category), product.slug).toBe(true);
    }
  });

  it("has prices that are null or above zero", () => {
    for (const product of products) {
      expect(
        product.price === null || product.price > 0,
        `${product.slug} price ${product.price}`,
      ).toBe(true);
    }
  });

  it("only uses makes listed in site.vehicleMakes", () => {
    for (const product of products) {
      for (const make of product.makes) {
        expect(site.vehicleMakes, `${product.slug} make ${make}`).toContain(make);
      }
    }
  });

  it("marks at least 4 products as featured", () => {
    expect(products.filter((p) => p.featured).length).toBeGreaterThanOrEqual(4);
  });

  it("states a warranty only as the 2 years the old site names", () => {
    for (const product of products) {
      if (product.warrantyYears !== undefined) {
        expect(product.warrantyYears, product.slug).toBe(2);
      }
    }
  });

  it("gives every spec a non-empty label and value in both locales", () => {
    for (const product of products) {
      for (const spec of product.specs) {
        for (const locale of locales) {
          expect(spec.label[locale].trim(), `${product.slug} spec label`).not.toBe("");
          expect(spec.value[locale].trim(), `${product.slug} spec value`).not.toBe("");
        }
      }
    }
  });

  it("keeps the BMW range findable through the make filter", () => {
    const bmw = products.filter((p) => p.makes.includes("BMW"));
    expect(bmw.length).toBeGreaterThan(15);
    expect(bmw.some((p) => p.category === "adapters")).toBe(true);
  });
});
