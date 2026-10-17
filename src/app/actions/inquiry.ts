"use server";

import { Resend } from "resend";
import {
  deliverInquiry,
  parseInquiry,
  readInquiryValues,
  type InquiryState,
  type OutgoingInquiryMessage,
} from "@/lib/inquiry";

/**
 * Resend reports failures as a returned `error` instead of throwing. Turn that into a throw
 * so `deliverInquiry` answers `send-failed` and never claims a message was sent.
 */
async function sendWithResend(msg: OutgoingInquiryMessage) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send(msg);
    if (error) throw new Error(`${error.name}: ${error.message}`);
  } catch (err) {
    // Logged for the operator (Vercel logs); nothing the visitor typed is included.
    console.error("[inquiry] email delivery failed:", err instanceof Error ? err.message : err);
    throw err;
  }
}

export async function submitInquiry(_prev: InquiryState, fd: FormData): Promise<InquiryState> {
  const parsed = parseInquiry(fd);
  // Sent back with every error, so a failed attempt never costs the visitor their text.
  const values = readInquiryValues(fd);

  if (!parsed.ok) {
    return { status: "error", code: "invalid", fieldErrors: parsed.fieldErrors, values };
  }

  const state = await deliverInquiry(
    parsed.data,
    {
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      INQUIRY_TO_EMAIL: process.env.INQUIRY_TO_EMAIL,
      INQUIRY_FROM_EMAIL: process.env.INQUIRY_FROM_EMAIL,
    },
    sendWithResend,
  );
  return state.status === "error" ? { ...state, values } : state;
}
