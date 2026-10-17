import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { Hero } from "./Hero";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  // jsdom has no canvas; the beam simply does not draw.
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Hero", () => {
  it.each(["et", "en"] as const)("uses the tagline as the only h1 (%s)", (locale) => {
    render(<Hero locale={locale} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(site.tagline[locale]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("keeps the h1 visible at first paint: it only moves, it never fades", () => {
    render(<Hero locale="et" />);
    const h1 = screen.getByRole("heading", { level: 1 });
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
    expect(screen.getByText(/tuleklaaside vahetus/)).toHaveTextContent(String(site.founded));
    render(<Hero locale="en" />);
    const subline = screen.getByText(/lens replacement/);
    expect(subline).toHaveTextContent(/Projector retrofits/);
    expect(subline).toHaveTextContent(/restoration/);
    expect(subline).toHaveTextContent(/Tallinn workshop since 2015/);
  });

  it("links the primary CTA to the contact section and the secondary to the catalog", () => {
    render(<Hero locale="en" />);
    expect(screen.getByRole("link", { name: /Request an offer/ })).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: "View catalog" })).toHaveAttribute("href", "/en/catalog");
  });

  it("shows four trust items built from the site facts", () => {
    render(<Hero locale="et" />);
    const items = within(screen.getByRole("list", { name: "Miks Retrofit Parts" })).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent(`${site.experienceYears} aastat kogemust`);
    expect(items[1]).toHaveTextContent(`${site.warrantyYears}-aastane garantii`);
    expect(items[2]).toHaveTextContent("Ametlik esindaja");
    for (const brand of site.representedBrands) expect(items[2]).toHaveTextContent(brand);
    expect(items[3]).toHaveTextContent(site.address.street);
  });

  it("hides the decorative lens and beam from assistive tech", () => {
    const { container } = render(<Hero locale="et" />);
    expect(container.querySelector(".pl-root")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
  });
});
