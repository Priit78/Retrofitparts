"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { segment } from "@/lib/story";
import { useChapter } from "./ScrollChapter";

/** The span of the chapter's progress over which the strip travels; it holds still around it. */
const START = 0.1;
const END = 0.92;

/** Pixels a focused tile keeps from the screen's edges, so its focus ring is never cut off. */
const RING_ROOM = 8;

/**
 * The width the strip shows its tiles in: the layout viewport, without a classic scrollbar.
 * `innerWidth` where nothing is laid out (jsdom).
 */
function viewportWidth(): number {
  return document.documentElement.clientWidth || window.innerWidth;
}

/** Pixels, to two decimals; −0 prints as 0. */
function px(value: number): string {
  return `${Math.round(value * 100) / 100 || 0}px`;
}

/** A computed length in px, 0 when there is none (jsdom). */
function lengthOf(value: string): number {
  return Number.parseFloat(value) || 0;
}

/**
 * The track's full width, padding included. A row that is not a scroll container (the pinned
 * track) leaves its end padding out of `scrollWidth` in Chrome, so the end is also measured from
 * the last tile.
 */
function widthOf(track: HTMLElement): number {
  const last = track.lastElementChild;
  if (!last) return track.scrollWidth;
  const end =
    last.getBoundingClientRect().right -
    track.getBoundingClientRect().left +
    lengthOf(getComputedStyle(track).paddingRight);
  return Math.max(track.scrollWidth, end);
}

/**
 * The catalog chapter's row of tiles. Its children are the tiles, as `li` elements. Pinned, each
 * tile spans the track's three rows as a subgrid
 * (`pinned-lg:row-span-3 pinned-lg:grid pinned-lg:grid-rows-subgrid`): photo, title and count,
 * sub-links.
 *
 * - Static (no JS, reduced motion, below 1024 px or a short viewport): a native swipe row that
 *   scrolls sideways with snap points; give each tile `snap-start`. A tile that takes keyboard
 *   focus while not fully in the row scrolls to its own snap point.
 * - Pinned (`pinned-lg`, where the chapter animates): vertical scroll moves the track sideways,
 *   by `−travel · segment(p, 0.10, 0.92)`. The travel is the track's full width, padding
 *   included, past the viewport, so the last tile ends in view at p 0.92, and it is never
 *   negative. It is measured again when the track or a tile changes size (ResizeObserver) and
 *   when the window is resized.
 *
 * The strip is full-bleed: the track's untranslated left edge is at viewport x = 0, and its
 * padding lines the tiles up with the page container. The travel and the keyboard maths rely on
 * that; inside an inset box they would be off by the inset.
 *
 * The outer box clips the track sideways (`overflow-x: clip`, which is not a scroll container),
 * so a focused tile can never scroll the stage instead. When keyboard focus lands on a tile
 * that is off-screen, or within 8 px of the screen's edge where its focus ring would be cut off,
 * the chapter scrolls to the progress that brings the tile into view
 * (`seek`), by the inverse of the travel mapping. That check runs on the next frame, after the
 * browser's own focus scroll (which can move the strip). Focus that comes with a pointer press
 * is left alone in both modes: the pressed tile shows at least in part, and the strip must not
 * move under the pointer.
 *
 * The transform is written from the progress value (no React state per frame), and removed when
 * the chapter stops animating. Nothing is set on the server.
 */
