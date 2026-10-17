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

  it("duplicates the list for the loop, hidden from assistive tech", () => {
    const { container } = render(<BrandMarquee locale="en" />);
    const lists = container.querySelectorAll(".brand-track > ul");
    expect(lists).toHaveLength(2);
    expect(lists[0]).not.toHaveAttribute("aria-hidden");
    expect(lists[1]).toHaveAttribute("aria-hidden", "true");
    expect(lists[1].textContent).toBe(lists[0].textContent);
  });

  it("offers a labelled pause control and becomes static under reduced motion", () => {
    const { container } = render(<BrandMarquee locale="et" />);
    expect(screen.getByRole("checkbox", { name: "Peata brändide liikumine" })).toBeInTheDocument();
    const css = container.querySelector("style")?.textContent ?? "";
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*{\s*\.brand-track { animation: none; }/);
    expect(css).toContain("animation-play-state: paused");
  });
});
