import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Beat } from "./Beat";
import { ChapterProgressProvider } from "./ScrollChapter";

/** The beat's vertical offset in px, from its inline transform ("none" is 0). */
function yOf(el: HTMLElement): number {
  const match = /translateY\((.+)px\)/.exec(el.style.transform);
  return match ? Number(match[1]) : 0;
}

describe("Beat", () => {
  it("is fully visible and clickable inside its range", () => {
    render(
      <ChapterProgressProvider progress={0.5}>
        <Beat range={[0.33, 0.66]} initiallyHidden>
          Middle
        </Beat>
      </ChapterProgressProvider>,
    );
    const el = screen.getByText("Middle");
    expect(el).toHaveStyle({ opacity: "1" });
    // Inline, so it overrides the pinned pre-hydration CSS on a data-pinned-hidden beat.
    expect(el.style.pointerEvents).toBe("auto");
  });

  it("is hidden before its range, and lets clicks through to what is under it", () => {
    render(
      <ChapterProgressProvider progress={0.1}>
        <Beat range={[0.33, 0.66]}>Middle</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Middle")).toHaveStyle({ opacity: "0", pointerEvents: "none" });
  });

  it("stops catching clicks once it is more than half faded", () => {
    // range [0.2, 0.6], fade 0.05: opacity is 0.4 at p 0.22 and 0.6 at p 0.23.
    const { unmount } = render(
      <ChapterProgressProvider progress={0.22}>
        <Beat range={[0.2, 0.6]}>Fading</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Fading").style.pointerEvents).toBe("none");
    unmount();
    render(
      <ChapterProgressProvider progress={0.23}>
        <Beat range={[0.2, 0.6]}>Fading</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Fading").style.pointerEvents).toBe("auto");
  });

  it("rises in from below and leaves upwards", () => {
    const { unmount } = render(
      <ChapterProgressProvider progress={0.225}>
        <Beat range={[0.2, 0.6]}>Moving</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Moving")).toHaveStyle({ opacity: "0.5", transform: "translateY(7px)" });
    unmount();
    render(
      <ChapterProgressProvider progress={0.575}>
        <Beat range={[0.2, 0.6]}>Moving</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Moving")).toHaveStyle({ opacity: "0.5", transform: "translateY(-7px)" });
  });

  it("only moves up while it fades out, like the hero copy", () => {
    const hero = (p: number) => (
      <ChapterProgressProvider progress={p}>
        <Beat range={[0, 0.38]} fade={0.3} lift={50}>
          Hero
        </Beat>
      </ChapterProgressProvider>
    );
    const { rerender } = render(hero(0.15));
    const el = screen.getByText("Hero");
    expect(yOf(el)).toBeLessThanOrEqual(0);
    rerender(hero(0.25));
    expect(yOf(el)).toBeLessThanOrEqual(0);

    let previous = Infinity;
    for (let i = 0; i <= 30; i++) {
      const p = 0.08 + i / 100;
      rerender(hero(p));
      expect(yOf(el), `p ${p}`).toBeLessThanOrEqual(previous);
      previous = yOf(el);
    }
    expect(previous).toBe(-50);
  });

  it("rises from below while it fades in, when it stays to the end", () => {
    const next = (p: number) => (
      <ChapterProgressProvider progress={p}>
        <Beat range={[0.42, 1.01]} fade={0.24} lift={30}>
          Next
        </Beat>
      </ChapterProgressProvider>
    );
    const { rerender } = render(next(0.42));
    const el = screen.getByText("Next");
    for (let i = 0; i <= 24; i++) {
      const p = 0.42 + i / 100;
      rerender(next(p));
      expect(yOf(el), `p ${p}`).toBeGreaterThanOrEqual(0);
    }
    rerender(next(0.5));
    expect(yOf(el)).toBeGreaterThan(0);
    rerender(next(1));
    expect(yOf(el)).toBe(0);
  });

  it("scrolls a faded beat into view when something in it takes keyboard focus", () => {
    const seek = vi.fn();
    render(
      <ChapterProgressProvider progress={0.1} seek={seek}>
        <Beat range={[0.33, 0.66]}>
          <a href="#contact">Contact</a>
        </Beat>
      </ChapterProgressProvider>,
    );
    act(() => screen.getByRole("link", { name: "Contact" }).focus());
    expect(seek).toHaveBeenCalledTimes(1);
    const [p] = seek.mock.calls[0];
    expect(p).toBeGreaterThanOrEqual(0.38);
    expect(p).toBeLessThanOrEqual(0.61);
  });

  it("seeks to the start for a first beat and to the fade-in end for a last one", () => {
    const seek = vi.fn();
    render(
      <ChapterProgressProvider progress={0.5} seek={seek}>
        <Beat range={[0, 0.33]}>
          <a href="#first">First</a>
        </Beat>
        <Beat range={[0.66, 1.01]}>
          <a href="#last">Last</a>
        </Beat>
      </ChapterProgressProvider>,
    );
    act(() => screen.getByRole("link", { name: "First" }).focus());
    act(() => screen.getByRole("link", { name: "Last" }).focus());
    expect(seek).toHaveBeenCalledTimes(2);
    expect(seek.mock.calls[0][0]).toBe(0);
    expect(seek.mock.calls[1][0]).toBeCloseTo(0.71);
  });

  it("does not seek when the focused beat is visible or the chapter does not animate", () => {
    const seek = vi.fn();
    render(
      <>
        <ChapterProgressProvider progress={0.5} seek={seek}>
          <Beat range={[0.33, 0.66]}>
            <a href="#visible">Visible</a>
          </Beat>
        </ChapterProgressProvider>
        <ChapterProgressProvider progress={0.1} seek={seek} animated={false}>
          <Beat range={[0.33, 0.66]}>
            <a href="#static">Static</a>
          </Beat>
        </ChapterProgressProvider>
      </>,
    );
    act(() => screen.getByRole("link", { name: "Visible" }).focus());
    act(() => screen.getByRole("link", { name: "Static" }).focus());
    expect(seek).not.toHaveBeenCalled();
  });

  it("sets no motion styles when the chapter does not animate", () => {
    render(
      <ChapterProgressProvider progress={0.1} animated={false}>
        <Beat range={[0.33, 0.66]}>Static</Beat>
      </ChapterProgressProvider>,
    );
    const style = screen.getByText("Static").getAttribute("style") ?? "";
    expect(style).not.toContain("opacity");
    expect(style).not.toContain("transform");
    expect(style).not.toContain("pointer-events");
  });

  it("drops its motion styles when the chapter stops animating", () => {
    const { rerender } = render(
      <ChapterProgressProvider progress={0.1}>
        <Beat range={[0.33, 0.66]}>Toggled</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Toggled")).toHaveStyle({ opacity: "0" });
    rerender(
      <ChapterProgressProvider progress={0.1} animated={false}>
        <Beat range={[0.33, 0.66]}>Toggled</Beat>
      </ChapterProgressProvider>,
    );
    const style = screen.getByText("Toggled").getAttribute("style") ?? "";
    expect(style).not.toContain("opacity");
    expect(style).not.toContain("transform");
    expect(style).not.toContain("pointer-events");
  });

  it("marks a later beat for the pinned pre-hydration CSS", () => {
    render(
      <ChapterProgressProvider progress={0}>
        <Beat range={[0, 0.33]}>First</Beat>
        <Beat range={[0.33, 0.66]} initiallyHidden>
          Second
        </Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("First")).not.toHaveAttribute("data-pinned-hidden");
    expect(screen.getByText("Second")).toHaveAttribute("data-pinned-hidden");
  });

  it("renders as a paragraph when asked", () => {
    render(
      <ChapterProgressProvider progress={0}>
        <Beat range={[0, 0.33]} as="p" className="lead">
          Text
        </Beat>
      </ChapterProgressProvider>,
    );
    const el = screen.getByText("Text");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("lead");
  });
});
