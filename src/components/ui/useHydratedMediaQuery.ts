"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether `query` matches, kept live. The server snapshot makes it `false` on the server and
 * during hydration, so this is "hydrated and matching", and markup that depends on it never
 * mismatches the server HTML.
 */
export function useHydratedMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener?.("change", onChange);
      return () => mql.removeEventListener?.("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
