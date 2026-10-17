"use client";

import { CircleAlert, LoaderCircle, Mail, Phone } from "lucide-react";
import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { submitInquiry } from "@/app/actions/inquiry";
import { Button } from "@/components/ui/Button";
import { inquiry as copy } from "@/content/inquiry";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
// Types only from `inquiry` (erased at build time) and the values from the zod-free
// `inquiry-shared`, so the validation library stays out of the browser bundle.
import type { InquiryInput, InquiryState } from "@/lib/inquiry";
import { checkRequired, inquiryLimits, readInquiryValues } from "@/lib/inquiry-shared";

const initialState: InquiryState = { status: "idle" };

/**
 * The server action, with transport failures (offline, deploy skew, an oversized body)
 * turned into the same `send-failed` result as a delivery failure. Left alone, a rejected
 * action is rethrown while rendering: the page errors out, the typed message is lost and
 * the phone and email fallback never shows.
 *
 * Missing required fields are reported straight away, without calling the server.
 */
async function submit(prev: InquiryState, fd: FormData): Promise<InquiryState> {
  const missing = checkRequired(fd);
  if (missing) {
    return { status: "error", code: "invalid", fieldErrors: missing, values: readInquiryValues(fd) };
  }
  try {
    return await submitInquiry(prev, fd);
  } catch {
    return { status: "error", code: "send-failed", values: readInquiryValues(fd) };
  }
}

interface ControlProps {
  id: string;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  className: string;
}

function joinIds(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(" ") || undefined;
}

const labelClass = "font-mono text-xs font-medium tracking-[0.12em] text-muted uppercase";

