"use client";

import { motionValue, useMotionValue, useScroll, type MotionValue } from "motion/react";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useHydratedMediaQuery } from "@/components/ui/useHydratedMediaQuery";
import { cn } from "@/lib/cn";
import { jumpTo } from "@/lib/scroller";
import { PINNED_LG_QUERY, PINNED_QUERY } from "./pinned";

export interface ChapterState {
  /** The chapter's scroll progress: 0 when its stage reaches the top, 1 when its track ends. */
  progress: MotionValue<number>;
  /**
   * Whether the chapter is pinned, so leaves may set motion styles: the pinned condition
   * (pinned.ts, the same as the CSS) matches, live. `false` on the server and during hydration,
   * so the server HTML never carries a p = 0 style that would hide content without JS. Until it
   * turns true, `data-pinned-hidden` and `pinned:` classes (globals.css) give a pinned stage its
   * p = 0 look.
   */
  animated: boolean;
  /**
   * Scrolls the window, instantly, to the point of the track where the progress is `p` (through
   * Lenis when it runs, so its smooth scroll cannot carry the page on past it). Does nothing when
   * the chapter does not animate.
   */
  seek: (p: number) => void;
}

/** Outside a chapter, leaves render their static layout. */
const ChapterContext = createContext<ChapterState>({
  progress: motionValue(0),
  animated: false,
  seek: () => {},
});

export function useChapter(): ChapterState {
  return use(ChapterContext);
}

/**
 * A chapter of the landing scroll story: a tall track whose stage, one screen high, sticks to the
 * top while the track scrolls past (`.chapter` and `.chapter-stage` in globals.css). It only pins
 * when JS has run, the visitor allows motion and the viewport is tall enough (pinned.ts);
 * otherwise it is a plain section and every beat reads in order.
 */
export function ScrollChapter({
  id,
  labelledBy,
  label,
  length,
  pinFrom = "base",
  className,
  stageClassName,
  children,
}: {
  id: string;
  /** Id of the chapter's heading, for `aria-labelledby`. */
  labelledBy?: string;
  /** Accessible name, for a chapter without a visible heading. */
  label?: string;
  /** Track height in vh: `base` below 768 px, `md` from 768 px. */
  length: { base: number; md: number };
  /** `"lg"` pins only from 1024 px; below that the chapter is a plain section. */
  pinFrom?: "base" | "lg";
  className?: string;
  stageClassName?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const animated = useHydratedMediaQuery(pinFrom === "lg" ? PINNED_LG_QUERY : PINNED_QUERY);

  const seek = useCallback(
    (p: number) => {
      const section = ref.current;
      if (!animated || !section) return;
      // The section's top in the document (as offsetTop, but independent of positioned ancestors).
      const top = section.getBoundingClientRect().top + window.scrollY;
      // The viewport height as motion's useScroll measures the progress: without a scrollbar.
      const viewport = document.documentElement.clientHeight;
      jumpTo(top + p * (section.offsetHeight - viewport));
    },
    [animated],
  );

  const state = useMemo(
    () => ({ progress: scrollYProgress, animated, seek }),
    [scrollYProgress, animated, seek],
  );

  const style = {
    "--chapter-len": `${length.base}vh`,
    "--chapter-len-md": `${length.md}vh`,
  } as CSSProperties;

  return (
    <ChapterContext value={state}>
      <section
        ref={ref}
        id={id}
        aria-labelledby={labelledBy}
        aria-label={label}
        data-pin-from={pinFrom}
        // For the pre-hydration CSS on hidden beats (globals.css); never in the server HTML.
        data-animated={animated ? "" : undefined}
        className={cn("chapter", className)}
        style={style}
      >
        <div className={cn("chapter-stage", stageClassName)}>{children}</div>
      </section>
    </ChapterContext>
  );
}

const noSeek = () => {};

/** Test helper: gives its leaves a fixed chapter progress, and an optional `seek` spy. */
export function ChapterProgressProvider({
  progress,
  animated = true,
  seek = noSeek,
  children,
}: {
  progress: number;
  animated?: boolean;
  seek?: (p: number) => void;
  children: ReactNode;
}) {
  const value = useMotionValue(progress);
  useEffect(() => {
    value.set(progress);
  }, [value, progress]);
  const state = useMemo(() => ({ progress: value, animated, seek }), [value, animated, seek]);
  return <ChapterContext value={state}>{children}</ChapterContext>;
}
