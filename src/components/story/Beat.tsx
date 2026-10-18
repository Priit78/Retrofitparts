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
 * The inline `pointer-events` overrides any `pointer-events-*` class on the Beat itself; put such
 * a class on a child instead.
 *
 * When keyboard focus lands inside a faded beat, the chapter scrolls to where the beat is fully
 * visible, so the focus ring is never invisible.
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
  const { progress, animated, seek } = useChapter();
  const ref = useRef<HTMLDivElement & HTMLParagraphElement>(null);
  const [start, end] = range;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!animated || !el) return;

    const apply = (p: number) => {
      const opacity = beatOpacity(p, [start, end], fade);
      // The direction follows the active fade: a beat comes up from below while it fades in
      // (or before its range), and moves on up while it fades out (or after its range). A beat
      // that stays to the end (end > 1) never leaves.
      const leaving = end <= 1 && p >= end - fade;
      const y = (leaving ? -1 : 1) * (1 - opacity) * lift;
      el.style.opacity = String(opacity);
      el.style.transform = y === 0 ? "none" : `translateY(${y}px)`;
      // A mostly faded beat lets clicks through to the visible one under it. `auto` is set
      // inline so it also overrides the pinned pre-hydration CSS on `data-pinned-hidden`.
      el.style.pointerEvents = opacity < 0.5 ? "none" : "auto";
    };

    // Keyboard focus inside a faded beat would be invisible: scroll to where the beat is fully
    // visible, the middle of that span (or its start for a first beat, its fade-in end for a
    // beat that stays to the end).
    const onFocusIn = () => {
      if (beatOpacity(progress.get(), [start, end], fade) >= 0.5) return;
      seek(start <= 0 ? 0 : end > 1 ? start + fade : (start + end) / 2);
    };

    apply(progress.get());
    const unsubscribe = progress.on("change", apply);
    el.addEventListener("focusin", onFocusIn);
    return () => {
      unsubscribe();
      el.removeEventListener("focusin", onFocusIn);
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("pointer-events");
    };
  }, [animated, progress, seek, start, end, fade, lift]);

  return (
    <Tag ref={ref} className={className} data-pinned-hidden={initiallyHidden ? "" : undefined}>
      {children}
    </Tag>
  );
}
