import type { Locale, Localized } from "@/lib/i18n";

/** Copy for the header, mobile menu, language switch and footer. Facts come from `site.ts`. */
export const layout = {
  header: {
    mainNav: { et: "Peamenüü", en: "Main navigation" },
    openMenu: { et: "Ava menüü", en: "Open menu" },
    closeMenu: { et: "Sulge menüü", en: "Close menu" },
    menu: { et: "Menüü", en: "Menu" },
  },

  language: {
    label: { et: "Keel", en: "Language" },
    /** Each language named in itself, so a visitor recognises their own. */
    names: { et: "Eesti", en: "English" } satisfies Record<Locale, string>,
  },

  footer: {
    navTitle: { et: "Navigatsioon", en: "Navigation" },
    contactTitle: { et: "Kontakt", en: "Contact" },
    hoursTitle: { et: "Lahtiolekuajad", en: "Opening hours" },
    closed: { et: "Suletud", en: "Closed" },
    openInMaps: { et: "Ava kaardil", en: "Open in Maps" },
    regLabel: { et: "Reg.", en: "Reg." },
    vatLabel: { et: "KMKR", en: "VAT" },
    facebook: { et: "Facebook", en: "Facebook" },
  },

  /** Screen-reader hint for links that open a new tab. */
  newTab: { et: "(avaneb uues aknas)", en: "(opens in a new tab)" },
} satisfies Record<string, Localized<string> | Record<string, Localized<string>>>;
