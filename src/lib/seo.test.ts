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

describe("robotsRules", () => {
  it("allows everything and links the sitemap once the site is indexable", async () => {
    const { robotsRules } = await loadSeo(noSiteEnv);
    expect(robotsRules(true)).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://www.retrofitparts.ee/sitemap.xml",
    });
  });

  it("blocks every agent and omits the sitemap on previews", async () => {
    const { robotsRules } = await loadSeo(noSiteEnv);
    expect(robotsRules(false)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});

describe("sitemapEntries", () => {
  it("lists home, catalog and every product in both locales", async () => {
    const { sitemapEntries } = await loadSeo(noSiteEnv);
    const urls = sitemapEntries(["a-1", "b-2"]).map((entry) => entry.url);
    expect(urls).toEqual([
      "https://www.retrofitparts.ee/et",
      "https://www.retrofitparts.ee/en",
      "https://www.retrofitparts.ee/et/catalog",
      "https://www.retrofitparts.ee/en/catalog",
      "https://www.retrofitparts.ee/et/catalog/a-1",
      "https://www.retrofitparts.ee/en/catalog/a-1",
      "https://www.retrofitparts.ee/et/catalog/b-2",
      "https://www.retrofitparts.ee/en/catalog/b-2",
    ]);
  });

  it("links the other language versions of each page", async () => {
    const { sitemapEntries } = await loadSeo(noSiteEnv);
    const entry = sitemapEntries(["a-1"]).find((e) => e.url.endsWith("/en/catalog/a-1"));
    expect(entry?.alternates?.languages).toEqual({
      et: "https://www.retrofitparts.ee/et/catalog/a-1",
      en: "https://www.retrofitparts.ee/en/catalog/a-1",
      "x-default": "https://www.retrofitparts.ee/et/catalog/a-1",
    });
  });
});

describe("openingHoursSpecification", () => {
  it("expands a day range and splits the time, skipping closed days", async () => {
    const { openingHoursSpecification } = await loadSeo(noSiteEnv);
    const spec = openingHoursSpecification([
      { days: { et: "E–N", en: "Mon–Thu" }, time: "09:00–18:00" },
      { days: { et: "R–P", en: "Fri–Sun" }, time: null },
    ]);
    expect(spec).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "18:00",
      },
    ]);
  });

  it("handles a single day and ignores labels it cannot read", async () => {
    const { openingHoursSpecification } = await loadSeo(noSiteEnv);
    const spec = openingHoursSpecification([
      { days: { et: "L", en: "Sat" }, time: "10:00–14:00" },
      { days: { et: "?", en: "Holidays" }, time: "10:00–14:00" },
    ]);
    expect(spec).toHaveLength(1);
    expect(spec[0].dayOfWeek).toEqual(["Saturday"]);
  });
});

describe("autoRepairJsonLd", () => {
  it("describes the workshop with the facts from site.ts", async () => {
    const { autoRepairJsonLd } = await loadSeo(noSiteEnv);
    const { site } = await import("@/content/site");
    const ld = autoRepairJsonLd("en");
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("AutoRepair");
    expect(ld.name).toBe("Retrofit Parts");
    expect(ld.url).toBe("https://www.retrofitparts.ee/en");
    expect(ld.telephone).toBe(site.phone);
    expect(ld.email).toBe(site.email);
    expect(ld.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "Pärnu mnt 160F",
      postalCode: "11317",
      addressLocality: "Tallinn",
      addressCountry: "EE",
    });
    expect(ld.sameAs).toEqual([site.facebook]);
    expect(ld.priceRange).toBe("€€");
    expect(ld.areaServed).toEqual({ "@type": "Country", name: "Estonia" });
    expect(ld.openingHoursSpecification).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        opens: "09:00",
        closes: "18:00",
      },
    ]);
  });

  it("points the url at the requested locale and shares one @id", async () => {
    const { autoRepairJsonLd } = await loadSeo(noSiteEnv);
    expect(autoRepairJsonLd("et").url).toBe("https://www.retrofitparts.ee/et");
    expect(autoRepairJsonLd("et")["@id"]).toBe(autoRepairJsonLd("en")["@id"]);
  });
});

describe("serializeJsonLd", () => {
  it("escapes angle brackets so data can never close the script tag", async () => {
    const { serializeJsonLd } = await loadSeo(noSiteEnv);
    const out = serializeJsonLd({ name: "</script><b>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><b>" });
  });
});

describe("seoCopy", () => {
  it("keeps titles and descriptions inside search-snippet limits", async () => {
    const { seoCopy } = await import("@/content/seo");
    for (const locale of ["et", "en"] as const) {
      expect(seoCopy[locale].title.length).toBeLessThanOrEqual(60);
      expect(seoCopy[locale].description.length).toBeGreaterThan(80);
      expect(seoCopy[locale].description.length).toBeLessThanOrEqual(160);
    }
  });
});
