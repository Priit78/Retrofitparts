"use client";

import { motionValue, useMotionValue, useScroll, type MotionValue } from "motion/react";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

export interface ChapterState {
  /** The chapter's scroll progress: 0 when its stage reaches the top, 1 when its track ends. */
  progress: MotionValue<number>;
  /**
   * Whether leaves may set motion styles. `false` under reduced motion, and also on the server
   * and during hydration, so the server HTML never carries a p = 0 style that would hide content
   * without JS. Until it turns true, `data-pinned-hidden` and `pinned:` classes (globals.css)
   * give a pinned stage its p = 0 look.
   */
  animated: boolean;
}

/** Outside a chapter, leaves render their static layout. */
const ChapterContext = createContext<ChapterState>({ progress: motionValue(0), animated: false });

export function useChapter(): ChapterState {
  return use(ChapterContext);
}

const subscribeToNothing = () => () => {};

/** `false` on the server and during hydration, then `true`. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
}

/**
 * A chapter of the landing scroll story: a tall track whose stage, one screen high, sticks to the
 * top while the track scrolls past (`.chapter` and `.chapter-stage` in globals.css). It only pins
 * when JS has run and the visitor allows motion; otherwise it is a plain section and every beat
 * reads in order.
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
  const reducedMotion = usePrefersReducedMotion();
  const animated = useHydrated() && !reducedMotion;
  const state = useMemo(() => ({ progress: scrollYProgress, animated }), [scrollYProgress, animated]);

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
        className={cn("chapter", className)}
        style={style}
      >
        <div className={cn("chapter-stage", stageClassName)}>{children}</div>
      </section>
    </ChapterContext>
  );
}

/** Test helper: gives its leaves a fixed chapter progress. */
export function ChapterProgressProvider({
  progress,
  animated = true,
  children,
}: {
  progress: number;
  animated?: boolean;
  children: ReactNode;
}) {
  const value = useMotionValue(progress);
  useEffect(() => {
    value.set(progress);
  }, [value, progress]);
  const state = useMemo(() => ({ progress: value, animated }), [value, animated]);
  return <ChapterContext value={state}>{children}</ChapterContext>;
}
