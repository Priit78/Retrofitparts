import { Container } from "@/components/ui/Container";
import { monoLabel, sectionTitle } from "@/components/ui/styles";
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
        // Pinned: one screen, under the fixed header. Stacked (phones, portrait tablets), the
        // drawing takes the height the heading and the list leave, so a short screen never clips.
        "pinned:flex pinned:h-full pinned:flex-col pinned:gap-5 pinned:pt-20 pinned:pb-6",
        "pinned:max-md:[@media(max-height:40rem)]:gap-3 pinned:max-md:[@media(max-height:40rem)]:pt-[4.5rem]",
        // Side by side in a landscape tablet and from lg: the drawing's row takes what the heading
        // leaves, and the whole group is centred.
        "pinned:md:max-lg:landscape:grid pinned:md:max-lg:landscape:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] pinned:md:max-lg:landscape:items-center",
        "pinned:md:max-lg:landscape:grid-rows-[auto_minmax(0,max-content)] pinned:md:max-lg:landscape:content-center-safe",
        "pinned:md:max-lg:landscape:gap-x-10 pinned:md:max-lg:landscape:gap-y-6",
        "pinned:lg:grid pinned:lg:grid-rows-[auto_minmax(0,max-content)] pinned:lg:content-center-safe",
        "pinned:lg:gap-x-16 pinned:lg:gap-y-[clamp(1.5rem,4svh,2.5rem)] pinned:lg:pt-[5.5rem]",
      )}
    >
      <div className="lg:col-span-2 pinned:shrink-0 pinned:md:max-lg:landscape:col-span-2">
        <p className={monoLabel}>{story.anatomy.kicker[locale]}</p>
        <h2
          id={HEADING_ID}
          className={cn(
            "mt-4",
            sectionTitle,
            // Pinned, the large heading scales with the screen's height; phones get a smaller one.
            "pinned:md:text-[clamp(2rem,6svh,3.25rem)] pinned:max-md:text-[28px]",
            "pinned:max-md:[@media(max-height:40rem)]:mt-2 pinned:max-md:[@media(max-height:40rem)]:text-[26px]",
          )}
        >
          {polish.partsHeading[locale]}
        </h2>
      </div>
      {/* Pinned, the drawing fills the box it is given (centred), at most its own size. */}
      <ExplodedHeadlight className="pinned:flex pinned:min-h-0 pinned:flex-col pinned:justify-center pinned:self-stretch">
        <HeadlightLines
          label={story.anatomy.drawingLabel[locale]}
          offsets={EXPLODED}
          className="pinned:min-h-0 pinned:max-h-full"
        />
      </ExplodedHeadlight>
      <PartsList
        labelledBy={HEADING_ID}
        parts={polish.parts.map((part) => ({ id: part.id, name: part.name[locale], body: part.body[locale] }))}
        className="pinned:shrink-0"
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
