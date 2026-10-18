import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { hero } from "@/content/hero";
import { site } from "@/content/site";
import { Hero } from "./Hero";

describe("Hero", () => {
  it.each(["et", "en"] as const)("has one h1 with the headline (%s)", (locale) => {
    render(<Hero locale={locale} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(hero.title[locale].join(" "));
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("shows the agreed headline", () => {
    render(<Hero locale="et" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Selge valgus. Kindel töö.");
    render(<Hero locale="en" />);
    expect(screen.getByRole("heading", { name: "Clear light. Solid work." })).toBeInTheDocument();
  });

  it("keeps the h1 visible at first paint: never in a Reveal, it only moves and never fades", () => {
    render(<Hero locale="et" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.closest("[data-reveal]")).toBeNull();
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
    const et = screen.getByText(/tuleklaase/);
    expect(et).toHaveTextContent(/projektoreid/);
    expect(et).toHaveTextContent(/taastame esitulesid/);
    expect(et).toHaveTextContent(`Tallinnas, alates ${site.founded}`);
    render(<Hero locale="en" />);
    const en = screen.getByText(/replace hazed lenses/);
    expect(en).toHaveTextContent(/projectors/);
    expect(en).toHaveTextContent(/restore headlights/);
    expect(en).toHaveTextContent(`Tallinn workshop, since ${site.founded}`);
  });

  it("loads the photo eagerly with localized alt text", () => {
    render(<Hero locale="en" />);
    const photo = screen.getByRole("img", { name: hero.photoAlt.en });
    expect(photo).not.toHaveAttribute("loading", "lazy");
    expect(photo).toHaveAttribute("sizes");
  });

  it("links the primary CTA to the contact section and the secondary to the catalog", () => {
    render(<Hero locale="en" />);
    expect(screen.getByRole("link", { name: "Request an offer" })).toHaveAttribute("href", "#contact");
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
});
