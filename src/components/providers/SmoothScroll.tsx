"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling; skipped entirely when the user prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Anchor offset comes from the global `scroll-margin-top` on sections, which Lenis honours.
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.1 });
    return () => lenis.destroy();
  }, []);

  return null;
}
