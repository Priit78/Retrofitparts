import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { categories } from "@/data/products";
import { illustrationSvg, ProductIllustration } from "./ProductIllustration";

function parse(svg: string) {
  return new DOMParser().parseFromString(svg, "image/svg+xml");
}

describe("illustrationSvg", () => {
  it.each(categories.map((c) => c.id))("is a well-formed, self-contained SVG for %s", (id) => {
    const svg = illustrationSvg(id);
    const doc = parse(svg);
    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.getAttribute("viewBox")).toBe("24 30 352 264");

    // Every paint server, mask, clip path and <use> target it references is defined in it.
    const ids = new Set(Array.from(doc.querySelectorAll("[id]"), (el) => el.id));
    const refs = [...svg.matchAll(/url\(#([\w-]+)\)|href="#([\w-]+)"/g)].map((m) => m[1] ?? m[2]);
    expect(refs.length).toBeGreaterThan(0);
    for (const ref of refs) expect(ids).toContain(ref);

    // An SVG image can't see the page's CSS variables, so none may be used.
    expect(svg).not.toContain("var(");
  });

  it("draws LED and xenon projectors, and xenon and halogen bulbs, differently", () => {
    expect(illustrationSvg("led-projectors")).not.toBe(illustrationSvg("xenon-projectors"));
    expect(illustrationSvg("xenon-bulbs")).not.toBe(illustrationSvg("halogen"));
  });

  it("has its own render for complete headlights, not the lens shot", () => {
    expect(illustrationSvg("headlights")).not.toBe(illustrationSvg("lenses"));
    const { container } = render(<ProductIllustration category="headlights" />);
    expect(container.querySelector("[data-shot]")).toHaveAttribute("data-shot", "headlight");
  });

  it.each(["lenses", "headlights", "led-projectors", "led-lights", "xenon-bulbs", "halogen"] as const)(
    "lights %s with neutral greys only: no colour, no glow",
    (id) => {
      const svg = illustrationSvg(id);
      for (const [, hex] of svg.matchAll(/#([0-9a-f]{6})\b/gi)) {
        const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
        // Warm white and graphite: channels within a few steps of each other.
        expect(Math.max(r, g, b) - Math.min(r, g, b), `#${hex}`).toBeLessThanOrEqual(12);
      }
      expect(svg).not.toContain("<filter");
      expect(svg).not.toMatch(/id="(emit|rimlight|floor)"/);
    },
  );
});

describe("ProductIllustration", () => {
  it("renders one decorative element painted by a shared style rule", () => {
    const { container } = render(<ProductIllustration category="lenses" className="aspect-[4/3]" />);
    const el = container.querySelector("[data-shot]");
    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el).toHaveClass("rp-shot-lens", "aspect-[4/3]");
    expect(el?.querySelectorAll("*")).toHaveLength(0);
  });
});
