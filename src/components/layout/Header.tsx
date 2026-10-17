import { Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { common } from "@/content/common";
import { layout } from "@/content/layout";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";
import { HeaderGlass } from "./HeaderGlass";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "./nav";
import { Wordmark } from "./Wordmark";

export function Header({ locale }: { locale: Locale }) {
  const items = navLinks(locale);

  return (
    <header id="site-header" className="fixed inset-x-0 top-0 z-50">
      <HeaderGlass />
      <Container className="relative flex h-16 items-center gap-4 lg:h-[72px] lg:gap-6">
        <Link href={localePath(locale)} className="group -mx-2 flex shrink-0 items-center rounded-md px-2 py-2">
          <Wordmark />
        </Link>

        <nav aria-label={layout.header.mainNav[locale]} className="mx-auto hidden lg:block">
          <ul className="flex items-center">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="relative block rounded-md px-2 py-2 text-sm text-muted transition-[color,background-color,border-color] duration-300 hover:text-fg after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0.5 after:h-px after:origin-center after:scale-x-0 after:bg-accent after:shadow-[0_0_8px_var(--color-accent)] after:transition-transform after:duration-500 after:ease-out-expo hover:after:scale-x-100 xl:px-3.5 xl:after:inset-x-3.5"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <LanguageSwitch locale={locale} />
          <a
            href={site.phoneHref}
            className="hidden items-center gap-2 rounded-md px-1 py-2 font-mono text-[13px] tracking-wide whitespace-nowrap text-muted transition-[color,background-color,border-color] duration-300 hover:text-fg lg:inline-flex"
          >
            <Phone aria-hidden strokeWidth={1.75} className="size-3.5 text-accent" />
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
