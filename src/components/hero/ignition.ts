/**
 * The bi-LED switch-on timeline, shared by the lens (motion keyframes) and the beam canvas
 * (sampled every frame), so the glow and the beam flicker in sync.
 *
 * Two quick flickers within the first ~400 ms, as the driver catches, then a 1.2 s bloom.
 */

/** Seconds between mount and the first flicker. */
export const IGNITION_DELAY = 0.25;

/** Keyframe times in seconds from the start of the ignition. */
const T = [0, 0.05, 0.11, 0.2, 0.27, 0.4, 1.6] as const;

/** Light output at each keyframe, 0 (off) to 1 (fully lit). */
export const IGNITION_LEVELS = [0, 0.85, 0.06, 1, 0.12, 0.22, 1] as const;

export const IGNITION_DURATION = T[T.length - 1];

/** Keyframe offsets (0–1) for motion's `times`. */
export const IGNITION_TIMES = T.map((t) => t / IGNITION_DURATION);

/** The bloom, matching the `ease-out-expo` theme token. */
export const BLOOM_EASE = [0.16, 1, 0.3, 1] as const;

/** Per-segment easing for motion: the flickers switch hard, the bloom eases out. */
export const IGNITION_EASE = T.slice(1).map((_, i) =>
  i === T.length - 2 ? BLOOM_EASE : ("linear" as const),
);

/** Evaluates a CSS cubic-bezier(x1, y1, x2, y2) at progress x (0–1). */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number, x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s ** 2 * (1 - s) + s ** 3;
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s ** 2 * (1 - s) + s ** 3;
  // Bisection on the monotonic x(s): robust and plenty fast for a few calls per frame.
  let lo = 0;
  let hi = 1;
  let s = x;
  for (let i = 0; i < 24; i++) {
    s = (lo + hi) / 2;
    if (bx(s) < x) lo = s;
    else hi = s;
  }
  return by(s);
}

/**
 * Light output at `t` seconds after the ignition starts (before the delay is applied):
 * 0 before it starts, 1 once the bloom has finished.
 */
export function ignitionLevel(t: number): number {
  if (t <= 0) return 0;
  if (t >= IGNITION_DURATION) return 1;
  let i = 0;
  while (t > T[i + 1]) i++;
  const span = T[i + 1] - T[i];
  const p = (t - T[i]) / span;
  const eased = i === T.length - 2 ? cubicBezier(...BLOOM_EASE, p) : p;
  return IGNITION_LEVELS[i] + (IGNITION_LEVELS[i + 1] - IGNITION_LEVELS[i]) * eased;
}
