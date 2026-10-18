import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { catalog } from "@/content/catalog";
import { products } from "@/data/products";
import type { CategoryId } from "@/data/types";
import { filterProducts, parseFilters } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { CatalogTeaser } from "./CatalogTeaser";

/** The category tiles, in strip order; the closing card ("all") follows them. */
const tileIds = ["lenses", "headlights", "led", "xenon"] as const;

function tile(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-teaser-tile="${id}"]`);
  if (!el) throw new Error(`no tile ${id}`);
  return el;
}

/** The tile's main link: the one in its title, or the closing card itself. */
function mainLink(id: string) {
  const link = tile(id).querySelector<HTMLAnchorElement>("h3 a, a[data-tile-link]");
  if (!link) throw new Error(`no main link in ${id}`);
  return link;
}

/** What the catalog lists for a link, using its own URL parsing and filter. */
function listedBy(href: string, locale: Locale) {
  const query = href.split("?")[1] ?? "";
  return filterProducts(products, parseFilters(new URLSearchParams(query)), locale);
}

/** The unit the complete-headlights tile shows: the first headlight the client has photographed. */
const unit = products.find((product) => product.category === "headlights" && product.image);

beforeEach(() => {
  // A static visit (no pinning): the strip is a swipe row.
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

describe("CatalogTeaser", () => {
  it("is the catalog chapter, named by its heading", () => {
    render(<CatalogTeaser locale="et" />);
    expect(screen.getByRole("region", { name: catalog.teaser.title.et })).toHaveAttribute("id", "catalog-teaser");
  });

  it("shows five tile links in order: lenses, complete headlights, LED, xenon, the whole catalog", () => {
    render(<CatalogTeaser locale="et" />);
    const order = [...document.querySelectorAll("[data-teaser-tile]")].map((el) => el.getAttribute("data-teaser-tile"));
    expect(order).toEqual([...tileIds, "all"]);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);

    const expected: Record<(typeof tileIds)[number] | "all", string> = {
      lenses: "/et/catalog?category=lenses",
      headlights: "/et/catalog?category=headlights",
      led: "/et/catalog?category=led-projectors,led-lights",
      xenon: "/et/catalog?category=xenon-projectors,xenon-bulbs,ballasts",
      all: "/et/catalog",
    };
    for (const id of [...tileIds, "all"] as const) {
      expect(mainLink(id), id).toHaveAttribute("href", expected[id]);
    }
    for (const id of tileIds) {
      expect(mainLink(id)).toHaveTextContent(catalog.teaser.tiles[id].title.et);
      expect(within(tile(id)).getByRole("img")).toHaveAttribute("alt", catalog.teaser.tiles[id].alt.et);
    }
  });

  it("shows a real product photo, framed, on the complete-headlights tile", () => {
    expect(unit?.image).toMatch(/^\/products\//);
    render(<CatalogTeaser locale="en" />);
    const frame = tile("headlights").querySelector('[data-media="photo"]');
    expect(frame).not.toBeNull();
    const img = within(tile("headlights")).getByRole("img");
    expect(decodeURIComponent(img.getAttribute("src") ?? "")).toContain(unit?.image);
    expect(img).toHaveAttribute("alt", catalog.teaser.tiles.headlights.alt.en);
  });

  it("leaves out the complete-headlights tile while no headlight has a photo", async () => {
    vi.resetModules();
    vi.doMock("@/data/products", async (importOriginal) => {
      const data = await importOriginal<typeof import("@/data/products")>();
      return {
        ...data,
        products: data.products.map((product) =>
          product.category === "headlights" ? { ...product, image: undefined } : product,
        ),
      };
    });
    try {
      const { CatalogTeaser: WithoutPhotos } = await import("./CatalogTeaser");
      render(<WithoutPhotos locale="et" />);
      const order = [...document.querySelectorAll("[data-teaser-tile]")].map((el) =>
        el.getAttribute("data-teaser-tile"),
      );
      expect(order).toEqual(["lenses", "led", "xenon", "all"]);
      expect(screen.queryByText(catalog.teaser.tiles.headlights.title.et)).toBeNull();
    } finally {
      vi.doUnmock("@/data/products");
      vi.resetModules();
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

  it.each(["et", "en"] as const)("closes with a card to the whole catalog and its total (%s)", (locale) => {
    const { container } = render(<CatalogTeaser locale={locale} />);
    const { title, count } = catalog.teaser.closing;
    const link = screen.getByRole("link", { name: `${title[locale]} ${count[locale](products.length)}` });
    expect(link).toHaveAttribute("href", `/${locale}/catalog`);
    expect(link.closest("[data-teaser-tile]")).toHaveAttribute("data-teaser-tile", "all");
    expect(link.querySelector("[data-tile-count]")).toHaveAttribute("data-tile-count", String(products.length));
    expect(link).toHaveTextContent(String(products.length));
    // No featured product cards, as before.
    expect(container.querySelector("[data-product-card]")).toBeNull();
  });
});
