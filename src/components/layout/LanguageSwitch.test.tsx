import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LanguageSwitch } from "./LanguageSwitch";

const nav = vi.hoisted(() => ({ pathname: "/et/catalog/koito-bi-led", search: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => {
  nav.pathname = "/et/catalog/koito-bi-led";
  nav.search = "";
});

describe("LanguageSwitch", () => {
  it("links to the same page in each language and marks the current one", () => {
    render(<LanguageSwitch locale="et" />);
    // The visible code is part of the accessible name (WCAG 2.5.3).
    const et = screen.getByRole("link", { name: "ET – Eesti" });
    const en = screen.getByRole("link", { name: "EN – English" });

    expect(et).toHaveAttribute("href", "/et/catalog/koito-bi-led");
    expect(et).toHaveAttribute("hreflang", "et");
    expect(et).toHaveAttribute("aria-current", "true");

    expect(en).toHaveAttribute("href", "/en/catalog/koito-bi-led");
    expect(en).toHaveAttribute("hreflang", "en");
    expect(en).not.toHaveAttribute("aria-current");
  });

  it("keeps the query, so a filtered catalog stays filtered", () => {
    nav.pathname = "/et/catalog";
    nav.search = "category=lenses&make=BMW";
    render(<LanguageSwitch locale="et" />);
    expect(screen.getByRole("link", { name: "EN – English" })).toHaveAttribute(
      "href",
      "/en/catalog?category=lenses&make=BMW",
    );
  });
});
