import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { BrandMarquee } from "./BrandMarquee";

const allBrands = [...site.representedBrands, ...site.workedBrands];

describe("BrandMarquee", () => {
  it.each([
    ["et", "Ametlik esindaja"],
    ["en", "Official representative"],
  ] as const)("lists every brand once for assistive tech (%s)", (locale, label) => {
    render(<BrandMarquee locale={locale} />);
    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");
    expect(items.map((item) => item.textContent?.replace(label, ""))).toEqual(allBrands);
    // Only the represented brands carry the label.
    for (const item of items) {
      const represented = site.representedBrands.some((brand) => item.textContent?.startsWith(brand));
      expect(item.textContent?.includes(label)).toBe(represented);
    }
  });

  it("repeats the list for the loop, with the copies hidden from assistive tech", () => {
    const { container } = render(<BrandMarquee locale="en" />);
    const lists = container.querySelectorAll(".brand-track > ul");
    // Three copies, so the track still covers the viewport on very wide screens.
    expect(lists).toHaveLength(3);
    expect(lists[0]).not.toHaveAttribute("aria-hidden");
    for (const copy of [...lists].slice(1)) {
      expect(copy).toHaveAttribute("aria-hidden", "true");
      expect(copy.textContent).toBe(lists[0].textContent);
    }
    // The track slides by exactly one copy.
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toContain("translate3d(calc(-100% / 3), 0, 0)");
  });

  it("offers a labelled pause control and becomes static under reduced motion", () => {
    const { container } = render(<BrandMarquee locale="et" />);
    expect(screen.getByRole("checkbox", { name: "Peata brändide liikumine" })).toBeInTheDocument();
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*{\s*\.brand-track { animation: none; }/);
    expect(css).toContain("animation-play-state: paused");
  });
});
