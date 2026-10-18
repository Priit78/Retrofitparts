import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterIndex } from "./ChapterIndex";

const ids = ["top", "problem", "difference", "anatomy", "services", "process", "catalog-teaser"];

let reducedMotion = false;

beforeEach(() => {
  reducedMotion = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        if (query === "(prefers-reduced-motion: no-preference)") return !reducedMotion;
        if (query === "(prefers-reduced-motion: reduce)") return reducedMotion;
        throw new Error(`Unexpected query: ${query}`);
      },
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.querySelectorAll("[data-test-chapter]").forEach((el) => el.remove());
});

/** Adds the landing chapters to the page, with their tops (px from the viewport top). */
function placeChapters(tops: number[]) {
  const sections = ids.map((id, index) => {
    const section = document.createElement("section");
    section.id = id;
    section.dataset.testChapter = "";
    section.getBoundingClientRect = () => ({ top: tops[index] }) as DOMRect;
    document.body.append(section);
    return section;
  });
  return (next: number[]) =>
    sections.forEach((section, index) => {
      section.getBoundingClientRect = () => ({ top: next[index] }) as DOMRect;
    });
}

const links = (name: string) => within(screen.getByRole("navigation", { name })).getAllByRole("link");

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
    const move = placeChapters([-2400, -900, 200, 900, 1500, 2100, 2800]);
    render(<ChapterIndex locale="et" />);
    const current = () => links("Peatükid").filter((link) => link.getAttribute("aria-current") === "true");
    expect(current().map((link) => link.textContent)).toEqual(["Vahe"]);

    move([-2800, -1300, -200, 380, 1100, 1700, 2400]);
    fireEvent.scroll(window);
    await waitFor(() => expect(current().map((link) => link.textContent)).toEqual(["Lahendus"]));
  });

  it("draws a decorative reading-progress line", () => {
    const { container } = render(<ChapterIndex locale="et" />);
    const line = container.querySelector("[data-reading-progress]");
    expect(line).toHaveAttribute("aria-hidden", "true");
  });

  it("renders nothing under reduced motion", () => {
    reducedMotion = true;
    const { container } = render(<ChapterIndex locale="et" />);
    expect(container).toBeEmptyDOMElement();
  });
});
