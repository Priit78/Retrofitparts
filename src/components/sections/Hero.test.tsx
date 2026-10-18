import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterProgressProvider } from "@/components/story/ScrollChapter";
import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { story } from "@/content/story";
import type { Locale } from "@/lib/i18n";
import { Hero, HeroStage, TRUST_AFTER_CHAPTER, TRUST_IN_STAGE } from "./Hero";

/** The opacity an element renders at: its own inline opacity times its ancestors'. */
function opacityOf(el: HTMLElement): number {
  let value = 1;
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node.style.opacity !== "") value *= Number(node.style.opacity);
  }
  return value;
}

/** The hero's stage at a fixed chapter progress, as it renders while pinned. */
function stageAt(progress: number, locale: Locale = "et", seek?: (p: number) => void) {
  return render(
    <ChapterProgressProvider progress={progress} seek={seek}>
      <HeroStage locale={locale} />
    </ChapterProgressProvider>,
  );
}

const trustLists = (locale: Locale) => screen.getAllByRole("list", { name: hero.trustLabel[locale] });

beforeEach(() => {
  // The full Hero is a real ScrollChapter, which reads the pinned condition. It never matches
  // here, so the chapter renders its static layout.
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

describe("Hero", () => {
  it.each(["et", "en"] as const)("has one h1 with the headline (%s)", (locale) => {
    render(<Hero locale={locale} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(hero.title[locale].join(" "));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the agreed headline", () => {
    render(<Hero locale="et" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Selge valgus. Kindel töö.");
    render(<Hero locale="en" />);
    expect(screen.getByRole("heading", { name: "Clear light. Solid work." })).toBeInTheDocument();
  });

  it("keeps the h1 visible at first paint: never in a Reveal, it only moves and never fades", () => {
    render(<Hero locale="et" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.closest("[data-reveal]")).toBeNull();
    expect(h1.className).toContain("hero-rise");
    expect(h1.className).not.toContain("hero-fade");
    expect(h1.getAttribute("style") ?? "").not.toContain("opacity");
    const css = document.querySelector("#top style")?.textContent ?? "";
    const rise = /@keyframes hero-rise\s*{([^}]*}[^}]*)}/.exec(css)?.[1] ?? "";
    expect(rise).toContain("transform");
    expect(rise).not.toContain("opacity");
  });

  it("names the services, the workshop and the founding year", () => {
    render(<Hero locale="et" />);
    const et = screen.getByText(/tuleklaase/);
    expect(et).toHaveTextContent(/projektoreid/);
    expect(et).toHaveTextContent(/taastame esitulesid/);
    expect(et).toHaveTextContent(`Tallinnas, alates ${site.founded}`);
    render(<Hero locale="en" />);
    const en = screen.getByText(/replace hazed lenses/);
    expect(en).toHaveTextContent(/projectors/);
    expect(en).toHaveTextContent(/restore headlights/);
    expect(en).toHaveTextContent(`Tallinn workshop, since ${site.founded}`);
  });

  it("loads the photo eagerly with localized alt text", () => {
    render(<Hero locale="en" />);
    const photo = screen.getByRole("img", { name: hero.photoAlt.en });
    expect(photo).not.toHaveAttribute("loading", "lazy");
    expect(photo).toHaveAttribute("sizes");
  });

  it("links the primary CTA to the contact section and the secondary to the catalog", () => {
    render(<Hero locale="en" />);
    expect(screen.getByRole("link", { name: "Request an offer" })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: "View catalog" })).toHaveAttribute("href", "/en/catalog");
  });

  it("shows four trust items built from the site facts", () => {
    render(<Hero locale="et" />);
    // Two copies: the stage's, and the one after the stage for pinned phones (CSS shows one).
    const lists = trustLists("et");
    expect(lists).toHaveLength(2);
    for (const list of lists) {
      const items = within(list).getAllByRole("listitem");
      expect(items).toHaveLength(4);
      expect(items[0]).toHaveTextContent(`${site.experienceYears} aastat kogemust`);
      expect(items[1]).toHaveTextContent(hero.trust[1].title.et);
      expect(items[1]).toHaveTextContent(String(site.warrantyYears));
      expect(items[2]).toHaveTextContent("Ametlik esindaja");
      for (const brand of site.representedBrands) expect(items[2]).toHaveTextContent(brand);
      expect(items[3]).toHaveTextContent(site.address.street);
    }
  });
});

