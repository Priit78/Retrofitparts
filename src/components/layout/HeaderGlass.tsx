"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";

const THRESHOLD = 24;

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

const isScrolled = () => window.scrollY > THRESHOLD;
const isScrolledOnServer = () => false;

/**
 * The header's glass backdrop. Transparent at the top of the page; after 24 px of scroll it
 * fades in as a blurred surface with a bottom hairline. Kept as a separate layer so the header
 * itself never gets a backdrop-filter (which would trap fixed descendants).
 */
export function HeaderGlass() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, isScrolledOnServer);

  return (
    <div
      aria-hidden
      data-scrolled={scrolled ? "" : undefined}
      className={cn(
        "pointer-events-none absolute inset-0 border-b border-line bg-surface/70 backdrop-blur-xl backdrop-saturate-150",
        "transition-opacity duration-500 ease-out-expo",
        scrolled ? "opacity-100" : "opacity-0",
      )}
    />
  );
}
