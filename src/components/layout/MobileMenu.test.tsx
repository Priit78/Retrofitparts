import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileMenu } from "./MobileMenu";

vi.mock("next/navigation", () => ({
  usePathname: () => "/et",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  // Reduced motion makes the sheet appear and leave without animation.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.style.overflow = "";
});

function openMenu() {
  render(<MobileMenu locale="et" />);
  const toggle = screen.getByRole("button", { name: "Ava menüü" });
  fireEvent.click(toggle);
  return { toggle, dialog: screen.getByRole("dialog", { name: "Menüü" }) };
}

describe("MobileMenu", () => {
  it("starts closed", () => {
    render(<MobileMenu locale="et" />);
    expect(screen.getByRole("button", { name: "Ava menüü" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens a modal sheet, focuses the close button and locks page scroll", () => {
    const { toggle, dialog } = openMenu();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByRole("button", { name: "Sulge menüü" })).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("hidden");
  });

  it("links every nav item through the locale", () => {
    openMenu();
    expect(screen.getByRole("link", { name: /Teenused/ })).toHaveAttribute("href", "/et#services");
    expect(screen.getByRole("link", { name: /Kataloog/ })).toHaveAttribute("href", "/et/catalog");
    expect(screen.getByRole("link", { name: /Küsi pakkumist/ })).toHaveAttribute("href", "/et#contact");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const { toggle } = openMenu();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
    expect(document.documentElement.style.overflow).toBe("");
  });

  it("closes when a link is clicked", async () => {
    openMenu();
    const link = screen.getByRole("link", { name: /Tööprotsess/ });
    link.addEventListener("click", (event) => event.preventDefault()); // jsdom can't navigate
    fireEvent.click(link);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("traps focus inside the sheet", () => {
    const { dialog } = openMenu();
    const focusable = dialog.querySelectorAll<HTMLElement>("a[href], button");
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(first).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });
});
