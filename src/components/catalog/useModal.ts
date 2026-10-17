"use client";

import { useEffect, useEffectEvent, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

/** Focusable descendants that are actually rendered (not inside a hidden subtree). */
function focusableIn(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.getClientRects().length > 0,
  );
}

/**
 * Modal behaviour for a dialog sheet. While `open`:
 * - page scroll is locked (the scrollbar's space is kept, so nothing shifts),
 * - focus moves to `initialFocus` (or the container) and Tab cycles inside the container,
 * - Escape calls `onClose`.
 * When it closes, focus returns to the element that had it before opening (the trigger).
 *
 * Lenis keeps smooth-scrolling the page on wheel input unless the sheet (and its overlay)
 * carry `data-lenis-prevent`, so callers set that attribute on both.
 */
export function useModal({
  open,
  onClose,
  container,
  initialFocus,
}: {
  open: boolean;
  onClose: () => void;
  container: RefObject<HTMLElement | null>;
  initialFocus?: RefObject<HTMLElement | null>;
}) {
  const close = useEffectEvent(() => onClose());

  useEffect(() => {
    if (!open) return;
    const sheet = container.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };

    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    (initialFocus?.current ?? sheet)?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusable = focusableIn(sheet);
      if (focusable.length === 0) {
        event.preventDefault();
        sheet.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!sheet.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && (active === first || active === sheet)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [open, container, initialFocus]);
}
