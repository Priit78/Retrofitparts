"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { segment } from "@/lib/story";
import { useChapter } from "./ScrollChapter";

/**
 * Scales its child, the hero photo, from 1 to `to` over the chapter, towards the headlight
 * (transform origin 72 % 48 %). It scales this wrapper, never the image, so `next/image` sizing
 * is untouched. Give the wrapper its box with `className`; the image fills it.
 *
 * Like Beat, it writes the transform itself from the progress value and removes it when the
 * chapter stops animating, so the photo is never left zoomed in static mode. It never remounts
 * its child: the photo is the LCP image.
 */
export function HeroZoom({
  children,
  to = 1.22,
  className,
}: {
  children: ReactNode;
  /** Scale at the end of the chapter. */
  to?: number;
  className?: string;
}) {
  const { progress, animated } = useChapter();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!animated || !el) return;

    const apply = (p: number) => {
      // Rounded, so 1.22 − 1 (0.21999999999999997) never shows up as scale(1.1099999999999999).
      const scale = Math.round((1 + (to - 1) * segment(p, 0, 1)) * 1e4) / 1e4;
      el.style.transform = scale === 1 ? "none" : `scale(${scale})`;
    };

    apply(progress.get());
    const unsubscribe = progress.on("change", apply);
    return () => {
      unsubscribe();
      el.style.removeProperty("transform");
    };
  }, [animated, progress, to]);

  return (
    <div ref={ref} className={cn("origin-[72%_48%] pinned:will-change-transform", className)}>
      {children}
    </div>
  );
}
