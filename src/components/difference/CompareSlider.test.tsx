import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "motion/react";
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

  describe("driven by a motion value", () => {
    function renderDriven(drivenBy?: ReturnType<typeof motionValue<number>>) {
      const ui = (value?: ReturnType<typeof motionValue<number>>) => (
        <CompareSlider
          before={<div>before scene</div>}
          after={<div>after scene</div>}
          label="Compare the light"
          valueText="Before {before}%, after {after}%"
          drivenBy={value}
        />
      );
      const view = render(ui(drivenBy));
      const slider = screen.getByRole("slider", { name: "Compare the light" }) as HTMLInputElement;
      const root = slider.parentElement as HTMLElement;
      root.getBoundingClientRect = () =>
        ({ left: 0, width: 400, top: 0, height: 300, right: 400, bottom: 300 }) as DOMRect;
      return { slider, root, rerender: (value?: ReturnType<typeof motionValue<number>>) => view.rerender(ui(value)) };
    }

    it("follows the driving value, and skips the intro sweep", () => {
      mockReducedMotion(false);
      const callbacks = mockIntersection();
      const driver = motionValue(30);
      const { slider } = renderDriven(driver);
      expect(slider.value).toBe("30");
      expect(slider).toHaveAttribute("aria-valuetext", "Before 30%, after 70%");
      expect(callbacks).toHaveLength(0);

      act(() => driver.set(70));
      expect(slider.value).toBe("70");
      expect(slider).toHaveAttribute("aria-valuetext", "Before 70%, after 30%");
    });

    it("moves the handle with the driving value", async () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      renderDriven(driver);
      const handle = document.querySelector<HTMLElement>("[aria-hidden].pointer-events-none");
      await waitFor(() => expect(handle?.style.left).toBe("30%"));
      act(() => driver.set(80));
      await waitFor(() => expect(handle?.style.left).toBe("80%"));
    });

    it("stays within 0 to 100", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(120);
      const { slider } = renderDriven(driver);
      expect(slider.value).toBe("100");
      act(() => driver.set(-20));
      expect(slider.value).toBe("0");
    });

    it("lets the visitor win after a key press", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider } = renderDriven(driver);
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.value).toBe("35");
      act(() => driver.set(20));
      expect(slider.value).toBe("35");
    });

    it("lets the visitor win after a mouse drag", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider, root } = renderDriven(driver);
      fireEvent.pointerDown(root, { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200 });
      fireEvent.pointerUp(root, { pointerId: 1, pointerType: "mouse", clientX: 200 });
      expect(slider.value).toBe("50");
      act(() => driver.set(90));
      expect(slider.value).toBe("50");
    });

    it("lets the visitor win after a touch tap", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider, root } = renderDriven(driver);
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 150 });
      fireEvent.pointerUp(root, { pointerId: 7, pointerType: "touch", clientX: 101, clientY: 150 });
      expect(slider.value).toBe("25");
      act(() => driver.set(90));
      expect(slider.value).toBe("25");
    });

    it("keeps following the scroll while a finger scrolls the page over the slider", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider, root } = renderDriven(driver);
      // A touch that goes down on the slider and then scrolls the page is neither a tap nor a drag.
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 250 });
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 102, clientY: 200 });
      fireEvent.pointerCancel(root, { pointerId: 7, pointerType: "touch", clientX: 102, clientY: 200 });
      act(() => driver.set(60));
      expect(slider.value).toBe("60");

      // A sideways drag does take over.
      fireEvent.pointerDown(root, { pointerId: 8, pointerType: "touch", clientX: 200, clientY: 150 });
      fireEvent.pointerMove(root, { pointerId: 8, pointerType: "touch", clientX: 300, clientY: 152 });
      fireEvent.pointerUp(root, { pointerId: 8, pointerType: "touch", clientX: 300, clientY: 152 });
      expect(slider.value).toBe("75");
      act(() => driver.set(10));
      expect(slider.value).toBe("75");
    });

    it("starts following when the driver arrives later, and rests at 50% when it goes", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(20);
      const { slider, rerender } = renderDriven(undefined);
      expect(slider.value).toBe("50");
      rerender(driver);
      expect(slider.value).toBe("20");
      act(() => driver.set(40));
      expect(slider.value).toBe("40");
      rerender(undefined);
      expect(slider.value).toBe("50");
      act(() => driver.set(90));
      expect(slider.value).toBe("50");
    });
  });
});
