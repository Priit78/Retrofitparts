import { notFound } from "next/navigation";
import { About } from "@/components/sections/About";
import { CarMakes } from "@/components/sections/CarMakes";
import { CatalogTeaser } from "@/components/sections/CatalogTeaser";
import { Contact } from "@/components/sections/Contact";
import { Difference } from "@/components/sections/Difference";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Polish } from "@/components/sections/Polish";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { isLocale } from "@/lib/i18n";
import { autoRepairJsonLd, serializeJsonLd } from "@/lib/seo";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(autoRepairJsonLd(locale)) }}
      />
      <Hero locale={locale} />
      <Services locale={locale} />
      <Difference locale={locale} />
      <Polish locale={locale} />
      <Process locale={locale} />
      <CatalogTeaser locale={locale} />
      <CarMakes locale={locale} />
      <About locale={locale} />
      <Faq locale={locale} />
      <Contact locale={locale} />
    </>
  );
}
