import { describe, expect, it } from "vitest";
import {
  IGNITION_DURATION,
  IGNITION_EASE,
  IGNITION_LEVELS,
  IGNITION_TIMES,
  cubicBezier,
  ignitionLevel,
} from "./ignition";

describe("ignition timeline", () => {
  it("starts dark and ends fully lit", () => {
    expect(ignitionLevel(-1)).toBe(0);
    expect(ignitionLevel(0)).toBe(0);
    expect(ignitionLevel(IGNITION_DURATION)).toBe(1);
    expect(ignitionLevel(IGNITION_DURATION + 5)).toBe(1);
  });

  it("flickers twice within the first 400 ms, then blooms for about 1.2 s", () => {
    // Sample every 5 ms and count the peaks above 80 % before 0.4 s.
    const samples = Array.from({ length: 81 }, (_, i) => ignitionLevel(i * 0.005));
    let peaks = 0;
    for (let i = 1; i < samples.length - 1; i++) {
      if (samples[i] > 0.8 && samples[i] >= samples[i - 1] && samples[i] > samples[i + 1]) peaks++;
    }
    expect(peaks).toBe(2);
    expect(ignitionLevel(0.4)).toBeLessThan(0.3);
    expect(IGNITION_DURATION - 0.4).toBeCloseTo(1.2);
  });

  it("brightens steadily during the bloom", () => {
    let prev = ignitionLevel(0.4);
    for (let t = 0.45; t <= IGNITION_DURATION; t += 0.05) {
      const level = ignitionLevel(t);
      expect(level).toBeGreaterThanOrEqual(prev);
      prev = level;
    }
  });

  it("gives motion matching keyframes, offsets and easings", () => {
    expect(IGNITION_TIMES).toHaveLength(IGNITION_LEVELS.length);
    expect(IGNITION_TIMES[0]).toBe(0);
    expect(IGNITION_TIMES[IGNITION_TIMES.length - 1]).toBe(1);
    expect(IGNITION_EASE).toHaveLength(IGNITION_LEVELS.length - 1);
  });

  it("evaluates cubic-bezier easing", () => {
    expect(cubicBezier(0, 0, 1, 1, 0.5)).toBeCloseTo(0.5, 3);
    expect(cubicBezier(0.16, 1, 0.3, 1, 0.5)).toBeGreaterThan(0.9);
    expect(cubicBezier(0.16, 1, 0.3, 1, 0)).toBe(0);
    expect(cubicBezier(0.16, 1, 0.3, 1, 1)).toBe(1);
  });
});