describe("Hero chapter", () => {
  it("is the `top` chapter, named by the h1", () => {
    const { container } = render(<Hero locale="et" />);
    const section = container.querySelector<HTMLElement>("section#top");
    expect(section).toHaveClass("chapter");
    expect(section?.style.getPropertyValue("--chapter-len")).toBe("160vh");
    expect(section?.style.getPropertyValue("--chapter-len-md")).toBe("190vh");
    expect(screen.getByRole("region", { name: "Selge valgus. Kindel töö." })).toBe(section);
  });

  it("shows the h1 and lead at p = 0, with the second line in the DOM but hidden", () => {
    stageAt(0);
    expect(opacityOf(screen.getByRole("heading", { level: 1 }))).toBe(1);
    expect(opacityOf(screen.getByText(/tuleklaase/))).toBe(1);
    const next = screen.getByText(story.heroNext.et);
    // Hidden by CSS before hydration on a pinned stage, so it never flashes over the copy.
    expect(next.closest("[data-pinned-hidden]")).not.toBeNull();
    expect(opacityOf(next)).toBe(0);
  });

  it("shows the second line at p = 0.7, once the copy has gone", () => {
    stageAt(0.7, "en");
    expect(opacityOf(screen.getByText(story.heroNext.en))).toBe(1);
    expect(opacityOf(screen.getByRole("heading", { level: 1 }))).toBe(0);
  });

  it("fades the trust row out by p = 0.30 and the copy by 0.38", () => {
    const { unmount } = stageAt(0.05);
    expect(opacityOf(within(trustLists("et")[0]).getAllByRole("listitem")[0])).toBe(1);
    expect(opacityOf(screen.getByRole("heading", { level: 1 }))).toBe(1);
    unmount();
    const middle = stageAt(0.3);
    expect(opacityOf(trustLists("et")[0])).toBe(0);
    expect(opacityOf(screen.getByRole("heading", { level: 1 }))).toBeGreaterThan(0);
    middle.unmount();
    stageAt(0.38);
    expect(opacityOf(screen.getByRole("heading", { level: 1 }))).toBe(0);
  });

  it("brings the faded buttons back into view when they get keyboard focus", () => {
    const seek = vi.fn();
    stageAt(0.5, "en", seek);
    screen.getByRole("link", { name: "Request an offer" }).focus();
    expect(seek).toHaveBeenCalledWith(0);
  });

  it("leaves the h1 untouched at p = 0: no inline transform or partial opacity above it", () => {
    const { container } = stageAt(0);
    const h1 = screen.getByRole("heading", { level: 1 });
    for (let node: HTMLElement | null = h1; node && node !== container; node = node.parentElement) {
      expect(["", "none"], node.tagName).toContain(node.style.transform);
      expect(node.style.opacity === "" || Number(node.style.opacity) >= 1, node.tagName).toBe(true);
    }
  });

  it("shows exactly one trust row in every mode: the two copies' classes are complementary", () => {
    const { container } = render(<Hero locale="et" />);
    const [inStage, after] = trustLists("et");
    const stageCopy = inStage.closest<HTMLElement>(".chapter-stage > *")!;
    const afterCopy = after.parentElement!;
    expect(container.querySelector("section#top")?.nextElementSibling).toBe(afterCopy);
    for (const cls of TRUST_IN_STAGE.split(" ")) expect(stageCopy).toHaveClass(cls);
    for (const cls of TRUST_AFTER_CHAPTER.split(" ")) expect(afterCopy).toHaveClass(cls);

    // Displayed or not, per mode: the last matching rule of base < pinned < pinned and roomy wins.
    type Mode = "static" | "pinned" | "roomy";
    const order: Mode[] = ["static", "pinned", "roomy"];
    const roomy = /^pinned:lg:\[@media\(min-height:[\d.]+rem\)\]:/;
    const rules = (classes: string) =>
      classes.split(" ").map((cls) => {
        const mode: Mode = roomy.test(cls) ? "roomy" : cls.startsWith("pinned:") ? "pinned" : "static";
        return { mode, shown: !cls.endsWith("hidden"), prefix: roomy.exec(cls)?.[0] };
      });
    const shownIn = (classes: string, mode: Mode) =>
      rules(classes)
        .filter((rule) => order.indexOf(rule.mode) <= order.indexOf(mode))
        .sort((a, b) => order.indexOf(a.mode) - order.indexOf(b.mode))
        .reduce((shown, rule) => rule.shown, true);
    for (const mode of order) {
      expect([shownIn(TRUST_IN_STAGE, mode), shownIn(TRUST_AFTER_CHAPTER, mode)], mode).toEqual(
        mode === "pinned" ? [false, true] : [true, false],
      );
    }
    // Both use the same height threshold.
    const prefixes = (classes: string) => rules(classes).flatMap((rule) => rule.prefix ?? []);
    expect(new Set([...prefixes(TRUST_IN_STAGE), ...prefixes(TRUST_AFTER_CHAPTER)]).size).toBe(1);
  });

  it("keeps the phone trust row after the stage, outside the faded beats", () => {
    const { container } = render(<Hero locale="et" />);
    const section = container.querySelector("section#top")!;
    const [inStage, after] = trustLists("et");
    expect(section.contains(inStage)).toBe(true);
    expect(section.contains(after)).toBe(false);
    expect(section.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
