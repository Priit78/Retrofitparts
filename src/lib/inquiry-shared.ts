/**
 * The parts of the inquiry module that the client form needs at runtime.
 *
 * Deliberately free of zod (and of every other import), so importing it from a client
 * component keeps the validation library out of the browser bundle. The schema, parsing
 * and delivery live in `inquiry.ts`, which re-exports everything here.
 */

/**
 * Codes for field errors. They are not user-facing text: the form looks the localized
 * message up in `src/content/inquiry.ts`.
 */
export const fieldErrorCodes = [
  "name-length",
  "email-invalid",
  "phone-invalid",
  "contact-required",
  "message-required",
  "too-long",
  "invalid",
] as const;

export type FieldErrorCode = (typeof fieldErrorCodes)[number];

/** Maximum lengths, shared by the schema and the form's `maxLength` attributes. */
export const inquiryLimits = {
  name: 100,
  email: 254,
  phone: 20,
  car: 60,
  topic: 200,
  message: 2000,
} as const;

const valueNames = [
  "name",
  "email",
  "phone",
  "carMake",
  "carModel",
  "carYear",
  "topic",
  "message",
] as const;

/** What the visitor typed into the visible fields; sent back so an error never costs them their text. */
export type InquiryValues = Partial<Record<(typeof valueNames)[number], string>>;

/** A string form value; anything else (missing key, a file) reads as empty. */
export function formText(fd: FormData, key: string) {
  const value = fd.get(key);
  return typeof value === "string" ? value : "";
}

export function readInquiryValues(fd: FormData): InquiryValues {
  const values: InquiryValues = {};
  for (const key of valueNames) values[key] = formText(fd, key);
  return values;
}

export type RequiredFieldErrors = Partial<Record<"name" | "email" | "message", FieldErrorCode>>;

/**
 * The checks the browser makes before sending, so an empty or half-filled form gets its
 * field errors without a round trip: a name, an email or phone number, and a message. They
 * mirror the schema in `inquiry.ts` and never reject what it accepts; the server action
 * still validates everything, formats included. Returns null when nothing is missing.
 */
export function checkRequired(fd: FormData): RequiredFieldErrors | null {
  const text = (key: string) => formText(fd, key).trim();
  const errors: RequiredFieldErrors = {};
  if (text("name").length < 2) errors.name = "name-length";
  if (!text("email") && !text("phone")) errors.email = "contact-required";
  if (!text("message")) errors.message = "message-required";
  return Object.keys(errors).length > 0 ? errors : null;
}
