import { Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { common } from "@/content/common";
import { layout } from "@/content/layout";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";
import { HeaderBackdrop } from "./HeaderBackdrop";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "./nav";
import { Wordmark } from "./Wordmark";

const quietLink =
  "rounded-[2px] text-soft transition-colors duration-300 hover:text-fg";

export function Header({ locale }: { locale: Locale }) {
  const items = navLinks(locale);

  return (
    <header id="site-header" className="fixed inset-x-0 top-0 z-50">
      <HeaderBackdrop locale={locale} />
      <Container className="relative flex h-16 items-center gap-4 lg:h-20 lg:gap-6">
        <Link href={localePath(locale)} className="-mx-1 flex shrink-0 items-center rounded-[2px] px-1 py-2">
          <Wordmark />
        </Link>

        <nav aria-label={layout.header.mainNav[locale]} className="ml-auto hidden lg:block">
          <ul className="flex items-center">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`${quietLink} relative block px-2.5 py-2 text-sm after:pointer-events-none after:absolute after:inset-x-2.5 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-fg/60 after:transition-transform after:duration-300 hover:after:scale-x-100 xl:px-3 xl:after:inset-x-3`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:gap-5">
          <LanguageSwitch locale={locale} />
          <a
            href={site.phoneHref}
            className={`${quietLink} hidden items-center gap-2 py-2 font-mono text-[13px] tracking-[0.02em] whitespace-nowrap xl:inline-flex`}
          >
            <Phone aria-hidden strokeWidth={1.5} className="size-3.5 text-muted" />
            {site.phone}
          </a>
          {/* Wrapped: Button's own `inline-flex` would override a `hidden` passed to it. */}
          <div className="hidden sm:block">
            <Button href={localePath(locale, "#contact")}>{common.requestOffer[locale]}</Button>
          </div>
          <MobileMenu locale={locale} />
        </div>
      </Container>
    </header>
  );
}
