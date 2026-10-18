import { ArrowRight } from "lucide-react";
import { common } from "@/content/common";
import { processCopy } from "@/content/process";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fillTemplate, fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { textLink } from "@/components/ui/styles";
import type { Locale } from "@/lib/i18n";
import { ProcessTimeline, type TimelineStep } from "./ProcessTimeline";

export function Process({ locale }: { locale: Locale }) {
  const facts = { years: site.warrantyYears };
  const email = (
    <a href={`mailto:${site.email}`} className={`${textLink} whitespace-nowrap`}>
      {site.email}
    </a>
  );
  const steps: TimelineStep[] = processCopy.steps.map((step) => ({
    id: step.id,
    title: step.title[locale],
    body: fillTemplate(step.body[locale], { ...facts, email }),
    tag: fillText(step.tag[locale], facts),
  }));

  return (
    <section id="process" className="relative border-t border-line py-18 md:py-30">
      <Container>
        <div className="grid gap-12 md:gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <SectionHeading
                  eyebrow={processCopy.eyebrow[locale]}
                  title={processCopy.title[locale]}
                  intro={processCopy.intro[locale]}
                />
              </Reveal>
              <Reveal delay={0.1} className="mt-10">
                <Button href="#contact" size="lg">
                  {common.requestOffer[locale]}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-7 lg:pt-2">
            <ProcessTimeline steps={steps} />
          </div>
        </div>
      </Container>
    </section>
  );
}
