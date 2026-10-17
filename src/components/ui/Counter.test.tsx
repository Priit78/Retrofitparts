import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Counter } from "./Counter";

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: reduce && query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
}

/** The number sighted users see (the screen-reader copy is a separate, static node). */
function visibleNumber(container: HTMLElement) {
  return container.querySelector("[aria-hidden]")?.textContent;
}

afterEach(() => vi.unstubAllGlobals());

describe("Counter", () => {
  it("renders the final value immediately under reduced motion", () => {
    mockReducedMotion(true);
    const { container } = render(<Counter to={2015} />);
    expect(visibleNumber(container)).toBe("2015");
    expect(screen.getByText("2015", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("renders the final value on the server", () => {
    const host = document.createElement("div");
    host.innerHTML = renderToString(<Counter to={2015} />);
    // The visible digits and the screen-reader copy both carry the final value.
    expect(visibleNumber(host)).toBe("2015");
    expect(host.querySelector(".sr-only")?.textContent).toBe("2015");
  });

  it("includes the prefix and suffix", () => {
    mockReducedMotion(true);
    const { container } = render(<Counter to={10} suffix="+" prefix="~" />);
    expect(visibleNumber(container)).toBe("~10+");
  });

  it("shows the final value when IntersectionObserver is unavailable", () => {
    mockReducedMotion(false);
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<Counter to={42} />);
    expect(visibleNumber(container)).toBe("42");
  });

  it("starts from zero and counts up once it scrolls into view", async () => {
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
    const { container } = render(<Counter to={12} duration={0.05} />);
    await vi.waitFor(() => expect(visibleNumber(container)).toBe("0"));
    act(() => trigger([{ isIntersecting: true }]));
    await vi.waitFor(() => expect(visibleNumber(container)).toBe("12"), { timeout: 2000 });
    // Screen readers always get the real figure.
    expect(screen.getByText("12", { selector: ".sr-only" })).toBeInTheDocument();
  });
});
