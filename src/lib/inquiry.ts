import { z } from "zod";

/**
 * Inquiry form: schema, parsing, email text and delivery.
 *
 * Pure and free of Next.js / Resend imports, so it can be unit tested and shared by the
 * client form and the server action. The Resend call itself lives in
 * `src/app/actions/inquiry.ts`, which is a `'use server'` file and may only export async
 * functions.
 */

import {
  fieldErrorCodes,
  formText,
  inquiryLimits,
  readInquiryValues,
  type FieldErrorCode,
  type InquiryValues,
} from "./inquiry-shared";

// The client form imports these from `inquiry-shared` directly (no zod); they stay
// available here so server code and tests have one place to import from.
export { fieldErrorCodes, inquiryLimits, readInquiryValues };
export type { FieldErrorCode, InquiryValues };

/** Digits, spaces, `+`, `-` and parentheses. A literal space on purpose: `\s` would admit newlines. */
const phonePattern = /^[\d +\-()]{6,20}$/;

function isEmail(value: string) {
  return z.email().safeParse(value).success;
}

/** Optional free-text field, trimmed. */
function optionalText(max: number) {
  return z.string({ error: "invalid" }).trim().max(max, { error: "too-long" }).optional();
}

export const inquirySchema = z
  .object({
    name: z
      .string({ error: "name-length" })
      .trim()
      .min(2, { error: "name-length" })
      .max(inquiryLimits.name, { error: "name-length" }),
    /** Empty or a valid address. Whether at least one contact exists is checked below. */
    email: z
      .string({ error: "email-invalid" })
      .trim()
      .max(inquiryLimits.email, { error: "email-invalid" })
      .refine((value) => value === "" || isEmail(value), { error: "email-invalid" })
      .optional(),
    phone: z
      .string({ error: "phone-invalid" })
      .trim()
      .refine((value) => value === "" || phonePattern.test(value), { error: "phone-invalid" })
      .optional(),
    carMake: optionalText(inquiryLimits.car),
    carModel: optionalText(inquiryLimits.car),
    carYear: optionalText(inquiryLimits.car),
    topic: optionalText(inquiryLimits.topic),
    message: z
      .string({ error: "message-required" })
      .trim()
      .min(1, { error: "message-required" })
      .max(inquiryLimits.message, { error: "too-long" }),
    locale: z.enum(["et", "en"], { error: "invalid" }),
    /** Honeypot: hidden from people, filled in by bots. */
    website: z.string().optional(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    path: ["email"],
    error: "contact-required",
  });

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryFieldErrors = Partial<Record<keyof InquiryInput, FieldErrorCode>>;

export type InquiryState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      code: "invalid" | "not-configured" | "send-failed";
      fieldErrors?: InquiryFieldErrors;
      values?: InquiryValues;
    };

const fieldNames = [
  "name",
  "email",
  "phone",
  "carMake",
  "carModel",
  "carYear",
  "topic",
  "message",
  "locale",
  "website",
] as const satisfies readonly (keyof InquiryInput)[];

function isFieldErrorCode(value: unknown): value is FieldErrorCode {
  return (fieldErrorCodes as readonly unknown[]).includes(value);
}

export function parseInquiry(
  fd: FormData,
): { ok: true; data: InquiryInput } | { ok: false; fieldErrors: InquiryFieldErrors } {
  const raw: Record<string, string> = {};
  for (const key of fieldNames) raw[key] = formText(fd, key);

  const result = inquirySchema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: InquiryFieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key !== "string" || !(fieldNames as readonly string[]).includes(key)) continue;
    const field = key as keyof InquiryInput;
    if (field in fieldErrors) continue;
    fieldErrors[field] = isFieldErrorCode(issue.message) ? issue.message : "invalid";
  }
  return { ok: false, fieldErrors };
}

/**
 * Collapses all whitespace, newlines included. Everything above the message is visitor
 * supplied, so each value stays on its own line and cannot fake another header-like line
 * (or, in the subject, inject a real header).
 */
function singleLine(value: string | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * The email goes to the workshop, so it is always in Estonian. The visitor's site language
 * is included so the reply can use it.
 */
export function buildInquiryEmail(d: InquiryInput): { subject: string; text: string } {
  const subject = `Päring: ${singleLine(d.topic) || "üldine"} — ${singleLine(d.name)}`;

  const car = [d.carMake, d.carModel, d.carYear].map(singleLine).filter(Boolean).join(" ");

  const lines = [
    ["Nimi", singleLine(d.name)],
    ["E-post", singleLine(d.email)],
    ["Telefon", singleLine(d.phone)],
    ["Auto", car],
    ["Teenus või toode", singleLine(d.topic)],
    ["Saidi keel", d.locale],
  ]
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`);

  return { subject, text: [...lines, "", "Sõnum:", d.message].join("\n") };
}

export interface InquiryEnv {
  RESEND_API_KEY?: string;
  INQUIRY_TO_EMAIL?: string;
  INQUIRY_FROM_EMAIL?: string;
}

export interface OutgoingInquiryMessage {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
}

export const defaultFromEmail = "Retrofit Parts <onboarding@resend.dev>";

function configured(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Sends a validated inquiry. `send` must resolve only when the message was accepted and
 * throw otherwise; the result never claims success for an email that was not sent.
 *
 * The one deliberate exception is the honeypot: a filled hidden field means a bot, which
 * gets a quiet "success" and nothing is sent.
 */
export async function deliverInquiry(
  d: InquiryInput,
  env: InquiryEnv,
  send: (msg: OutgoingInquiryMessage) => Promise<void>,
): Promise<InquiryState> {
  if (d.website?.trim()) return { status: "success" };

  const apiKey = configured(env.RESEND_API_KEY);
  const to = configured(env.INQUIRY_TO_EMAIL);
  if (!apiKey || !to) return { status: "error", code: "not-configured" };

  const { subject, text } = buildInquiryEmail(d);
  try {
    await send({
      from: configured(env.INQUIRY_FROM_EMAIL) ?? defaultFromEmail,
      to,
      replyTo: d.email || undefined,
      subject,
      text,
    });
  } catch {
    return { status: "error", code: "send-failed" };
  }
  return { status: "success" };
}
