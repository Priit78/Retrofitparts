import { render, screen } from "@testing-library/react";
import { motion } from "motion/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Beat } from "./Beat";
import { ScrollChapter, useChapter } from "./ScrollChapter";

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

function Probe() {
  const { progress, animated } = useChapter();
  return <p>{`${animated ? "animated" : "static"} at ${progress.get()}`}</p>;
}

/** A typical chapter leaf: fades in with the progress, so it is hidden at p = 0. */
function FadingLeaf() {
  const { progress, animated } = useChapter();
  return <motion.p style={animated ? { opacity: progress } : undefined}>Fades in</motion.p>;
}

beforeEach(() => mockReducedMotion(false));
afterEach(() => vi.unstubAllGlobals());

describe("ScrollChapter", () => {
  it("renders the chapter track with its lengths as custom properties", () => {
    const { container } = render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <p>Stage</p>
      </ScrollChapter>,
    );
    const section = container.querySelector<HTMLElement>("section#x");
    expect(section).toHaveClass("chapter");
    expect(section?.style.getPropertyValue("--chapter-len")).toBe("160vh");
    expect(section?.style.getPropertyValue("--chapter-len-md")).toBe("190vh");
  });

  it("puts the children inside the stage", () => {
    const { container } = render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }} className="track" stageClassName="stage">
        <p>Stage</p>
      </ScrollChapter>,
    );
    const stage = screen.getByText("Stage").parentElement;
    expect(stage).toHaveClass("chapter-stage", "stage");
    expect(stage?.parentElement).toBe(container.querySelector("section#x"));
    expect(container.querySelector("section#x")).toHaveClass("chapter", "track");
  });

  it("pins from every width by default, and from lg when asked", () => {
    const { container, rerender } = render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <p>Stage</p>
      </ScrollChapter>,
    );
    expect(container.querySelector("section#x")).toHaveAttribute("data-pin-from", "base");
    rerender(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }} pinFrom="lg">
        <p>Stage</p>
      </ScrollChapter>,
    );
    expect(container.querySelector("section#x")).toHaveAttribute("data-pin-from", "lg");
  });

  it("names the section", () => {
    render(
      <>
        <ScrollChapter id="a" labelledBy="a-title" length={{ base: 100, md: 100 }}>
          <h2 id="a-title">The problem</h2>
        </ScrollChapter>
        <ScrollChapter id="b" label="The fix" length={{ base: 100, md: 100 }}>
          <p>Drawing</p>
        </ScrollChapter>
      </>,
    );
    expect(screen.getByRole("region", { name: "The problem" })).toHaveAttribute("id", "a");
    expect(screen.getByRole("region", { name: "The fix" })).toHaveAttribute("id", "b");
  });

  it("gives its leaves the progress and animates when motion is allowed", () => {
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("animated at 0")).toBeInTheDocument();
  });

  it("does not animate under reduced motion", () => {
    mockReducedMotion(true);
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("static at 0")).toBeInTheDocument();
  });

  it("does not animate in the server HTML, so nothing is hidden without JS", () => {
    const html = renderToString(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
        <FadingLeaf />
        <Beat range={[0, 0.33]}>First</Beat>
        <Beat range={[0.33, 0.66]} initiallyHidden>
          Second
        </Beat>
      </ScrollChapter>,
    );
    expect(html).toContain("static at 0");
    expect(html).toContain("Second");
    expect(html).toContain("data-pinned-hidden");
    expect(html).not.toContain("opacity");
    expect(html).not.toContain("transform");
  });
});
