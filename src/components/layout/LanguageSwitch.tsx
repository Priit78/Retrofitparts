"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { layout } from "@/content/layout";
import { cn } from "@/lib/cn";
import { locales, switchLocalePath, type Locale } from "@/lib/i18n";

/**
 * One link per language. The visible code is part of the accessible name ("ET – Eesti"), so
 * speech users can say what they see (WCAG 2.5.3).
 */
function LanguageLinks({ locale, query }: { locale: Locale; query: string }) {
  const pathname = usePathname() ?? `/${locale}`;

  return locales.map((code) => {
    const current = code === locale;
    const visible = code.toUpperCase();
    return (
      <Link
        key={code}
        href={`${switchLocalePath(pathname, code)}${query}`}
        hrefLang={code}
        lang={code}
        aria-label={`${visible} – ${layout.language.names[code]}`}
        aria-current={current ? "true" : undefined}
        className={cn(
          "inline-flex h-8 min-w-10 items-center justify-center rounded-full px-2.5 font-mono text-[11px] font-medium tracking-[0.14em] uppercase transition-[color,background-color,border-color] duration-300",
          current ? "bg-white/[0.08] text-fg" : "text-muted hover:text-fg",
        )}
      >
        {visible}
      </Link>
    );
  });
}

/** The links with the current query, so a filtered catalog stays filtered in the other language. */
function LanguageLinksWithQuery({ locale }: { locale: Locale }) {
  const query = useSearchParams()?.toString();
  return <LanguageLinks locale={locale} query={query ? `?${query}` : ""} />;
}

/** ET / EN pill. Links to the same page in the other language. */
export function LanguageSwitch({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <div
      role="group"
      aria-label={layout.language.label[locale]}
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-white/[0.02] p-0.5",
        className,
      )}
    >
      {/* The query is only known in the browser: static pages render the links without it. */}
      <Suspense fallback={<LanguageLinks locale={locale} query="" />}>
        <LanguageLinksWithQuery locale={locale} />
      </Suspense>
    </div>
  );
}
