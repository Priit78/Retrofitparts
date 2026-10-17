import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CompareSlider } from "./CompareSlider";

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

/** Captures IntersectionObserver callbacks so tests can fire them. */
function mockIntersection() {
  const callbacks: Array<(entries: Array<{ isIntersecting: boolean }>) => void> = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        callbacks.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  return callbacks;
}

function renderSlider() {
  render(
    <CompareSlider
      before={<div>before scene</div>}
      after={<div>after scene</div>}
      label="Compare the light"
      valueText="Before {before}%, after {after}%"
    />,
  );
  return screen.getByRole("slider", { name: "Compare the light" }) as HTMLInputElement;
}

afterEach(() => vi.unstubAllGlobals());

describe("CompareSlider", () => {
  it("starts at 50% under reduced motion and never runs the intro", () => {
    mockReducedMotion(true);
    const callbacks = mockIntersection();
    const slider = renderSlider();
    expect(slider.value).toBe("50");
    expect(slider).toHaveAttribute("aria-valuetext", "Before 50%, after 50%");
    expect(callbacks).toHaveLength(0);
  });

  it("moves in 5% steps with the arrow keys, and Home/End jump to the ends", () => {
    mockReducedMotion(true);
    mockIntersection();
    const slider = renderSlider();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.value).toBe("55");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    fireEvent.keyDown(slider, { key: "ArrowDown" });
    expect(slider.value).toBe("45");
    expect(slider).toHaveAttribute("aria-valuetext", "Before 45%, after 55%");
    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.value).toBe("0");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider.value).toBe("0");
    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.value).toBe("100");
  });

  it("keeps the handle in sync with the slider value", async () => {
    mockReducedMotion(true);
    mockIntersection();
    const slider = renderSlider();
    const handle = document.querySelector<HTMLElement>("[aria-hidden].pointer-events-none");
    expect(handle?.style.left).toBe("50%");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    // motion writes styles on the next animation frame.
    await waitFor(() => expect(handle?.style.left).toBe("55%"));
  });

  it("follows a mouse drag", () => {
    mockReducedMotion(true);
    mockIntersection();
    const slider = renderSlider();
    const root = slider.parentElement as HTMLElement;
    root.getBoundingClientRect = () =>
      ({ left: 100, width: 400, top: 0, height: 300, right: 500, bottom: 300 }) as DOMRect;

    fireEvent.pointerDown(root, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200 });
    expect(slider.value).toBe("25");
    fireEvent.pointerMove(root, { pointerId: 1, pointerType: "mouse", clientX: 400 });
    expect(slider.value).toBe("75");
    fireEvent.pointerUp(root, { pointerId: 1, pointerType: "mouse", clientX: 400 });
    fireEvent.pointerMove(root, { pointerId: 1, pointerType: "mouse", clientX: 100 });
    expect(slider.value).toBe("75");
  });

  describe("touch", () => {
    function setup() {
      mockReducedMotion(true);
      mockIntersection();
      const slider = renderSlider();
      const root = slider.parentElement as HTMLElement;
      root.getBoundingClientRect = () =>
        ({ left: 0, width: 400, top: 0, height: 300, right: 400, bottom: 300 }) as DOMRect;
      const touch = (type: "pointerDown" | "pointerMove" | "pointerUp" | "pointerCancel", x: number, y: number) =>
        fireEvent[type](root, { pointerId: 7, pointerType: "touch", clientX: x, clientY: y });
      return { slider, touch };
    }

    it("moves the handle to a tap, as a single-pointer alternative to dragging", () => {
      const { slider, touch } = setup();
      touch("pointerDown", 100, 150);
      expect(slider.value).toBe("50"); // nothing happens until the finger lifts or moves sideways
      touch("pointerUp", 102, 151);
      expect(slider.value).toBe("25");
    });

    it("drags once the finger moves sideways", () => {
      const { slider, touch } = setup();
      touch("pointerDown", 200, 150);
      touch("pointerMove", 300, 152);
      expect(slider.value).toBe("75");
      touch("pointerUp", 300, 152);
      expect(slider.value).toBe("75");
    });

    it("leaves the handle alone when the finger scrolls the page", () => {
      const { slider, touch } = setup();
      touch("pointerDown", 100, 150);
      touch("pointerMove", 102, 110); // mostly vertical: not a drag
      touch("pointerUp", 102, 60); // and too far to be a tap
      expect(slider.value).toBe("50");
      touch("pointerDown", 100, 150);
      touch("pointerCancel", 100, 150); // the browser took over the scroll
      expect(slider.value).toBe("50");
    });

    it("allows vertical panning and pinch-zoom on the scene", () => {
      const { slider } = setup();
      expect(slider.parentElement).toHaveClass("touch-pan-y", "touch-pinch-zoom");
    });
  });

  it("is described by the visible hint", () => {
    mockReducedMotion(true);
    mockIntersection();
    render(
      <>
        <CompareSlider
          before={null}
          after={null}
          label="Compare"
          valueText="{before}/{after}"
          describedBy="hint"
        />
        <span id="hint">Drag the handle or use the arrow keys</span>
      </>,
    );
    expect(screen.getByRole("slider")).toHaveAccessibleDescription("Drag the handle or use the arrow keys");
  });

  it("parks at 15% before coming into view, and user input takes over from the intro", () => {
    mockReducedMotion(false);
    const callbacks = mockIntersection();
    const slider = renderSlider();
    expect(slider.value).toBe("50");

    const [arm] = callbacks;
    act(() => arm([{ isIntersecting: true }]));
    expect(slider.value).toBe("15");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.value).toBe("20");
  });
});
