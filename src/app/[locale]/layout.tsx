import type { Metadata, Viewport } from "next";
import { Archivo, Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import "lenis/dist/lenis.css";
import "../globals.css";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { common } from "@/content/common";
import { seoCopy, titleTemplate } from "@/content/seo";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { isLocale, locales } from "@/lib/i18n";
import { alternates, isIndexable, metadataRobots, siteUrl } from "@/lib/seo";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  // Matches the `bg` token, so mobile browser chrome blends into the page.
  themeColor: "#050607",
};

/**
 * Defaults for every page. Metadata merges shallowly, so a page that sets `alternates` or
 * `openGraph` replaces the whole object and must repeat what it needs (canonical, locale).
 * `openGraph` and `twitter` carry no title or description on purpose: Next fills them from each
 * page's own title and description, so child pages never inherit the home page's.
 */
export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = seoCopy[locale];
  const otherLocale = locales.find((l) => l !== locale);

  return {
    metadataBase: new URL(siteUrl),
    title: { default: copy.title, template: titleTemplate },
    description: copy.description,
    applicationName: site.name,
    alternates: alternates("", locale),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: copy.ogLocale,
      alternateLocale: otherLocale ? seoCopy[otherLocale].ogLocale : undefined,
    },
    twitter: { card: "summary_large_image" },
    // Previews must not compete with the live site in search results.
    robots: metadataRobots(isIndexable),
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html
      lang={locale}
      className={cn(archivo.variable, inter.variable, jetbrains.variable)}
      // The inline script below adds the `js` class before hydration.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="skip-link">
          {common.skipLink[locale]}
        </a>
        <SmoothScroll />
        <Header locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
