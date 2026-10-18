import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { polish } from "@/content/polish";
import { story } from "@/content/story";
import { locales, type Locale } from "@/lib/i18n";
import { ProblemChapter, ProblemStage } from "./ProblemChapter";
import { ChapterProgressProvider } from "./ScrollChapter";

/** The stage at a fixed progress, pinned (`animated`) unless asked otherwise. */
function renderStage(locale: Locale, progress: number, animated = true) {
  return render(
    <ChapterProgressProvider progress={progress} animated={animated}>
      <ProblemStage locale={locale} />
    </ChapterProgressProvider>,
  );
}

/** The opacity an element is shown at: its own times every ancestor's. */
function shownOpacity(el: Element): number {
  let value = 1;
  for (let node: Element | null = el; node; node = node.parentElement) {
    const opacity = getComputedStyle(node).opacity;
    value *= opacity === "" ? 1 : Number(opacity);
  }
  return value;
}

/** The inline clip-path on the element or its nearest clipped ancestor ("" when none). */
function clipOf(el: Element): string {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const clip = (node as HTMLElement).style?.clipPath;
    if (clip) return clip;
  }
  return "";
}

const beatTitles = (locale: Locale) => story.problem.beats.map((beat) => beat.title[locale]);

describe("ProblemStage", () => {
  it.each(locales)("shows the same headlight before and after polishing, framed alike (%s)", (locale) => {
    renderStage(locale, 0);
    const unpolished = screen.getByRole("img", { name: polish.photos.unpolished.alt[locale] });
    const polished = screen.getByRole("img", { name: polish.photos.polished.alt[locale] });
    // Unpolished first, and both cropped the same way, so the headlight lines up under the wipe.
    expect(unpolished.compareDocumentPosition(polished) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(polished.className).toBe(unpolished.className);
    expect(polished.parentElement?.className).toBe(unpolished.parentElement?.className);
  });

  it.each(locales)("captions the unpolished photo at the start and the polished one past the wipe's midpoint (%s)", (locale) => {
    const { unmount } = renderStage(locale, 0);
    expect(screen.getByText(polish.photos.unpolished.caption[locale])).toBeInTheDocument();
    expect(screen.queryByText(polish.photos.polished.caption[locale])).toBeNull();
    unmount();

    renderStage(locale, 0.6);
    expect(screen.getByText(polish.photos.polished.caption[locale])).toBeInTheDocument();
    expect(screen.queryByText(polish.photos.unpolished.caption[locale])).toBeNull();
  });

  it.each(locales)("wipes the polished photo in from the left with a seam at its edge (%s)", (locale) => {
    const polishedAt = (p: number) => {
      const view = renderStage(locale, p);
      const photo = screen.getByRole("img", { name: polish.photos.polished.alt[locale] });
      const seam = view.container.querySelector("[data-wipe-seam]");
      const result = { clip: clipOf(photo), seam: seam ? shownOpacity(seam) : NaN };
      view.unmount();
      return result;
    };
    // w = segment(p, 0.30, 0.62): 0 at the start, 0.5 at p 0.46, 1 from 0.62.
    expect(polishedAt(0)).toEqual({ clip: "inset(0 100% 0 0)", seam: 0 });
    expect(polishedAt(0.46)).toEqual({ clip: "inset(0 50% 0 0)", seam: 1 });
    expect(polishedAt(0.8)).toEqual({ clip: "inset(0 0% 0 0)", seam: 0 });
  });

  it.each(locales)("crossfades the beats: the second one alone shows at p 0.5 (%s)", (locale) => {
    renderStage(locale, 0.5);
    const [first, second, third] = beatTitles(locale).map((name) => screen.getByRole("heading", { name }));
    expect(shownOpacity(second)).toBe(1);
    expect(shownOpacity(first)).toBe(0);
    expect(shownOpacity(third)).toBe(0);
  });

  it.each(locales)("keeps all three beat titles in the DOM, in order (%s)", (locale) => {
    renderStage(locale, 0);
    expect(screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(
      beatTitles(locale),
    );
  });

  it.each(locales)("compares polishing with replacing, every point listed (%s)", (locale) => {
    renderStage(locale, 1);
    for (const side of [polish.compare.polish, polish.compare.replace]) {
      const column = screen.getByRole("group", { name: side.title[locale] });
      expect(column).toHaveTextContent(side.tag[locale]);
      expect(within(column).getAllByRole("listitem")).toHaveLength(side.points.length);
      for (const point of side.points) {
        expect(point[locale].trim()).not.toBe("");
        expect(column).toHaveTextContent(point[locale]);
      }
    }
  });

  it.each(locales)("drops every motion style when the chapter stops animating (%s)", (locale) => {
    const stage = (animated: boolean) => (
      <ChapterProgressProvider progress={0.46} animated={animated}>
        <ProblemStage locale={locale} />
      </ChapterProgressProvider>
    );
    const { container, rerender } = render(stage(true));
    expect(clipOf(screen.getByRole("img", { name: polish.photos.polished.alt[locale] }))).toBe("inset(0 50% 0 0)");
    rerender(stage(false));

    for (const el of container.querySelectorAll<HTMLElement>("*")) {
      expect(el.style.clipPath).toBe("");
      expect(el.style.transform).toBe("");
      expect(el.style.opacity).toBe("");
    }
    for (const photo of [polish.photos.unpolished, polish.photos.polished]) {
      const img = screen.getByRole("img", { name: photo.alt[locale] });
      expect(img.closest("figure")).toHaveTextContent(photo.caption[locale]);
    }
    for (const name of beatTitles(locale)) {
      expect(shownOpacity(screen.getByRole("heading", { name }))).toBe(1);
    }
  });

  it("asks for half-width photos where the static pair sits side by side, full width where it pins", () => {
    renderStage("et", 0);
    for (const photo of [polish.photos.unpolished, polish.photos.polished]) {
      const sizes = screen.getByRole("img", { name: photo.alt.et }).getAttribute("sizes") ?? "";
      // 640–1023 px: side by side when static (reduced motion, or too short to pin), one frame when pinned.
      expect(sizes).toContain("(min-width: 640px) and (prefers-reduced-motion: reduce) 50vw");
      expect(sizes).toContain("(min-width: 640px) and (max-height: 511px) 50vw");
      // A landscape tablet pins the frame beside the beats.
      expect(sizes).toContain("(min-width: 768px) and (orientation: landscape) 50vw");
      expect(sizes.trim().endsWith("100vw")).toBe(true);
    }
  });

  it.each(locales)("shows both photos with their own captions and no motion styles when static (%s)", (locale) => {
    renderStage(locale, 0.5, false);
    for (const photo of [polish.photos.unpolished, polish.photos.polished]) {
      const img = screen.getByRole("img", { name: photo.alt[locale] });
      expect(img.closest("figure")).toHaveTextContent(photo.caption[locale]);
      expect(clipOf(img)).toBe("");
    }
    for (const name of beatTitles(locale)) {
      expect(shownOpacity(screen.getByRole("heading", { name }))).toBe(1);
    }
  });
});

describe("ProblemChapter", () => {
  beforeEach(() => {
    // The chapter's pinned condition never matches here: it renders its static layout.
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(locales)("is the #problem chapter, named by its kicker (%s)", (locale) => {
    render(<ProblemChapter locale={locale} />);
    const section = screen.getByRole("region", { name: story.problem.kicker[locale] });
    expect(section).toHaveAttribute("id", "problem");
    expect(section).toHaveClass("chapter");
  });

  it.each(locales)("marks only the later beats for the pinned pre-hydration CSS (%s)", (locale) => {
    render(<ProblemChapter locale={locale} />);
    const [first, second, third] = beatTitles(locale).map((name) => screen.getByRole("heading", { name }));
    expect(first.closest("[data-pinned-hidden]")).toBeNull();
    expect(second.closest("[data-pinned-hidden]")).not.toBeNull();
    expect(third.closest("[data-pinned-hidden]")).not.toBeNull();
  });
});
