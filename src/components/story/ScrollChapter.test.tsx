import { act, fireEvent, render, screen } from "@testing-library/react";
import { motion } from "motion/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Beat } from "./Beat";
import { ScrollChapter, useChapter } from "./ScrollChapter";

/** A fake viewport that `matchMedia` answers from, live. */
interface Viewport {
  width: number;
  height: number;
  reducedMotion: boolean;
}

let viewport: Viewport;
const listeners = new Set<() => void>();

function matches(query: string): boolean {
  return query.split(" and ").every((feature) => {
    if (feature === "(prefers-reduced-motion: no-preference)") return !viewport.reducedMotion;
    if (feature === "(prefers-reduced-motion: reduce)") return viewport.reducedMotion;
    const size = /^\(min-(width|height): (\d+)rem\)$/.exec(feature);
    if (size) return viewport[size[1] as "width" | "height"] >= Number(size[2]) * 16;
    throw new Error(`Unexpected media feature: ${feature}`);
  });
}

function setViewport(next: Partial<Viewport>) {
  viewport = { ...viewport, ...next };
  act(() => listeners.forEach((onChange) => onChange()));
}

function Probe() {
  const { progress, animated } = useChapter();
  return <p>{`${animated ? "animated" : "static"} at ${progress.get()}`}</p>;
}

function SeekButton() {
  const { seek } = useChapter();
  return <button onClick={() => seek(0.5)}>Seek</button>;
}

/** A typical chapter leaf: fades in with the progress, so it is hidden at p = 0. */
function FadingLeaf() {
  const { progress, animated } = useChapter();
  return <motion.p style={animated ? { opacity: progress } : undefined}>Fades in</motion.p>;
}

beforeEach(() => {
  viewport = { width: 1440, height: 900, reducedMotion: false };
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return matches(query);
      },
      media: query,
      addEventListener: (_type: string, onChange: () => void) => listeners.add(onChange),
      removeEventListener: (_type: string, onChange: () => void) => listeners.delete(onChange),
    })),
  );
});
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

  it("gives its leaves the progress and animates when motion is allowed and the screen is tall enough", () => {
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("animated at 0")).toBeInTheDocument();
  });

  it("does not animate under reduced motion", () => {
    viewport.reducedMotion = true;
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("static at 0")).toBeInTheDocument();
  });

  it("does not animate in a viewport too short to pin", () => {
    viewport.height = 500;
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("static at 0")).toBeInTheDocument();
  });

  it('animates a pinFrom="lg" chapter only from 1024 px', () => {
    viewport.width = 1000;
    const { unmount } = render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }} pinFrom="lg">
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("static at 0")).toBeInTheDocument();
    unmount();
    viewport.width = 1024;
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }} pinFrom="lg">
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("animated at 0")).toBeInTheDocument();
  });

  it("follows the viewport as it changes", () => {
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }} pinFrom="lg">
        <Probe />
      </ScrollChapter>,
    );
    expect(screen.getByText("animated at 0")).toBeInTheDocument();
    setViewport({ width: 800 });
    expect(screen.getByText("static at 0")).toBeInTheDocument();
    setViewport({ width: 1280, height: 480 });
    expect(screen.getByText("static at 0")).toBeInTheDocument();
    setViewport({ height: 800 });
    expect(screen.getByText("animated at 0")).toBeInTheDocument();
  });

  it("seeks by scrolling the window to that point of the chapter's track", () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    const { container } = render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <SeekButton />
      </ScrollChapter>,
    );
    const section = container.querySelector<HTMLElement>("section#x")!;
    section.getBoundingClientRect = () => ({ top: 1000 }) as DOMRect;
    Object.defineProperty(section, "offsetHeight", { value: 3000 });
    fireEvent.click(screen.getByRole("button", { name: "Seek" }));
    expect(scrollTo).toHaveBeenCalledWith({
      top: 1000 + 0.5 * (3000 - window.innerHeight),
      behavior: "instant",
    });
  });

  it("does not seek when it does not animate", () => {
    viewport.reducedMotion = true;
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    render(
      <ScrollChapter id="x" length={{ base: 160, md: 190 }}>
        <SeekButton />
      </ScrollChapter>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Seek" }));
    expect(scrollTo).not.toHaveBeenCalled();
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
