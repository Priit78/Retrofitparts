import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("shows the legal line, contact facts and localized closed days", () => {
    render(<Footer locale="et" />);
    expect(screen.getByText("Retrofit Parts OÜ · Reg. 12908331 · KMKR EE101821324")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+372 5667 0631" })).toHaveAttribute("href", "tel:+37256670631");
    expect(screen.getByRole("link", { name: "info@retrofitparts.ee" })).toHaveAttribute(
      "href",
      "mailto:info@retrofitparts.ee",
    );
    expect(screen.getByText("09:00–18:00")).toBeInTheDocument();
    expect(screen.getByText("Suletud")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Teenused" })).toHaveAttribute("href", "/et#services");
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument();
  });

  it("is fully English on /en", () => {
    render(<Footer locale="en" />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
    expect(screen.getByText("Mon–Thu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Catalog" })).toHaveAttribute("href", "/en/catalog");
  });
});
