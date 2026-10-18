"use client";

import { animate } from "motion/react";
import { useId, useRef, useState, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

export interface AccordionItem {
  id: string;
  question: string;
  answer: ReactNode;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Disclosure buttons (`aria-expanded`, `aria-controls`) over labelled regions. The panel
 * height is animated with motion, and changes instantly under reduced motion.
 *
 * Closed panels are collapsed only once the inline script has put `js` on <html>, so without
 * JavaScript every answer stays readable. A collapsed panel is `visibility: hidden`, which
 * takes it out of the tab order and the accessibility tree.
 */
export function FaqAccordion({ items, defaultOpen }: { items: AccordionItem[]; defaultOpen?: string }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <FaqRow key={item.id} item={item} initiallyOpen={item.id === defaultOpen} />
      ))}
    </div>
  );
}

function FaqRow({ item, initiallyOpen }: { item: AccordionItem; initiallyOpen: boolean }) {
  const uid = useId();
  const buttonId = `${uid}-button`;
  const panelId = `${uid}-panel`;
  const panelRef = useRef<HTMLDivElement>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState(initiallyOpen);
  // Stays false through the closing animation; true once the panel has fully closed.
  const [collapsed, setCollapsed] = useState(!initiallyOpen);

  function toggle() {
    const panel = panelRef.current;
    const next = !open;
    setOpen(next);
    animation.current?.stop();
    animation.current = null;
    if (!panel) return;

    if (reduce) {
      panel.style.height = next ? "auto" : "0px";
      setCollapsed(!next);
      return;
    }

    const from = panel.getBoundingClientRect().height;
    if (next) setCollapsed(false);
    const run = animate(
      panel,
      { height: [`${from}px`, next ? `${panel.scrollHeight}px` : "0px"] },
      { duration: next ? 0.5 : 0.4, ease: EASE },
    );
    animation.current = run;
    run.then(() => {
      // A newer toggle may have taken over; only the latest animation settles the panel.
      if (animation.current !== run) return;
      if (next) panel.style.height = "auto";
      else setCollapsed(true);
    });
  }

  return (
    <div className="border-b border-line">
      <h3 className="text-base leading-snug font-medium tracking-[-0.01em] md:text-lg">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="group/q flex w-full items-start justify-between gap-6 py-6 text-left text-fg md:py-7"
        >
          <span className="min-w-0 text-pretty underline decoration-transparent underline-offset-4 transition-colors duration-300 group-hover/q:decoration-fg/40">
            {item.question}
          </span>
          {/* Plus when closed, minus when open: the vertical stroke folds away. */}
          <span
            aria-hidden
            className="relative mt-[0.3em] size-3.5 shrink-0 text-muted transition-colors duration-300 group-hover/q:text-fg"
          >
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            <span
              className={cn(
                "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-300 ease-out-expo",
                open && "scale-y-0",
              )}
            />
          </span>
        </button>
      </h3>
      <div
        ref={panelRef}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        data-collapsed={collapsed ? "" : undefined}
        // The side padding (offset by negative margins) keeps focus rings on links inside the
        // answer from being clipped by overflow-hidden.
        className="-mx-2 overflow-hidden px-2 [.js_&[data-collapsed]]:invisible [.js_&[data-collapsed]]:h-0"
      >
        <div className="max-w-[62ch] pr-8 pb-7 text-base leading-relaxed text-pretty text-soft md:pr-10">
          {item.answer}
        </div>
      </div>
    </div>
  );
}
