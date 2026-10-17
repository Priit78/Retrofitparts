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

/** Stubs matchMedia for a viewport that does or does not fit the pinned stage. */
function mockMedia({ fits, reduce }: { fits: boolean; reduce: boolean }) {
  motionPreference.reduce = reduce;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce")
        ? reduce
        : (!query.includes("min-width") || fits) && (!query.includes("no-preference") || !reduce),
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

afterEach(() => vi.unstubAllGlobals());

describe("Anatomy", () => {
  it("lists all four parts with a name and an explanation, in both languages", () => {
    for (const locale of ["et", "en"] as const) {
      mockMedia({ fits: false, reduce: false });
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

  it("keeps the static exploded layout (no inline motion) on small screens", () => {
    mockMedia({ fits: false, reduce: false });
    render(<Anatomy locale="et" />);
    expect(cluster()?.style.transform).toBe("");
    expect(cluster()?.style.getPropertyValue("--ex")).not.toBe("");
  });

  it("keeps the static exploded layout under reduced motion, even on a large screen", () => {
    mockMedia({ fits: true, reduce: true });
    render(<Anatomy locale="et" />);
    expect(cluster()?.style.transform).toBe("");
  });

  it("drives the parts from scroll on a large screen with motion allowed", () => {
    mockMedia({ fits: true, reduce: false });
    render(<Anatomy locale="et" />);
    expect(cluster()?.style.transform).toMatch(/translate\(.+\) scale\(/);
  });

  it("explains that polishing is temporary and replacement lasts", () => {
    mockMedia({ fits: false, reduce: false });
    render(<Anatomy locale="en" />);
    expect(screen.getByText("Polish or replace?")).toBeInTheDocument();
    expect(screen.getByText("Afterwards the lens surface is far more vulnerable to damage")).toBeInTheDocument();
    expect(screen.getByText("Dirt inside the light stays where it is")).toBeInTheDocument();
    expect(screen.getByText("Output equal to or better than factory")).toBeInTheDocument();
  });
});
