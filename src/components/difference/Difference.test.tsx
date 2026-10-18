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
  it.each(locales)("renders the slider over two versions of the photo, and three facts (%s)", (locale) => {
    mockBrowser();
    render(<Difference locale={locale} />);
    const slider = screen.getByRole("slider", { name: difference.slider.label[locale] });
    expect(slider).toHaveAccessibleDescription(difference.slider.hint[locale]);

    const before = screen.getByRole("img", { name: difference.before.photo[locale] });
    const after = screen.getByRole("img", { name: difference.after.photo[locale] });
    expect(before.getAttribute("src")).toBe(after.getAttribute("src"));
    expect(before.style.filter).toContain("sepia");
    expect(after.style.filter).not.toContain("sepia");

    expect(screen.getByText(difference.before.label[locale], { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(difference.after.label[locale], { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText(difference.slider.note[locale])).toBeInTheDocument();
    expect(screen.getByRole("list", { name: difference.factsLabel[locale] }).children).toHaveLength(3);
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
