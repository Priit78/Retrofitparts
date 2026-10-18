"use client";

import { useHydratedMediaQuery } from "./useHydratedMediaQuery";

/**
 * Hydration-safe reduced-motion flag: `false` on the server and during hydration, then the
 * real preference. (motion's `useReducedMotion` reads the preference during hydration, so
 * markup that depends on it would mismatch the server HTML.)
 */
export function usePrefersReducedMotion(): boolean {
  return useHydratedMediaQuery("(prefers-reduced-motion: reduce)");
}
