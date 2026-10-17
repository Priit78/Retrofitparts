"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { layout } from "@/content/layout";
import { cn } from "@/lib/cn";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

/** ET / EN pill. Links to the same page in the other language. */
export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  const pathname = usePathname() ?? `/${locale}`;

  return (
    <div
      role="group"
      aria-label={layout.language.label[locale]}
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-white/[0.02] p-0.5",
        className,
      )}
    >
      {locales.map((code) => {
        const current = code === locale;
        return (
          <Link
            key={code}
            href={switchLocalePath(pathname, code)}
            hrefLang={code}
            lang={code}
            aria-current={current ? "true" : undefined}
            className={cn(
              "inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase transition-[color,background-color,border-color] duration-300",
              current ? "bg-white/[0.08] text-fg" : "text-muted hover:text-fg",
            )}
          >
            <span aria-hidden>{code}</span>
            <span className="sr-only">{layout.language.names[code]}</span>
          </Link>
        );
      })}
    </div>
  );
}
