import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { layout } from "@/content/layout";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";
import { navLinks } from "./nav";
import { Wordmark } from "./Wordmark";

const label = "font-mono text-xs tracking-[0.08em] text-muted uppercase";
const link = "inline-block rounded-[2px] py-1 text-sm text-soft transition-colors duration-300 hover:text-fg";

export function Footer({ locale }: { locale: Locale }) {
  const t = layout.footer;
  const items = navLinks(locale);
  const year = new Date().getFullYear();
  const legal = `${site.legalName} · ${t.regLabel[locale]} ${site.regCode} · ${t.vatLabel[locale]} ${site.vat}`;

  return (
    <footer id="site-footer" className="border-t border-line bg-bg">
      <Container>
        <div className="grid gap-x-8 gap-y-12 py-16 md:grid-cols-3 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))] lg:py-20">
          <div className="md:col-span-3 lg:col-span-1">
            <Link href={localePath(locale)} className="-mx-1 inline-flex rounded-[2px] px-1 py-2">
              <Wordmark size="lg" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty text-muted">
              {site.tagline[locale]}
            </p>
          </div>

          <nav aria-labelledby="footer-nav">
            <h2 id="footer-nav" className={label}>
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
            <h2 className={label}>{t.contactTitle[locale]}</h2>
            <address className="mt-4 flex flex-col items-start gap-1 not-italic">
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/map block rounded-[2px] py-1 text-sm leading-relaxed text-soft transition-colors duration-300 hover:text-fg"
              >
                {site.address.street}
                <br />
                {site.address.postalCode} {site.address.city}, {site.address.country[locale]}
                <span className="mt-1 flex items-center gap-1 font-mono text-xs tracking-[0.08em] text-muted uppercase underline-offset-4 group-hover/map:text-fg group-hover/map:underline">
                  {t.openInMaps[locale]}
                  <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-3.5" />
                </span>
                <span className="sr-only"> {layout.newTab[locale]}</span>
              </a>
              <a href={site.phoneHref} className={`${link} font-mono tracking-[0.02em]`}>
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className={link}>
                {site.email}
              </a>
            </address>
          </div>

          <div>
            <h2 className={label}>{t.hoursTitle[locale]}</h2>
            <dl className="mt-4 border-t border-line text-sm">
              {site.hours.map((row) => (
                <div key={row.days.en} className="flex items-baseline justify-between gap-6 border-b border-line py-2.5">
                  <dt className="text-muted">{row.days[locale]}</dt>
                  <dd className={row.time ? "text-fg tabular-nums" : "text-muted"}>{row.time ?? t.closed[locale]}</dd>
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
            className="inline-flex items-center gap-1 self-start rounded-[2px] py-1 transition-colors duration-300 hover:text-fg md:ml-auto md:self-auto"
          >
            {t.facebook[locale]}
            <ArrowUpRight aria-hidden strokeWidth={1.5} className="size-3.5" />
            <span className="sr-only"> {layout.newTab[locale]}</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