export function CatalogStrip({ className, children }: { className?: string; children: ReactNode }) {
  const { progress, animated, seek } = useChapter();
  const trackRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Focus that follows a press comes from a pointer; keyboard focus comes on its own.
    let pressed = false;
    let pressTimer: number | undefined;
    const onPress = () => {
      pressed = true;
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(() => {
        pressed = false;
      });
    };

    /** The tile (a child of the track) that holds `target`. */
    const tileOf = (target: EventTarget | null) =>
      target instanceof Element ? [...track.children].find((child) => child.contains(target)) : undefined;

    if (!animated) {
      // The swipe row. The browser scrolls a focused link into view itself, but mandatory
      // snapping then pulls the row back to the previous snap point, leaving the link partly
      // hidden: bring a tile that is not fully in the row to its own snap point first.
      const onFocusIn = (event: FocusEvent) => {
        const tile = pressed ? undefined : tileOf(event.target);
        if (!tile) return;
        const row = track.getBoundingClientRect();
        const box = tile.getBoundingClientRect();
        if (box.left >= row.left && box.right <= row.right) return;
        tile.scrollIntoView({ inline: "start", block: "nearest" });
      };
      track.addEventListener("mousedown", onPress);
      track.addEventListener("focusin", onFocusIn);
      return () => {
        track.removeEventListener("mousedown", onPress);
        track.removeEventListener("focusin", onFocusIn);
        window.clearTimeout(pressTimer);
      };
    }

    let travel = 0;
    /** The translation last written. */
    let shift = 0;
    const shiftAt = (p: number) => -travel * segment(p, START, END);
    const apply = (p: number) => {
      shift = shiftAt(p);
      track.style.transform = `translateX(${px(shift)})`;
    };
    const measure = () => {
      travel = Math.max(0, widthOf(track) - viewportWidth());
      apply(progress.get());
    };

    /**
     * Where the strip sits for the window's scroll right now, from the chapter's own box: the
     * progress value can lag a frame behind a scroll. The written translation outside a chapter.
     */
    const shiftNow = () => {
      const chapter = track.closest<HTMLElement>(".chapter");
      const length = chapter ? chapter.offsetHeight - document.documentElement.clientHeight : 0;
      if (!chapter || length <= 0) return shift;
      return shiftAt(Math.min(1, Math.max(0, -chapter.getBoundingClientRect().top / length)));
    };

    /** Seeks to the progress that shows `tile` whole, with room for its focus ring. */
    const reveal = (tile: Element) => {
      const width = viewportWidth();
      const box = tile.getBoundingClientRect();
      const left = box.left - shift + shiftNow();
      // In view with room for the focus ring (2 px, 4 px out) on both sides.
      if (left >= RING_ROOM && left + box.width <= width - RING_ROOM) return;

      // Where the tile sits in the track, whatever the current translation.
      const start = box.left - track.getBoundingClientRect().left;
      const end = start + box.width;
      const style = getComputedStyle(track);
      // The nearest translation that shows the whole tile, with the track's padding beside it.
      const x =
        left < RING_ROOM ? -(start - lengthOf(style.paddingLeft)) : width - end - lengthOf(style.paddingRight);
      const share = Math.min(1, Math.max(0, -x / travel));
      seek(START + share * (END - START));
    };

    // The browser scrolls a focused element into view itself, after this event, and that scroll
    // can move the strip: check the tile on the next frame, once it has.
    let frame = 0;
    const onFocusIn = (event: FocusEvent) => {
      const tile = pressed || travel <= 0 ? undefined : tileOf(event.target);
      if (!tile) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => reveal(tile));
    };

    measure();
    const unsubscribe = progress.on("change", apply);
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(track);
    for (const child of track.children) observer?.observe(child);
    track.addEventListener("mousedown", onPress);
    track.addEventListener("focusin", onFocusIn);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", measure);
      observer?.disconnect();
      track.removeEventListener("mousedown", onPress);
      track.removeEventListener("focusin", onFocusIn);
      window.clearTimeout(pressTimer);
      cancelAnimationFrame(frame);
      track.style.removeProperty("transform");
    };
  }, [animated, progress, seek]);

  return (
    // Pinned, the strip takes what height the stage has left (min-h-0 lets it shrink).
    <div className={cn("pinned-lg:min-h-0 pinned-lg:overflow-x-clip", className)}>
      {/* role="list": Safari drops list semantics from a `list-style: none` list. */}
      <ul
        ref={trackRef}
        role="list"
        className={cn(
          // One column per tile: most of a phone screen (the next tile peeks in), and 30 vw, at
          // most 420 px, on desktop.
          "grid grid-flow-col auto-cols-[min(78vw,400px)] gap-x-4 lg:auto-cols-[min(30vw,420px)]",
          // Static: a swipe row. Its padding lines the first tile up with the page container
          // (Container: 1280 px wide, 16 px gutters, 24 px from md); scroll-padding makes the
          // snap points do the same. The vertical padding keeps focus rings inside the row.
          "snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain px-4 pt-2 pb-5",
          "md:scroll-px-[max(24px,calc((100%_-_1280px)/2_+_24px))] md:gap-x-5 md:px-[max(24px,calc((100%_-_1280px)/2_+_24px))]",
          // Pinned: the track fills the strip and moves by transform. Its three rows (photo;
          // title and count; sub-links) are shared by every tile, so all photos are one height.
          // The photo row is 4:5 at most, and gives up height first when the screen is short, so
          // the stage always fits.
          "pinned-lg:h-full pinned-lg:grid-rows-[minmax(0,calc(min(30vw,420px)*1.25))_auto_auto] pinned-lg:content-start",
          "pinned-lg:snap-none pinned-lg:overflow-visible pinned-lg:pb-2 pinned-lg:will-change-transform",
        )}
      >
        {children}
      </ul>
    </div>
  );
}
