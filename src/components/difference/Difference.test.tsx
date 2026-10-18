import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Difference } from "@/components/sections/Difference";
import { ChapterProgressProvider } from "@/components/story/ScrollChapter";
import { difference } from "@/content/difference";
import { story } from "@/content/story";
import { locales } from "@/lib/i18n";

/**
 * Difference renders its own ScrollChapter, whose context would shadow a ChapterProgressProvider
 * around it. With `plainChapter` set, ScrollChapter is just a section, so the tests can give the
 * whole section a fixed progress. Everything else in the module stays real.
 */
const chapterMock = vi.hoisted(() => ({ plainChapter: false }));
vi.mock("@/components/story/ScrollChapter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/story/ScrollChapter")>();
  return {
    ...actual,
    ScrollChapter: (props: ComponentProps<typeof actual.ScrollChapter>) =>
      chapterMock.plainChapter ? (
        <section id={props.id} aria-labelledby={props.labelledBy}>
          {props.children}
        </section>
      ) : (
        <actual.ScrollChapter {...props} />
      ),
  };
});

/**
 * Static: only the explicit reduced-motion query matches, so nothing pins or animates.
 * `pinned`: the visitor allows motion on a tall viewport, so the chapter pins and animates.
 */
function mockBrowser({ pinned = false }: { pinned?: boolean } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: pinned ? query.includes("no-preference") : query === "(prefers-reduced-motion: reduce)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
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

afterEach(() => {
  vi.unstubAllGlobals();
  chapterMock.plainChapter = false;
});

describe("Difference", () => {
  it.each(locales)("renders the slider over two versions of the photo, and three facts (%s)", (locale) => {
    mockBrowser();
    render(<Difference locale={locale} />);
    const slider = screen.getByRole("slider", { name: difference.slider.label[locale] });
    expect(slider).toHaveAccessibleDescription(difference.slider.hint[locale]);

    const before = screen.getByRole("img", { name: difference.before.photo[locale] });
    const after = screen.getByRole("img", { name: difference.after.photo[locale] });
    expect(before.getAttribute("src")).toBe(after.getAttribute("src"));
    // The filter sits on a wrapper so it also applies to the overlay (vignette or tint).
    const beforeLayer = before.parentElement as HTMLElement;
    const afterLayer = after.parentElement as HTMLElement;
    expect(beforeLayer.style.filter).toContain("sepia");
    expect(afterLayer.style.filter).not.toContain("sepia");
    expect(afterLayer.style.filter).toContain("saturate");
    for (const layer of [beforeLayer, afterLayer]) {
      expect(layer.querySelector<HTMLElement>("[aria-hidden]")?.style.backgroundImage).toMatch(/gradient/);
    }

    expect(screen.getByText(difference.before.label[locale], { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(difference.after.label[locale], { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(difference.slider.note[locale])).toBeInTheDocument();
    expect(screen.getByRole("list", { name: difference.factsLabel[locale] }).children).toHaveLength(3);
  });

  it("states only general physics: no percentages or 'times brighter' claims", () => {
    for (const locale of locales) {
      for (const fact of difference.facts) {
        const text = [fact.title, fact.body, fact.before, fact.after].map((x) => x[locale]).join(" ");
        expect(text).not.toMatch(/%|\d+\s*[x×]|times|korda/i);
        // The only numbers are the colour temperatures.
        for (const number of text.match(/\d+/g) ?? []) {
          expect(["3200", "5500", "6000"]).toContain(number);
        }
      }
    }
  });

  it.each(locales)("is the difference chapter, labelled by its heading (%s)", (locale) => {
    mockBrowser();
    render(<Difference locale={locale} />);
    const section = document.getElementById("difference");
    expect(section?.tagName).toBe("SECTION");
    expect(section).toHaveClass("chapter");
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.textContent).toBe(difference.title[locale]);
    expect(section).toHaveAttribute("aria-labelledby", heading.id);
    // The facts follow the chapter as their own block, not inside the pinned stage.
    const facts = screen.getByRole("list", { name: difference.factsLabel[locale] });
    expect(section).not.toContainElement(facts);
  });

  it("rests at 50% and shows the drag hint when the chapter does not animate", () => {
    mockBrowser();
    render(<Difference locale="en" />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("50");
    expect(screen.getByText(difference.slider.hint.en)).toBeVisible();
    expect(screen.queryByText(story.difference.scrollHint.en)).not.toBeInTheDocument();
  });

  it("starts the pinned chapter at 10% and shows the scroll hint, which still carries the drag hint", () => {
    mockBrowser({ pinned: true });
    render(<Difference locale="en" />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    // A pinned chapter at progress 0 (jsdom never scrolls).
    expect(slider.value).toBe("10");
    expect(screen.getByText(story.difference.scrollHint.en)).toBeVisible();
    expect(slider).toHaveAccessibleDescription(
      `${story.difference.scrollHint.en} ${difference.slider.hint.en}`,
    );
  });

  it("goes back to the drag hint once the visitor takes over, as scrolling no longer moves the slider", () => {
    mockBrowser({ pinned: true });
    render(<Difference locale="en" />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(screen.getByText(story.difference.scrollHint.en)).toBeVisible();

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(screen.queryByText(story.difference.scrollHint.en)).not.toBeInTheDocument();
    expect(screen.getByText(difference.slider.hint.en)).toBeVisible();
    expect(slider).toHaveAccessibleDescription(difference.slider.hint.en);
  });

  describe("scroll drives the slider", () => {
    /** Renders a fresh chapter at `progress` (a motion-driven leaf follows a rerender a frame late). */
    function sliderAt(progress: number, animated = true) {
      cleanup();
      mockBrowser();
      chapterMock.plainChapter = true;
      render(
        <ChapterProgressProvider progress={progress} animated={animated}>
          <Difference locale="en" />
        </ChapterProgressProvider>,
      );
      return screen.getByRole("slider") as HTMLInputElement;
    }

    it("is at 50% in the middle of the chapter", () => {
      expect(sliderAt(0.5).value).toBe("50");
    });

    it("starts at 10% when the scroll reaches 0.08, and holds 10% before that", () => {
      expect(sliderAt(0.08).value).toBe("10");
      expect(sliderAt(0).value).toBe("10");
    });

    it("ends at 90% when the scroll reaches 0.92, and holds 90% after that", () => {
      expect(sliderAt(0.92).value).toBe("90");
      expect(sliderAt(1).value).toBe("90");
    });

    it("moves the split in between", () => {
      expect(sliderAt(0.29).value).toBe("30");
      expect(sliderAt(0.71).value).toBe("70");
    });

    it("rests at 50% when the chapter does not animate, wherever the scroll is", () => {
      expect(sliderAt(0.9, false).value).toBe("50");
    });

    it("still renders the three facts", () => {
      sliderAt(0.5);
      expect(screen.getByRole("list", { name: difference.factsLabel.en }).children).toHaveLength(3);
    });
  });
});
