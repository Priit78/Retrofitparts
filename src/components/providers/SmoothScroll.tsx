"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { keepPlace } from "@/lib/keep-place";
import { registerScroller } from "@/lib/scroller";

/**
 * The element a same-page fragment link points to ("#services", or "/et#services" while on
 * /et), or null for any other link, or for a click meant to open the link elsewhere.
 */
function fragmentTarget(event: MouseEvent): HTMLElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(link instanceof HTMLAnchorElement)) return null;
  if ((link.target && link.target !== "_self") || link.hasAttribute("download")) return null;

  const url = new URL(link.href);
  const here = window.location;
  if (!url.hash || url.origin !== here.origin) return null;
  if (url.pathname !== here.pathname || url.search !== here.search) return null;
  return document.getElementById(decodeURIComponent(url.hash.slice(1)));
}

/**
 * Moves focus to the target without scrolling, as following the link natively would, so the
 * next Tab continues from there. A non-focusable target is made focusable until it loses
 * focus, without a focus ring: it is a landmark, not a control.
 */
function focusTarget(el: HTMLElement) {
  if (!el.hasAttribute("tabindex") && el.tabIndex < 0) {
    el.setAttribute("tabindex", "-1");
    el.style.outline = "none";
    el.addEventListener(
      "blur",
      () => {
        el.removeAttribute("tabindex");
        el.style.removeProperty("outline");
      },
      { once: true },
    );
  }
  el.focus({ preventScroll: true });
}

/**
 * Lenis smooth scrolling; skipped entirely when the user prefers reduced motion.
 *
 * Same-page anchor links scroll with Lenis alone. Left to the browser (or to Next's Link,
 * which scrolls to the hash itself), the page would first jump to the target and Lenis would
 * then pull it back to animate from where it was: a double jump. The click is handled in the
 * capture phase, so Link sees it as handled and stays out. The offset is the target's
 * `scroll-margin-top` (globals.css), which Lenis honours.
 *
 * The instance is registered as the page's scroller (lib/scroller.ts), so a chapter's instant
 * `seek` goes through Lenis rather than being overridden by its running animation.
 *
 * It also keeps the reader's place across resizes, rotations and reduced-motion switches
 * (lib/keep-place.ts), with or without Lenis.
 */
export function SmoothScroll() {
  useEffect(() => keepPlace(), []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    const unregister = registerScroller(lenis);

    const onClick = (event: MouseEvent) => {
      const target = fragmentTarget(event);
      if (!target) return;
      event.preventDefault();
      const hash = `#${encodeURIComponent(target.id)}`;
      // null state: the App Router fills in its own and keeps its URL in sync.
      if (window.location.hash !== hash) window.history.pushState(null, "", hash);
      // Start from where the page really is: a native scroll in this same frame (keyboard,
      // scrollbar, a focus jump) may not have reached Lenis yet, and it measures from its own.
      lenis.scrollTo(window.scrollY, { immediate: true });
      lenis.scrollTo(target);
      focusTarget(target);
    };

    window.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("click", onClick, { capture: true });
      unregister();
      lenis.destroy();
    };
  }, []);

  return null;
}
