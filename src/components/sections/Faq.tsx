import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { fillTemplate, fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { textLink } from "@/components/ui/styles";
import type { Locale } from "@/lib/i18n";
import { FaqAccordion, type AccordionItem } from "./FaqAccordion";

export function Faq({ locale }: { locale: Locale }) {
  const email = (
    <a href={`mailto:${site.email}`} className={textLink}>
      {site.email}
    </a>
  );
  const phone = (
    <a href={site.phoneHref} className={`${textLink} whitespace-nowrap`}>
      {site.phone}
    </a>
  );

  const items: AccordionItem[] = faq.items.map((item) => ({
    id: item.id,
    question: item.question[locale],
    answer: fillTemplate(item.answer[locale], { email }),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.question[locale],
      acceptedAnswer: {
        "@type": "Answer",
        text: fillText(item.answer[locale], { email: site.email }),
      },
    })),
  };

  return (
    <section id="faq" className="border-t border-line py-18 md:py-30">
      <script
        type="application/ld+json"
        // Escape "<" so the payload can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container>
        {/* Phones read heading, questions, then "didn't find your answer?"; wide screens keep
            that line under the heading, beside the questions. */}
        <div className="grid gap-10 md:gap-y-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-6">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow={faq.eyebrow[locale]} title={faq.title[locale]} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:pt-2">
            <FaqAccordion items={items} defaultOpen={items[0]?.id} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5 lg:col-start-1 lg:row-start-2">
            <p className="max-w-[40ch] text-base leading-relaxed text-pretty text-soft">
              {fillTemplate(faq.more[locale], { email, phone })}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
