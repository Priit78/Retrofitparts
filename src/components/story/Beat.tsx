"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { beatOpacity } from "@/lib/story";
import { useChapter } from "./ScrollChapter";

/**
 * A text beat inside a ScrollChapter stage. It shows while the chapter's progress is inside
 * `range`, rising in from below and leaving upwards. Give every beat after the first
 * `initiallyHidden`, so a pinned stage shows only the first one before hydration. When the
 * chapter does not animate, the beat is plain, visible content.
 *
 * The beat writes its own styles from the progress value (opacity, transform, and
 * `pointer-events: none` while it is less than half visible, so a faded beat never blocks the
 * one under it; its text stays in the DOM for screen readers), and removes them when the chapter
 * stops animating. (motion keeps styles it has bound even after they leave `style`, so a beat
 * would stay hidden if reduced motion were switched on mid-visit.) Nothing is set on the server.
 */
export function Beat({
  range,
  fade = 0.05,
  lift = 14,
  initiallyHidden = false,
  as: Tag = "div",
  className,
  children,
}: {
  range: readonly [number, number];
  /** Share of the progress each crossfade takes. */
  fade?: number;
  /** Pixels of vertical travel while fading. */
  lift?: number;
  initiallyHidden?: boolean;
  as?: "div" | "p";
  className?: string;
  children: ReactNode;
}) {
  const { progress, animated } = useChapter();
  const ref = useRef<HTMLDivElement & HTMLParagraphElement>(null);
  const [start, end] = range;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!animated || !el) return;

    const apply = (p: number) => {
      const opacity = beatOpacity(p, [start, end], fade);
      // Below the range midpoint the beat is still arriving, so it sits lower; after, higher.
      const y = (p < (start + end) / 2 ? 1 : -1) * (1 - opacity) * lift;
      el.style.opacity = String(opacity);
      el.style.transform = y === 0 ? "none" : `translateY(${y}px)`;
      // A mostly faded beat lets clicks through to the visible one under it. `auto` is set
      // inline so it also overrides the pinned pre-hydration CSS on `data-pinned-hidden`.
      el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
    };

    apply(progress.get());
    const unsubscribe = progress.on("change", apply);
    return () => {
      unsubscribe();
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("pointer-events");
    };
  }, [animated, progress, start, end, fade, lift]);

  return (
    <Tag ref={ref} className={className} data-pinned-hidden={initiallyHidden ? "" : undefined}>
      {children}
    </Tag>
  );
}
