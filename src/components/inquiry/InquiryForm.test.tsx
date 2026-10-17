import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InquiryForm } from "./InquiryForm";

// The real action pulls in the Resend SDK; the form only needs the function to exist.
vi.mock("@/app/actions/inquiry", () => ({
  submitInquiry: vi.fn(async () => ({ status: "idle" })),
}));

describe("InquiryForm", () => {
  it("gives every control a label, in both languages", () => {
    const { unmount } = render(<InquiryForm locale="et" />);
    for (const label of ["Nimi", "E-post", "Telefon", "Mark", "Mudel", "Aasta", "Teenus või toode", "Sõnum"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    unmount();

    render(<InquiryForm locale="en" />);
    for (const label of ["Name", "Email", "Phone", "Make", "Model", "Year", "Service or product", "Message"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("uses unique ids when several forms share a page", () => {
    const { container } = render(
      <>
        <InquiryForm locale="et" />
        <InquiryForm locale="et" compact defaultTopic="Morimoto XB LED" />
      </>,
    );
    const ids = [...container.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids.length).toBeGreaterThan(8);
    expect(new Set(ids).size).toBe(ids.length);

    // Each label points at a control inside its own form.
    for (const form of container.querySelectorAll("form")) {
      for (const label of form.querySelectorAll("label[for]")) {
        expect(form.querySelector(`[id="${label.getAttribute("for")}"]`)).not.toBeNull();
      }
    }
  });

  it("pre-fills the topic from defaultTopic", () => {
    render(<InquiryForm locale="et" defaultTopic="Morimoto XB LED" />);
    expect(screen.getByLabelText("Teenus või toode")).toHaveValue("Morimoto XB LED");
  });

  it("sends the locale and carries a hidden honeypot named website", () => {
    const { container } = render(<InquiryForm locale="en" />);
    expect(container.querySelector('input[name="locale"]')).toHaveValue("en");
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest("[aria-hidden]")).not.toBeNull();
  });

  it("starts without any error or success message", () => {
    const { container } = render(<InquiryForm locale="et" />);
    expect(container.querySelector('[aria-invalid="true"]')).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(screen.getByRole("button", { name: "Saada päring" })).toBeEnabled();
  });
});
