import type { Localized } from "@/lib/i18n";

/** Small UI strings shared across the layout. Section copy lives in its own file. */
export const common = {
  skipLink: { et: "Liigu sisu juurde", en: "Skip to content" },
  requestOffer: { et: "Küsi pakkumist", en: "Request an offer" },
  viewCatalog: { et: "Vaata kataloogi", en: "View catalog" },
  notFoundTitle: { et: "Lehte ei leitud", en: "Page not found" },
  notFoundBody: {
    et: "Seda lehte ei ole olemas või see on liikunud.",
    en: "This page does not exist or has moved.",
  },
  backHome: { et: "Avalehele", en: "Back to home" },
} satisfies Record<string, Localized<string>>;
