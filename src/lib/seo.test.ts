import { afterEach, describe, expect, it, vi } from "vitest";

// siteUrl is resolved at module load, so each test sets the env and re-imports.
async function loadSeo(env: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
  return import("./seo");
}

afterEach(() => vi.unstubAllEnvs());

const noSiteEnv = { NEXT_PUBLIC_SITE_URL: undefined, VERCEL_PROJECT_PRODUCTION_URL: undefined };

describe("alternates", () => {
  it("builds canonical and hreflang URLs, defaulting to Estonian", async () => {
    const { alternates } = await loadSeo(noSiteEnv);
    const result = alternates("/catalog");
    expect(result.canonical).toBe("https://www.retrofitparts.ee/et/catalog");
    expect(result.languages.et).toBe("https://www.retrofitparts.ee/et/catalog");
    expect(result.languages.en).toBe("https://www.retrofitparts.ee/en/catalog");
    expect(result.languages["x-default"]).toBe("https://www.retrofitparts.ee/et/catalog");
  });

  it("uses the given locale for the canonical URL", async () => {
    const { alternates } = await loadSeo(noSiteEnv);
    expect(alternates("", "en").canonical).toBe("https://www.retrofitparts.ee/en");
  });
});

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and strips a trailing slash", async () => {
    const seo = await loadSeo({ ...noSiteEnv, NEXT_PUBLIC_SITE_URL: "https://example.ee/" });
    expect(seo.siteUrl).toBe("https://example.ee");
    expect(seo.isIndexable).toBe(true);
  });

  it("falls back to the Vercel production URL and stays out of indexes", async () => {
    const seo = await loadSeo({ ...noSiteEnv, VERCEL_PROJECT_PRODUCTION_URL: "rp.vercel.app" });
    expect(seo.siteUrl).toBe("https://rp.vercel.app");
    expect(seo.isIndexable).toBe(false);
  });
});
