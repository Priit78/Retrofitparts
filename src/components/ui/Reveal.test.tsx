import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Reveal } from "./Reveal";

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Reveal", () => {
  it("shows content immediately under reduced motion", () => {
    mockReducedMotion(true);
    render(<Reveal>Hello</Reveal>);
    const el = screen.getByText("Hello");
    expect(el).toBeVisible();
    expect(el).toHaveAttribute("data-revealed");
    expect(el.getAttribute("style") ?? "").not.toContain("opacity");
  });

  it("reveals right away when IntersectionObserver is unavailable", () => {
    mockReducedMotion(false);
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Reveal>World</Reveal>);
    expect(screen.getByText("World")).toHaveAttribute("data-revealed");
  });

  it("waits for the element to enter the viewport", () => {
    mockReducedMotion(false);
    let trigger: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof trigger) {
          trigger = cb;
        }
        observe() {}
        disconnect() {}
      },
    );
    render(<Reveal>Later</Reveal>);
    const el = screen.getByText("Later");
    expect(el).not.toHaveAttribute("data-revealed");
    trigger([{ isIntersecting: true }]);
    expect(el).toHaveAttribute("data-revealed");
  });
});
