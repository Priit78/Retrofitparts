import type { MetadataRoute } from "next";
import { seoCopy } from "@/content/seo";
import { site, type OpeningHours } from "@/content/site";
import { defaultLocale, localePath, locales, type Locale } from "./i18n";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "https://www.retrofitparts.ee";
}

export const siteUrl = resolveSiteUrl().replace(/\/$/, "");

/** True only once the real domain is configured; previews stay out of search indexes. */
export const isIndexable = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}

/** Canonical URL plus hreflang alternates for a path that exists in every locale. */
export function alternates(
  path: string,
  locale: Locale = defaultLocale,
): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath(defaultLocale, path));
  return { canonical: absoluteUrl(localePath(locale, path)), languages };
}

/** robots.txt rules: open and linked to the sitemap once indexable, closed on previews. */
export function robotsRules(indexable: boolean): MetadataRoute.Robots {
  if (!indexable) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

/** Every public page in every locale: home, catalog and one page per product. */
export function sitemapEntries(productSlugs: readonly string[]): MetadataRoute.Sitemap {
  const paths = ["", "/catalog", ...productSlugs.map((slug) => `/catalog/${slug}`)];
  return paths.flatMap((path) => {
    const { languages } = alternates(path);
    return locales.map((locale) => ({
      url: absoluteUrl(localePath(locale, path)),
      alternates: { languages },
    }));
  });
}

const weekdays = [
  { abbr: "Mon", name: "Monday" },
  { abbr: "Tue", name: "Tuesday" },
  { abbr: "Wed", name: "Wednesday" },
  { abbr: "Thu", name: "Thursday" },
  { abbr: "Fri", name: "Friday" },
  { abbr: "Sat", name: "Saturday" },
  { abbr: "Sun", name: "Sunday" },
];

/** Reads English day labels such as "Mon–Thu" or "Sat" into schema.org weekday names. */
function weekdaysFromLabel(label: string): string[] {
  const [from, to = from] = label.split(/[–-]/).map((part) => part.trim());
  const start = weekdays.findIndex((day) => day.abbr === from);
  const end = weekdays.findIndex((day) => day.abbr === to);
  if (start === -1 || end === -1 || end < start) return [];
  return weekdays.slice(start, end + 1).map((day) => day.name);
}

/** schema.org opening hours derived from `site.hours`, so there is one source of truth. */
export function openingHoursSpecification(hours: readonly OpeningHours[] = site.hours) {
  return hours.flatMap((entry) => {
    const dayOfWeek = weekdaysFromLabel(entry.days.en);
    if (!entry.time || dayOfWeek.length === 0) return [];
    const [opens, closes] = entry.time.split(/[–-]/).map((part) => part.trim());
    return [{ "@type": "OpeningHoursSpecification" as const, dayOfWeek, opens, closes }];
  });
}

/** schema.org `AutoRepair` (a LocalBusiness) for the landing page. */
export function autoRepairJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": absoluteUrl("/#autorepair"),
    name: site.name,
    legalName: site.legalName,
    description: seoCopy[locale].description,
    url: absoluteUrl(localePath(locale)),
    telephone: site.phone,
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: "EE",
    },
    hasMap: site.mapsUrl,
    openingHoursSpecification: openingHoursSpecification(),
    priceRange: "€€",
    areaServed: { "@type": "Country", name: "Estonia" },
    sameAs: [site.facebook],
    foundingDate: String(site.founded),
    vatID: site.vat,
  };
}

/** JSON for a `<script type="application/ld+json">`; `<` is escaped so data can't end the tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
