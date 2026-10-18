import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { Header } from "./Header";
import { hasHero } from "./HeaderBackdrop";

const nav = vi.hoisted(() => ({ pathname: "/et" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

function backdrop() {
  return document.querySelector("#site-header > [aria-hidden]") as HTMLElement;
}

function scrollTo(y: number) {
  Object.defineProperty(window, "scrollY", { value: y, configurable: true });
  act(() => {
    window.dispatchEvent(new Event("scroll"));
  });
}

beforeEach(() => {
  nav.pathname = "/et";
  scrollTo(0);
});

afterEach(() => {
  scrollTo(0);
});

describe("Header", () => {
  it("links the text wordmark home and the nav through the locale", () => {
    render(<Header locale="et" />);
    expect(screen.getByRole("link", { name: site.name })).toHaveAttribute("href", "/et");
    const links = within(screen.getByRole("navigation", { name: "Peamenüü" })).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/et#services",
      "/et/catalog",
      "/et#process",
      "/et#faq",
      "/et#contact",
    ]);
  });

  it("keeps the phone link, the language switch and the offer button", () => {
    render(<Header locale="en" />);
    expect(screen.getByRole("link", { name: site.phone })).toHaveAttribute("href", site.phoneHref);
    expect(screen.getByRole("group", { name: "Language" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Request an offer" })).toHaveAttribute("href", "/en#contact");
  });

  it("is transparent over the landing hero, solid after 24 px of scroll, and transparent again back at the top", () => {
    render(<Header locale="et" />);
    expect(backdrop()).not.toHaveAttribute("data-solid");
    expect(backdrop()).toHaveClass("opacity-0");

    scrollTo(24);
    expect(backdrop()).not.toHaveAttribute("data-solid");

    scrollTo(25);
    expect(backdrop()).toHaveAttribute("data-solid");
    expect(backdrop()).toHaveClass("opacity-100", "bg-bg", "border-line");

    scrollTo(24);
    expect(backdrop()).not.toHaveAttribute("data-solid");
    expect(backdrop()).toHaveClass("opacity-0");

    scrollTo(600);
    scrollTo(0);
    expect(backdrop()).not.toHaveAttribute("data-solid");
    expect(backdrop()).toHaveClass("opacity-0");
  });

  it.each(["/et/catalog", "/en/catalog/koito-bi-led", "/et/missing"])(
    "starts solid on pages without a hero (%s)",
    (pathname) => {
      nav.pathname = pathname;
      render(<Header locale={pathname.startsWith("/en") ? "en" : "et"} />);
      expect(backdrop()).toHaveAttribute("data-solid");
      expect(backdrop()).toHaveClass("opacity-100");
    },
  );
});

describe("hasHero", () => {
  it("is true only on the locale root", () => {
    expect(hasHero("/et", "et")).toBe(true);
    expect(hasHero("/en/", "en")).toBe(true);
    expect(hasHero("/en", "et")).toBe(false);
    expect(hasHero("/et/catalog", "et")).toBe(false);
    expect(hasHero("", "et")).toBe(false);
  });
});
