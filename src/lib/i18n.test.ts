import { describe, expect, it } from "vitest";
import { isLocale, localePath, switchLocalePath } from "./i18n";

describe("localePath", () => {
  it("returns the locale root without a path", () => {
    expect(localePath("et")).toBe("/et");
    expect(localePath("en", "/")).toBe("/en");
  });

  it("prefixes paths, hashes and queries", () => {
    expect(localePath("en", "/catalog")).toBe("/en/catalog");
    expect(localePath("et", "catalog")).toBe("/et/catalog");
    expect(localePath("et", "#contact")).toBe("/et#contact");
    expect(localePath("et", "?make=BMW")).toBe("/et?make=BMW");
  });
});

describe("switchLocalePath", () => {
  it("swaps the locale segment and keeps the rest of the path", () => {
    expect(switchLocalePath("/et/catalog/koito-bi-led", "en")).toBe("/en/catalog/koito-bi-led");
    expect(switchLocalePath("/en", "et")).toBe("/et");
  });

  it("adds a locale when the path has none", () => {
    expect(switchLocalePath("/", "en")).toBe("/en");
    expect(switchLocalePath("/catalog", "et")).toBe("/et/catalog");
  });
});

describe("isLocale", () => {
  it("accepts only supported locales", () => {
    expect(isLocale("et")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
