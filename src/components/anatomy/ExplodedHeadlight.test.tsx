import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Anatomy } from "@/components/sections/Anatomy";
import { anatomy } from "@/content/anatomy";

// motion caches the reduced-motion preference per module, so tests set it explicitly.
const motionPreference = vi.hoisted(() => ({ reduce: false }));
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => motionPreference.reduce,
}));

interface Viewport {
  width: number;
  height: number;
  reduce?: boolean;
}

/** Evaluates the media queries the component uses against a given viewport (1rem = 16px). */
function evaluate(query: string, { width, height, reduce = false }: Viewport): boolean {
  return query.split(" and ").every((part) => {
    const feature = part.trim().replace(/^\(|\)$/g, "");
    const [name, raw] = feature.split(":").map((x) => x.trim());
    const px = raw?.endsWith("rem") ? parseFloat(raw) * 16 : parseFloat(raw);
    switch (name) {
      case "min-width":
        return width >= px;
      case "min-height":
        return height >= px;
      case "max-height":
        return height <= px;
      case "prefers-reduced-motion":
        return raw === "reduce" ? reduce : !reduce;
      default:
        throw new Error(`Unhandled media feature in test: ${feature}`);
    }
  });
}

function mockViewport(viewport: Viewport) {
  motionPreference.reduce = viewport.reduce ?? false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: evaluate(query, viewport),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

const cluster = () => document.querySelector<SVGGElement>(".xh-cluster");
const isScrollDriven = () => /translate\(.+\) scale\(/.test(cluster()?.style.transform ?? "");

afterEach(() => vi.unstubAllGlobals());

describe("Anatomy", () => {
  it("lists all four parts with a name and an explanation, in both languages", () => {
    for (const locale of ["et", "en"] as const) {
      mockViewport({ width: 390, height: 844 });
      const { unmount } = render(<Anatomy locale={locale} />);
      const items = screen.getAllByRole("listitem").filter((li) => li.closest("ol"));
      expect(items).toHaveLength(4);
      anatomy.parts.forEach((part, index) => {
        expect(items[index]).toHaveTextContent(part.name[locale]);
        expect(items[index]).toHaveTextContent(part.body[locale]);
      });
      expect(screen.getByRole("img", { name: anatomy.figureLabel[locale] })).toBeInTheDocument();
      unmount();
    }
  });

  it("keeps the static exploded layout (no inline motion) on phones", () => {
    mockViewport({ width: 390, height: 844 });
    render(<Anatomy locale="et" />);
    expect(cluster()?.style.transform).toBe("");
    expect(cluster()?.style.getPropertyValue("--ex")).not.toBe("");
  });

  it.each([
    { width: 768, height: 1024, why: "portrait tablet: the two-column stage is too narrow" },
    { width: 800, height: 700, why: "small window" },
    { width: 1280, height: 650, why: "short laptop: the stage would not fit one screen" },
    { width: 844, height: 390, why: "landscape phone" },
  ])("uses the static layout at $width×$height ($why)", ({ width, height }) => {
    mockViewport({ width, height });
    render(<Anatomy locale="et" />);
    expect(isScrollDriven()).toBe(false);
  });

  it.each([
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
  ])("drives the parts from scroll at $width×$height", ({ width, height }) => {
    mockViewport({ width, height });
    render(<Anatomy locale="et" />);
    expect(isScrollDriven()).toBe(true);
  });

  it("keeps the static exploded layout under reduced motion, even on a large screen", () => {
    mockViewport({ width: 1440, height: 900, reduce: true });
    render(<Anatomy locale="et" />);
    expect(cluster()?.style.transform).toBe("");
  });

  it("pins only from lg and 720px tall in CSS too, so the first paint matches", () => {
    mockViewport({ width: 390, height: 844 });
    const { container } = render(<Anatomy locale="et" />);
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain(
      "@media (min-width: 64rem) and (min-height: 45rem) and (prefers-reduced-motion: no-preference)",
    );
    // The scroll cue only exists in that layout.
    expect(css).toMatch(/\.xh-cue\{display:none\}/);
    expect(screen.getByText(anatomy.scrollHint.et)).toHaveClass("xh-cue");
    // Its bob is finite and short (WCAG 2.2.2), and waits until the cue is on screen.
    expect(css).toContain(".xh-cue svg{animation:xh-bob 1.6s cubic-bezier(0.16,1,0.3,1) 3 paused}");
    expect(css).toContain(".xh-cue[data-seen] svg{animation-play-state:running}");
    expect(css).not.toContain("infinite");
  });

  it("explains that polishing is temporary and replacement lasts", () => {
    mockViewport({ width: 390, height: 844 });
    render(<Anatomy locale="en" />);
    expect(screen.getByText("Polish or replace?")).toBeInTheDocument();
    expect(screen.getByText("Afterwards the lens surface is far more vulnerable to damage")).toBeInTheDocument();
    expect(screen.getByText("Dirt inside the light stays where it is")).toBeInTheDocument();
    expect(screen.getByText("Output equal to or better than factory")).toBeInTheDocument();
  });
});
