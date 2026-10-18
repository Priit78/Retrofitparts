import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "@/lib/i18n";
import { site } from "@/content/site";
import { categories, products } from "./products";

const categoryOrder = [
  "lenses",
  "headlights",
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
  it("lists all 11 categories in display order, complete headlights after lenses", () => {
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
  it("contains exactly the 114 live products (115 minus the placeholder row)", () => {
    expect(products).toHaveLength(114);
  });

  it("leaves out the €0 placeholder and the products the live shop no longer has", () => {
    const slugs = products.map((p) => p.slug);
    for (const gone of [
      "toode",
      "yike-profile-i-lens-2-0",
      "4tl-r",
      "yeaky-d1s-4300k",
      "osram-d1s-66140cbi-xenarc-cool-blue-intense",
      "osram-cool-blue-intense-h1-12v-55w",
    ]) {
      expect(slugs, gone).not.toContain(gone);
    }
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

  it("gives every fitment entry non-empty text in both locales", () => {
    for (const product of products) {
      for (const entry of product.fitment) {
        for (const locale of locales) {
          expect(typeof entry[locale], `${product.slug} fitment ${locale}`).toBe("string");
          expect(entry[locale].trim(), `${product.slug} fitment ${locale}`).not.toBe("");
        }
      }
    }
  });

  it("uses English model naming in the English fitment text", () => {
    for (const product of products) {
      for (const entry of product.fitment) {
        expect(entry.en, product.slug).not.toMatch(/seeria|klass|põlvkond|generatsioon|kupee|sedaan|\bja\b/);
      }
    }
    const f10 = products.find((p) => p.slug === "tuleklaasid-f10");
    expect(f10?.fitment).toEqual([
      { et: "BMW 5. seeria F10/F11", en: "BMW 5 Series F10/F11" },
    ]);
  });

  it("keeps the BMW range findable through the make filter", () => {
    const bmw = products.filter((p) => p.makes.includes("BMW"));
    expect(bmw.length).toBeGreaterThan(15);
    expect(bmw.some((p) => p.category === "adapters")).toBe(true);
  });

  it("points every image at its own photo in public/products/, and the file exists", () => {
    for (const product of products) {
      if (product.image === undefined) continue;
      expect(product.image, product.slug).toBe(`/products/${product.slug}.jpg`);
      expect(existsSync(join(process.cwd(), "public", product.image)), product.image).toBe(true);
    }
  });

  it("shows the client's own photo, side and condition for every complete headlight", () => {
    const headlights = products.filter((p) => p.category === "headlights");
    expect(headlights).toHaveLength(12);
    for (const product of headlights) {
      expect(product.image, product.slug).toBeDefined();
      const labels = product.specs.map((s) => s.label.en);
      expect(labels, product.slug).toContain("Condition");
      expect(
        labels.includes("Side") || labels.includes("Contents"),
        `${product.slug} side or set`,
      ).toBe(true);
    }
  });
});
