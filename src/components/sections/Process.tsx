import { ArrowRight } from "lucide-react";
import { common } from "@/content/common";
import { processCopy } from "@/content/process";
import { site } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fillText } from "@/components/ui/fillTemplate";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";
import { ProcessTimeline, type TimelineStep } from "./ProcessTimeline";

export function Process({ locale }: { locale: Locale }) {
  const facts = { years: site.warrantyYears };
  const steps: TimelineStep[] = processCopy.steps.map((step) => ({
    id: step.id,
    title: step.title[locale],
    body: fillText(step.body[locale], facts),
    tag: fillText(step.tag[locale], facts),
  }));

  return (
    <section id="process" className="relative isolate overflow-clip py-24 md:py-36">
      {/* A faint cone of light falling from the top of the section. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem] bg-[radial-gradient(60%_100%_at_30%_0%,color-mix(in_oklab,var(--color-accent)_9%,transparent),transparent_70%)]"
      />
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-16">
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
          <div className="lg:col-span-7 lg:pt-4">
            <ProcessTimeline steps={steps} />
          </div>
        </div>
      </Container>
    </section>
  );
}
