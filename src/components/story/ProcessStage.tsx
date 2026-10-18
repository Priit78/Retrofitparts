"use client";

import { motion, useTransform } from "motion/react";
import Image, { type StaticImageData } from "next/image";
import { useCallback, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { monoLabel } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { activeIndex } from "@/lib/story";
import { useChapter } from "./ScrollChapter";

export interface ProcessStageStep {
  id: string;
  title: string;
  /** May hold a link, such as the email address. */
  body: ReactNode;
  tag: string;
  /** Decorative: the text carries the meaning. */
  photo: StaticImageData;
}

const bg = (alpha: number) => `color-mix(in oklab, var(--color-bg) ${alpha}%, transparent)`;

/**
 * The bottom scrim over a pinned step photo, so every word on it meets AA. It is the design's
 * gradient (bg/97 at 0 %, bg/82 at 38 %, bg/20 at 75 %, bg/55 at the top), strengthened: the
 * dense part reaches at least `--scrim-dense` from the bottom, which covers the text block's
 * height at each breakpoint (`scrimStops`), and only then clears. Each step carries its own
 * scrim, so a crossfade between two steps keeps the same darkness.
 */
const scrimStyle: CSSProperties = {
  backgroundImage: `linear-gradient(0deg, ${bg(97)} 0%, ${bg(85)} max(38%, var(--scrim-dense)), ${bg(20)} max(75%, var(--scrim-clear)), ${bg(55)} 100%)`,
};

/**
 * The pinned text block's height (measured at 360–1440 px in both locales: up to 505 px on
 * phones, 567 px on tablets and 460 px from `lg`, where the heading sits beside the step), plus a
 * margin, then 10 rem to clear.
 */
const scrimStops =
  "[--scrim-dense:33rem] [--scrim-clear:43rem] md:[--scrim-dense:37rem] md:[--scrim-clear:47rem] lg:[--scrim-dense:30rem] lg:[--scrim-clear:40rem]";

/** How far a step's text sits below (next steps) or above (past steps) its place, in px. */
const LIFT = 16;

/**
 * The process steps of the landing scroll story, with their progress bar.
 *
 * Pinned, the stage shows one step at a time: step k = activeIndex(p, n). Its photo fills the
 * stage (the nearest positioned ancestor is the sticky `.chapter-stage`) and crossfades with the
 * step, and its text sits at the bottom, stacked in one grid cell with the others. The other
 * steps are transparent and let clicks through. Under the steps, segment i fills as
 * clamp(n·p − i, 0, 1).
 *
 * Static (no JS, reduced motion, a short viewport), the steps are a plain list, each with its
 * photo above it, and the segments are hidden.
 */
export function ProcessStage({ steps }: { steps: ProcessStageStep[] }) {
  const { progress, animated, seek } = useChapter();
  const count = steps.length;

  // The step changes three times per pass, so following it in React state is cheap; the segments
  // follow the progress every frame through motion values instead.
  const subscribe = useCallback((onChange: () => void) => progress.on("change", onChange), [progress]);
  const active = useSyncExternalStore(
    subscribe,
    () => activeIndex(progress.get(), count),
    () => 0,
  );

  return (
    <>
      <ol className="mt-12 grid gap-14 md:mt-16 md:grid-cols-2 md:gap-x-8 lg:gap-x-12 pinned:mt-6 pinned:grid-cols-1 pinned:gap-0 pinned:md:mt-8 pinned:lg:col-span-7 pinned:lg:mt-0">
        {steps.map((step, index) => {
          const current = index === active;
          const y = index < active ? -LIFT : index > active ? LIFT : 0;
          return (
            <li
              key={step.id}
              aria-current={animated && current ? "step" : undefined}
              // Before hydration a pinned stage shows step 1 only (globals.css).
              data-pinned-hidden={index > 0 ? "" : undefined}
              // Opacity only, never a transform: the photo inside is positioned against the stage.
              className="min-w-0 transition-opacity duration-700 ease-out-expo pinned:col-start-1 pinned:row-start-1"
              style={
                animated
                  ? { opacity: current ? 1 : 0, pointerEvents: current ? "auto" : "none" }
                  : undefined
              }
              // Keyboard focus in a hidden step (the step-1 email link) scrolls to the middle of
              // that step's span, so the focus ring is never invisible.
              onFocus={() => {
                if (activeIndex(progress.get(), count) !== index) seek((index + 0.5) / count);
              }}
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2px] bg-surface pinned:absolute pinned:inset-0 pinned:aspect-auto pinned:rounded-none">
                <Image
                  src={step.photo}
                  alt=""
                  fill
                  sizes="100vw"
                  // Step 1 shows as soon as the chapter pins; the others load as it comes near.
                  loading={index === 0 ? "eager" : "lazy"}
                  className="object-cover"
                />
                <div aria-hidden className={cn("absolute inset-0 hidden pinned:block", scrimStops)} style={scrimStyle} />
              </div>

              {/* Positioned, so it paints over its own photo. */}
              <div
                className="relative mt-6 transition-transform duration-700 ease-out-expo pinned:mt-0"
                style={animated ? { transform: y === 0 ? "none" : `translateY(${y}px)` } : undefined}
              >
                <span
                  aria-hidden
                  className="block text-[56px] leading-none font-light tracking-[-0.04em] text-fg pinned:text-[clamp(64px,10vw,128px)]"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-[26px] leading-tight text-fg md:text-[clamp(26px,3vw,36px)]">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[46ch] text-base leading-relaxed text-pretty text-soft md:text-[17px]">
                  {step.body}
                </p>
                <p className={cn(monoLabel, "mt-3 [overflow-wrap:anywhere]")}>{step.tag}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div
        aria-hidden
        data-process-progress
        className="relative z-10 mt-6 hidden grid-cols-4 gap-1.5 pinned:grid pinned:md:mt-8 pinned:lg:col-span-12"
      >
        {steps.map((step, index) => (
          <span key={step.id} className="relative h-0.5 overflow-hidden bg-fg/20">
            {animated ? (
              <SegmentFill index={index} count={count} />
            ) : (
              <span className="absolute inset-0 origin-left scale-x-0 bg-fg" />
            )}
          </span>
        ))}
      </div>
    </>
  );
}

/** Segment `index` of the progress bar: clamp(count·p − index, 0, 1) of its width, in `fg`. */
function SegmentFill({ index, count }: { index: number; count: number }) {
  const { progress } = useChapter();
  const scaleX = useTransform(progress, (p) => Math.min(1, Math.max(0, count * p - index)));
  return <motion.span style={{ scaleX }} className="absolute inset-0 origin-left bg-fg" />;
}
