import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";

export interface NavLink {
  id: string;
  href: string;
  label: string;
}

/**
 * Site navigation with locale-prefixed hrefs. Hash items resolve to the landing page
 * (`/et#services`), so they also work from catalog pages.
 */
export function navLinks(locale: Locale): NavLink[] {
  return site.nav.map((item) => ({
    id: item.id,
    href: localePath(locale, item.href),
    label: item.label[locale],
  }));
}
