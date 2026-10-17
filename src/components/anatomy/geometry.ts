/*
 * Geometry for the exploded headlight drawing.
 *
 * Every part is drawn flat in "face" coordinates (the headlight seen straight on, x right,
 * y down) and projected into a three-quarter view with one affine matrix: the light is
 * turned toward the viewer's right and seen slightly from above. Depth runs along the
 * optical axis (positive = towards the viewer) and shows up on screen as a shift along N,
 * which is the diagonal the parts separate on.
 */

export const FACE_W = 520;
export const FACE_H = 220;

/** Face → screen linear part. */
export const M = { a: 0.819, b: -0.287, c: 0, d: 0.866 } as const;
/** Screen shift per unit of depth (towards the viewer). */
export const N = { x: 0.574, y: 0.41 } as const;

export type Pt = [number, number];

export const round = (n: number) => Math.round(n * 100) / 100;

/** SVG transform that places a face-space shape at the given depth. */
export function placeAt(depth: number, extra: Pt = [0, 0]): string {
  const dx = round(N.x * depth + extra[0]);
  const dy = round(N.y * depth + extra[1]);
  return `translate(${dx} ${dy}) matrix(${M.a} ${M.b} ${M.c} ${M.d} 0 0)`;
}

/** Screen position of a face point at a depth. */
export function project(fx: number, fy: number, depth = 0): Pt {
  return [M.a * fx + M.c * fy + N.x * depth, M.b * fx + M.d * fy + N.y * depth];
}

export function depthShift(depth: number): Pt {
  return [N.x * depth, N.y * depth];
}

/** The headlight's outer outline, shared by housing rim, shroud and outer lens. */
export const OUTLINE =
  "M34 50C150 12 360 6 488 40C512 47 524 66 520 90L504 150C499 172 482 184 460 186L96 212C56 214 24 196 18 160L12 96C10 72 18 56 34 50Z";

/** A slightly smaller outline for the shroud plate. */
export const SHROUD_OUTLINE =
  "M44 60C152 26 358 20 478 50C498 56 507 71 504 90L490 146C486 163 472 172 456 174L100 198C68 200 42 186 36 158L30 100C28 80 34 66 44 60Z";

export const PROJECTOR = { cx: 150, cy: 120, lens: 52, ring: 60, barrel: 46, sink: 52 } as const;
export const REFLECTOR = { cx: 368, cy: 114, r: 48 } as const;

export function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
}

export function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  return `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${
    x + w - r
  } ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
}

/** Linear interpolation between two #rrggbb colours. */
export function mix(from: string, to: string, t: number): string {
  const a = parseInt(from.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const channel = (shift: number) => {
    const x = (a >> shift) & 255;
    const y = (b >> shift) & 255;
    return Math.round(x + (y - x) * t);
  };
  const value = (channel(16) << 16) | (channel(8) << 8) | channel(0);
  return `#${value.toString(16).padStart(6, "0")}`;
}

/** Depths from `from` (back) to `to` (front) in `step`s, inclusive. */
export function depths(from: number, to: number, step: number): number[] {
  const list: number[] = [];
  for (let d = from; d < to; d += step) list.push(d);
  list.push(to);
  return list;
}

/* ------------------------------------------------------------ layer layout */

export type LayerId = "lens" | "shroud" | "projector" | "housing";

/** Depth of each part when assembled and when exploded (housing stays put). */
export const LAYER_DEPTH: Record<LayerId, { assembled: number; exploded: number }> = {
  housing: { assembled: 0, exploded: 0 },
  projector: { assembled: -6, exploded: 165 },
  shroud: { assembled: -2, exploded: 320 },
  lens: { assembled: 4, exploded: 470 },
};

/** Stage (viewBox) size and the placement of the whole drawing in both states. */
export const VIEW = { w: 1000, h: 820 } as const;

/** Bounding box of the drawing for the given depth range (housing back to lens front). */
function bounds(back: number, front: number) {
  const corners: Pt[] = [];
  for (const depth of [back, front]) {
    for (const [fx, fy] of [
      [0, 0],
      [FACE_W, 0],
      [0, FACE_H],
      [FACE_W, FACE_H],
    ] as Pt[]) {
      corners.push(project(fx, fy, depth));
    }
  }
  const xs = corners.map(([x]) => x);
  const ys = corners.map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

export const HOUSING_BACK = -130;

function fit(back: number, front: number, scale: number, nudge: Pt) {
  const b = bounds(back, front);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  return {
    scale,
    x: round(VIEW.w / 2 - cx * scale + nudge[0]),
    y: round(VIEW.h / 2 - cy * scale + nudge[1]),
  };
}

/** Whole-drawing transform: bigger and centred when assembled, smaller when exploded. */
export const CLUSTER = {
  assembled: fit(HOUSING_BACK, LAYER_DEPTH.lens.assembled, 1.5, [0, 0]),
  exploded: fit(HOUSING_BACK, LAYER_DEPTH.lens.exploded, 1.08, [-24, 4]),
};
