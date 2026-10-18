import { Check, X } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import headlightPolished from "@/assets/photos/headlight-polished.jpg";
import headlightUnpolished from "@/assets/photos/headlight-unpolished.jpg";
import { Container } from "@/components/ui/Container";
import { mono, monoLabel } from "@/components/ui/styles";
import { polish } from "@/content/polish";
import { story } from "@/content/story";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { Beat } from "./Beat";
import { PolishWipe } from "./PolishWipe";
import { ScrollChapter } from "./ScrollChapter";

/** The photo column: 7/12 of the container from lg, the full width below. */
const PHOTO_SIZES = "(min-width: 1280px) 690px, (min-width: 1024px) 56vw, 100vw";

/** Pinned, the three beats share one grid cell and crossfade; static, they read in order. */
const beatClass = "pinned:[grid-area:1/1] pinned:self-start pinned:lg:self-center";
const titleClass = cn(
  "mt-4 text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px]",
  // Pinned on a short phone (an iPhone SE's 548 px), every beat still fits under the photo.
  "pinned:max-md:[@media(max-height:40rem)]:mt-2 pinned:max-md:[@media(max-height:40rem)]:text-[26px]",
);

/** The chapter's kicker on each beat. Static, only the first one shows (and is read). */
function Kicker({ locale, repeat = false }: { locale: Locale; repeat?: boolean }) {
  return (
    <p aria-hidden={repeat || undefined} className={cn(monoLabel, repeat && "hidden pinned:block")}>
      {story.problem.kicker[locale]}
    </p>
  );
}

function Body({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft md:text-[17px]">{children}</p>
  );
}

/** Polishing (temporary, in `halogen`) against new parts (lasting, in `fg`). */
function Compare({ locale }: { locale: Locale }) {
  const columns = [
    { key: "polish", ...polish.compare.polish, lasting: false },
    { key: "replace", ...polish.compare.replace, lasting: true },
  ];
  return (
    <div
      className={cn(
        "mt-8 grid gap-10 sm:grid-cols-2 sm:gap-6 pinned:mt-6 pinned:grid-cols-2 pinned:gap-4 pinned:sm:gap-6",
        "pinned:max-md:[@media(max-height:40rem)]:mt-4",
      )}
    >
      {columns.map((column) => {
        const Icon = column.lasting ? Check : X;
        const titleId = `problem-compare-${column.key}`;
        return (
          <div
            key={column.key}
            role="group"
            aria-labelledby={titleId}
            className={cn("border-t pt-5", column.lasting ? "border-fg/35" : "border-line")}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 id={titleId} className="text-lg font-semibold text-fg pinned:max-sm:text-base">
                {column.title[locale]}
              </h3>
              <span className={cn(mono, column.lasting ? "text-fg" : "text-halogen")}>{column.tag[locale]}</span>
            </div>
            <ul
              className={cn(
                "mt-4 space-y-3 pinned:max-sm:mt-3 pinned:max-sm:space-y-2",
                "pinned:max-md:[@media(max-height:40rem)]:space-y-1.5",
              )}
            >
              {column.points.map((point) => (
                <li
                  key={point.en}
                  className="flex gap-3 text-[15px] leading-relaxed text-pretty pinned:max-sm:gap-2 pinned:max-sm:text-[13px] pinned:max-sm:leading-snug"
                >
                  <Icon
                    aria-hidden
                    className={cn(
                      "mt-1 size-4 shrink-0 pinned:max-sm:mt-0.5 pinned:max-sm:size-3.5",
                      column.lasting ? "text-fg" : "text-muted",
                    )}
                    strokeWidth={1.75}
                  />
                  <span className={column.lasting ? "text-fg" : "text-soft"}>{point[locale]}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The problem chapter's stage: the polishing wipe, then three beats (lenses age; polishing clears
 * them for a while; polish or replace?). Exported for tests, which give it a fixed progress.
 */
export function ProblemStage({ locale }: { locale: Locale }) {
  const [aging, polishing, choice] = story.problem.beats;
  return (
    <Container
      className={cn(
        "grid gap-12 py-18 md:py-30 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-16",
        // Pinned: one screen, under the fixed header. Photo on top on phones, beside the text from lg.
        "pinned:h-full pinned:grid-rows-[auto_minmax(0,1fr)] pinned:content-start pinned:gap-6 pinned:pt-20 pinned:pb-6",
        "pinned:max-md:[@media(max-height:40rem)]:gap-4 pinned:max-md:[@media(max-height:40rem)]:pt-[4.5rem]",
        "pinned:lg:grid-rows-1 pinned:lg:content-center pinned:lg:items-center pinned:lg:pt-24 pinned:lg:pb-10",
      )}
    >
      {/* The pair beside the beats from lg; it stays in view while static beats scroll past. */}
      <div className="lg:sticky lg:top-28 lg:order-2 pinned:lg:static">
        <PolishWipe
          // A short phone gets a shallower crop of the pair.
          className="pinned:max-md:[@media(max-height:40rem)]:max-h-[22svh]"
          before={
            <Image
              src={headlightUnpolished}
              alt={polish.photos.unpolished.alt[locale]}
              fill
              sizes={PHOTO_SIZES}
              className="object-cover object-center"
            />
          }
          after={
            <Image
              src={headlightPolished}
              alt={polish.photos.polished.alt[locale]}
              fill
              sizes={PHOTO_SIZES}
              className="object-cover object-center"
            />
          }
          beforeCaption={polish.photos.unpolished.caption[locale]}
          afterCaption={polish.photos.polished.caption[locale]}
        />
      </div>

      <div className="grid gap-16 lg:order-1 pinned:gap-0">
        <Beat range={[0, 0.33]} className={beatClass}>
          <Kicker locale={locale} />
          <h2 className={titleClass}>{aging.title[locale]}</h2>
          {aging.body ? <Body>{aging.body[locale]}</Body> : null}
        </Beat>
        <Beat range={[0.33, 0.66]} initiallyHidden className={beatClass}>
          <Kicker locale={locale} repeat />
          <h2 className={titleClass}>{polishing.title[locale]}</h2>
          {polishing.body ? <Body>{polishing.body[locale]}</Body> : null}
        </Beat>
        <Beat range={[0.66, 1.01]} initiallyHidden className={beatClass}>
          <Kicker locale={locale} repeat />
          <h2 className={titleClass}>{choice.title[locale]}</h2>
          <Compare locale={locale} />
        </Beat>
      </div>
    </Container>
  );
}

/**
 * 2 · The problem: lenses age, polishing clears them for a while, so polish or replace? Pinned,
 * the polished photo wipes in over the unpolished one while three beats crossfade beside it.
 */
export function ProblemChapter({ locale }: { locale: Locale }) {
  return (
    <ScrollChapter
      id="problem"
      label={story.problem.kicker[locale]}
      length={{ base: 260, md: 300 }}
      className="border-t border-line"
    >
      <ProblemStage locale={locale} />
    </ScrollChapter>
  );
}
