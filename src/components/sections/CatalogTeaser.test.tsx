import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { catalog } from "@/content/catalog";
import { products } from "@/data/products";
import type { CategoryId } from "@/data/types";
import { filterProducts, parseFilters } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { CatalogTeaser } from "./CatalogTeaser";

const tileIds = ["lenses", "led", "xenon"] as const;

function tile(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-teaser-tile="${id}"]`);
  if (!el) throw new Error(`no tile ${id}`);
  return el;
}

/** The tile's main link: the one in its title. */
function mainLink(id: string) {
  const link = tile(id).querySelector<HTMLAnchorElement>("h3 a");
  if (!link) throw new Error(`no main link in ${id}`);
  return link;
}

/** What the catalog lists for a link, using its own URL parsing and filter. */
function listedBy(href: string, locale: Locale) {
  const query = href.split("?")[1] ?? "";
  return filterProducts(products, parseFilters(new URLSearchParams(query)), locale);
}

describe("CatalogTeaser", () => {
  it("shows three photo tiles, each linking to the catalog filtered by every category it covers", () => {
    render(<CatalogTeaser locale="et" />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    const expected: Record<(typeof tileIds)[number], string> = {
      lenses: "/et/catalog?category=lenses",
      led: "/et/catalog?category=led-projectors,led-lights",
      xenon: "/et/catalog?category=xenon-projectors,xenon-bulbs,ballasts",
    };
    for (const id of tileIds) {
      const link = mainLink(id);
      expect(link).toHaveTextContent(catalog.teaser.tiles[id].title.et);
      expect(link).toHaveAttribute("href", expected[id]);
      expect(within(tile(id)).getByRole("img")).toHaveAttribute("alt", catalog.teaser.tiles[id].alt.et);
    }
  });

  it.each(["et", "en"] as const)(
    "shows on each tile exactly the number of products its link lists (%s)",
    (locale) => {
      render(<CatalogTeaser locale={locale} />);
      for (const id of tileIds) {
        const listed = listedBy(mainLink(id).getAttribute("href") ?? "", locale);
        expect(listed.length, id).toBeGreaterThan(0);
        const count = tile(id).querySelector("[data-tile-count]");
        expect(count, id).toHaveAttribute("data-tile-count", String(listed.length));
        expect(count?.textContent, id).toMatch(
          new RegExp(`^${catalog.productCount[locale](listed.length)}`),
        );
      }
    },
  );

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
      const href = `/en/catalog?category=${category}`;
      const listed = listedBy(href, "en");
      if (listed.length === 0) continue;
      const link = within(tile(id))
        .getAllByRole("link")
        .find((a) => !a.closest("h3") && a.getAttribute("href") === href);
      expect(link, category).toBeDefined();
      expect(link).toHaveTextContent(String(listed.length));
    }
  });

  it("links to the whole catalog with the total, and no longer shows featured products", () => {
    const { container } = render(<CatalogTeaser locale="et" />);
    expect(
      screen.getByRole("link", { name: catalog.teaser.viewAll.et(products.length) }),
    ).toHaveAttribute("href", "/et/catalog");
    expect(container.querySelector("[data-product-card]")).toBeNull();
  });
});
