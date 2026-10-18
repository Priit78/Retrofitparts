import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { catalog } from "@/content/catalog";
import { products } from "@/data/products";
import type { CategoryId } from "@/data/types";
import { CatalogTeaser } from "./CatalogTeaser";

const count = (...ids: CategoryId[]) => products.filter((p) => ids.includes(p.category)).length;

function tile(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-teaser-tile="${id}"]`);
  if (!el) throw new Error(`no tile ${id}`);
  return within(el);
}

describe("CatalogTeaser", () => {
  it("shows three photo tiles that link to the catalog filtered by their main category", () => {
    render(<CatalogTeaser locale="et" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(tile("lenses").getByRole("link", { name: "Tuleklaasid" })).toHaveAttribute(
      "href",
      "/et/catalog?category=lenses",
    );
    expect(tile("led").getByRole("link", { name: "LED projektorid ja kaugtuled" })).toHaveAttribute(
      "href",
      "/et/catalog?category=led-projectors",
    );
    expect(tile("xenon").getByRole("link", { name: "Xenon" })).toHaveAttribute(
      "href",
      "/et/catalog?category=xenon-projectors",
    );
    for (const id of ["lenses", "led", "xenon"]) {
      expect(tile(id).getByRole("img")).toHaveAttribute("alt", catalog.teaser.tiles[id as "led"].alt.et);
    }
  });

  it("counts the real products of every category a tile covers", () => {
    render(<CatalogTeaser locale="et" />);
    const lenses = count("lenses");
    const led = count("led-projectors", "led-lights");
    const xenon = count("xenon-projectors", "xenon-bulbs", "ballasts");
    expect(lenses).toBeGreaterThan(0);
    expect(tile("lenses").getByText(new RegExp(`^${lenses} toodet`))).toBeInTheDocument();
    expect(tile("led").getByText(`${led} toodet`)).toBeInTheDocument();
    expect(tile("xenon").getByText(`${xenon} toodet`)).toBeInTheDocument();
  });

  it("lists each grouped category with its own count and filtered link", () => {
    render(<CatalogTeaser locale="en" />);
    const parts: [string, CategoryId][] = [
      ["led", "led-projectors"],
      ["led", "led-lights"],
      ["xenon", "xenon-projectors"],
      ["xenon", "xenon-bulbs"],
      ["xenon", "ballasts"],
    ];
    for (const [id, category] of parts) {
      if (count(category) === 0) continue;
      const link = tile(id)
        .getAllByRole("link")
        .find((a) => !a.closest("h3") && a.getAttribute("href") === `/en/catalog?category=${category}`);
      expect(link, category).toBeDefined();
      expect(link).toHaveTextContent(String(count(category)));
    }
  });

  it("links to the whole catalog with the total, and no longer shows featured products", () => {
    const { container } = render(<CatalogTeaser locale="et" />);
    expect(
      screen.getByRole("link", { name: `Vaata kogu kataloogi (${products.length} toodet)` }),
    ).toHaveAttribute("href", "/et/catalog");
    expect(container.querySelector("[data-product-card]")).toBeNull();
  });
});
