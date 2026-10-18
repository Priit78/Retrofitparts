/**
 * When a scroll-story chapter pins: the visitor allows motion and the viewport is tall enough for
 * a one-screen stage. A `pinFrom="lg"` chapter also needs the lg width. JS must have run too:
 * CSS checks `html.js`, and ScrollChapter only animates after hydration.
 *
 * ScrollChapter's `animated` flag matches these queries; the `pinned` and `pinned-lg` variants in
 * globals.css must use exactly the same conditions (src/app/globals.test.ts checks it).
 */
export const PINNED_QUERY = "(prefers-reduced-motion: no-preference) and (min-height: 32rem)";

export const PINNED_LG_QUERY = `${PINNED_QUERY} and (min-width: 64rem)`;

/**
 * A viewport too short to pin (just under PINNED_QUERY's 32rem), where every chapter shows its
 * static layout: for `sizes` lists that must follow it.
 */
export const TOO_SHORT_TO_PIN = "(max-height: 31.99rem)";
