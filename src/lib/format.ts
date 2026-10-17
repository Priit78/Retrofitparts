import type { Locale } from "@/lib/i18n";

const intlLocale: Record<Locale, string> = { et: "et-EE", en: "en-IE" };

const formatters = new Map<Locale, Intl.NumberFormat>();

function formatterFor(locale: Locale): Intl.NumberFormat {
  let formatter = formatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(intlLocale[locale], {
      style: "currency",
      currency: "EUR",
    });
    formatters.set(locale, formatter);
  }
  return formatter;
}

/**
 * Formats a VAT-inclusive euro price for display: "284,59 €" (et) or "€284.59" (en).
 * Returns null when the price is unknown so callers can show "Ask for price" instead.
 */
export function formatPrice(value: number | null, locale: Locale): string | null {
  if (value === null) return null;
  return formatterFor(locale).format(value);
}
