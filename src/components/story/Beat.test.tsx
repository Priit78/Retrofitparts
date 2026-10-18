import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Beat } from "./Beat";
import { ChapterProgressProvider } from "./ScrollChapter";

describe("Beat", () => {
  it("is fully visible inside its range", () => {
    render(
      <ChapterProgressProvider progress={0.5}>
        <Beat range={[0.33, 0.66]}>Middle</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Middle")).toHaveStyle({ opacity: "1" });
  });

  it("is hidden before its range", () => {
    render(
      <ChapterProgressProvider progress={0.1}>
        <Beat range={[0.33, 0.66]}>Middle</Beat>
      </ChapterProgressProvider>,
    );
    expect(screen.getByText("Middle")).toHaveStyle({ opacity: "0" });
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

  it("sets no motion styles when the chapter does not animate", () => {
    render(
      <ChapterProgressProvider progress={0.1} animated={false}>
        <Beat range={[0.33, 0.66]}>Static</Beat>
      </ChapterProgressProvider>,
    );
    const style = screen.getByText("Static").getAttribute("style") ?? "";
    expect(style).not.toContain("opacity");
    expect(style).not.toContain("transform");
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
