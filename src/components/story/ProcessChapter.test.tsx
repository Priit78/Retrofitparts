import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { common } from "@/content/common";
import { processCopy } from "@/content/process";
import { site } from "@/content/site";
import { locales, type Locale } from "@/lib/i18n";
import { ProcessChapter, processSteps } from "./ProcessChapter";
import { ProcessStage } from "./ProcessStage";
import { ChapterProgressProvider } from "./ScrollChapter";

/** The stage at a fixed progress, as the chapter builds it. */
function renderStage(
  locale: Locale,
  progress: number,
  { animated = true, seek }: { animated?: boolean; seek?: (p: number) => void } = {},
) {
  return render(
    <ChapterProgressProvider progress={progress} animated={animated} seek={seek}>
      <ProcessStage steps={processSteps(locale)} />
    </ChapterProgressProvider>,
  );
}

const stepItems = () => within(screen.getByRole("list")).getAllByRole("listitem");

/** The x scale of a progress segment's fill, from its inline transform ("none" is 1). */
function scaleXOf(el: Element): number {
  const transform = (el as HTMLElement).style.transform;
  const match = /scaleX\(([^)]+)\)/.exec(transform);
  return match ? Number(match[1]) : transform === "none" ? 1 : NaN;
}

describe("ProcessChapter", () => {
  // The full chapter renders a real ScrollChapter: a viewport that never pins keeps it static.
  beforeEach(() => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(locales)("is the #process chapter, labelled by its h2 (%s)", (locale) => {
    const { container } = render(<ProcessChapter locale={locale} />);
    const h2 = screen.getByRole("heading", { level: 2 });
    expect(h2).toHaveAttribute("id", "process-title");
    expect(h2).toHaveTextContent(processCopy.title[locale]);

    const section = container.querySelector<HTMLElement>("section#process");
    expect(section).toHaveClass("chapter");
    expect(section).toHaveAttribute("aria-labelledby", "process-title");
    expect(section?.style.getPropertyValue("--chapter-len")).toBe("300vh");
    expect(section?.style.getPropertyValue("--chapter-len-md")).toBe("360vh");
  });

  it.each(locales)("lists the four step titles in order (%s)", (locale) => {
    render(<ProcessChapter locale={locale} />);
    const titles = within(screen.getByRole("list")).getAllByRole("heading", { level: 3 });
    expect(titles.map((title) => title.textContent)).toEqual(processCopy.steps.map((step) => step.title[locale]));
  });

  it.each(locales)("keeps the kicker, the intro under the h2 and the offer button (%s)", (locale) => {
    render(<ProcessChapter locale={locale} />);
    const h2 = screen.getByRole("heading", { level: 2 });
    const kicker = screen.getByText(processCopy.eyebrow[locale]);
    const intro = screen.getByText(processCopy.intro[locale]);
    expect(kicker.compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(h2.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const cta = screen.getByRole("link", { name: common.requestOffer[locale] });
    expect(cta).toHaveAttribute("href", "#contact");
    // After the steps, at the bottom of the stage.
    expect(screen.getByRole("list").compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it.each(locales)("is static without the pinned condition: no current step, every step shown (%s)", (locale) => {
    const { container } = render(<ProcessChapter locale={locale} />);
    expect(container.querySelector("[aria-current]")).toBeNull();
    for (const item of stepItems()) expect(item).toBeVisible();
  });
});

describe("ProcessStage", () => {
  it.each(locales)("links the step-1 body to the email address (%s)", (locale) => {
    renderStage(locale, 0);
    const [request] = stepItems();
    const link = within(request).getByRole("link", { name: site.email });
    expect(link).toHaveAttribute("href", `mailto:${site.email}`);
    expect(link.closest("p")).toHaveTextContent(processCopy.steps[0].body[locale].replace("{email}", site.email));
  });

  it.each(locales)("fills the warranty years from site.ts (%s)", (locale) => {
    renderStage(locale, 0);
    const warranty = stepItems()[3];
    const years = String(site.warrantyYears);
    expect(warranty).toHaveTextContent(processCopy.steps[3].body[locale].replace("{years}", years));
    expect(warranty).toHaveTextContent(processCopy.steps[3].tag[locale].replace("{years}", years));
    expect(screen.getByRole("list").textContent).not.toMatch(/[{}]/);
  });

  it.each([
    ["et", 0.6, "Paigaldus"],
    ["en", 0.6, "Installation"],
    ["et", 0, "Päring"],
    ["en", 0, "Request"],
    ["en", 0.25, "Offer"],
    ["en", 1, "Warranty"],
  ] as const)("marks the current step from the progress alone (%s at %s: %s)", (locale, progress, title) => {
    const { container } = renderStage(locale, progress);
    const current = container.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0].tagName).toBe("LI");
    expect(within(current[0] as HTMLElement).getByRole("heading", { level: 3 })).toHaveTextContent(title);
  });

  it("shows only the current step, and lets clicks pass through the others", () => {
    renderStage("et", 0.6);
    stepItems().forEach((item, index) => {
      if (index === 2) {
        expect(item).toBeVisible();
        expect(item.style.opacity).toBe("1");
        expect(item.style.pointerEvents).toBe("auto");
      } else {
        expect(item).not.toBeVisible();
        expect(item.style.opacity).toBe("0");
        expect(item.style.pointerEvents).toBe("none");
      }
    });
  });

  it("hides steps 2–4 before hydration in a pinned stage", () => {
    renderStage("et", 0, { animated: false });
    expect(stepItems().map((item) => item.hasAttribute("data-pinned-hidden"))).toEqual([false, true, true, true]);
  });

  it("is plain content when the chapter does not animate: no current step, every step visible", () => {
    const { container } = renderStage("en", 0.6, { animated: false });
    expect(container.querySelector("[aria-current]")).toBeNull();
    for (const item of stepItems()) {
      expect(item).toBeVisible();
      expect(item.getAttribute("style") ?? "").toBe("");
    }
  });

  it("brings a hidden step into view when focus lands in it", () => {
    const seek = vi.fn();
    renderStage("et", 0.6, { seek });
    act(() => screen.getByRole("link", { name: site.email }).focus());
    // Step 1 shows while p is in [0, 0.25): its centre is 0.125.
    expect(seek).toHaveBeenCalledWith(0.125);
  });

  it("does not move when focus lands in the current step", () => {
    const seek = vi.fn();
    renderStage("et", 0.1, { seek });
    act(() => screen.getByRole("link", { name: site.email }).focus());
    expect(seek).not.toHaveBeenCalled();
  });

  it("gives every step a decorative photo, and loads only the first one eagerly, at low priority", () => {
    const { container } = renderStage("et", 0);
    const photos = [...container.querySelectorAll("img")];
    expect(photos).toHaveLength(4);
    stepItems().forEach((item, index) => expect(item).toContainElement(photos[index]));
    for (const photo of photos) {
      expect(photo).toHaveAttribute("alt", "");
      // Full-bleed when pinned; half width in the static two-column list from md (reduced
      // motion, or a viewport too short to pin).
      expect(photo).toHaveAttribute(
        "sizes",
        "(prefers-reduced-motion: reduce) and (min-width: 48rem) 50vw, (min-width: 48rem) and (max-height: 31.99rem) 50vw, 100vw",
      );
    }
    expect(photos.map((photo) => photo.getAttribute("loading"))).toEqual(["eager", "lazy", "lazy", "lazy"]);
    // Low priority keeps React from preloading it in the head, beside the hero photo.
    expect(photos.map((photo) => photo.getAttribute("fetchpriority"))).toEqual(["low", null, null, null]);
  });

  it("fills the four progress segments as the chapter advances", () => {
    const { container } = renderStage("et", 0.6);
    const fills = [...container.querySelectorAll("[data-process-progress] > * > *")];
    expect(fills).toHaveLength(4);
    // Segment i is clamp(4p − i, 0, 1).
    const scales = fills.map(scaleXOf);
    expect(scales[0]).toBe(1);
    expect(scales[1]).toBe(1);
    expect(scales[2]).toBeCloseTo(0.4);
    expect(scales[3]).toBe(0);
  });
});
