import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FaqAccordion } from "./FaqAccordion";

const items = [
  { id: "fitment", question: "How do I know a product fits?", answer: "The product pages list the cars." },
  { id: "stock", question: "Can I order out of stock?", answer: "Yes, delivery just takes longer." },
];

beforeEach(() => {
  // Reduced motion: panels open and close at once, without the height animation.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("FaqAccordion", () => {
  it("wires each question button to a labelled answer region", () => {
    render(<FaqAccordion items={items} defaultOpen="fitment" />);
    const button = screen.getByRole("button", { name: items[0].question });
    const panelId = button.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    const panel = document.getElementById(panelId!);
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", button.id);
    expect(button.closest("h3")).not.toBeNull();
  });

  it("opens the default item and keeps the others closed", () => {
    render(<FaqAccordion items={items} defaultOpen="fitment" />);
    expect(screen.getByRole("button", { name: items[0].question })).toHaveAttribute("aria-expanded", "true");
    const closed = screen.getByRole("button", { name: items[1].question });
    expect(closed).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById(closed.getAttribute("aria-controls")!)).toHaveAttribute("data-collapsed");
  });

  it("toggles a question open and closed", () => {
    render(<FaqAccordion items={items} defaultOpen="fitment" />);
    const button = screen.getByRole("button", { name: items[1].question });
    const panel = document.getElementById(button.getAttribute("aria-controls")!)!;

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("data-collapsed");

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveAttribute("data-collapsed");
  });

  it("keeps every answer in the markup, so it reads without JavaScript", () => {
    render(<FaqAccordion items={items} />);
    for (const item of items) expect(screen.getByText(item.answer)).toBeInTheDocument();
  });
});
