import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/content/site";
import { logoPath } from "./logo";
import { Wordmark } from "./Wordmark";

describe("Wordmark", () => {
  it("draws the client's lettering as one labelled image in the brand colour", () => {
    render(<Wordmark />);
    const logo = screen.getByRole("img", { name: site.name });
    expect(logo).toHaveClass("text-brand");
    expect(logo.querySelector("path")).toHaveAttribute("d", logoPath);
  });
});
