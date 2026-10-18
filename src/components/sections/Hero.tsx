import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import heroPhoto from "@/assets/photos/hero-headlight.jpg";
import { Beat } from "@/components/story/Beat";
import { HeroZoom } from "@/components/story/HeroZoom";
import { ScrollChapter } from "@/components/story/ScrollChapter";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { monoLabel } from "@/components/ui/styles";
import { common } from "@/content/common";
import { hero } from "@/content/hero";
import { story } from "@/content/story";
import { localePath, type Locale } from "@/lib/i18n";

/*
 * Entrances. The h1 is visible at first paint: it only moves, it never fades. The rest fades up
 * in a short stagger. Nothing animates under reduced motion.
 */
const CSS = `
@keyframes hero-rise { from { transform: translate3d(0, 0.2em, 0); } to { transform: none; } }
@keyframes hero-fade { from { opacity: 0; transform: translate3d(0, 12px, 0); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: no-preference) {
  .hero-rise { animation: hero-rise 1.2s var(--ease-out-expo) both; }
  .hero-fade { animation: hero-fade 1s var(--ease-out-expo) var(--hero-delay, 0s) both; }
}
`;

const delay = (seconds: number) => ({ "--hero-delay": `${seconds}s` }) as CSSProperties;

/*
 * Where the trust row shows. The stage holds it, except when the stage is pinned (one screen
 * high) and has no room for it: below `lg`, where the photo band takes the space under the copy,
 * and from `lg` on screens under 40rem (640 px) high (the centred copy and the row need up to
 * 638 px, measured at 1024–1920 px wide in both locales). There the copy after the chapter shows
 * instead, in the flow, and never fades. The two are exactly complementary (Hero.test.tsx checks
 * it), so the row reaches the accessibility tree once.
 */
export const TRUST_IN_STAGE = "pinned:hidden pinned:lg:[@media(min-height:40rem)]:block";
export const TRUST_AFTER_CHAPTER = "hidden pinned:block pinned:lg:[@media(min-height:40rem)]:hidden";

function TrustList({ locale }: { locale: Locale }) {
  return (
    // role="list": Safari drops list semantics from a `list-style: none` list.
    <ul
      role="list"
      aria-label={hero.trustLabel[locale]}
      className="hero-fade grid grid-cols-2 border-t border-line lg:grid-cols-4"
      style={delay(0.55)}
    >
      {hero.trust.map((item) => (
        <li
          key={item.id}
          className="min-w-0 border-line py-5 pr-4 text-sm leading-normal text-muted max-lg:nth-[n+3]:border-t lg:border-l lg:px-5 lg:pt-[22px] lg:pb-[30px] lg:first:border-l-0 lg:first:pl-0"
        >
          <span className="mb-1 block text-[15px] font-semibold text-fg">{item.title[locale]}</span>
          {item.detail[locale]}
        </li>
      ))}
    </ul>
  );
}

/**
 * The landing hero, the first chapter of the scroll story ("Light"). While it is pinned, the
 * photo zooms towards the headlight, the copy and the trust row fade out, and a second line
 * fades in. At p = 0 everything is fully visible, and without JS or with reduced motion it is
 * the plain hero with the second line after it.
 */
export function Hero({ locale }: { locale: Locale }) {
  return (
    <>
      <ScrollChapter
        id="top"
        labelledBy="hero-title"
        length={{ base: 160, md: 190 }}
        // No `relative` here: it would override the pinned stage's `position: sticky`. Pinned,
        // the stage is exactly one screen high, so it stays pinned to the end of its track.
        stageClassName="isolate flex min-h-[640px] flex-col overflow-hidden md:min-h-[720px] pinned:h-svh pinned:min-h-0"
      >
        <HeroStage locale={locale} />
      </ScrollChapter>

      {/* Where the pinned stage has no room for the trust row (see TRUST_IN_STAGE). */}
      <Container className={TRUST_AFTER_CHAPTER}>
        <TrustList locale={locale} />
      </Container>
    </>
  );
}

