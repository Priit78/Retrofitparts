import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterIndex } from "./ChapterIndex";

const ids = ["top", "problem", "difference", "anatomy", "services", "process", "catalog-teaser"];

/** A fake viewport that `matchMedia` answers from, live. */
let viewport: { width: number; reducedMotion: boolean };
const listeners = new Set<() => void>();

function setViewport(next: Partial<typeof viewport>) {
  viewport = { ...viewport, ...next };
  act(() => listeners.forEach((onChange) => onChange()));
}

beforeEach(() => {
  viewport = { width: 1440, reducedMotion: false };
  listeners.clear();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        if (query === "(prefers-reduced-motion: no-preference)") return !viewport.reducedMotion;
        if (query === "(prefers-reduced-motion: reduce)") return viewport.reducedMotion;
        if (query === "(min-width: 1440px)") return viewport.width >= 1440;
        throw new Error(`Unexpected query: ${query}`);
      },
      media: query,
      addEventListener: (_type: string, onChange: () => void) => listeners.add(onChange),
      removeEventListener: (_type: string, onChange: () => void) => listeners.delete(onChange),
    })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelectorAll("[data-test-chapter]").forEach((el) => el.remove());
});

/**
 * Adds the landing chapters to the page, with their tops (px from the viewport top). Each is
 * 600 px high unless `bottoms` says otherwise. Returns a spy on the rect reads and a mover.
 */
function placeChapters(tops: number[], bottoms: number[] = tops.map((top) => top + 600)) {
  const reads = vi.fn();
  const rects = { tops, bottoms };
  const sections = ids.map((id, index) => {
    const section = document.createElement("section");
    section.id = id;
    section.dataset.testChapter = "";
    section.getBoundingClientRect = () => {
      reads(id);
      return { top: rects.tops[index], bottom: rects.bottoms[index] } as DOMRect;
    };
    document.body.append(section);
    return section;
  });
  const move = (nextTops: number[], nextBottoms: number[] = nextTops.map((top) => top + 600)) => {
    rects.tops = nextTops;
    rects.bottoms = nextBottoms;
  };
  return { reads, move, sections };
}

const links = (name: string) => within(screen.getByRole("navigation", { name })).getAllByRole("link");

/** Labels of the links marked current. */
const current = () =>
  links("Peatükid")
    .filter((link) => link.getAttribute("aria-current") === "location")
    .map((link) => link.textContent);

/** A link's hairline tick. */
const tickOf = (link: HTMLElement) => link.querySelector("[aria-hidden]");

describe("ChapterIndex", () => {
  it("links every chapter in page order, with its label", () => {
    render(<ChapterIndex locale="et" />);
    const et = links("Peatükid");
    expect(et.map((link) => link.textContent)).toEqual([
      "Valgus",
      "Probleem",
      "Vahe",
      "Lahendus",
      "Hinnad",
      "Töö käik",
      "Kataloog",
    ]);
    expect(et.map((link) => link.getAttribute("href"))).toEqual(ids.map((id) => `#${id}`));
  });

  it("has English labels", () => {
    render(<ChapterIndex locale="en" />);
    expect(links("Chapters").map((link) => link.textContent)).toEqual([
      "Light",
      "Problem",
      "Difference",
      "Fix",
      "Prices",
      "Process",
      "Catalog",
    ]);
  });

  it("marks the last chapter whose top is above the middle of the screen, and follows the scroll", async () => {
    // jsdom's viewport is 768 px high: the middle is at 384.
    const { move } = placeChapters([-2400, -900, 200, 900, 1500, 2100, 2800]);
    render(<ChapterIndex locale="et" />);
    expect(current()).toEqual(["Vahe"]);

    move([-2800, -1300, -200, 380, 1100, 1700, 2400]);
    fireEvent.scroll(window);
    await waitFor(() => expect(current()).toEqual(["Lahendus"]));
  });

  it("marks no chapter once the catalog teaser has gone above the middle of the screen", async () => {
    const tops = [-6000, -5000, -4000, -3000, -2000, -1000, -400];
    // The catalog teaser still reaches below the middle (384): it is current.
    const { move } = placeChapters(tops, [...tops.slice(1), 500]);
    render(<ChapterIndex locale="et" />);
    expect(current()).toEqual(["Kataloog"]);
    for (const link of links("Peatükid")) expect(tickOf(link)).toHaveClass(link.textContent === "Kataloog" ? "bg-fg" : "bg-muted");

    // Its bottom has passed the middle: the visitor is reading the sections after the story.
    move(tops, [...tops.slice(1), 300]);
    fireEvent.scroll(window);
    await waitFor(() => expect(current()).toEqual([]));
    for (const link of links("Peatükid")) expect(tickOf(link)).toHaveClass("bg-muted");
  });

  it("below 1440 px shows only the line, and never measures the chapters", async () => {
    viewport.width = 1439;
    const { reads } = placeChapters([-2400, -900, 200, 900, 1500, 2100, 2800]);
    const { container } = render(<ChapterIndex locale="et" />);
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(container.querySelector("[data-reading-progress]")).not.toBeNull();
    fireEvent.scroll(window);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(reads).not.toHaveBeenCalled();

    // Widening the window brings the index in, live.
    setViewport({ width: 1440 });
    expect(current()).toEqual(["Vahe"]);
    expect(reads).toHaveBeenCalled();
  });

  it("draws a decorative reading-progress line below 1440 px, and only there", () => {
    viewport.width = 1439;
    const { container } = render(<ChapterIndex locale="et" />);
    const line = () => container.querySelector("[data-reading-progress]");
    expect(line()).toHaveAttribute("aria-hidden", "true");
    setViewport({ width: 1440 });
    expect(line()).toBeNull();
  });

  it("renders nothing under reduced motion", () => {
    viewport.reducedMotion = true;
    const { container } = render(<ChapterIndex locale="et" />);
    expect(container).toBeEmptyDOMElement();
  });
});
