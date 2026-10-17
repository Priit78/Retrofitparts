"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

export interface TimelineStep {
  id: string;
  title: string;
  body: string;
  tag: string;
}

interface Geometry {
  /** First and last node centres, in px from the top of the list. */
  top: number;
  height: number;
  /** Scroll progress (0–1 along the track) at which each node lights up. */
  stops: number[];
}

/** Where on screen the beam tip sits while it draws: 60% of the way down the viewport. */
const READING_LINE = 0.6;

/**
 * A vertical beam that draws down as the list scrolls past the reading line. Each step's node
 * lights up when the beam reaches it. Reduced motion shows the beam fully drawn and every
 * step lit. The step text never depends on the animation.
 */
export function ProcessTimeline({ steps }: { steps: TimelineStep[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const reduce = usePrefersReducedMotion();
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [reached, setReached] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: [`start ${READING_LINE}`, `end ${READING_LINE}`],
  });
  const tipTop = useTransform(scrollYProgress, (v) => `${v * 100}%`);

  const countReached = useCallback(
    (progress: number, stops: number[]) =>
      stops.filter((stop, i) => (i === 0 ? progress > 0 : progress >= stop - 0.001)).length,
    [],
  );

  // Measure the node centres so the track runs from the first node to the last one.
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const listTop = list.getBoundingClientRect().top;
      const centres = nodeRefs.current
        .filter((node): node is HTMLSpanElement => node !== null)
        .map((node) => {
          const rect = node.getBoundingClientRect();
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
    // wrapper's top edge, so the node positions measured on the list apply to the rail as-is.
    <div className="relative">
      {/* The rail, and the beam that fills it. */}
      <div
        ref={trackRef}
        aria-hidden
        className={cn("absolute left-5 w-px -translate-x-1/2", !geometry && "top-5 bottom-24")}
        style={geometry ? { top: geometry.top, height: geometry.height } : undefined}
      >
        <div className="absolute inset-0 bg-line" />
        {reduce ? (
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-linear-to-b from-accent/30 via-accent to-light" />
        ) : (
          <>
            <motion.div
              style={{ scaleY: scrollYProgress }}
              className="absolute inset-y-0 left-1/2 w-0.5 origin-top -translate-x-1/2 bg-linear-to-b from-accent/0 via-accent to-light shadow-[0_0_14px_color-mix(in_oklab,var(--color-accent)_70%,transparent)]"
            />
            <motion.div
              style={{ top: tipTop }}
              className="absolute left-1/2 size-2 -translate-1/2 rounded-full bg-light shadow-[0_0_18px_6px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]"
            />
          </>
        )}
      </div>

      <ol ref={listRef} className="relative">
        {steps.map((step, index) => {
          const lit = index < litCount;
          return (
            <li
              key={step.id}
              data-lit={lit ? "" : undefined}
              className="group/step relative grid grid-cols-[2.5rem_1fr] gap-x-6 pb-16 last:pb-0 md:gap-x-10 md:pb-24"
            >
              <span
                ref={(node) => {
                  nodeRefs.current[index] = node;
                }}
                aria-hidden
                className={cn(
                  "relative z-10 grid size-10 place-items-center rounded-full border bg-bg font-mono text-xs transition-[border-color,color,box-shadow] duration-700 ease-out-expo",
                  lit
                    ? "border-accent/70 text-light shadow-[0_0_0_5px_color-mix(in_oklab,var(--color-accent)_10%,transparent),0_0_28px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]"
                    : "border-line text-muted",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 pt-1">
                <p
                  className={cn(
                    "font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-700 [overflow-wrap:anywhere]",
                    lit ? "text-accent" : "text-muted",
                  )}
                >
                  {step.tag}
                </p>
                <h3 className="mt-3 text-2xl leading-tight font-semibold text-fg md:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-muted md:text-lg">
                  {step.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
