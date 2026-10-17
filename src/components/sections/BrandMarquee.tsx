import { Pause, Play } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

/*
 * A CSS-only marquee: the track holds the list three times and slides by one copy, so the
 * loop is seamless. The two copies after the visible one always cover the viewport: one list
 * is about 2,100–2,750 px wide, and never narrower than half the viewport (`min-w-[50vw]`).
 * It pauses on hover and with the pause toggle (a checkbox, so it works without JS). Under
 * reduced motion it is a static, wrapped row.
 */
const COPIES = 3;

const CSS = `
@keyframes brand-marquee { to { transform: translate3d(calc(-100% / ${COPIES}), 0, 0); } }
.brand-track { animation: brand-marquee 52s linear infinite; }
.brand-marquee:hover .brand-track,
.brand-marquee:has(.brand-pause:checked) .brand-track { animation-play-state: paused; }
@media (prefers-reduced-motion: reduce) {
  .brand-track { animation: none; }
}
`;

const brands = [
  ...site.representedBrands.map((name) => ({ name, represented: true })),
  ...site.workedBrands.map((name) => ({ name, represented: false })),
];

function BrandList({ locale, duplicate = false }: { locale: Locale; duplicate?: boolean }) {
  return (
    // role="list": Safari drops list semantics from a `list-style: none` list.
    <ul
      role="list"
      aria-hidden={duplicate || undefined}
      aria-labelledby={duplicate ? undefined : "brands-title"}
      className={cn(
        "flex min-w-[50vw] shrink-0 items-center",
        "motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-10 motion-reduce:gap-y-5",
        duplicate && "motion-reduce:hidden",
      )}
    >
      {brands.map(({ name, represented }) => (
        <li
          key={name}
          className="flex items-center whitespace-nowrap motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-3 motion-reduce:gap-y-2"
        >
          <span
            aria-hidden
            className="mx-7 size-1 rounded-full bg-muted/40 md:mx-10 motion-reduce:hidden"
          />
          <span
            className={cn(
              "font-display text-xl font-semibold tracking-[0.02em] uppercase [font-stretch:125%] md:text-[1.75rem]",
              represented ? "text-fg" : "text-muted",
            )}
          >
            {name}
          </span>
          {represented ? (
            <span className="ml-3 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[0.625rem] leading-none tracking-[0.14em] text-accent uppercase motion-reduce:ml-0">
              {hero.marquee.representative[locale]}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function BrandMarquee({ locale }: { locale: Locale }) {
  return (
    <section
      id="brands"
      aria-labelledby="brands-title"
      className="brand-marquee relative border-y border-line bg-surface/60 py-10 md:py-14"
    >
      <style>{CSS}</style>

      <Container className="mb-7 flex items-center justify-between gap-4 md:mb-9">
        <h2
          id="brands-title"
          className="font-mono text-xs font-normal tracking-[0.2em] text-muted uppercase"
        >
          {hero.marquee.heading[locale]}
        </h2>
        <label
          title={hero.marquee.pause[locale]}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line text-muted transition-colors duration-300 hover:border-accent/50 hover:text-fg has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-accent motion-reduce:hidden"
        >
          <input
            type="checkbox"
            aria-label={hero.marquee.pause[locale]}
            className="brand-pause peer sr-only"
          />
          <Pause aria-hidden className="size-3.5 peer-checked:hidden" strokeWidth={2} />
          <Play aria-hidden className="hidden size-3.5 peer-checked:block" strokeWidth={2} />
        </label>
      </Container>

      {/* Edges fade out (a mask uses only alpha; any opaque token works). */}
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,var(--color-bg)_12%,var(--color-bg)_88%,transparent)] motion-reduce:[mask-image:none]">
        <div className="brand-track flex w-max motion-reduce:w-full motion-reduce:px-4">
          <BrandList locale={locale} />
          {Array.from({ length: COPIES - 1 }, (_, i) => (
            <BrandList key={i} locale={locale} duplicate />
          ))}
        </div>
      </div>
    </section>
  );
}
