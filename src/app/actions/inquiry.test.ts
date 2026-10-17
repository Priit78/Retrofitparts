import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { submitInquiry } from "./inquiry";

// Resend v6 reports API failures as a returned `{ data: null, error }`, not a throw.
const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  construct: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mocks.send };
    constructor(apiKey?: string) {
      mocks.construct(apiKey);
    }
  },
}));

const fields = {
  name: "Mari Maasikas",
  email: "mari@example.com",
  phone: "",
  carMake: "BMW",
  carModel: "F30",
  carYear: "2015",
  topic: "Bi-LED projektorid",
  message: "Tahaksin hinnapakkumist esituledele.",
  locale: "et",
  website: "",
};

function formData(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  for (const [key, value] of Object.entries({ ...fields, ...overrides })) fd.set(key, value);
  return fd;
}

const idle = { status: "idle" } as const;

function configure() {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("INQUIRY_TO_EMAIL", "info@retrofitparts.ee");
  vi.stubEnv("INQUIRY_FROM_EMAIL", "");
}

describe("submitInquiry", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.send.mockReset();
    mocks.construct.mockReset();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    consoleError.mockRestore();
  });

  it("returns success when Resend accepts the message, and sends the built email", async () => {
    configure();
    mocks.send.mockResolvedValue({ data: { id: "email_123" }, error: null, headers: null });

    const state = await submitInquiry(idle, formData());

    expect(state).toEqual({ status: "success" });
    expect(mocks.construct).toHaveBeenCalledWith("re_test_key");
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.send).toHaveBeenCalledWith({
      from: "Retrofit Parts <onboarding@resend.dev>",
      to: "info@retrofitparts.ee",
      replyTo: "mari@example.com",
      subject: "Päring: Bi-LED projektorid — Mari Maasikas",
      text: expect.stringContaining("Tahaksin hinnapakkumist esituledele."),
    });
  });

  it("returns send-failed, never success, when Resend returns an error", async () => {
    configure();
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "The from address is not verified", statusCode: 403 },
      headers: null,
    });

    const state = await submitInquiry(idle, formData());

    expect(state.status).toBe("error");
    expect(state).toMatchObject({ status: "error", code: "send-failed" });
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });

  it("hands the typed values back after a Resend error so nothing is lost", async () => {
    configure();
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "rate_limit_exceeded", message: "Too many requests", statusCode: 429 },
      headers: null,
    });

    const state = await submitInquiry(idle, formData());

    expect(state).toMatchObject({
      status: "error",
      code: "send-failed",
      values: { name: "Mari Maasikas", email: "mari@example.com", message: fields.message },
    });
    // The honeypot and locale are not part of the values the form shows again.
    expect(state).not.toHaveProperty("values.website");
    expect(state).not.toHaveProperty("values.locale");
  });

  it("returns send-failed when the Resend call itself throws (network error)", async () => {
    configure();
    mocks.send.mockRejectedValue(new Error("fetch failed"));

    const state = await submitInquiry(idle, formData());

    expect(state).toMatchObject({ status: "error", code: "send-failed" });
  });

  it("logs the Resend error for the operator without the visitor's message", async () => {
    configure();
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: "invalid_api_key", message: "API key is invalid", statusCode: 401 },
      headers: null,
    });

    await submitInquiry(idle, formData());

    expect(consoleError).toHaveBeenCalledTimes(1);
    const logged = consoleError.mock.calls[0].join(" ");
    expect(logged).toContain("invalid_api_key");
    expect(logged).not.toContain(fields.message);
    expect(logged).not.toContain(fields.email);
  });

  it("returns not-configured without touching Resend when the key is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("INQUIRY_TO_EMAIL", "info@retrofitparts.ee");

    const state = await submitInquiry(idle, formData());

    expect(state).toMatchObject({ status: "error", code: "not-configured", values: { name: "Mari Maasikas" } });
    expect(mocks.construct).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns not-configured when the recipient is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("INQUIRY_TO_EMAIL", "");

    const state = await submitInquiry(idle, formData());

    expect(state).toMatchObject({ status: "error", code: "not-configured" });
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns invalid with field errors and values, and sends nothing, for bad input", async () => {
    configure();

    const state = await submitInquiry(idle, formData({ name: "", email: "", phone: "" }));

    expect(state).toMatchObject({
      status: "error",
      code: "invalid",
      fieldErrors: { name: "name-length", email: "contact-required" },
      values: { message: fields.message },
    });
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("answers success to a filled honeypot without sending anything", async () => {
    configure();

    const state = await submitInquiry(idle, formData({ website: "https://spam.example" }));

    expect(state).toEqual({ status: "success" });
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
