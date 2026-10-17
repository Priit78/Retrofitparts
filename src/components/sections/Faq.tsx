import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { fillTemplate, fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";
import { FaqAccordion, type AccordionItem } from "./FaqAccordion";

const linkClass =
  "text-light underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent";

export function Faq({ locale }: { locale: Locale }) {
  const email = (
    <a href={`mailto:${site.email}`} className={linkClass}>
      {site.email}
    </a>
  );
  const phone = (
    <a href={site.phoneHref} className={`${linkClass} whitespace-nowrap`}>
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
    <section id="faq" className="relative py-24 md:py-36">
      <script
        type="application/ld+json"
        // Escape "<" so the payload can never close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Container>
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <SectionHeading align="center" eyebrow={faq.eyebrow[locale]} title={faq.title[locale]} />
          </Reveal>
          <Reveal delay={0.1} className="mt-14 md:mt-16">
            <FaqAccordion items={items} defaultOpen={items[0]?.id} />
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-10 text-center text-base leading-relaxed text-muted">
              {fillTemplate(faq.more[locale], { email, phone })}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
