import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { site } from "@/content/site";
import { InquiryForm } from "./InquiryForm";

// The real action pulls in the Resend SDK; the form only needs a controllable function.
const mocks = vi.hoisted(() => ({ submitInquiry: vi.fn() }));
vi.mock("@/app/actions/inquiry", () => ({ submitInquiry: mocks.submitInquiry }));

beforeEach(() => {
  mocks.submitInquiry.mockReset();
  mocks.submitInquiry.mockResolvedValue({ status: "idle" });
});

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

async function submit(container: HTMLElement) {
  const form = container.querySelector("form");
  if (!form) throw new Error("no form rendered");
  await act(async () => {
    fireEvent.submit(form);
  });
}

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

  it("keeps the dl valid: dt and dd only as children of row divs directly inside the dl", async () => {
    const { ContactDetails } = await import("./ContactDetails");
    const { container } = render(<ContactDetails locale="et" />);
    const list = container.querySelector("dl");
    expect(list).not.toBeNull();
    for (const row of list!.children) {
      expect(row.tagName).toBe("DIV");
      expect([...row.children].map((child) => child.tagName)).toEqual(["DT", "DD"]);
    }
  });

  describe("when the action fails in transport", () => {
    it("shows the phone and email fallback and keeps the typed message instead of crashing", async () => {
      mocks.submitInquiry.mockRejectedValue(new Error("Failed to fetch"));
      const { container } = render(<InquiryForm locale="et" />);
      fill("Nimi", "Mari Maasikas");
      fill("E-post", "mari@example.com");
      fill("Sõnum", "Tahaksin hinnapakkumist.");

      await submit(container);

      expect(mocks.submitInquiry).toHaveBeenCalledTimes(1);
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Päringut ei õnnestunud saata");
      expect(screen.getByRole("link", { name: site.phone })).toHaveAttribute("href", site.phoneHref);
      expect(screen.getByRole("link", { name: site.email })).toHaveAttribute("href", `mailto:${site.email}`);
      // Never claims it was sent, and the text is still in the form.
      expect(screen.queryByText("Päring on saadetud")).toBeNull();
      expect(screen.getByLabelText("Sõnum")).toHaveValue("Tahaksin hinnapakkumist.");
      expect(screen.getByLabelText("Nimi")).toHaveValue("Mari Maasikas");
      expect(screen.getByRole("button", { name: "Saada päring" })).toBeEnabled();
    });

    it("says the same in English", async () => {
      mocks.submitInquiry.mockRejectedValue(new TypeError("NetworkError"));
      const { container } = render(<InquiryForm locale="en" />);
      fill("Name", "Mari Maasikas");
      fill("Message", "Hello");

      await submit(container);

      expect(screen.getByRole("alert")).toHaveTextContent("We could not send your inquiry");
      expect(screen.getByRole("link", { name: site.phone })).toBeInTheDocument();
    });
  });

  describe("results from the action", () => {
    it("shows the success state only when the action reports success", async () => {
      mocks.submitInquiry.mockResolvedValue({ status: "success" });
      const { container } = render(<InquiryForm locale="et" />);

      await submit(container);

      expect(screen.getByRole("heading", { name: "Päring on saadetud" })).toBeInTheDocument();
      expect(container.querySelector("form")).toBeNull();
    });

    it("shows the not-configured banner with phone and email, not success", async () => {
      mocks.submitInquiry.mockResolvedValue({
        status: "error",
        code: "not-configured",
        values: { name: "Mari Maasikas", message: "Tere" },
      });
      const { container } = render(<InquiryForm locale="et" />);

      await submit(container);

      expect(screen.getByRole("alert")).toHaveTextContent("Veebivorm ei ole praegu kasutusel");
      expect(screen.getByRole("link", { name: site.phone })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: site.email })).toBeInTheDocument();
      expect(screen.queryByText("Päring on saadetud")).toBeNull();
      expect(screen.getByLabelText("Nimi")).toHaveValue("Mari Maasikas");
    });

    it("marks fields invalid and links their errors with aria-describedby", async () => {
      mocks.submitInquiry.mockResolvedValue({
        status: "error",
        code: "invalid",
        fieldErrors: { name: "name-length", email: "contact-required", message: "message-required" },
        values: {},
      });
      const { container } = render(<InquiryForm locale="et" />);

      await submit(container);

      for (const label of ["Nimi", "E-post", "Telefon", "Sõnum"]) {
        const field = screen.getByLabelText(label);
        expect(field, label).toHaveAttribute("aria-invalid", "true");
        const described = field.getAttribute("aria-describedby")?.split(" ") ?? [];
        expect(described.length, label).toBeGreaterThan(0);
        for (const id of described) {
          expect(container.querySelector(`[id="${id}"]`)?.textContent, `${label} -> ${id}`).toBeTruthy();
        }
      }
    });
  });
});
