import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Difference } from "@/components/sections/Difference";
import { difference } from "@/content/difference";
import { locales } from "@/lib/i18n";

function mockBrowser() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Difference", () => {
  it("renders the slider, both labelled scenes and three facts", () => {
    mockBrowser();
    render(<Difference locale="et" />);
    expect(screen.getByRole("slider", { name: difference.slider.label.et })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: difference.before.scene.et })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: difference.after.scene.et })).toBeInTheDocument();
    expect(screen.getByText("Enne", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("Pärast", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: difference.factsLabel.et }).children).toHaveLength(3);
  });

  it("states only general physics: no percentages or 'times brighter' claims", () => {
    for (const locale of locales) {
      for (const fact of difference.facts) {
        const text = [fact.title, fact.body, fact.before, fact.after].map((x) => x[locale]).join(" ");
        expect(text).not.toMatch(/%|\d+\s*[x×]|times|korda/i);
        // The only numbers are the colour temperatures.
        for (const number of text.match(/\d+/g) ?? []) {
          expect(["3200", "5500", "6000"]).toContain(number);
        }
      }
    }
  });
});
