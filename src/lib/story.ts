/**
 * Pure helpers for the landing scroll story. `p` is a chapter's scroll progress: 0 when its stage
 * reaches the top of the screen, 1 when its track ends (see components/story/ScrollChapter.tsx).
 * Every chapter state is a function of `p` alone, so jumping to an anchor and back always shows
 * the right beat or step.
 */

/**
 * Float noise is rounded away, so a value that is exactly representable stays exact: 0.7 − 0.3
 * is 0.39999999999999997, which would otherwise make segment(0.5, 0.3, 0.7) 0.5000000000000001.
 */
const PRECISION = 1e9;

/**
 * Step boundaries such as 1/3 are not representable, so segment × count can land just below a
 * whole number (0.999999999 for p = 1/3 of 3 steps). The floor in `activeIndex` adds this much
 * first, so a boundary always belongs to the step that starts there.
 */
const STEP_TOLERANCE = 1e-6;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Where `p` sits between `start` and `end`, from 0 to 1. Requires `end > start`. */
export function segment(p: number, start: number, end: number): number {
  return clamp01(Math.round(((p - start) / (end - start)) * PRECISION) / PRECISION);
}

/**
 * Opacity of a text beat that shows while `p` is inside `range`, crossfading over `fade` at each
 * end. A beat that starts at 0 or earlier is visible at load, and one that ends after 1 stays
 * visible at the end of the chapter.
 */
export function beatOpacity(p: number, range: readonly [number, number], fade = 0.05): number {
  const [start, end] = range;
  const fadeIn = start <= 0 ? 1 : segment(p, start, start + fade);
  const fadeOut = end > 1 ? 0 : segment(p, end - fade, end);
  return fadeIn * (1 - fadeOut);
}

/** Which of `count` equal steps between `start` and `end` is active, from 0 to `count − 1`. */
export function activeIndex(p: number, count: number, start = 0, end = 1): number {
  return Math.min(count - 1, Math.floor(segment(p, start, end) * count + STEP_TOLERANCE));
}

/**
 * How far a drawing layer moves out along the diagonal depth axis: deeper layers (higher
 * `layer`) go further right and up. `e` is the explode progress, from 0 (stacked) to 1.
 */
export function explodeOffset(
  layer: number,
  e: number,
  step = { x: 120, y: 64 },
): { x: number; y: number } {
  return { x: layer * step.x * e, y: -layer * step.y * e };
}
