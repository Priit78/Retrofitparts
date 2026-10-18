import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GlowCard } from "./GlowCard";

describe("GlowCard", () => {
  it("renders its children and merges the class name", () => {
    const { container } = render(
      <GlowCard className="h-full">
        <p>Koito bi-LED</p>
      </GlowCard>,
    );
    expect(screen.getByText("Koito bi-LED")).toBeInTheDocument();
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("h-full");
  });

  it("is a flat card: hairline border, 2px radius, a border change on hover and no light layers", () => {
    const { container } = render(
      <GlowCard>
        <p>Card</p>
      </GlowCard>,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("border", "border-line", "bg-surface", "rounded-[2px]", "hover:border-fg/30");
    // The old cursor light was drawn by decorative layers; none remain.
    expect(container.querySelectorAll("[aria-hidden]")).toHaveLength(0);
    expect(card.getAttribute("style")).toBeNull();
    expect(card.className).not.toMatch(/shadow|blur|gradient/);
  });

  it("keeps the group name the catalog cards hook their hover styles on", () => {
    const { container } = render(
      <GlowCard>
        <p>Card</p>
      </GlowCard>,
    );
    expect(container.firstElementChild).toHaveClass("group/glow");
  });
});
