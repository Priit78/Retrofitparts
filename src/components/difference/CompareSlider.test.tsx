import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "motion/react";
import { Profiler, type ComponentProps } from "react";
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

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

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

  it("keeps the handle in sync with the slider value, moving it by transform", async () => {
    mockReducedMotion(true);
    mockIntersection();
    const slider = renderSlider();
    const handle = document.querySelector<HTMLElement>("[aria-hidden].pointer-events-none");
    expect(handle?.style.transform).toContain("translateX(50%)");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    // motion writes styles on the next animation frame.
    await waitFor(() => expect(handle?.style.transform).toContain("translateX(55%)"));
    // A layout property never animates.
    expect(handle?.style.left).toBe("");
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
    type Driver = ReturnType<typeof motionValue<number>>;

    function renderDriven(drivenBy?: Driver, extra: Partial<ComponentProps<typeof CompareSlider>> = {}) {
      const ui = (value?: Driver) => (
        <CompareSlider
          before={<div>before scene</div>}
          after={<div>after scene</div>}
          label="Compare the light"
          valueText="Before {before}%, after {after}%"
          drivenBy={value}
          {...extra}
        />
      );
      const view = render(ui(drivenBy));
      const slider = screen.getByRole("slider", { name: "Compare the light" }) as HTMLInputElement;
      const root = slider.parentElement as HTMLElement;
      root.getBoundingClientRect = () =>
        ({ left: 0, width: 400, top: 0, height: 300, right: 400, bottom: 300 }) as DOMRect;
      return { slider, root, rerender: (value?: Driver) => view.rerender(ui(value)) };
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

    it("moves the handle with the driving value, by transform", async () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      renderDriven(driver);
      const handle = document.querySelector<HTMLElement>("[aria-hidden].pointer-events-none");
      await waitFor(() => expect(handle?.style.transform).toContain("translateX(30%)"));
      act(() => driver.set(80));
      await waitFor(() => expect(handle?.style.transform).toContain("translateX(80%)"));
      expect(handle?.style.left).toBe("");
    });

    it("does not re-render React while the driver moves the handle", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(10);
      let commits = 0;
      render(
        <Profiler id="slider" onRender={() => void (commits += 1)}>
          <CompareSlider
            before={<div>before scene</div>}
            after={<div>after scene</div>}
            label="Compare the light"
            valueText="Before {before}%, after {after}%"
            drivenBy={driver}
          />
        </Profiler>,
      );
      const slider = screen.getByRole("slider", { name: "Compare the light" }) as HTMLInputElement;
      expect(slider.value).toBe("10");
      const settled = commits;

      for (let v = 11; v <= 90; v += 1) act(() => driver.set(v));
      expect(slider.value).toBe("90");
      expect(slider).toHaveAttribute("aria-valuetext", "Before 90%, after 10%");
      expect(commits).toBe(settled);
    });

    it("writes the input only when the rounded value changes", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider } = renderDriven(driver);
      const valueText = vi.spyOn(slider, "setAttribute");
      const value = vi.spyOn(slider, "value", "set");

      for (const v of [30.1, 30.2, 30.4, 29.6]) act(() => driver.set(v));
      expect(value).not.toHaveBeenCalled();
      expect(valueText).not.toHaveBeenCalled();

      act(() => driver.set(30.6));
      expect(value).toHaveBeenCalledTimes(1);
      expect(valueText).toHaveBeenCalledTimes(1);
      expect(slider.value).toBe("31");
      expect(slider).toHaveAttribute("aria-valuetext", "Before 31%, after 69%");
    });

    it("writes the exact value, not one snapped to the key step", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(10);
      const { slider } = renderDriven(driver);
      act(() => driver.set(17));
      expect(slider.value).toBe("17");
      expect(slider).toHaveAttribute("aria-valuetext", "Before 17%, after 83%");
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

    it("does not claim on a jittery near-vertical touch that the browser then takes for a scroll", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const onClaimChange = vi.fn();
      const { slider, root } = renderDriven(driver, { onClaimChange });
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 250 });
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 108, clientY: 243 });
      fireEvent.pointerCancel(root, { pointerId: 7, pointerType: "touch", clientX: 108, clientY: 243 });
      expect(slider.value).toBe("30");
      act(() => driver.set(60));
      expect(slider.value).toBe("60");
      expect(onClaimChange).not.toHaveBeenCalled();
    });

    it("needs a clearly sideways touch to engage: 10 px, and more than 1.5 times the vertical move", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider, root } = renderDriven(driver);
      // 12 px across but 10 px down: not sideways enough.
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 100, clientY: 250 });
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 112, clientY: 240 });
      expect(slider.value).toBe("30");
      // 40 px across, 10 px down: a drag.
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 140, clientY: 240 });
      expect(slider.value).toBe("35");
    });

    it("gives the claim back when the browser cancels a touch drag it had started, and returns to the driver", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const onClaimChange = vi.fn();
      const { slider, root } = renderDriven(driver, { onClaimChange });
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 200, clientY: 150 });
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 300, clientY: 152 });
      expect(slider.value).toBe("75");
      expect(onClaimChange).toHaveBeenLastCalledWith(true);

      fireEvent.pointerCancel(root, { pointerId: 7, pointerType: "touch", clientX: 300, clientY: 152 });
      expect(onClaimChange).toHaveBeenLastCalledWith(false);
      expect(slider.value).toBe("30");
      act(() => driver.set(60));
      expect(slider.value).toBe("60");
    });

    it("keeps an earlier claim when a later touch is cancelled", () => {
      mockReducedMotion(true);
      mockIntersection();
      const driver = motionValue(30);
      const { slider, root } = renderDriven(driver);
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.value).toBe("35");
      fireEvent.pointerDown(root, { pointerId: 7, pointerType: "touch", clientX: 200, clientY: 150 });
      fireEvent.pointerMove(root, { pointerId: 7, pointerType: "touch", clientX: 300, clientY: 152 });
      fireEvent.pointerCancel(root, { pointerId: 7, pointerType: "touch", clientX: 300, clientY: 152 });
      act(() => driver.set(90));
      expect(slider.value).toBe("75");
    });

    it("tells its owner once when the visitor takes over", () => {
      mockReducedMotion(true);
      mockIntersection();
      const onClaimChange = vi.fn();
      const { slider } = renderDriven(motionValue(30), { onClaimChange });
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(onClaimChange).toHaveBeenCalledTimes(1);
      expect(onClaimChange).toHaveBeenCalledWith(true);
    });

    describe("side tags", () => {
      /** A 400 px frame; the BEFORE tag spans 12 to 82 px and the AFTER tag 318 to 388 px. */
      function mockGeometry() {
        const box = (el: HTMLElement) =>
          el.textContent === "BEFORE"
            ? { left: 12, width: 70 }
            : el.textContent === "AFTER"
              ? { left: 318, width: 70 }
              : { left: 0, width: 400 };
        vi.spyOn(Element.prototype, "clientWidth", "get").mockReturnValue(400);
        vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (this: HTMLElement) {
          return box(this).left;
        });
        vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (this: HTMLElement) {
          return box(this).width;
        });
      }

      function renderTags(position: number) {
        mockReducedMotion(true);
        mockIntersection();
        mockGeometry();
        const driver = motionValue(position);
        renderDriven(driver, { beforeLabel: <span>BEFORE</span>, afterLabel: <span>AFTER</span> });
        const opacity = (name: string) =>
          parseFloat((screen.getByText(name).parentElement as HTMLElement).style.opacity || "1");
        return { driver, before: () => opacity("BEFORE"), after: () => opacity("AFTER") };
      }

      it("shows both tags when the split is clear of them", async () => {
        const { before, after } = renderTags(50);
        await waitFor(() => expect(before()).toBe(1));
        expect(after()).toBe(1);
      });

      it("fades the before tag out before the split reaches it, so it is never cut", async () => {
        const { before, after } = renderTags(10);
        await waitFor(() => expect(before()).toBe(0));
        expect(after()).toBe(1);
      });

      it("fades the after tag out the same way from the other side", async () => {
        const { before, after } = renderTags(90);
        await waitFor(() => expect(after()).toBe(0));
        expect(before()).toBe(1);
      });

      it("fades in between, from the same motion value", async () => {
        const { driver, before } = renderTags(10);
        // The before tag ends at 20.5 % of the frame; the fade takes 16 px (4 %) after that.
        act(() => driver.set(22.5));
        await waitFor(() => expect(before()).toBeGreaterThan(0));
        expect(before()).toBeLessThan(1);
        act(() => driver.set(26));
        await waitFor(() => expect(before()).toBe(1));
      });
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
