import { describe, expect, it, vi } from "vitest";
import {
  buildInquiryEmail,
  deliverInquiry,
  parseInquiry,
  readInquiryValues,
  type InquiryInput,
} from "./inquiry";

const valid: InquiryInput = {
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
  for (const [key, value] of Object.entries({ ...valid, ...overrides })) fd.set(key, value);
  return fd;
}

const fullEnv = {
  RESEND_API_KEY: "re_test_key",
  INQUIRY_TO_EMAIL: "info@retrofitparts.ee",
};

describe("parseInquiry", () => {
  it("parses valid data", () => {
    const result = parseInquiry(formData());
    expect(result).toEqual({ ok: true, data: valid });
  });

  it("accepts a phone number without an email", () => {
    const result = parseInquiry(formData({ email: "", phone: "+372 5667 0631" }));
    expect(result.ok).toBe(true);
  });

  it("accepts an email without a phone number", () => {
    const result = parseInquiry(formData({ email: "mari@example.com", phone: "" }));
    expect(result.ok).toBe(true);
  });

  it("trims whitespace around values", () => {
    const result = parseInquiry(formData({ name: "  Mari Maasikas  ", message: "  Tere  " }));
    expect(result.ok && result.data.name).toBe("Mari Maasikas");
    expect(result.ok && result.data.message).toBe("Tere");
  });

  it("puts a field error on email when both email and phone are missing", () => {
    const result = parseInquiry(formData({ email: "", phone: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.email).toBe("contact-required");
      expect(Object.keys(result.fieldErrors)).toEqual(["email"]);
    }
  });

  it("treats whitespace-only contact fields as missing", () => {
    const result = parseInquiry(formData({ email: "   ", phone: "  " }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.email).toBe("contact-required");
  });

  it("rejects an invalid email", () => {
    const result = parseInquiry(formData({ email: "not-an-email" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.email).toBe("email-invalid");
  });

  it("rejects an invalid phone number", () => {
    const result = parseInquiry(formData({ email: "", phone: "call me maybe" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.phone).toBe("phone-invalid");
  });

  it("rejects a phone number that is too short or too long", () => {
    const short = parseInquiry(formData({ phone: "12345" }));
    const long = parseInquiry(formData({ phone: "1".repeat(21) }));
    expect(short.ok).toBe(false);
    expect(long.ok).toBe(false);
  });

  it("accepts the phone characters digits, spaces, plus, dash and parentheses", () => {
    const result = parseInquiry(formData({ phone: "+372 (56) 670-631" }));
    expect(result.ok).toBe(true);
  });

  it("rejects a name that is too short or too long", () => {
    const short = parseInquiry(formData({ name: "M" }));
    const long = parseInquiry(formData({ name: "M".repeat(101) }));
    expect(short.ok === false && short.fieldErrors.name).toBe("name-length");
    expect(long.ok === false && long.fieldErrors.name).toBe("name-length");
  });

  it("requires a message", () => {
    const result = parseInquiry(formData({ message: "   " }));
    expect(result.ok === false && result.fieldErrors.message).toBe("message-required");
  });

  it("fails a message over 2000 characters", () => {
    const result = parseInquiry(formData({ message: "a".repeat(2001) }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.message).toBe("too-long");
  });

  it("accepts a message of exactly 2000 characters", () => {
    expect(parseInquiry(formData({ message: "a".repeat(2000) })).ok).toBe(true);
  });

  it("limits the car fields to 60 characters and the topic to 200", () => {
    const car = parseInquiry(formData({ carMake: "a".repeat(61) }));
    const topic = parseInquiry(formData({ topic: "a".repeat(201) }));
    expect(car.ok === false && car.fieldErrors.carMake).toBe("too-long");
    expect(topic.ok === false && topic.fieldErrors.topic).toBe("too-long");
  });

  it("treats missing optional fields as empty", () => {
    const fd = new FormData();
    fd.set("name", "Mari Maasikas");
    fd.set("email", "mari@example.com");
    fd.set("message", "Tere");
    fd.set("locale", "en");
    const result = parseInquiry(fd);
    expect(result.ok).toBe(true);
  });

  it("rejects an unknown locale", () => {
    const result = parseInquiry(formData({ locale: "ru" }));
    expect(result.ok === false && result.fieldErrors.locale).toBe("invalid");
  });

  it("reports several field errors at once", () => {
    const result = parseInquiry(formData({ name: "", message: "", email: "", phone: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "message", "name"]);
    }
  });

  it("does not fail validation when the honeypot is filled", () => {
    const result = parseInquiry(formData({ website: "https://spam.example" }));
    expect(result.ok).toBe(true);
  });
});

describe("readInquiryValues", () => {
  it("returns the visible fields as strings and leaves out the honeypot and locale", () => {
    const values = readInquiryValues(formData({ website: "x" }));
    expect(values.name).toBe("Mari Maasikas");
    expect(values.message).toBe("Tahaksin hinnapakkumist esituledele.");
    expect(values).not.toHaveProperty("website");
    expect(values).not.toHaveProperty("locale");
  });
});

describe("buildInquiryEmail", () => {
  it("builds the subject from the topic and name", () => {
    const { subject } = buildInquiryEmail(valid);
    expect(subject).toBe("Päring: Bi-LED projektorid — Mari Maasikas");
  });

  it("falls back to 'üldine' when there is no topic", () => {
    const { subject } = buildInquiryEmail({ ...valid, topic: "" });
    expect(subject).toBe("Päring: üldine — Mari Maasikas");
  });

  it("keeps header injection out of the subject", () => {
    const { subject } = buildInquiryEmail({
      ...valid,
      topic: "Hind\r\nBcc: spam@example.com",
    });
    expect(subject).not.toMatch(/[\r\n]/);
  });

  it("lists contact details, car, language and message in the body", () => {
    const { text } = buildInquiryEmail(valid);
    expect(text).toContain("Mari Maasikas");
    expect(text).toContain("mari@example.com");
    expect(text).toContain("BMW");
    expect(text).toContain("F30");
    expect(text).toContain("2015");
    expect(text).toContain("Bi-LED projektorid");
    expect(text).toContain("Tahaksin hinnapakkumist esituledele.");
    expect(text).toMatch(/et/);
  });

  it("leaves out empty lines such as a missing phone number", () => {
    const { text } = buildInquiryEmail({ ...valid, phone: "" });
    expect(text).not.toMatch(/Telefon:\s*$/m);
  });
});

describe("deliverInquiry", () => {
  it("returns success without sending when the honeypot is filled", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const state = await deliverInquiry({ ...valid, website: "https://spam.example" }, fullEnv, send);
    expect(state).toEqual({ status: "success" });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns not-configured without sending when RESEND_API_KEY is missing", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const state = await deliverInquiry(valid, { INQUIRY_TO_EMAIL: "info@retrofitparts.ee" }, send);
    expect(state).toEqual({ status: "error", code: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns not-configured without sending when INQUIRY_TO_EMAIL is missing", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const state = await deliverInquiry(valid, { RESEND_API_KEY: "re_test_key" }, send);
    expect(state).toEqual({ status: "error", code: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });

  it("treats blank env values as missing", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const state = await deliverInquiry(valid, { RESEND_API_KEY: "  ", INQUIRY_TO_EMAIL: "" }, send);
    expect(state).toEqual({ status: "error", code: "not-configured" });
    expect(send).not.toHaveBeenCalled();
  });

  it("returns send-failed when send throws", async () => {
    const send = vi.fn().mockRejectedValue(new Error("Resend is down"));
    const state = await deliverInquiry(valid, fullEnv, send);
    expect(state).toEqual({ status: "error", code: "send-failed" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("sends to INQUIRY_TO_EMAIL with replyTo set to the visitor's email and the topic in the subject", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    const state = await deliverInquiry(valid, fullEnv, send);
    expect(state).toEqual({ status: "success" });
    expect(send).toHaveBeenCalledTimes(1);
    const msg = send.mock.calls[0][0];
    expect(msg.to).toBe("info@retrofitparts.ee");
    expect(msg.replyTo).toBe("mari@example.com");
    expect(msg.subject).toContain("Bi-LED projektorid");
    expect(msg.text).toContain("Tahaksin hinnapakkumist esituledele.");
  });

  it("omits replyTo when the visitor only left a phone number", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await deliverInquiry({ ...valid, email: "", phone: "+372 5667 0631" }, fullEnv, send);
    expect(send.mock.calls[0][0].replyTo).toBeUndefined();
  });

  it("defaults the sender to the Resend onboarding address", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await deliverInquiry(valid, fullEnv, send);
    expect(send.mock.calls[0][0].from).toBe("Retrofit Parts <onboarding@resend.dev>");
  });

  it("uses INQUIRY_FROM_EMAIL when it is set", async () => {
    const send = vi.fn().mockResolvedValue(undefined);
    await deliverInquiry(
      valid,
      { ...fullEnv, INQUIRY_FROM_EMAIL: "Retrofit Parts <noreply@retrofitparts.ee>" },
      send,
    );
    expect(send.mock.calls[0][0].from).toBe("Retrofit Parts <noreply@retrofitparts.ee>");
  });
});
