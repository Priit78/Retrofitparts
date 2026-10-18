import { describe, expect, it } from "vitest";
import { MOVED, placeAt, restoredScroll, scrollFor } from "./keep-place";

/** A page: a hero, a 2700 px chapter (300vh at 900 px), a 950 px section, a hidden block, a footer. */
const page = [
  { top: 0, height: 1000 },
  { top: 1000, height: 2700 },
  { top: 3700, height: 950 },
  { top: 3800, height: 0 },
  { top: 4650, height: 400 },
];

describe("placeAt", () => {
  it("takes the block under the viewport's middle", () => {
    expect(placeAt(page, 3500, 900)?.index).toBe(2);
    expect(placeAt(page, 3000, 900)?.index).toBe(1);
    expect(placeAt(page, 4500, 900)?.index).toBe(4);
  });

  it("skips blocks without a size", () => {
    // The middle (3850) is past the hidden block's top, but inside the section.
    expect(placeAt(page, 3400, 900)?.index).toBe(2);
  });

  it("records a block that starts on screen by its top's share of the viewport", () => {
    expect(placeAt(page, 3600, 900)).toEqual({ index: 2, box: { top: 3700, height: 950 }, at: { start: 100 / 900 } });
  });

  it("records a block the reader is inside by the share of it scrolled past", () => {
    // Halfway through the chapter's travel: 900 px of its 2700.
    expect(placeAt(page, 1900, 900)).toEqual({ index: 1, box: { top: 1000, height: 2700 }, at: { inside: 1 / 3 } });
  });

  it("keeps the top of the page at the top", () => {
    expect(placeAt(page, 0, 900)?.at).toEqual({ start: 0 });
  });

  it("has no place without blocks", () => {
    expect(placeAt([], 0, 900)).toBeNull();
  });
});

describe("restoredScroll", () => {
  it("does nothing while the block keeps its place and size (an address bar showing)", () => {
    const place = placeAt(page, 3600, 900)!;
    expect(restoredScroll(place, { top: 3700 + MOVED, height: 950 - MOVED }, 800)).toBeNull();
  });

  it("keeps a block that started on screen at the same share of the new viewport", () => {
    const place = placeAt(page, 3600, 900)!;
    // The chapter above shrank with the viewport: the section now starts at 3400.
    const y = restoredScroll(place, { top: 3400, height: 950 }, 800)!;
    expect(3400 - y).toBeCloseTo((100 / 900) * 800, 6);
  });

  it("keeps a pinned chapter's progress when its vh track follows the viewport", () => {
    const place = placeAt(page, 1900, 900)!;
    // At 800 px the 300vh chapter starts at 889 (the 1000 px hero is 111vh) and is 2400 px long.
    const top = (1000 / 900) * 800;
    const y = restoredScroll(place, { top, height: 2400 }, 800)!;
    expect((y - top) / (2400 - 800)).toBeCloseTo(0.5, 6);
  });

  it("keeps the share of a static block the reader is in when its text reflows", () => {
    const place = placeAt(page, 3900, 900)!;
    expect(place.at).toEqual({ inside: 200 / 950 });
    expect(restoredScroll(place, { top: 3000, height: 1900 }, 900)).toBeCloseTo(3000 + 400, 6);
  });
});

describe("scrollFor", () => {
  it("puts the reader at the place even when its block has not moved", () => {
    const place = placeAt(page, 1900, 900)!;
    // Held after a jump: the page already sits elsewhere, but the place's block is back as it was.
    expect(scrollFor(place, place.box, 900)).toBeCloseTo(1900, 6);
    expect(restoredScroll(place, place.box, 900)).toBeNull();
  });
});
