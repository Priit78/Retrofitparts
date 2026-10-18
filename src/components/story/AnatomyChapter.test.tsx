import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { polish } from "@/content/polish";
import { story } from "@/content/story";
import { activeIndex, explodeOffset } from "@/lib/story";
import { locales, type Locale } from "@/lib/i18n";
import { AnatomyChapter, AnatomyStage } from "./AnatomyChapter";
import { ASSEMBLED_SCALE } from "./anatomy";
import { ChapterProgressProvider } from "./ScrollChapter";

/** The stage at a fixed progress, pinned (`animated`) unless asked otherwise. */
function renderStage(locale: Locale, progress: number, animated = true) {
  return render(
    <ChapterProgressProvider progress={progress} animated={animated}>
      <AnatomyStage locale={locale} />
    </ChapterProgressProvider>,
  );
}

const partsList = (locale: Locale) => screen.getByRole("list", { name: polish.partsHeading[locale] });

/** A drawing layer's offset, from its inline style (pinned) or its transform attribute (static). */
function offsetOf(layer: Element): { x: number; y: number } {
  const source = (layer as SVGGElement).style.transform || layer.getAttribute("transform") || "";
  const match = /translate\(\s*(-?[\d.]+)(?:px)?[\s,]+(-?[\d.]+)(?:px)?\s*\)/.exec(source);
  // `+ 0` turns −0 into 0, so offsets compare equal however they were written.
  return match ? { x: Number(match[1]) + 0, y: Number(match[2]) + 0 } : { x: 0, y: 0 };
}

/** explodeOffset, with −0 turned into 0. */
function offset(layer: number, e: number) {
  const { x, y } = explodeOffset(layer, e);
  return { x: x + 0, y: y + 0 };
}

/** The inline opacity and transform nearest to `el`, looking up to (and including) `stop`. */
function inlineUp(el: Element, stop: Element): { opacity: string; transform: string } {
  const found = { opacity: "", transform: "" };
  for (let node: Element | null = el; node; node = node.parentElement) {
    const style = (node as HTMLElement).style;
    found.opacity ||= style.opacity;
    found.transform ||= style.transform;
    if (node === stop) break;
  }
  return found;
}

function layersOf(container: HTMLElement) {
  return [...container.querySelectorAll("svg [data-layer]")];
}

