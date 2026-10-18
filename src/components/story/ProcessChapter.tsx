import { ArrowRight } from "lucide-react";
import type { StaticImageData } from "next/image";
import headlightUnpolished from "@/assets/photos/headlight-unpolished.jpg";
import heroHeadlight from "@/assets/photos/hero-headlight.jpg";
import projectorBench from "@/assets/photos/projector-bench.jpg";
import retrofitInProgress from "@/assets/photos/retrofit-in-progress.jpg";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fillTemplate, fillText } from "@/components/ui/fillTemplate";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { textLink } from "@/components/ui/styles";
import { common } from "@/content/common";
import { processCopy, type ProcessStep } from "@/content/process";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";
import { ProcessStage, type ProcessStageStep } from "./ProcessStage";
import { ScrollChapter } from "./ScrollChapter";

/** One decorative photo per step; the step text carries the meaning. */
const photos: Record<ProcessStep["id"], StaticImageData> = {
  // The kind of photo a customer sends with the request.
  request: headlightUnpolished,
  offer: projectorBench,
  installation: retrofitInProgress,
  warranty: heroHeadlight,
};

/** The four steps, with `{years}` from site.ts and `{email}` as a link to site.email. */
export function processSteps(locale: Locale): ProcessStageStep[] {
  const facts = { years: site.warrantyYears };
  const email = (
    <a href={`mailto:${site.email}`} className={`${textLink} whitespace-nowrap`}>
      {site.email}
    </a>
  );
  return processCopy.steps.map((step) => ({
    id: step.id,
    title: step.title[locale],
    body: fillTemplate(step.body[locale], { ...facts, email }),
    tag: fillText(step.tag[locale], facts),
    photo: photos[step.id],
  }));
}

/**
 * Chapter 6 of the landing scroll story: the four steps from request to warranty. Pinned, the
 * stage is one full-screen photo per step with the text at the bottom (ProcessStage); static, the
 * steps are listed in order, each with its photo. The header navigation links to `#process`.
 */
export function ProcessChapter({ locale }: { locale: Locale }) {
  return (
    <ScrollChapter
      id="process"
      labelledBy="process-title"
      length={{ base: 300, md: 360 }}
      className="border-t border-line"
      stageClassName="py-18 md:py-30 pinned:flex pinned:flex-col pinned:justify-end pinned:pt-20 pinned:pb-8 pinned:md:pt-24 pinned:md:pb-12"
    >
      {/*
        Pinned, the text sits at the bottom of the stage over the step photos: stacked below `lg`,
        and from `lg` the heading beside the step, so the block stays low on a 720 px laptop. The
        container must stay unpositioned: the step photos inside it fill the stage.
      */}
      <Container className="pinned:lg:grid pinned:lg:grid-cols-12 pinned:lg:items-end pinned:lg:gap-x-12">
        <SectionHeading
          id="process-title"
          eyebrow={processCopy.eyebrow[locale]}
          title={processCopy.title[locale]}
          intro={processCopy.intro[locale]}
          className="relative z-10 pinned:lg:col-span-5"
        />

        <ProcessStage steps={processSteps(locale)} />

        {/*
          Pinned below `lg` the stage has no room for it, so it shows only in the static layout and
          on desktop. The header (or its menu) has the same button.
        */}
        <div className="relative z-10 mt-12 pinned:max-lg:hidden pinned:lg:col-span-12 pinned:lg:mt-8">
          <Button href="#contact" size="lg">
            {common.requestOffer[locale]}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </Container>
    </ScrollChapter>
  );
}
