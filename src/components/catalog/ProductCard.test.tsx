import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Product } from "@/data/types";
import { ProductCard } from "./ProductCard";

/** A placeholder product, shaped like the client's used OEM headlight listings. */
const unit: Product = {
  slug: "test-headlight-unit",
  name: { et: "Testi esituli", en: "Test headlight" },
  category: "headlights",
  brand: "Hella",
  makes: ["BMW"],
  price: 420,
  stock: "in-stock",
  description: { et: "Kirjeldus.", en: "Description." },
  specs: [],
  fitment: [],
  image: "/products/test-headlight-unit.jpg",
};

describe("ProductCard", () => {
  it("shows the real photo when the product has one, contained on a neutral backdrop", () => {
    const { container } = render(<ProductCard product={unit} locale="et" onInquire={vi.fn()} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain(encodeURIComponent("/products/test-headlight-unit.jpg"));
    expect(img).toHaveAttribute("sizes");
    expect(img).toHaveClass("object-contain");
    expect(container.querySelector("[data-media]")).toHaveAttribute("data-media", "photo");
    expect(container.querySelector("[data-shot]")).toBeNull();
  });

  it("falls back to the category render without a photo", () => {
    const { container } = render(
      <ProductCard product={{ ...unit, image: undefined }} locale="et" onInquire={vi.fn()} />,
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[data-shot]")).toHaveAttribute("data-shot", "headlight");
  });

  it("links the name to the product page and keeps the neutral stock wording", () => {
    render(<ProductCard product={unit} locale="en" onInquire={vi.fn()} />);
    expect(screen.getByRole("link", { name: "Test headlight" })).toHaveAttribute(
      "href",
      "/en/catalog/test-headlight-unit",
    );
    expect(screen.getByText("In stock")).toBeInTheDocument();
    render(<ProductCard product={{ ...unit, slug: "b", stock: "backorder" }} locale="et" onInquire={vi.fn()} />);
    expect(screen.getByText("Tellimisel")).toBeInTheDocument();
  });

  it("opens the inquiry for this product, or links to it without a handler", () => {
    const onInquire = vi.fn();
    render(<ProductCard product={unit} locale="et" onInquire={onInquire} />);
    fireEvent.click(screen.getByRole("button", { name: "Küsi pakkumist" }));
    expect(onInquire).toHaveBeenCalledExactlyOnceWith(unit);

    render(<ProductCard product={{ ...unit, slug: "c" }} locale="et" inquireHref="#inquiry" />);
    expect(screen.getByRole("link", { name: "Küsi pakkumist" })).toHaveAttribute("href", "#inquiry");
  });

  it("asks for the price when there is none", () => {
    render(<ProductCard product={{ ...unit, price: null }} locale="et" onInquire={vi.fn()} />);
    expect(screen.getByText("Küsi hinda")).toBeInTheDocument();
  });
});
