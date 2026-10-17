export const locales = ["et", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "et";

export type Localized<T> = Record<Locale, T>;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Builds a locale-prefixed path: localePath("en", "/catalog") → "/en/catalog". */
export function localePath(locale: Locale, path = ""): string {
  if (!path || path === "/") return `/${locale}`;
  if (path.startsWith("#") || path.startsWith("?")) return `/${locale}${path}`;
  return `/${locale}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Swaps (or adds) the locale segment of a pathname, keeping the rest of the path. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = to;
  } else {
    segments.unshift(to);
  }
  return `/${segments.join("/")}`;
}
