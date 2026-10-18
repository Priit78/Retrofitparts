/**
 * The page's smooth scroller, when one runs. SmoothScroll registers its Lenis instance here, so
 * code that must move the page at once (a scroll-story chapter's `seek`) goes through Lenis: a
 * native `window.scrollTo` would be overridden by a Lenis animation still under way, such as the
 * second or so after a wheel flick.
 */

/** The parts of a Lenis instance that `jumpTo` and `remeasureScroller` use. */
export interface Scroller {
  scrollTo(target: number, options: { immediate: boolean; force: boolean }): void;
  /** Measures the page and the viewport again (Lenis clamps its jumps to what it measured). */
  resize?(): void;
}

let current: Scroller | null = null;

/** Makes `scroller` the page's scroller. The returned function unregisters it again. */
export function registerScroller(scroller: Scroller): () => void {
  current = scroller;
  return () => {
    if (current === scroller) current = null;
  };
}

/**
 * Scrolls the window to `top` at once. Through the registered scroller, which also stops its
 * own animation (`force`: even while it is stopped); natively when none is registered (reduced
 * motion, or before SmoothScroll has run).
 */
export function jumpTo(top: number): void {
  if (current) current.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "instant" });
}

/**
 * Has the registered scroller measure the page again, before a jump right after a layout change:
 * Lenis re-measures only a moment after a resize, and would clamp the jump to the old length.
 */
export function remeasureScroller(): void {
  current?.resize?.();
}
