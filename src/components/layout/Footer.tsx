import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { layout } from "@/content/layout";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";
import { navLinks } from "./nav";
import { Wordmark } from "./Wordmark";

const title = "font-mono text-[11px] font-medium tracking-[0.2em] text-muted uppercase";
const link = "inline-block py-1 text-sm text-fg/85 transition-[color,background-color,border-color] duration-300 hover:text-light";

export function Footer({ locale }: { locale: Locale }) {
  const t = layout.footer;
  const items = navLinks(locale);
  const year = new Date().getFullYear();
  const legal = `${site.legalName} · ${t.regLabel[locale]} ${site.regCode} · ${t.vatLabel[locale]} ${site.vat}`;

  return (
    <footer id="site-footer" className="relative overflow-hidden border-t border-line bg-bg">
      {/* A thin bar of light along the top edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-accent)_55%,transparent)_50%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 h-48 w-full max-w-4xl -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_0%,color-mix(in_oklab,var(--color-accent)_9%,transparent),transparent)]"
      />

      <Container className="relative">
        <div className="grid gap-x-8 gap-y-12 py-16 md:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:py-20">
          <div className="md:col-span-3 lg:col-span-1">
            <Link href={localePath(locale)} className="group -mx-2 inline-flex rounded-md px-2 py-2">
              <Wordmark size="lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty text-muted">
              {site.tagline[locale]}
            </p>
          </div>

          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={title}>
              {t.navTitle[locale]}
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-1">
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={title}>{t.contactTitle[locale]}</h2>
            <address className="mt-4 flex flex-col items-start gap-1 not-italic">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/map block py-1 text-sm leading-relaxed text-fg/85 transition-[color,background-color,border-color] duration-300 hover:text-light"
              >
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}, {site.address.country[locale]}
                <span className="mt-1 flex items-center gap-1 font-mono text-[11px] tracking-[0.12em] text-muted uppercase transition-[color,background-color,border-color] duration-300 group-hover/map:text-accent">
                  {t.openInMaps[locale]}
                  <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
                </span>
                <span className="sr-only"> {layout.newTab[locale]}</span>
              </a>
              <a href={site.phoneHref} className={`${link} font-mono tracking-wide`}>
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className={link}>
                {site.email}
              </a>
            </address>
          </div>

          <div>
            <h2 className={title}>{t.hoursTitle[locale]}</h2>
            <dl className="mt-4 text-sm">
              {site.hours.map((row) => (
                <div
                  key={row.days.en}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 first:pt-1"
                >
                  <dt className="text-muted">{row.days[locale]}</dt>
                  <dd className={row.time ? "font-mono tracking-wide text-fg tabular-nums" : "text-muted"}>
                    {row.time ?? t.closed[locale]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 text-xs text-muted md:flex-row md:items-center md:gap-8">
          <p>
            © {year} {site.name}
          </p>
          <p>{legal}</p>
          <a
            href={site.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 self-start py-1 transition-[color,background-color,border-color] duration-300 hover:text-fg md:ml-auto md:self-auto"
          >
            {t.facebook[locale]}
            <ArrowUpRight aria-hidden strokeWidth={1.75} className="size-3.5" />
            <span className="sr-only"> {layout.newTab[locale]}</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
