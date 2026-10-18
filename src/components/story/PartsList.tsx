"use client";

import { useMotionValueEvent } from "motion/react";
import { useState, type CSSProperties } from "react";
import { mono } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { activePartAt } from "./anatomy";
import { useChapter } from "./ScrollChapter";

export interface Part {
  id: string;
  name: string;
  body: string;
}

/**
 * The four parts of a headlight, front to back, numbered 01–04. Each description stays in its
 * own item, right after the part's name, so a screen reader reads them in order.
 *
 * Static, every part reads in full: its row, then its description.
 *
 * Pinned, nothing changes size while the chapter scrolls. The list is one grid: a row per part,
 * then a shared slot as tall as the longest description. Every item spans all the rows (a row
 * subgrid), puts its name in its own row and its description in the slot, so the four
 * descriptions overlap there. The active part (the one the drawing highlights) is
 * `aria-current="step"` and in `fg`, and its description fades and rises in while the others
 * fade out: opacity and transform only.
 *
 * Nothing in it takes focus, so it needs no `seek`. React renders only when the active part
 * changes, not per frame.
 */
export function PartsList({ parts, labelledBy, className }: { parts: Part[]; labelledBy: string; className?: string }) {
  const { progress, animated } = useChapter();
  const [active, setActive] = useState(() => activePartAt(progress.get()));
  useMotionValueEvent(progress, "change", (p) => setActive(activePartAt(p)));

  return (
    <ol
      aria-labelledby={labelledBy}
      style={{ "--slot-row": parts.length + 1 } as CSSProperties}
      className={cn("border-t border-line pinned:grid pinned:grid-rows-[repeat(var(--slot-row),auto)]", className)}
    >
      {parts.map((part, index) => {
        const current = animated && index === active;
        const folded = animated && !current;
        return (
          <li
            key={part.id}
            aria-current={current ? "step" : undefined}
            style={{ "--part-row": index + 1 } as CSSProperties}
            className={cn(
              "grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-b border-line py-5 transition-colors duration-500 md:grid-cols-[2.5rem_minmax(0,1fr)] md:py-6",
              "pinned:col-start-1 pinned:row-span-full pinned:grid-rows-subgrid pinned:border-b-0 pinned:py-0",
              // Before hydration a pinned list shows p = 0: every part muted, no description.
              animated ? (current ? "text-fg" : "text-muted") : "text-fg pinned:text-muted",
            )}
          >
            <div
              className={cn(
                "col-span-2 grid grid-cols-subgrid items-baseline",
                "pinned:[grid-row:var(--part-row)] pinned:border-b pinned:border-line pinned:py-2.5 pinned:md:py-5",
                // A short phone (an iPhone SE's 548 px) gets tighter rows.
                "pinned:max-md:[@media(max-height:40rem)]:py-2",
              )}
            >
              <span aria-hidden className={cn(mono, "text-muted tabular-nums")}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[17px] font-semibold">{part.name}</h3>
            </div>
            <p
              className={cn(
                "col-start-2 pt-2 text-[15px] leading-relaxed text-pretty text-soft",
                "pinned:[grid-row:var(--slot-row)] pinned:pt-3 pinned:md:pt-4 pinned:max-md:[@media(max-height:40rem)]:pt-2",
                "transition-[opacity,transform] duration-500 ease-out-expo",
                !animated && "pinned:translate-y-2 pinned:opacity-0",
              )}
              style={folded ? { opacity: 0, transform: "translateY(0.5rem)" } : animated ? { transform: "none" } : undefined}
            >
              {part.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
