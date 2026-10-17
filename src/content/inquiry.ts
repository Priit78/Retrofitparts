import type { Localized } from "@/lib/i18n";
import type { FieldErrorCode } from "@/lib/inquiry-shared";

/** Copy for the inquiry form (`components/inquiry/InquiryForm.tsx`). */
export const inquiry = {
  labels: {
    name: { et: "Nimi", en: "Name" },
    email: { et: "E-post", en: "Email" },
    phone: { et: "Telefon", en: "Phone" },
    car: { et: "Sinu auto", en: "Your car" },
    carMake: { et: "Mark", en: "Make" },
    carModel: { et: "Mudel", en: "Model" },
    carYear: { et: "Aasta", en: "Year" },
    topic: { et: "Teenus või toode", en: "Service or product" },
    message: { et: "Sõnum", en: "Message" },
  },
  placeholders: {
    carMake: { et: "nt BMW", en: "e.g. BMW" },
    carModel: { et: "nt 330i", en: "e.g. 330i" },
    carYear: { et: "nt 2016", en: "e.g. 2016" },
    topic: {
      et: "nt bi-LED projektorid esituledele",
      en: "e.g. bi-LED projectors for headlights",
    },
    message: {
      et: "Kirjelda, mida soovid: millised tuled, mis probleem või millist toodet vajad.",
      en: "Describe what you need: which headlights, what the problem is, or which product.",
    },
  },
  optional: { et: "valikuline", en: "optional" },
  contactHint: {
    et: "Vähemalt üks: e-post või telefon, et saaksime sulle vastata.",
    en: "At least one: email or phone, so we can reply.",
  },
  submit: { et: "Saada päring", en: "Send inquiry" },
  sending: { et: "Saadan…", en: "Sending…" },
  submitHint: {
    et: "Mida täpsem info auto kohta, seda täpsema pakkumise saame teha.",
    en: "The more we know about your car, the more precise an offer we can make.",
  },
  honeypotLabel: { et: "Jäta see väli tühjaks", en: "Leave this field empty" },

  /** Form-level messages, keyed by the error code the server action returns. */
  errors: {
    invalid: {
      title: { et: "Mõni väli vajab parandamist", en: "Some fields need attention" },
      body: {
        et: "Vaata märgitud väljad üle ja proovi uuesti.",
        en: "Check the highlighted fields and try again.",
      },
    },
    "not-configured": {
      title: {
        et: "Veebivorm ei ole praegu kasutusel",
        en: "The web form is not available right now",
      },
      body: {
        et: "Sinu päringut ei saadetud. Palun helista või kirjuta meile otse.",
        en: "Your inquiry was not sent. Please call or email us directly.",
      },
    },
    "send-failed": {
      title: {
        et: "Päringut ei õnnestunud saata",
        en: "We could not send your inquiry",
      },
      body: {
        et: "Sinu sõnum ei jõudnud meieni. Proovi mõne hetke pärast uuesti või võta meiega otse ühendust.",
        en: "Your message did not reach us. Try again in a moment, or contact us directly.",
      },
    },
  },

  /** Messages under a single field, keyed by the code `parseInquiry` returns. */
  fieldErrors: {
    "name-length": {
      et: "Sisesta oma nimi (2–100 tähemärki).",
      en: "Enter your name (2–100 characters).",
    },
    "email-invalid": {
      et: "Sisesta korrektne e-posti aadress.",
      en: "Enter a valid email address.",
    },
    "phone-invalid": {
      et: "Sisesta korrektne telefoninumber (6–20 märki).",
      en: "Enter a valid phone number (6–20 characters).",
    },
    "contact-required": {
      et: "Lisa e-post või telefon, et saaksime sulle vastata.",
      en: "Add an email or phone number so we can reply.",
    },
    "message-required": {
      et: "Kirjuta, millega saame aidata.",
      en: "Tell us how we can help.",
    },
    "too-long": { et: "See tekst on liiga pikk.", en: "This text is too long." },
    invalid: { et: "Kontrolli seda välja.", en: "Please check this field." },
  } satisfies Record<FieldErrorCode, Localized<string>>,

  success: {
    title: { et: "Päring on saadetud", en: "Your inquiry has been sent" },
    body: {
      et: "Aitäh! Oleme sinu sõnumi kätte saanud ja võtame sinuga ühendust.",
      en: "Thank you. We have received your message and will get back to you.",
    },
    again: { et: "Saada uus päring", en: "Send another inquiry" },
  },
};

/** Copy for the contact section (`components/sections/Contact.tsx`). */
export const contact = {
  eyebrow: { et: "Kontakt", en: "Contact" },
  title: { et: "Küsi pakkumist", en: "Request an offer" },
  intro: {
    et: "Kirjuta meile oma auto ja soovi kohta. Mida täpsem info, seda täpsem pakkumine.",
    en: "Tell us about your car and what you need. The more detail you give, the more precise the offer.",
  },
  card: {
    title: { et: "Kontaktandmed", en: "Contact details" },
    address: { et: "Töökoda", en: "Workshop" },
    openMap: { et: "Ava kaardil", en: "Open in maps" },
    phone: { et: "Telefon", en: "Phone" },
    email: { et: "E-post", en: "Email" },
    hours: { et: "Lahtiolekuajad", en: "Opening hours" },
    closed: { et: "Suletud", en: "Closed" },
    regLabel: { et: "Reg.", en: "Reg." },
    vatLabel: { et: "KMKR", en: "VAT" },
  },
};
