import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CatalogStrip } from "./CatalogStrip";
import { ChapterProgressProvider } from "./ScrollChapter";

/** The track's measured `scrollWidth` (jsdom lays nothing out). */
let trackWidth: number;

function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, writable: true, value: width });
}

/** Captures the ResizeObservers the strip creates, so a test can report a size change. */
const observers: { callback: ResizeObserverCallback; observer: ResizeObserver; targets: Element[] }[] = [];

class FakeResizeObserver {
  private entry: (typeof observers)[number];
  constructor(callback: ResizeObserverCallback) {
    this.entry = { callback, observer: this as unknown as ResizeObserver, targets: [] };
    observers.push(this.entry);
  }
  observe(target: Element) {
    this.entry.targets.push(target);
  }
  unobserve() {}
  disconnect() {
    this.entry.targets = [];
  }
}

/** Fakes layout: the rect of each element that the test places (others are empty). */
const rects = new Map<Element, { left: number; width: number }>();

const tileIds = ["a", "b", "c", "d", "e"];

function Strip({
  progress,
  animated = true,
  seek,
}: {
  progress: number;
  animated?: boolean;
  seek?: (p: number) => void;
}) {
  return (
    <ChapterProgressProvider progress={progress} animated={animated} seek={seek}>
      <CatalogStrip>
        {tileIds.map((id) => (
          <li key={id} data-testid={`tile-${id}`}>
            <a href={`#${id}`}>Tile {id}</a>
          </li>
        ))}
      </CatalogStrip>
    </ChapterProgressProvider>
  );
}

const track = () => screen.getByRole("list");
const tile = (id: string) => screen.getByTestId(`tile-${id}`);

/**
 * Lays the tiles out 400 px wide, 20 px apart, from `start` px into the track, with the track
 * translated by `x`.
 */
function layOut(x: number, start = 0) {
  rects.set(track(), { left: x, width: trackWidth });
  tileIds.forEach((id, index) => rects.set(tile(id), { left: x + start + index * 420, width: 400 }));
}

