import { ArrowRight, BadgeCheck, MapPin, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { BeamCanvas } from "@/components/hero/BeamCanvas";
import { ProjectorLens } from "@/components/hero/ProjectorLens";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { common } from "@/content/common";
import { hero, type TrustIcon } from "@/content/hero";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { localePath, type Locale } from "@/lib/i18n";

const trustIcons: Record<TrustIcon, LucideIcon> = {
  experience: Wrench,
  warranty: ShieldCheck,
  representative: BadgeCheck,
  workshop: MapPin,
};

/*
 * Entrances. The h1 is the LCP element, so it only moves (no opacity), and is visible at
 * first paint. The rest fades up in a short stagger. Nothing animates under reduced motion.
 */
const CSS = `
@keyframes hero-rise { from { transform: translate3d(0, 0.35em, 0); } to { transform: none; } }
@keyframes hero-fade { from { opacity: 0; transform: translate3d(0, 14px, 0); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: no-preference) {
  .hero-rise { animation: hero-rise 1.4s var(--ease-out-expo) both; }
  .hero-fade { animation: hero-fade 1.1s var(--ease-out-expo) var(--hero-delay, 0s) both; }
}
`;

const delay = (seconds: number) => ({ "--hero-delay": `${seconds}s` }) as CSSProperties;

export function Hero({ locale }: { locale: Locale }) {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      <style>{CSS}</style>

      {/* Backdrop: a faint cool wash where the light is, fading into the next section. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(70%_60%_at_72%_32%,color-mix(in_oklab,var(--color-accent)_7%,transparent),transparent_70%)] lg:bg-[radial-gradient(55%_65%_at_76%_46%,color-mix(in_oklab,var(--color-accent)_7%,transparent),transparent_70%)]"
      />
      <BeamCanvas className="absolute inset-0 -z-10 size-full" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-b from-transparent to-bg"
      />

      <Container className="relative flex flex-1 flex-col pt-[4.5rem] pb-8 lg:pb-10">
        <div className="relative grid flex-1 grid-cols-1 content-center lg:grid-cols-12 lg:items-center">
          {/* The lens: above the text on phones, to the right on desktop. */}
          <div
            className={cn(
              "relative -mr-[10vw] mb-3 ml-auto w-[min(76vw,380px)] [--beam-angle:122] sm:-mr-8",
              "lg:absolute lg:top-1/2 lg:-right-10 lg:m-0 lg:w-[min(42vw,600px)] lg:-translate-y-1/2 lg:[--beam-angle:183]",
              // Protrude past the container only as far as the page gutter allows (0 at 1280 px, 48 px from 1376 px).
              "xl:right-[calc(-1*clamp(0px,(100vw_-_1280px)/2,48px))] xl:w-[min(44vw,610px)]",
            )}
          >
            <ProjectorLens />
          </div>

          {/* A size container: the h1 scales with this column so "valguslahendused" always fits. */}
          <div className="@container relative z-10 lg:col-span-7 lg:py-16 xl:col-span-6">
            <p
              className="hero-fade mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase md:mb-6"
              style={delay(0.1)}
            >
              <span aria-hidden className="h-px w-8 bg-accent/60" />
              {hero.eyebrow[locale]}
            </p>

            <h1
              id="hero-title"
              className={cn(
                // Sized from its column, so the longest word always fits: no greedy hyphenation
                // ("valgus-lahendused"); overflow-wrap stays as the safety net.
                "hero-rise font-semibold tracking-tight text-balance text-fg [hyphens:manual]",
                "text-[clamp(1.5rem,9.3cqi,4.5rem)] leading-[1.02]",
              )}
            >
              {site.tagline[locale]}
            </h1>

            <p
              className="hero-fade mt-6 max-w-[34rem] text-base leading-relaxed text-pretty text-fg/75 md:mt-8 md:text-lg"
              style={delay(0.25)}
            >
              {hero.subline[locale]}
            </p>

            <div
              className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10"
              style={delay(0.4)}
            >
              <Button href="#contact" size="lg" className="group">
                {common.requestOffer[locale]}
                <ArrowRight
                  aria-hidden
                  className="size-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                />
              </Button>
              <Button href={localePath(locale, "/catalog")} variant="ghost" size="lg">
                {common.viewCatalog[locale]}
              </Button>
            </div>
          </div>
        </div>

        <ul
          aria-label={hero.trustLabel[locale]}
          className="hero-fade relative z-10 mt-12 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-line pt-6 lg:mt-10 lg:grid-cols-4 lg:gap-x-0 lg:divide-x lg:divide-line"
          style={delay(0.55)}
        >
          {hero.trust.map((item) => {
            const Icon = trustIcons[item.icon];
            return (
              <li key={item.icon} className="flex min-w-0 items-start gap-3 lg:px-6 lg:first:pl-0">
                <span
                  aria-hidden
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-fg/[0.03] text-accent"
                >
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg">{item.title[locale]}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted md:text-sm">
                    {item.detail[locale]}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
