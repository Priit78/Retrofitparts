import { describe, expect, it } from "vitest";
import { formatPrice, keepNumbersTogether } from "./format";

describe("formatPrice", () => {
  it("formats euros the Estonian way, with a non-breaking space before the sign", () => {
    expect(formatPrice(284.59, "et")).toBe("284,59 €");
  });

  it("formats euros the Irish-English way", () => {
    expect(formatPrice(284.59, "en")).toBe("€284.59");
  });

  it("returns null when the price is unknown", () => {
    expect(formatPrice(null, "et")).toBeNull();
    expect(formatPrice(null, "en")).toBeNull();
  });

  it("always shows two decimals and groups thousands", () => {
    expect(formatPrice(155, "en")).toBe("€155.00");
    expect(formatPrice(1234.5, "en")).toBe("€1,234.50");
  });
});

describe("keepNumbersTogether", () => {
  const nbsp = " ";

  it("keeps values with their units", () => {
    expect(keepNumbersTogether("LED lisakaugtuled 60 W")).toBe(`LED lisakaugtuled 60${nbsp}W`);
    expect(keepNumbersTogether("Osram Cool Blue Intense H1 12 V 55 W")).toBe(
      `Osram Cool Blue Intense H1 12${nbsp}V 55${nbsp}W`,
    );
  });

  it("keeps a model series or generation with its number", () => {
    expect(keepNumbersTogether("Tuleklaasid BMW 3. seeria E46")).toBe(
      `Tuleklaasid BMW 3.${nbsp}seeria E46`,
    );
    expect(keepNumbersTogether("Headlight lenses BMW 5 Series F10")).toBe(
      `Headlight lenses BMW 5${nbsp}Series F10`,
    );
    expect(keepNumbersTogether("Honda CR-V 3. põlvkond")).toBe(`Honda CR-V 3.${nbsp}põlvkond`);
    expect(keepNumbersTogether("Honda CR-V Gen 3")).toBe(`Honda CR-V Gen${nbsp}3`);
  });

  it("leaves other spaces alone", () => {
    for (const name of ["Hella 5DV 009 ballast", "Yike (Profile) I-Lens 2.0 projektor", "BMW X5 E70 Vision"]) {
      expect(keepNumbersTogether(name)).toBe(name);
    }
  });
});
