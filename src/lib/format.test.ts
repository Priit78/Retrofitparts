import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

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
