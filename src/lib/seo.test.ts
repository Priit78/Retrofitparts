import { describe, expect, it } from "vitest";
import { alternates } from "./seo";

describe("alternates", () => {
  it("builds canonical and hreflang URLs, defaulting to Estonian", () => {
    const result = alternates("/catalog");
    expect(result.canonical).toBe("https://www.retrofitparts.ee/et/catalog");
    expect(result.languages.et).toBe("https://www.retrofitparts.ee/et/catalog");
    expect(result.languages.en).toBe("https://www.retrofitparts.ee/en/catalog");
    expect(result.languages["x-default"]).toBe("https://www.retrofitparts.ee/et/catalog");
  });

  it("uses the given locale for the canonical URL", () => {
    expect(alternates("", "en").canonical).toBe("https://www.retrofitparts.ee/en");
  });
});
