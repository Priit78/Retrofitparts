import { notFound } from "next/navigation";
import { About } from "@/components/sections/About";
import { CarMakes } from "@/components/sections/CarMakes";
import { CatalogTeaser } from "@/components/sections/CatalogTeaser";
import { Contact } from "@/components/sections/Contact";
import { Difference } from "@/components/sections/Difference";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { AnatomyChapter } from "@/components/story/AnatomyChapter";
import { ChapterIndex } from "@/components/story/ChapterIndex";
import { ProblemChapter } from "@/components/story/ProblemChapter";
import { ProcessChapter } from "@/components/story/ProcessChapter";
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
      {/* The scroll story: pinned chapters with calm sections between them. */}
      <Hero locale={locale} />
      <ProblemChapter locale={locale} />
      <Difference locale={locale} />
      <AnatomyChapter locale={locale} />
      <Services locale={locale} />
      <ProcessChapter locale={locale} />
      <CatalogTeaser locale={locale} />
      <CarMakes locale={locale} />
      <About locale={locale} />
      <Faq locale={locale} />
      <Contact locale={locale} />
      <ChapterIndex locale={locale} />
    </>
  );
}