beforeEach(() => {
  trackWidth = 3000;
  setInnerWidth(1440);
  observers.length = 0;
  rects.clear();
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(function (this: HTMLElement) {
    return this.getAttribute("role") === "list" ? trackWidth : 0;
  });
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
    const rect = rects.get(this) ?? { left: 0, width: 0 };
    return new DOMRect(rect.left, 0, rect.width, 100);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CatalogStrip", () => {
  it("moves the track by its whole travel, the track width past the viewport, at p 0.92", () => {
    render(<Strip progress={0.92} />);
    expect(track().style.transform).toBe("translateX(-1560px)");
  });

  it("holds the track at its start until p 0.10", () => {
    render(<Strip progress={0.1} />);
    expect(track().style.transform).toBe("translateX(0px)");
  });

  it("moves in proportion between p 0.10 and 0.92, and holds at the end", () => {
    const { unmount } = render(<Strip progress={0.51} />);
    expect(track().style.transform).toBe("translateX(-780px)");
    unmount();
    render(<Strip progress={1} />);
    expect(track().style.transform).toBe("translateX(-1560px)");
  });

  it("never moves when the tiles already fit", () => {
    trackWidth = 1200;
    render(<Strip progress={0.92} />);
    expect(track().style.transform).toBe("translateX(0px)");
  });

  it("measures the travel again when the viewport is resized", () => {
    render(<Strip progress={0.92} />);
    setInnerWidth(2000);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(track().style.transform).toBe("translateX(-1000px)");
  });

  it("measures the travel again when the track changes size", () => {
    render(<Strip progress={0.92} />);
    const observer = observers.find((entry) => entry.targets.includes(track()));
    expect(observer).toBeDefined();
    trackWidth = 2500;
    act(() => observer?.callback([], observer.observer));
    expect(track().style.transform).toBe("translateX(-1060px)");
  });

  it("counts the track's end padding, which a browser leaves out of an unclipped row's scrollWidth", () => {
    // Chrome: the pinned track's scrollWidth ends at its last tile (2104 px here), without the
    // 104 px end padding that lines the last tile up with the page container.
    trackWidth = 2104;
    render(<Strip progress={0.92} />);
    layOut(0, 24); // the last tile spans 1704–2104 px
    expect(tile("e").getBoundingClientRect().right).toBe(2104);
    track().style.paddingRight = "104px";
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(track().style.transform).toBe(`translateX(${-(2104 + 104 - 1440)}px)`);
  });

  it("stays a plain swipe row, with no transform, when the chapter does not animate", () => {
    render(<Strip progress={0.92} animated={false} />);
    expect(track().style.transform).toBe("");
    expect(track()).toHaveClass("overflow-x-auto", "snap-x", "snap-mandatory");
  });

  it("drops its transform when the chapter stops animating, and stops measuring", () => {
    const { rerender } = render(<Strip progress={0.92} />);
    expect(track().style.transform).toBe("translateX(-1560px)");
    rerender(<Strip progress={0.92} animated={false} />);
    expect(track().style.transform).toBe("");
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(track().style.transform).toBe("");
    expect(observers.every((entry) => entry.targets.length === 0)).toBe(true);
  });

  describe("keyboard", () => {
    it("brings a focused tile that sits off-screen to the right into view", () => {
      const seek = vi.fn();
      render(<Strip progress={0.1} seek={seek} />);
      layOut(0);
      // Tile d spans 1260–1660 px, past the 1440 px viewport: its right edge comes to 1440.
      act(() => tile("d").querySelector("a")?.focus());
      expect(seek).toHaveBeenCalledTimes(1);
      const travelled = 1660 - 1440;
      expect(seek.mock.calls[0][0]).toBeCloseTo(0.1 + (travelled / 1560) * 0.82, 6);
    });

    it("brings a focused tile that has moved off to the left back into view", () => {
      const seek = vi.fn();
      render(<Strip progress={0.92} seek={seek} />);
      layOut(-1560);
      // Tile b starts 420 px into the track, so 420 px of travel is the most that keeps it in view.
      act(() => tile("b").querySelector("a")?.focus());
      expect(seek).toHaveBeenCalledTimes(1);
      expect(seek.mock.calls[0][0]).toBeCloseTo(0.1 + (420 / 1560) * 0.82, 6);
    });

    it("also moves a tile whose edge is in view but too close to the screen's edge for its focus ring", () => {
      const seek = vi.fn();
      render(<Strip progress={0.1 + (224 / 1560) * 0.82} seek={seek} />);
      track().style.paddingRight = "24px";
      layOut(-224);
      // Tile d spans 1036–1436 px: inside the 1440 px viewport, but its ring (6 px out) is not.
      expect(tile("d").getBoundingClientRect().right).toBe(1436);
      act(() => tile("d").querySelector("a")?.focus());
      expect(seek).toHaveBeenCalledTimes(1);
      // Its right edge comes to the track's padding line, 24 px in from the viewport's edge.
      expect(seek.mock.calls[0][0]).toBeCloseTo(0.1 + ((1660 + 24 - 1440) / 1560) * 0.82, 6);
    });

    it("leaves the strip alone when the focused tile is already in view", () => {
      const seek = vi.fn();
      render(<Strip progress={0.1} seek={seek} />);
      layOut(0);
      act(() => tile("b").querySelector("a")?.focus());
      expect(seek).not.toHaveBeenCalled();
    });

    it("never moves the strip under a pointer that presses a tile", () => {
      const seek = vi.fn();
      render(<Strip progress={0.1} seek={seek} />);
      layOut(0);
      const link = tile("d").querySelector("a");
      if (!link) throw new Error("no link");
      fireEvent.mouseDown(link);
      act(() => link.focus());
      expect(seek).not.toHaveBeenCalled();
    });
  });
});