/** The hero chapter's stage. Exported for tests, which render it at a fixed progress. */
export function HeroStage({ locale }: { locale: Locale }) {
  return (
    <>
      <style>{CSS}</style>

      {/*
        The photo zone. It ends at the trust row, so the row always sits on plain `bg`. A pinned
        stage is one screen high: from `lg` the copy is centred in it; below `lg` the copy stays
        at the top and the photo band takes the space left under it.
      */}
      <div className="relative isolate flex flex-1 flex-col justify-end pinned:max-lg:justify-start pinned:lg:justify-center">
        {/*
          The photo. Below `lg` it is a band at the bottom of the zone, which clips the photo's
          dark top: the clear photo starts 20–24 px below the buttons however long the copy runs.
          (Pinned, the band follows the copy in the flow, 16 px up, and takes whatever height is
          left, down to none on the shortest screens; the photo box grows with a taller band.)
          From `lg` it fills the zone's right side and fades into `bg` on its left. The scrims
          stay put while the photo zooms.
        */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 overflow-hidden sm:h-[18.75rem] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[80%] pinned:max-lg:relative pinned:max-lg:order-last pinned:max-lg:-mt-4 pinned:max-lg:h-auto pinned:max-lg:min-h-0 pinned:max-lg:flex-1">
          <HeroZoom className="absolute inset-x-0 bottom-0 h-[22rem] lg:top-0 lg:h-auto pinned:max-lg:min-h-full">
            <Image
              src={heroPhoto}
              alt={hero.photoAlt[locale]}
              fill
              preload
              // Below 626 px the 22 rem box is cover-scaled to its height, so the photo renders
              // 626 px wide; above that it spans the viewport (80 % of it from `lg`, plus crop).
              // Anchored right below `lg`, so the whole headlight sits in the band.
              // Pinned below `lg` (the PINNED_QUERY condition), the box grows with the band: the
              // screen less the copy, which ends at least 416 px down, plus the 16 px overlap.
              // Cover-scaled at 16:9 that is 1.7778 × (100vh − 400 px) wide. A browser that
              // can't read `max()` here skips that entry and uses the two after it.
              sizes="(min-width: 64rem) 100vw, (prefers-reduced-motion: no-preference) and (min-height: 32rem) max(626px, 100vw, calc(177.78vh - 711px)), (min-width: 39.125rem) 100vw, 626px"
              className="object-cover object-[100%_90%] lg:object-[100%_60%]"
            />
          </HeroZoom>
          <div aria-hidden className="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-bg to-transparent lg:hidden" />
          <div aria-hidden className="absolute inset-y-0 left-0 hidden w-2/5 bg-linear-to-r from-bg to-transparent lg:block" />
        </div>
        {/* Desktop scrim behind the text column, and a fade into the trust row at every width. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hidden bg-linear-to-r from-bg/85 via-bg/55 via-45% to-bg/0 to-75% lg:block"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-12 bg-linear-to-t from-bg to-transparent lg:h-1/3" />

        {/* Pinned, the copy fits one screen down to the 512 px pinning floor. From `lg` the
            paddings are only minimums around the centred copy: it clears the 80 px header, and
            keeps 48 px above the trust row when the stage holds it (16 px to the screen's edge
            when it doesn't). Below `lg`, screens up to 544 px high get 16 px less top room. */}
        <Container className="pt-28 pb-52 sm:pt-32 sm:pb-70 lg:pt-40 lg:pb-[90px] pinned:max-lg:pb-0 pinned:max-lg:[@media(max-height:34rem)]:pt-20 pinned:lg:pt-20 pinned:lg:pb-4 pinned:lg:[@media(min-height:40rem)]:pb-12">
          {/* The copy drifts up and fades out between p 0.08 and 0.38. The buttons stay inside:
              focusing one after scrolling brings the copy back into view. */}
          <Beat range={[0, 0.38]} fade={0.3} lift={50}>
            <p className={`hero-fade ${monoLabel}`} style={delay(0.1)}>
              {hero.eyebrow[locale]}
            </p>

            <h1
              id="hero-title"
              className="hero-rise mt-[18px] text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-fg [hyphens:manual]"
            >
              {hero.title[locale].map((line, index) => (
                <Fragment key={line}>
                  {index > 0 ? " " : null}
                  <span className="block">{line}</span>
                </Fragment>
              ))}
            </h1>

            <p
              className="hero-fade mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-pretty text-soft md:mt-[26px] md:text-lg lg:max-w-[40ch] xl:max-w-[46ch]"
              style={delay(0.25)}
            >
              {hero.lead[locale]}
            </p>

            <div className="hero-fade mt-8 flex flex-wrap gap-3 md:mt-9" style={delay(0.4)}>
              <Button href="#contact" size="lg">
                {common.requestOffer[locale]}
              </Button>
              <Button href={localePath(locale, "/catalog")} variant="ghost" size="lg">
                {common.viewCatalog[locale]}
              </Button>
            </div>
          </Beat>
        </Container>
      </div>

      {/* Fades out between p 0.05 and 0.30, where the pinned stage holds it (TRUST_IN_STAGE). */}
      <Beat range={[0, 0.3]} fade={0.25} className={TRUST_IN_STAGE}>
        <Container>
          <TrustList locale={locale} />
        </Container>
      </Beat>

      {/*
        The second line fades in between p 0.42 and 0.66 and stays. Pinned, it overlays the
        stage: near the top below `lg`, where the copy was (the photo band is under it), and
        centred from `lg`, beside the photo. Static, it closes the hero in the flow, before the
        problem chapter.
      */}
      <Beat
        range={[0.42, 1.01]}
        fade={0.24}
        initiallyHidden
        className="pinned:absolute pinned:inset-x-0 pinned:top-0 pinned:flex pinned:h-svh pinned:items-start pinned:lg:items-center"
      >
        <Container className="py-16 md:py-24 pinned:pt-28 pinned:pb-0 pinned:sm:pt-32 pinned:lg:pt-0">
          <p className="max-w-[14ch] text-[clamp(34px,5vw,64px)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-fg">
            {story.heroNext[locale]}
          </p>
        </Container>
      </Beat>
    </>
  );
}
