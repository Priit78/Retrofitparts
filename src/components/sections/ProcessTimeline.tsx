"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { monoLabel } from "@/components/ui/styles";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

export interface TimelineStep {
  id: string;
  title: string;
  /** May hold a link, such as the email address. */
  body: ReactNode;
  tag: string;
}

interface Geometry {
  /** First and last marker centres, in px from the top of the list. */
  top: number;
  height: number;
  /** Scroll progress (0–1 along the rail) at which the line reaches each marker. */
  stops: number[];
}

/** Where on screen the line's end sits while it fills: 60% of the way down the viewport. */
const READING_LINE = 0.6;

/**
 * A hairline rail that fills in `fg` as the list scrolls past the reading line. A step turns from
 * `muted` to `fg` once the line has reached its marker. Phones get a plain list with no rail, and
 * reduced motion shows the rail filled and every step at full contrast. The step text never
 * depends on the animation.
 */
export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const reduce = usePrefersReducedMotion();
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [reached, setReached] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${READING_LINE}`, `end ${READING_LINE}`],
  });

  const countReached = useCallback(
    (progress: number, stops: number[]) =>
      stops.filter((stop, i) => (i === 0 ? progress > 0 : progress >= stop - 0.001)).length,
    [],
  );

  // Measure the marker centres so the rail runs from the first marker to the last one.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const listTop = list.getBoundingClientRect().top;
      const centres = markerRefs.current
        .filter((marker): marker is HTMLSpanElement => marker !== null)
        .map((marker) => {
          const rect = marker.getBoundingClientRect();
          return rect.top - listTop + rect.height / 2;
        });
      if (centres.length < 2) return;
      const top = centres[0];
      const height = centres[centres.length - 1] - top;
      const stops = centres.map((c) => (height > 0 ? (c - top) / height : 0));
      setGeometry({ top, height, stops });
      setReached(countReached(scrollYProgress.get(), stops));
    };

    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [countReached, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (geometry) setReached(countReached(progress, geometry.stops));
  });

  const litCount = reduce ? steps.length : reached;

  return (
    // The rail sits beside the list, not in it: an <ol> may only contain <li>s. Both share the
    // wrapper's top edge, so the marker positions measured on the list apply to the rail as-is.
    <div className="relative">
      <div
        ref={trackRef}
        aria-hidden
        className={cn(
          "absolute left-[18px] hidden w-px -translate-x-1/2 md:block",
          !geometry && "top-[18px] bottom-24",
        )}
        style={geometry ? { top: geometry.top, height: geometry.height } : undefined}
      >
        <div className="absolute inset-0 bg-line" />
        {reduce ? (
          <div className="absolute inset-0 bg-fg" />
        ) : (
          <motion.div style={{ scaleY: scrollYProgress }} className="absolute inset-0 origin-top bg-fg" />
        )}
      </div>

      <ol ref={listRef} className="relative">
        {steps.map((step, index) => {
          const lit = index < litCount;
          // Phones always see the full-contrast step; the muted state belongs to the rail.
          const tone = lit ? "text-fg" : "text-fg md:text-muted";
          return (
            <li
              key={step.id}
              className="relative border-t border-line py-7 last:border-b md:grid md:grid-cols-[36px_1fr] md:gap-x-10 md:border-t-0 md:py-0 md:pb-20 md:last:border-b-0 md:last:pb-0"
            >
              <span
                ref={(marker) => {
                  markerRefs.current[index] = marker;
                }}
                aria-hidden
                className={cn(
                  "relative z-10 block font-mono text-xs tracking-[0.08em] transition-[color,border-color] duration-500 md:grid md:size-9 md:place-items-center md:rounded-[2px] md:border md:bg-bg md:tracking-normal",
                  lit ? "text-muted md:border-fg md:text-fg" : "text-muted md:border-line",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 min-w-0 md:mt-0 md:pt-1">
                <h3
                  className={cn(
                    "text-2xl leading-tight font-semibold transition-colors duration-500 md:text-[28px]",
                    tone,
                  )}
                >
                  {step.title}
                </h3>
                <p
                  className={cn(
                    "mt-3 max-w-[46ch] text-base leading-relaxed transition-colors duration-500 md:text-[17px]",
                    lit ? "text-soft" : "text-soft md:text-muted",
                  )}
                >
                  {step.body}
                </p>
                <p className={cn(monoLabel, "mt-4 [overflow-wrap:anywhere]")}>
                  {step.tag}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
