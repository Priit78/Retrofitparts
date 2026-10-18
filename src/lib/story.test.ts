import { describe, expect, it } from "vitest";
import { activeIndex, beatOpacity, explodeOffset, segment } from "./story";

describe("segment", () => {
  it("maps p linearly between start and end, clamped to 0–1", () => {
    expect(segment(0.5, 0.3, 0.7)).toBe(0.5);
    expect(segment(-1, 0, 1)).toBe(0);
    expect(segment(2, 0, 1)).toBe(1);
  });
});

describe("beatOpacity", () => {
  it("shows a beat only inside its range", () => {
    expect(beatOpacity(0, [0, 0.33])).toBe(1); // first beat visible at load
    expect(beatOpacity(0.2, [0.33, 0.66])).toBe(0);
    expect(beatOpacity(0.5, [0.33, 0.66])).toBe(1);
    expect(beatOpacity(1, [0.66, 1.01])).toBe(1); // last beat stays
  });
});

describe("activeIndex", () => {
  it("steps through count items and never leaves the range", () => {
    expect(activeIndex(0, 4)).toBe(0);
    expect(activeIndex(0.999, 4)).toBe(3);
    expect(activeIndex(1, 4)).toBe(3); // never out of range
    expect(activeIndex(0.3, 4, 0.3, 0.98)).toBe(0);
  });
});

describe("explodeOffset", () => {
  it("moves each layer along the diagonal depth axis", () => {
    expect(explodeOffset(3, 1)).toEqual({ x: 360, y: -192 });
    expect(explodeOffset(2, 0)).toEqual({ x: 0, y: -0 });
  });
});
