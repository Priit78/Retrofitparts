"use client";

import { Plus } from "lucide-react";
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
      <h3 className="text-base leading-snug font-semibold md:text-lg">
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className="group/q flex w-full items-start justify-between gap-6 py-6 text-left text-fg transition-colors hover:text-light md:py-7"
        >
          <span className="min-w-0 text-pretty">{item.question}</span>
          <span
            aria-hidden
            className={cn(
              "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border transition-[transform,border-color,color,background-color] duration-500 ease-out-expo",
              open
                ? "rotate-45 border-accent/60 bg-accent/10 text-accent"
                : "border-line text-muted group-hover/q:border-accent/40 group-hover/q:text-fg",
            )}
          >
            <Plus className="size-4" strokeWidth={1.75} />
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
        <div className="max-w-2xl pt-1 pr-12 pb-7 text-base leading-relaxed text-pretty text-muted">
          {item.answer}
        </div>
      </div>
    </div>
  );
}
