import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LanguageSwitch } from "./LanguageSwitch";

vi.mock("next/navigation", () => ({ usePathname: () => "/et/catalog/koito-bi-led" }));

describe("LanguageSwitch", () => {
  it("links to the same page in each language and marks the current one", () => {
    render(<LanguageSwitch locale="et" />);
    const et = screen.getByRole("link", { name: "Eesti" });
    const en = screen.getByRole("link", { name: "English" });

    expect(et).toHaveAttribute("href", "/et/catalog/koito-bi-led");
    expect(et).toHaveAttribute("hreflang", "et");
    expect(et).toHaveAttribute("aria-current", "true");

    expect(en).toHaveAttribute("href", "/en/catalog/koito-bi-led");
    expect(en).toHaveAttribute("hreflang", "en");
    expect(en).not.toHaveAttribute("aria-current");
  });
});