describe("AnatomyStage", () => {
  it.each(locales)("labels the line drawing with the four parts (%s)", (locale) => {
    renderStage(locale, 0);
    expect(screen.getByRole("img", { name: story.anatomy.drawingLabel[locale] }).tagName.toLowerCase()).toBe("svg");
  });

  it.each(locales)("draws four layers, front to back (%s)", (locale) => {
    const { container } = renderStage(locale, 0);
    expect(layersOf(container).map((layer) => layer.getAttribute("data-layer"))).toEqual(["0", "1", "2", "3"]);
  });

  it.each(locales)("lists the four parts front to back, numbered (%s)", (locale) => {
    renderStage(locale, 0);
    const items = within(partsList(locale)).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(
      polish.parts.map((part, index) => `0${index + 1}${part.name[locale]}${part.body[locale]}`),
    );
  });

  it.each(locales)("marks no part before the drawing has come apart (%s)", (locale) => {
    const { container } = renderStage(locale, 0.1);
    expect(container.querySelector("[aria-current]")).toBeNull();
    expect(container.querySelector("svg [data-active]")).toBeNull();
  });

  it.each(locales)("steps through the parts once exploded: the projector at p 0.8 (%s)", (locale) => {
    expect(activeIndex(0.8, 4, 0.3, 0.98)).toBe(2);
    const { container } = renderStage(locale, 0.8);
    const current = container.querySelectorAll('[aria-current="step"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(polish.parts[2].name[locale]);
    expect(container.querySelector("svg [data-active]")).toHaveAttribute("data-layer", "2");

    // Only the current part's description is open.
    polish.parts.forEach((part, index) => {
      const body = screen.getByText(part.body[locale]);
      if (index === 2) expect(body).toBeVisible();
      else expect(body).not.toBeVisible();
    });
  });

  it.each(locales)("crossfades the descriptions in place, each in its own item right after its name (%s)", (locale) => {
    const { container } = renderStage(locale, 0.8);
    const items = within(partsList(locale)).getAllByRole("listitem");
    polish.parts.forEach((part, index) => {
      const name = within(items[index]).getByRole("heading", { name: part.name[locale] });
      const body = within(items[index]).getByText(part.body[locale]);
      expect(name.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      // Fading is opacity and transform only: nothing changes size while the chapter scrolls.
      const fade = inlineUp(body, items[index]);
      if (index === 2) {
        expect(fade.opacity).not.toBe("0");
        expect(fade.transform).toBe("none");
      } else {
        expect(fade.opacity).toBe("0");
        expect(fade.transform).toMatch(/^translateY\(/);
      }
    });
    for (const el of container.querySelectorAll<HTMLElement>("ol *")) {
      expect(el.style.gridTemplateRows).toBe("");
      expect(el.style.height).toBe("");
    }
  });

  it.each(locales)("marks the housing at the end (%s)", (locale) => {
    const { container } = renderStage(locale, 1);
    expect(container.querySelector('[aria-current="step"]')).toHaveTextContent(polish.parts[3].name[locale]);
  });

  it("moves the layers apart along the depth axis between p 0.02 and 0.30", () => {
    const at = (p: number) => {
      const view = renderStage("et", p);
      const offsets = layersOf(view.container).map(offsetOf);
      view.unmount();
      return offsets;
    };
    expect(at(0)).toEqual([0, 1, 2, 3].map(() => ({ x: 0, y: 0 })));
    // e = segment(0.16, 0.02, 0.30) = 0.5
    expect(at(0.16)).toEqual([0, 1, 2, 3].map((i) => offset(i, 0.5)));
    expect(at(0.5)).toEqual([0, 1, 2, 3].map((i) => offset(i, 1)));
  });

  it("shows the assembled headlight closer, and pulls back to keep the exploded one centred", () => {
    const assemblyAt = (p: number) => {
      const view = renderStage("et", p);
      const transform = view.container.querySelector<SVGGElement>("svg [data-assembly]")?.style.transform;
      view.unmount();
      return transform;
    };
    expect(assemblyAt(0)).toBe(`translate(0px, 0px) scale(${ASSEMBLED_SCALE})`);
    // Fully apart: minus the mean layer offset, explodeOffset(1.5, 1), at its own size.
    expect(assemblyAt(0.5)).toBe("translate(-180px, 96px) scale(1)");
  });

  it("hands the assembled scale to the pre-hydration CSS from its constant", () => {
    renderStage("et", 0);
    const svg = screen.getByRole("img", { name: story.anatomy.drawingLabel.et });
    expect(svg.parentElement?.style.getPropertyValue("--assembled-scale")).toBe(String(ASSEMBLED_SCALE));
  });

  it.each(locales)("drops every motion style when the chapter stops animating (%s)", (locale) => {
    const stage = (animated: boolean) => (
      <ChapterProgressProvider progress={0.8} animated={animated}>
        <AnatomyStage locale={locale} />
      </ChapterProgressProvider>
    );
    const { container, rerender } = render(stage(true));
    expect(container.querySelector('[aria-current="step"]')).not.toBeNull();
    rerender(stage(false));

    const svg = container.querySelector("svg")!;
    for (const el of svg.querySelectorAll<SVGElement>("[data-layer], [data-assembly], [data-depth]")) {
      expect(el.style.transform).toBe("");
      expect(el.style.opacity).toBe("");
    }
    expect(svg.querySelector("[data-active]")).toBeNull();
    expect(layersOf(container).map(offsetOf)).toEqual([0, 1, 2, 3].map((i) => offset(i, 1)));
    expect(container.querySelector("[aria-current]")).toBeNull();
    for (const part of polish.parts) {
      expect(screen.getByText(part.body[locale])).toBeVisible();
    }
  });

  it.each(locales)("is fully exploded with every description open when static (%s)", (locale) => {
    const { container } = renderStage(locale, 0, false);
    expect(layersOf(container).map(offsetOf)).toEqual([0, 1, 2, 3].map((i) => offset(i, 1)));
    expect(container.querySelector("[aria-current]")).toBeNull();
    for (const part of polish.parts) {
      expect(screen.getByText(part.body[locale])).toBeVisible();
    }
  });
});

describe("AnatomyChapter", () => {
  beforeEach(() => {
    // The chapter's pinned condition never matches here: it renders its static layout.
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} })));
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(locales)("is the #anatomy chapter, named by its kicker, with the parts heading (%s)", (locale) => {
    render(<AnatomyChapter locale={locale} />);
    const section = screen.getByRole("region", { name: story.anatomy.kicker[locale] });
    expect(section).toHaveAttribute("id", "anatomy");
    expect(section).toHaveClass("chapter");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent(polish.partsHeading[locale]);
  });
});
