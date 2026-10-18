import Image from "next/image";
import { Fragment, type CSSProperties } from "react";
import heroPhoto from "@/assets/photos/hero-headlight.jpg";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { common } from "@/content/common";
import { hero } from "@/content/hero";
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

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[640px] flex-col overflow-hidden md:min-h-[720px]"
    >
      <style>{CSS}</style>

      {/* The photo zone. It ends at the trust row, so the row always sits on plain `bg`. */}
      <div className="relative isolate flex flex-1 flex-col justify-end">
        {/*
          The photo. Below `lg` it is a band at the bottom of the zone, which clips the photo's
          dark top: the clear photo starts 20–24 px below the buttons however long the copy runs.
          From `lg` it fills the zone's right side and fades into `bg` on its left.
        */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-56 overflow-hidden sm:h-[18.75rem] lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[80%]">
          <div className="absolute inset-x-0 bottom-0 h-[26rem] lg:top-0 lg:h-auto">
            <Image
              src={heroPhoto}
              alt={hero.photoAlt[locale]}
              fill
              preload
              // Below 740 px the 26 rem box is cover-scaled to its height, so the photo renders
              // 740 px wide; above that it spans the viewport (80 % of it from `lg`, plus crop).
              sizes="(min-width: 46.25rem) 100vw, 740px"
              className="object-cover object-[78%_90%] lg:object-[100%_60%]"
            />
          </div>
          <div aria-hidden className="absolute inset-x-0 top-0 h-10 bg-linear-to-b from-bg to-transparent lg:hidden" />
          <div aria-hidden className="absolute inset-y-0 left-0 hidden w-2/5 bg-linear-to-r from-bg to-transparent lg:block" />
        </div>
        {/* Desktop scrim behind the text column, and a fade into the trust row at every width. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hidden bg-linear-to-r from-bg/85 via-bg/55 via-45% to-bg/0 to-75% lg:block"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-12 bg-linear-to-t from-bg to-transparent lg:h-1/3" />

        <Container className="pt-28 pb-52 sm:pt-32 sm:pb-70 lg:pt-40 lg:pb-[90px]">
          <p className="hero-fade font-mono text-xs tracking-[0.08em] text-muted uppercase" style={delay(0.1)}>
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
        </Container>
      </div>

      <Container>
        {/* role="list": Safari drops list semantics from a `list-style: none` list. */}
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
      </Container>
    </section>
  );
}
