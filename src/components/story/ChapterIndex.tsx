"use client";

import { motion, useScroll } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { mono } from "@/components/ui/styles";
import { story } from "@/content/story";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

const MOTION_OK = "(prefers-reduced-motion: no-preference)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(MOTION_OK);
  mql.addEventListener?.("change", onChange);
  return () => mql.removeEventListener?.("change", onChange);
}

/**
 * Whether the visitor allows motion, kept live. `false` on the server and during hydration, so
 * the index and the line never reach the static HTML: without JS or with reduced motion the
 * page has neither.
 */
function useMotionAllowed(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOTION_OK).matches,
    () => false,
  );
}

/** Index of the last chapter whose top is above the middle of the screen (0 above them all). */
function currentChapter(): number {
  const middle = window.innerHeight / 2;
  let current = 0;
  story.chapters.forEach((chapter, index) => {
    const el = document.getElementById(chapter.id);
    if (el && el.getBoundingClientRect().top < middle) current = index;
  });
  return current;
}

/** The chapter the visitor is reading, from scroll and resize events, once per frame. */
function useCurrentChapter(): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      // Same value, no render: React state changes only when the chapter does.
      setCurrent(currentChapter());
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return current;
}

/**
 * From 1440 px, where the container leaves a wide enough gutter: hairline ticks at the right
 * edge, one per chapter. The current one is longer and brighter, with its label above it; the
 * others show their labels on hover or focus. Labels sit above the ticks, not beside them, so
 * the index stays inside the gutter even for the longest one.
 */
function Index({ locale }: { locale: Locale }) {
  const current = useCurrentChapter();

  return (
    <nav
      aria-label={story.index.label[locale]}
      className="group/index fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 min-[1440px]:block"
    >
      <ol className="flex flex-col items-end">
        {story.chapters.map((chapter, index) => {
          const active = index === current;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={active ? "true" : undefined}
                className="group/tick flex flex-col items-end gap-1.5 rounded-[2px] py-1.5 pl-2"
              >
                <span
                  className={cn(
                    mono,
                    "text-[11px] leading-none transition-[opacity,color] duration-300",
                    active
                      ? "text-soft"
                      : "text-muted opacity-0 group-hover/index:opacity-100 group-focus-visible/tick:opacity-100",
                  )}
                >
                  {chapter.label[locale]}
                </span>
                {/* 28 px, drawn at half length (14 px) unless current. */}
                <span
                  aria-hidden
                  className={cn(
                    "block h-px w-7 origin-right transition-[transform,background-color] duration-500 ease-out-expo",
                    active ? "bg-fg" : "scale-x-50 bg-muted group-hover/tick:bg-soft",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Below 1440 px: a 1 px line under the header, as long as the share of the page read. */
function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      data-reading-progress=""
      className="pointer-events-none fixed inset-x-0 top-16 z-40 h-px origin-left bg-fg/70 lg:top-20 min-[1440px]:hidden"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/**
 * The landing page's chapter index (from 1440 px) and reading-progress line (below). Both are
 * decorative extras of the scroll story, so they only render once hydrated and when the visitor
 * allows motion; the header under them is `z-50`, they are `z-40`.
 */
export function ChapterIndex({ locale }: { locale: Locale }) {
  const motionAllowed = useMotionAllowed();
  if (!motionAllowed) return null;
  return (
    <>
      <Index locale={locale} />
      <ReadingProgress />
    </>
  );
}
