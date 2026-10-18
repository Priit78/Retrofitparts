import { jumpTo, remeasureScroller } from "./scroller";

/**
 * Keeps the reader's place when the page's layout changes under them: a window resize or a
 * rotation (the scroll story's tracks are in vh, so the page's length follows the viewport), or
 * a reduced-motion switch (chapters pin or unpin). Browsers keep the scroll offset, not the
 * place, so without this the reader would land in another section.
 *
 * The place is the block under the viewport's middle (a child of `main`, or the footer). While
 * it starts on screen, its top keeps the same share of the viewport's height; once the reader is
 * inside it, they stay the same share of the way through it (in a pinned chapter, the same
 * progress). The place is only restored when that block itself moved or changed size: when only
 * the viewport's height changes and the layout does not (a phone's address bar showing or
 * hiding), nothing happens.
 */

/** A block's box in document coordinates. */
export interface Box {
  top: number;
  height: number;
}

export interface Place {
  /** The block under the viewport's middle, by its index in the list of blocks. */
  index: number;
  /** Its box when the place was recorded. */
  box: Box;
  /**
   * Where the reader is: the block's top as a share of the viewport's height while it starts on
   * screen (`start`), or the share of the block scrolled past (`inside`).
   */
  at: { start: number } | { inside: number };
}

/** How far (px) a block must move or change size before the place is restored. */
export const MOVED = 4;

/** How long (ms) the place is held after a jump, while the page settles. */
const SETTLE_MS = 500;

/** The reader's place, from the blocks' boxes and the scroll position. Null without blocks. */
export function placeAt(boxes: readonly Box[], scrollY: number, viewportHeight: number): Place | null {
  const middle = scrollY + viewportHeight / 2;
  let index = -1;
  boxes.forEach((box, i) => {
    // The last block (with a size) that starts above the middle: the one the middle is in.
    if (box.height > 0 && box.top <= middle) index = i;
  });
  if (index === -1) return null;
  const box = boxes[index];
  const at =
    box.top >= scrollY || viewportHeight <= 0
      ? { start: viewportHeight > 0 ? (box.top - scrollY) / viewportHeight : 0 }
      : { inside: (scrollY - box.top) / box.height };
  return { index, box: { ...box }, at };
}

/** The scroll position that puts the reader at `place`, with its block's box now `box`. */
export function scrollFor(place: Place, box: Box, viewportHeight: number): number {
  return "start" in place.at ? box.top - place.at.start * viewportHeight : box.top + place.at.inside * box.height;
}

/**
 * The scroll position that puts the reader back at `place`, now that its block's box is `box`,
 * or null when the block has not moved or changed size (by more than MOVED px).
 */
export function restoredScroll(place: Place, box: Box, viewportHeight: number): number | null {
  const moved = Math.abs(box.top - place.box.top) > MOVED || Math.abs(box.height - place.box.height) > MOVED;
  return moved ? scrollFor(place, box, viewportHeight) : null;
}

/**
 * Starts keeping the place: records it on scroll (once per frame) and restores it after a resize
 * or a reduced-motion switch, through the page's scroller. Never during a touch, which a jump
 * would fight. Returns a function that stops it.
 */
export function keepPlace(): () => void {
  const blocks = () => [...document.querySelectorAll<HTMLElement>("main > *, body > footer")];
  const boxOf = (el: HTMLElement): Box => {
    const rect = el.getBoundingClientRect();
    // Fixed elements (the chapter index, the reading-progress line; their offsetParent is null)
    // are not part of the page: an empty box keeps them out without shifting the others' indexes.
    return { top: rect.top + window.scrollY, height: el.offsetParent === null ? 0 : rect.height };
  };
  const viewport = () => document.documentElement.clientHeight;

  let place: Place | null = null;
  let frame = 0;
  /** Set while the layout settles after a jump: the place is held, and nothing is recorded. */
  let holding: number | undefined;
  let touching = false;

  const record = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    place = placeAt(blocks().map(boxOf), window.scrollY, viewport());
  };
  const onScroll = () => {
    if (!frame && holding === undefined) frame = requestAnimationFrame(record);
  };
  /**
   * Jumps back to the recorded place if its block moved, or in any case while holding (an
   * earlier jump has already moved the page). Says whether it jumped.
   */
  const restore = () => {
    const block = place ? blocks()[place.index] : undefined;
    if (!place || !block) return false;
    const box = boxOf(block);
    const target = holding === undefined ? restoredScroll(place, box, viewport()) : scrollFor(place, box, viewport());
    if (target === null) return false;
    const end = document.documentElement.scrollHeight - viewport();
    // The scroller measures the page again first: Lenis only does so a moment after a resize.
    remeasureScroller();
    jumpTo(Math.min(end, Math.max(0, target)));
    return true;
  };
  const endHold = () => {
    holding = undefined;
    record();
  };
  const onLayoutChange = () => {
    if (touching || (!restore() && holding === undefined)) {
      // Nothing moved under the reader (or a finger is on the screen): just note where they are.
      record();
      return;
    }
    // The layout can keep changing for a moment: a media change reaches some of it only when
    // React renders again. Hold the place through those changes (the page's size changes call
    // `restore` again, before they are painted), then record from where the reader is.
    cancelAnimationFrame(frame);
    frame = 0;
    window.clearTimeout(holding);
    holding = window.setTimeout(endHold, SETTLE_MS);
  };
  const onResizeObserved = () => {
    if (holding !== undefined && !touching) restore();
  };
  const onTouch = (event: TouchEvent) => {
    touching = event.touches.length > 0;
  };

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(onResizeObserved);
  observer?.observe(document.body);
  record();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onLayoutChange);
  motion.addEventListener?.("change", onLayoutChange);
  for (const type of ["touchstart", "touchend", "touchcancel"] as const) {
    window.addEventListener(type, onTouch, { passive: true, capture: true });
  }

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(holding);
    observer?.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onLayoutChange);
    motion.removeEventListener?.("change", onLayoutChange);
    for (const type of ["touchstart", "touchend", "touchcancel"] as const) {
      window.removeEventListener(type, onTouch, { capture: true });
    }
  };
}