function controlClass(compact: boolean) {
  return cn(
    // The border is the only thing marking the control's edge, so it needs 3:1 (WCAG 1.4.11).
    "block w-full rounded-xl border border-fg/40 bg-surface-2/70 px-4 text-base text-fg",
    "placeholder:text-muted",
    "transition-[border-color,background-color,box-shadow] duration-300 ease-out-expo",
    "hover:border-fg/60 focus:border-accent focus:bg-surface-2 focus:ring-4 focus:ring-accent/15",
    "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/15",
    compact ? "h-11" : "h-12",
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-2 flex items-start gap-2 text-sm leading-snug text-danger">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

function Field({
  id,
  label,
  optionalLabel,
  error,
  describedBy,
  className,
  control,
}: {
  id: string;
  label: string;
  /** Shown next to the label when the field is optional. */
  optionalLabel?: string;
  error?: string;
  describedBy?: string;
  className?: string;
  control: (props: Omit<ControlProps, "className">) => ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {optionalLabel ? (
          <span className="font-mono text-xs text-muted">{optionalLabel}</span>
        ) : null}
      </div>
      {control({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": joinIds(error && errorId, describedBy),
      })}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

/** A calm, breathing glow around a check mark that draws itself. Static in reduced motion. */
function GlowCheck() {
  return (
    <div aria-hidden className="relative grid size-24 place-items-center">
      <style href="rp-inquiry-success" precedence="default">{`
        @media (prefers-reduced-motion: no-preference) {
          .rp-check { stroke-dasharray: 1; stroke-dashoffset: 1; animation: rp-check-draw 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards; }
          .rp-check-glow { animation: rp-check-breathe 3.6s ease-in-out infinite; }
        }
        @keyframes rp-check-draw { to { stroke-dashoffset: 0; } }
        @keyframes rp-check-breathe {
          0%, 100% { opacity: 0.55; transform: scale(0.94); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
      <span className="rp-check-glow absolute inset-0 rounded-full bg-accent/30 blur-2xl" />
      <span className="absolute inset-1 rounded-full border border-accent/40 bg-surface shadow-[0_0_56px_-8px] shadow-accent/65" />
      <svg
        viewBox="0 0 24 24"
        className="relative size-10 text-accent"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path className="rp-check" pathLength={1} d="M5.5 12.5l4.25 4.25L18.5 8" />
      </svg>
    </div>
  );
}

function InquiryFormBody({
  locale,
  defaultTopic,
  compact,
  onReset,
}: {
  locale: Locale;
  defaultTopic?: string;
  compact: boolean;
  onReset: () => void;
}) {
  const [state, formAction, pending] = useActionState(submit, initialState);
  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;

  const formRef = useRef<HTMLFormElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Fields edited since the last result no longer show their (now stale) error.
  const [edited, setEdited] = useState<{ for: InquiryState; names: readonly string[] }>({
    for: state,
    names: [],
  });
  const editedNames = edited.for === state ? edited.names : [];

  // Keyboard and screen reader users should land where the result is.
  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
    } else if (state.status === "error") {
      const firstInvalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      (firstInvalid ?? bannerRef.current)?.focus();
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="flex flex-col items-center rounded-2xl px-2 py-8 text-center"
      >
        <GlowCheck />
        <h3 className="mt-8 text-2xl font-semibold tracking-tight text-balance text-fg">
          {copy.success.title[locale]}
        </h3>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-pretty text-muted">
          {copy.success.body[locale]}
        </p>
        <Button variant="ghost" className="mt-8" onClick={onReset}>
          {copy.success.again[locale]}
        </Button>
      </div>
    );
  }

  const failure = state.status === "error" ? state : undefined;
  const values = failure?.values;
  const fieldErrors = failure?.fieldErrors ?? {};

  function errorFor(field: keyof InquiryInput) {
    const code = fieldErrors[field];
    if (!code || editedNames.includes(field)) return undefined;
    return copy.fieldErrors[code][locale];
  }

  // "Neither email nor phone" belongs to both fields, so it is shown once under the pair.
  const contactMissing = fieldErrors.email === "contact-required";
  const contactError =
    contactMissing && !editedNames.includes("email") && !editedNames.includes("phone")
      ? copy.fieldErrors["contact-required"][locale]
      : undefined;
  const emailError = contactMissing ? undefined : errorFor("email");
  const phoneError = errorFor("phone");

  const control = controlClass(compact);
  const gap = compact ? "gap-4" : "gap-5";
  const contactNoteId = id("contact-note");
  const bannerCopy = failure ? copy.errors[failure.code] : undefined;

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      aria-busy={pending}
      onInput={(event) => {
        const name = (event.target as HTMLElement).getAttribute("name");
        if (name && !editedNames.includes(name)) {
          setEdited({ for: state, names: [...editedNames, name] });
        }
      }}
      className={cn("grid", gap)}
    >
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot: invisible to people and screen readers, tempting to bots. */}
      <div aria-hidden className="sr-only">
        <label htmlFor={id("website")}>{copy.honeypotLabel[locale]}</label>
        <input id={id("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <Field
        id={id("name")}
        label={copy.labels.name[locale]}
        error={errorFor("name")}
        control={(props) => (
          <input
            {...props}
            className={control}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={inquiryLimits.name}
            defaultValue={values?.name ?? ""}
          />
        )}
      />

      <div>
        <div className={cn("grid @md:grid-cols-2", gap)}>
          <Field
            id={id("email")}
            label={copy.labels.email[locale]}
            error={emailError}
            describedBy={contactNoteId}
            control={(props) => (
              <input
                {...props}
                aria-invalid={contactError || props["aria-invalid"] ? true : undefined}
                className={control}
                name="email"
                type="email"
                autoComplete="email"
                maxLength={inquiryLimits.email}
                defaultValue={values?.email ?? ""}
              />
            )}
          />
          <Field
            id={id("phone")}
            label={copy.labels.phone[locale]}
            error={phoneError}
            describedBy={contactNoteId}
            control={(props) => (
              <input
                {...props}
                aria-invalid={contactError || props["aria-invalid"] ? true : undefined}
                className={control}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={inquiryLimits.phone}
                defaultValue={values?.phone ?? ""}
              />
            )}
          />
        </div>
        {contactError ? (
          <FieldError id={contactNoteId}>{contactError}</FieldError>
        ) : (
          <p id={contactNoteId} className="mt-2 text-sm leading-snug text-muted">
            {copy.contactHint[locale]}
          </p>
        )}
      </div>

      <fieldset className="min-w-0">
        <legend className="mb-2 w-full p-0">
          <span className="flex items-baseline justify-between gap-3">
            <span className={labelClass}>{copy.labels.car[locale]}</span>
            <span className="font-mono text-xs text-muted">{copy.optional[locale]}</span>
          </span>
        </legend>
        <div className={cn("grid grid-cols-2 @sm:grid-cols-[1fr_1fr_6.5rem]", gap)}>
        <Field
          id={id("car-make")}
          label={copy.labels.carMake[locale]}
          error={errorFor("carMake")}
          className="col-span-2 @sm:col-span-1"
          control={(props) => (
            <input
              {...props}
              className={control}
              name="carMake"
              type="text"
              autoComplete="off"
              placeholder={copy.placeholders.carMake[locale]}
              maxLength={inquiryLimits.car}
              defaultValue={values?.carMake ?? ""}
            />
          )}
        />
        <Field
          id={id("car-model")}
          label={copy.labels.carModel[locale]}
          error={errorFor("carModel")}
          control={(props) => (
            <input
              {...props}
              className={control}
              name="carModel"
              type="text"
              autoComplete="off"
              placeholder={copy.placeholders.carModel[locale]}
              maxLength={inquiryLimits.car}
              defaultValue={values?.carModel ?? ""}
            />
          )}
        />
        <Field
          id={id("car-year")}
          label={copy.labels.carYear[locale]}
          error={errorFor("carYear")}
          control={(props) => (
            <input
              {...props}
              className={control}
              name="carYear"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder={copy.placeholders.carYear[locale]}
              maxLength={inquiryLimits.car}
              defaultValue={values?.carYear ?? ""}
            />
          )}
        />
        </div>
      </fieldset>

      <Field
        id={id("topic")}
        label={copy.labels.topic[locale]}
        optionalLabel={copy.optional[locale]}
        error={errorFor("topic")}
        control={(props) => (
          <input
            {...props}
            className={control}
            name="topic"
            type="text"
            autoComplete="off"
            placeholder={copy.placeholders.topic[locale]}
            maxLength={inquiryLimits.topic}
            defaultValue={values?.topic ?? defaultTopic ?? ""}
          />
        )}
      />

      <Field
        id={id("message")}
        label={copy.labels.message[locale]}
        error={errorFor("message")}
        control={(props) => (
          <textarea
            {...props}
            className={cn(control, "h-auto min-h-32 resize-y py-3 leading-relaxed")}
            name="message"
            rows={compact ? 4 : 6}
            required
            placeholder={copy.placeholders.message[locale]}
            maxLength={inquiryLimits.message}
            defaultValue={values?.message ?? ""}
          />
        )}
      />

      {failure && bannerCopy ? (
        <div
          ref={bannerRef}
          role="alert"
          tabIndex={-1}
          className="rounded-2xl border border-danger/30 bg-danger/[0.07] p-4 md:p-5"
        >
          <p className="flex items-start gap-2 font-medium text-danger">
            <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>{bannerCopy.title[locale]}</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{bannerCopy.body[locale]}</p>
          {failure.code !== "invalid" ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={site.phoneHref} variant="ghost">
                <Phone aria-hidden className="size-4" />
                {site.phone}
              </Button>
              <Button href={`mailto:${site.email}`} variant="ghost">
                <Mail aria-hidden className="size-4" />
                {site.email}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 @lg:flex-row @lg:items-center">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="w-full shrink-0 whitespace-nowrap @lg:w-auto"
        >
          {pending ? (
            <>
              <LoaderCircle aria-hidden className="size-5 animate-spin" />
              {copy.sending[locale]}
            </>
          ) : (
            copy.submit[locale]
          )}
        </Button>
        {compact ? null : (
          <p className="text-sm leading-snug text-pretty text-muted">{copy.submitHint[locale]}</p>
        )}
      </div>
    </form>
  );
}

/**
 * The inquiry form. Safe to render several times on one page (ids come from `useId`).
 * `defaultTopic` pre-fills "service or product"; key the component on it if it changes
 * while the form stays mounted.
 */
export function InquiryForm({
  locale,
  defaultTopic,
  compact = false,
}: {
  locale: Locale;
  defaultTopic?: string;
  compact?: boolean;
}) {
  // "Send another inquiry" remounts the body, which starts a fresh action state.
  const [round, setRound] = useState(0);
  return (
    // Fills and centers inside a taller parent, so the success message sits mid-card.
    <div className="@container flex flex-1 flex-col justify-center">
      <InquiryFormBody
        key={round}
        locale={locale}
        defaultTopic={defaultTopic}
        compact={compact}
        onReset={() => setRound((n) => n + 1)}
      />
    </div>
  );
}
