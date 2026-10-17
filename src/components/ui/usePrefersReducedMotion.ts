"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener?.("change", onChange);
  return () => mql.removeEventListener?.("change", onChange);
}

/**
 * Hydration-safe reduced-motion flag: `false` on the server and during hydration, then the
 * real preference. (motion's `useReducedMotion` reads the preference during hydration, so
 * markup that depends on it would mismatch the server HTML.)
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
