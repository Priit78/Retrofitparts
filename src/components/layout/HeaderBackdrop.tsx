"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

const THRESHOLD = 24;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > THRESHOLD;
const isScrolledOnServer = () => false;

/** Only the landing page (`/et`, `/en`) opens with the photo hero under the header. */
export function hasHero(pathname: string, locale: Locale) {
  return pathname.replace(/\/+$/, "") === `/${locale}`;
}

/**
 * The header's background. Over the landing hero it is transparent at the top and turns solid
 * `bg` with a bottom hairline after 24 px of scroll. Pages without a hero start solid; the
 * pathname is known at build time, so their static HTML is solid from the first paint.
 * A separate layer, so the header's own content never fades.
 */
export function HeaderBackdrop({ locale }: { locale: Locale }) {
  const overHero = hasHero(usePathname() ?? "", locale);
  const scrolled = useSyncExternalStore(subscribe, isScrolled, isScrolledOnServer);
  const solid = !overHero || scrolled;

  return (
    <div
      aria-hidden
      data-header-backdrop=""
      data-solid={solid ? "" : undefined}
      className={cn(
        "pointer-events-none absolute inset-0 border-b border-line bg-bg transition-opacity duration-300",
        solid ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
