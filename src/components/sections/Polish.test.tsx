import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { polish } from "@/content/polish";
import { locales } from "@/lib/i18n";
import { Polish } from "./Polish";

describe("Polish", () => {
  it.each(locales)("keeps the #anatomy anchor and shows both captioned photos (%s)", (locale) => {
    const { container } = render(<Polish locale={locale} />);
    expect(container.querySelector("section")).toHaveAttribute("id", "anatomy");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(polish.title[locale]);

    for (const photo of Object.values(polish.photos)) {
      const figure = screen.getByRole("img", { name: photo.alt[locale] }).closest("figure");
      expect(figure).toHaveTextContent(photo.caption[locale]);
    }
  });

  it.each(locales)("lists the four headlight parts front to back, numbered (%s)", (locale) => {
    render(<Polish locale={locale} />);
    const items = within(screen.getByRole("list", { name: polish.partsHeading[locale] })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual(
      polish.parts.map((part, index) => `0${index + 1}${part.name[locale]}${part.body[locale]}`),
    );
  });

  it("compares polishing with replacing, every point in both languages", () => {
    render(<Polish locale="en" />);
    for (const side of [polish.compare.polish, polish.compare.replace]) {
      const column = screen.getByRole("heading", { name: side.title.en }).parentElement?.parentElement as HTMLElement;
      expect(column).toHaveTextContent(side.tag.en);
      expect(within(column).getAllByRole("listitem")).toHaveLength(side.points.length);
      for (const point of side.points) {
        expect(point.et.trim()).not.toBe("");
        expect(column).toHaveTextContent(point.en);
      }
    }
  });
});
