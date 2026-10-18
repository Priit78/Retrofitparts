import { Container } from "@/components/ui/Container";
import { monoLabel } from "@/components/ui/styles";
import { polish } from "@/content/polish";
import { story } from "@/content/story";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { EXPLODED } from "./anatomy";
import { ExplodedHeadlight } from "./ExplodedHeadlight";
import { HeadlightLines } from "./HeadlightLines";
import { PartsList } from "./PartsList";
import { ScrollChapter } from "./ScrollChapter";

/** The chapter appears once per page, so a fixed id is safe. */
const HEADING_ID = "anatomy-title";

/**
 * The fix chapter's stage: the parts heading, the line drawing and the parts list. Exported for
 * tests, which give it a fixed progress.
 */
export function AnatomyStage({ locale }: { locale: Locale }) {
  return (
    <Container
      className={cn(
        "grid gap-x-16 gap-y-10 py-18 md:py-30 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center",
        // Pinned: one screen, under the fixed header.
        "pinned:h-full pinned:content-start pinned:gap-y-5 pinned:pt-20 pinned:pb-6",
        // A short phone (an iPhone SE's 548 px) gets a smaller drawing and tighter rows.
        "pinned:max-md:[@media(max-height:40rem)]:gap-y-3 pinned:max-md:[@media(max-height:40rem)]:pt-[4.5rem]",
        "pinned:lg:content-center pinned:lg:gap-y-10 pinned:lg:pt-24 pinned:lg:pb-10",
      )}
    >
      <div className="lg:col-span-2">
        <p className={monoLabel}>{story.anatomy.kicker[locale]}</p>
        <h2
          id={HEADING_ID}
          className={cn(
            "mt-4 text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px]",
            "pinned:max-md:text-[28px] pinned:max-md:[@media(max-height:40rem)]:mt-2 pinned:max-md:[@media(max-height:40rem)]:text-[26px]",
          )}
        >
          {polish.partsHeading[locale]}
        </h2>
      </div>
      <ExplodedHeadlight>
        <HeadlightLines
          label={story.anatomy.drawingLabel[locale]}
          offsets={EXPLODED}
          // Pinned on a phone the drawing gives way to the list's description slot.
          className="pinned:max-md:max-h-[24svh] pinned:max-md:[@media(max-height:40rem)]:max-h-[22svh]"
        />
      </ExplodedHeadlight>
      <PartsList
        labelledBy={HEADING_ID}
        parts={polish.parts.map((part) => ({ id: part.id, name: part.name[locale], body: part.body[locale] }))}
      />
    </Container>
  );
}

/**
 * 4 · The fix: what a headlight is made of. Pinned, the line drawing comes apart into its four
 * layers, then each part lights up in turn while the list beside it opens its description.
 */
export function AnatomyChapter({ locale }: { locale: Locale }) {
  return (
    <ScrollChapter
      id="anatomy"
      label={story.anatomy.kicker[locale]}
      length={{ base: 280, md: 320 }}
      className="border-t border-line"
    >
      <AnatomyStage locale={locale} />
    </ScrollChapter>
  );
}
