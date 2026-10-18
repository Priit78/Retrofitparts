import { ArrowRight } from "lucide-react";
import type { StaticImageData } from "next/image";
import headlightUnpolished from "@/assets/photos/headlight-unpolished.jpg";
import heroHeadlight from "@/assets/photos/hero-headlight.jpg";
import projectorBench from "@/assets/photos/projector-bench.jpg";
import retrofitInProgress from "@/assets/photos/retrofit-in-progress.jpg";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { fillTemplate, fillText } from "@/components/ui/fillTemplate";
import { monoLabel, textLink } from "@/components/ui/styles";
import { common } from "@/content/common";
import { processCopy, type ProcessStep } from "@/content/process";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
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
      stageClassName="py-18 md:py-30 pinned:flex pinned:flex-col pinned:justify-end pinned:pt-20 pinned:pb-8 pinned:max-md:[@media(max-height:36rem)]:pb-6 pinned:md:pt-24 pinned:md:pb-12"
    >
      {/*
        Pinned, the text sits at the bottom of the stage over the step photos, in one of two
        layouts. Stacked on phones and on portrait screens, which are always at least as tall as
        they are wide, so the block fits (a short phone gets tighter spacing). Side by side, the
        heading beside the step, on landscape screens from `md`: they can be as short as 512 px,
        and only that block (about 460 px) fits under the header there.
        The container must stay unpositioned: the step photos inside it fill the stage.
      */}
      <Container className="pinned:md:landscape:grid pinned:md:landscape:grid-cols-12 pinned:md:landscape:items-end pinned:md:landscape:gap-x-12">
        {/* SectionHeading's markup, with the pinned variants it has no props for. */}
        <div className="relative z-10 max-w-3xl pinned:md:landscape:col-span-5">
          <p className={cn(monoLabel, "mb-4 pinned:max-md:[@media(max-height:36rem)]:mb-3")}>
            {processCopy.eyebrow[locale]}
          </p>
          <h2
            id="process-title"
            // Smaller where the pinned block is tight: a short phone, a narrow side-by-side
            // column, a short landscape screen.
            className="text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px] pinned:max-md:[@media(max-height:36rem)]:text-[28px] pinned:md:landscape:max-lg:text-[40px] pinned:md:landscape:[@media(max-height:36rem)]:text-[40px]"
          >
            {processCopy.title[locale]}
          </h2>
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft md:text-[17px] pinned:max-md:[@media(max-height:36rem)]:mt-3">
            {processCopy.intro[locale]}
          </p>
        </div>

        <ProcessStage steps={processSteps(locale)} />

        {/*
          Only the side-by-side layout has room for it when pinned; the stacked one leaves it to
          the header (or its menu), which has the same button.
        */}
        <div className="relative z-10 mt-12 pinned:hidden pinned:md:landscape:col-span-12 pinned:md:landscape:mt-8 pinned:md:landscape:block">
          <Button href="#contact" size="lg">
            {common.requestOffer[locale]}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </Container>
    </ScrollChapter>
  );
}
