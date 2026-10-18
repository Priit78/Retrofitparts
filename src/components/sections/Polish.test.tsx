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

  it.each(locales)("opens with the unpolished/polished pair and puts the retrofit photo with the parts (%s)", (locale) => {
    render(<Polish locale={locale} />);
    const unpolished = screen.getByRole("img", { name: polish.photos.unpolished.alt[locale] });
    const polished = screen.getByRole("img", { name: polish.photos.polished.alt[locale] });
    const retrofit = screen.getByRole("img", { name: polish.photos.retrofit.alt[locale] });

    // Unpolished first, and both framed and cropped the same way, so the headlight lines up.
    expect(unpolished.compareDocumentPosition(polished) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(polished.className).toBe(unpolished.className);
    expect(polished.parentElement?.className).toBe(unpolished.parentElement?.className);

    // The pair shares the top row with the h2; the retrofit photo sits in the parts row.
    const topRow = screen.getByRole("heading", { level: 2 }).closest("div.grid");
    expect(topRow).toContainElement(unpolished);
    expect(topRow).toContainElement(polished);
    expect(topRow).not.toContainElement(retrofit);
    const partsRow = screen.getByRole("list", { name: polish.partsHeading[locale] }).parentElement;
    expect(partsRow).toContainElement(retrofit);
    expect(partsRow).not.toContainElement(unpolished);
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
      const column = screen.getByRole("group", { name: side.title.en });
      expect(column).toHaveTextContent(side.tag.en);
      expect(within(column).getAllByRole("listitem")).toHaveLength(side.points.length);
      for (const point of side.points) {
        expect(point.et.trim()).not.toBe("");
        expect(column).toHaveTextContent(point.en);
      }
    }
  });
});
