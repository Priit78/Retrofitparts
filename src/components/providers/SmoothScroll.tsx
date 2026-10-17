"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scrolling; skipped entirely when the user prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 }, lerp: 0.1 });
    return () => lenis.destroy();
  }, []);

  return null;
}
