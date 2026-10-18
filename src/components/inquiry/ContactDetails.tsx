import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { contact } from "@/content/inquiry";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  // `dt` and `dd` are the only children of the row, and the row is a direct child of the
  // `dl`, which is what a definition list requires.
  return (
    <div className="min-w-0 border-t border-line py-5 first:border-t-0 first:pt-0">
      <dt className="font-mono text-xs tracking-[0.08em] text-muted uppercase">{label}</dt>
      <dd className="mt-2">{children}</dd>
    </div>
  );
}

const linkClass =
  "text-lg font-medium text-fg underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:decoration-fg [overflow-wrap:anywhere]";

/** Address, phone, email, opening hours and the legal line. Everything reads from `site`. */
export function ContactDetails({ locale }: { locale: Locale }) {
  const t = contact.card;

  return (
    <div>
      <h3 className="mb-6 text-2xl font-semibold text-fg md:mb-8">{t.title[locale]}</h3>
      <dl className="border-t border-line pt-5">
        <DetailRow label={t.address[locale]}>
          <address className="text-lg leading-snug font-medium text-fg not-italic">
            {site.address.street}
            <br />
            {`${site.address.postalCode} ${site.address.city}, ${site.address.country[locale]}`}
          </address>
          <a
            href={site.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm text-soft underline decoration-fg/40 underline-offset-4 transition-colors duration-300 hover:text-fg hover:decoration-fg"
          >
            {t.openMap[locale]}
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
        </DetailRow>

        <DetailRow label={t.phone[locale]}>
          <a href={site.phoneHref} className={linkClass}>
            {site.phone}
          </a>
        </DetailRow>

        <DetailRow label={t.email[locale]}>
          <a href={`mailto:${site.email}`} className={linkClass}>
            {site.email}
          </a>
        </DetailRow>

        <DetailRow label={t.hours[locale]}>
          <table className="w-full text-base">
            <caption className="sr-only">{t.hours[locale]}</caption>
            <tbody>
              {site.hours.map((row) => (
                <tr key={row.days.en}>
                  <th scope="row" className="py-1 pr-4 text-left font-normal text-soft">
                    {row.days[locale]}
                  </th>
                  <td
                    className={
                      row.time
                        ? "py-1 text-right font-mono text-fg"
                        : "py-1 text-right font-mono text-muted"
                    }
                  >
                    {row.time ?? t.closed[locale]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailRow>
      </dl>

      {/* nowrap keeps each label with its code when the line wraps; the text stays plain. */}
      <p className="border-t border-line pt-5 font-mono text-xs leading-relaxed text-muted">
        {site.legalName} ·{" "}
        <span className="whitespace-nowrap">
          {t.regLabel[locale]} {site.regCode}
        </span>{" "}
        ·{" "}
        <span className="whitespace-nowrap">
          {t.vatLabel[locale]} {site.vat}
        </span>
      </p>
    </div>
  );
}
