import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { contact } from "@/content/inquiry";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/**
 * A stylized map tile: faint streets, a glowing pin. Decorative only, the address link in
 * the card is the accessible way to the real map. The pulse is CSS and only runs when the
 * visitor allows motion; otherwise the pin simply sits there.
 */
function MapPinTile() {
  return (
    <a
      href={site.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-hidden
      tabIndex={-1}
      className="group relative block max-h-72 min-h-44 flex-1 overflow-hidden rounded-3xl border border-line bg-surface transition-colors duration-300 hover:border-accent/40"
    >
      <style href="rp-map-pin" precedence="default">{`
        @media (prefers-reduced-motion: no-preference) {
          .rp-pin-ring { transform-box: fill-box; transform-origin: center; animation: rp-pin-ring 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
          .rp-pin-ring-2 { animation-delay: 1.6s; }
          .rp-pin-body { animation: rp-pin-float 4.8s ease-in-out infinite; }
        }
        @keyframes rp-pin-ring {
          0% { opacity: 0.7; transform: scale(0.4); }
          80%, 100% { opacity: 0; transform: scale(1.6); }
        }
        @keyframes rp-pin-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
        fill="none"
      >
        <defs>
          <radialGradient id="rp-pin-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.55" />
            <stop offset="55%" stopColor="var(--color-accent)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rp-pin-fade" cx="50%" cy="50%" r="60%">
            <stop offset="30%" stopColor="var(--color-bg)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--color-bg)" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        {/* Streets */}
        <g className="stroke-fg/10" strokeWidth="1.25" strokeLinecap="round">
          <path d="M-10 70 C 90 60, 150 100, 260 84 S 380 40, 420 52" />
          <path d="M-10 168 C 70 150, 140 190, 230 172 S 350 130, 420 150" />
          <path d="M70 -10 C 84 70, 60 140, 96 250" />
          <path d="M190 -10 C 176 60, 214 150, 196 250" />
          <path d="M310 -10 C 330 80, 296 150, 330 250" />
        </g>
        <g className="stroke-fg/[0.04]" strokeWidth="1">
          <path d="M-10 120 L 420 104" />
          <path d="M130 -10 L 150 250" />
          <path d="M250 -10 L 270 250" />
        </g>

        {/* Light pooling around the pin */}
        <circle cx="200" cy="124" r="120" fill="url(#rp-pin-glow)" />

        {/* Pulse rings on the ground */}
        <g className="stroke-accent" strokeWidth="1.25">
          <ellipse className="rp-pin-ring" cx="200" cy="150" rx="46" ry="14" opacity="0.4" />
          <ellipse className="rp-pin-ring rp-pin-ring-2" cx="200" cy="150" rx="46" ry="14" opacity="0.4" />
        </g>
        <ellipse cx="200" cy="150" rx="9" ry="3" className="fill-accent" opacity="0.9" />

        {/* Pin */}
        <g className="rp-pin-body">
          <path
            d="M200 62c-19.3 0-35 15.4-35 34.4 0 24.6 35 55.6 35 55.6s35-31 35-55.6C235 77.4 219.3 62 200 62z"
            className="fill-surface-2 stroke-accent"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="200" cy="95" r="12" className="fill-accent" />
          <circle cx="200" cy="95" r="4.5" className="fill-surface-2" />
        </g>

        {/* Vignette keeps the tile calm at the edges */}
        <rect width="400" height="240" fill="url(#rp-pin-fade)" />
      </svg>
    </a>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white/[0.03] text-accent"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <dt className="font-mono text-xs tracking-[0.12em] text-muted uppercase">{label}</dt>
        <dd className="mt-1.5">{children}</dd>
      </div>
    </div>
  );
}

const linkClass =
  "text-lg font-medium text-fg transition-colors duration-300 hover:text-accent [overflow-wrap:anywhere]";

/** Address, phone, email, opening hours and the legal line. Everything reads from `site`. */
export function ContactDetails({ locale }: { locale: Locale }) {
  const t = contact.card;

  return (
    <div className="flex h-full flex-col gap-4 lg:gap-6">
      <MapPinTile />

      <div className="rounded-3xl border border-line bg-surface/70 p-6 md:p-8">
        <h3 className="sr-only">{t.title[locale]}</h3>
        <dl className="grid gap-6">
          <DetailRow icon={<MapPin className="size-[1.125rem]" />} label={t.address[locale]}>
            <address className="text-lg leading-snug font-medium text-fg not-italic">
              {site.address.street}
              <br />
              {`${site.address.postalCode} ${site.address.city}, ${site.address.country[locale]}`}
            </address>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent transition-colors duration-300 hover:text-light"
            >
              {t.openMap[locale]}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </DetailRow>

          <DetailRow icon={<Phone className="size-[1.125rem]" />} label={t.phone[locale]}>
            <a href={site.phoneHref} className={linkClass}>
              {site.phone}
            </a>
          </DetailRow>

          <DetailRow icon={<Mail className="size-[1.125rem]" />} label={t.email[locale]}>
            <a href={`mailto:${site.email}`} className={linkClass}>
              {site.email}
            </a>
          </DetailRow>

          <DetailRow icon={<Clock className="size-[1.125rem]" />} label={t.hours[locale]}>
            <table className="w-full text-sm">
              <caption className="sr-only">{t.hours[locale]}</caption>
              <tbody>
                {site.hours.map((row) => (
                  <tr key={row.days.en} className="border-t border-line first:border-t-0">
                    <th scope="row" className="py-2 pr-4 text-left font-normal text-muted">
                      {row.days[locale]}
                    </th>
                    <td
                      className={
                        row.time
                          ? "py-2 text-right font-mono text-fg"
                          : "py-2 text-right font-mono text-muted"
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
        <p className="mt-6 border-t border-line pt-5 font-mono text-xs leading-relaxed text-muted">
          {site.legalName} · <span className="whitespace-nowrap">Reg. {site.regCode}</span> ·{" "}
          <span className="whitespace-nowrap">
            {t.vatLabel[locale]} {site.vat}
          </span>
        </p>
      </div>
    </div>
  );
}
