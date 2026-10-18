import { activeIndex, explodeOffset, segment } from "@/lib/story";

/**
 * The fix chapter's timeline, shared by the drawing and the parts list: the headlight comes
 * apart between p 0.02 and 0.30, then the active part steps 01 → 04 until p 0.98.
 */
export const PART_COUNT = 4;

/** How far the drawing has come apart, from 0 (assembled) to 1. */
export function explodeAt(p: number): number {
  return segment(p, 0.02, 0.3);
}

/** The active part, or −1 while the drawing is still coming apart. */
export function activePartAt(p: number): number {
  return explodeAt(p) > 0.9 ? activeIndex(p, PART_COUNT, 0.3, 0.98) : -1;
}

/** Each layer's offset when fully apart: the static drawing. */
export const EXPLODED = Array.from({ length: PART_COUNT }, (_, layer) => explodeOffset(layer, 1));

export interface Offset {
  x: number;
  y: number;
}

/**
 * The whole drawing's offset for a set of layer offsets: minus their mean, so the headlight stays
 * centred while it comes apart (the front layer moves towards the viewer, the back one away).
 */
export function assemblyOffset(offsets: readonly Offset[]): Offset {
  if (offsets.length === 0) return { x: 0, y: 0 };
  const sum = offsets.reduce((a, b) => ({ x: a.x + b.x, y: a.y + b.y }), { x: 0, y: 0 });
  // `+ 0` turns −0 into 0.
  return { x: -sum.x / offsets.length + 0, y: -sum.y / offsets.length + 0 };
}

/**
 * The assembled drawing is shown this much larger and settles to its own size as it comes apart,
 * like a camera pulling back. The `pinned:` pre-hydration class in ExplodedHeadlight repeats it.
 */
export const ASSEMBLED_SCALE = 1.25;

/** The whole drawing's CSS transform at explode `e`, for the layers' `offsets`. */
export function assemblyTransform(offsets: readonly Offset[], e: number): string {
  const { x, y } = assemblyOffset(offsets);
  const scale = 1 + (ASSEMBLED_SCALE - 1) * (1 - e);
  return `translate(${x}px, ${y}px) scale(${scale})`;
}

/** How visible the depth edges are: hidden while assembled (a clean front view), drawn in as it comes apart. */
export function depthAt(e: number): number {
  return segment(e, 0.35, 0.85);
}
