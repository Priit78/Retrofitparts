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
