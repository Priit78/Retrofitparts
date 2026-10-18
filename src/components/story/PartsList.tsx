"use client";

import { useMotionValueEvent } from "motion/react";
import { useState } from "react";
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
 * The four parts of a headlight, front to back, numbered 01–04. While the fix chapter is pinned,
 * the active part (the one the drawing highlights) is `aria-current="step"`, in `fg`, with its
 * description open; the others are muted with their descriptions folded away (still in the DOM,
 * so a screen reader gets every word). Static, every part reads in full.
 *
 * Nothing in it takes focus, so it needs no `seek`. React renders only when the active part
 * changes, not per frame.
 */
export function PartsList({ parts, labelledBy, className }: { parts: Part[]; labelledBy: string; className?: string }) {
  const { progress, animated } = useChapter();
  const [active, setActive] = useState(() => activePartAt(progress.get()));
  useMotionValueEvent(progress, "change", (p) => setActive(activePartAt(p)));

  return (
    <ol aria-labelledby={labelledBy} className={cn("border-t border-line", className)}>
      {parts.map((part, index) => {
        const current = animated && index === active;
        const folded = animated && !current;
        return (
          <li
            key={part.id}
            aria-current={current ? "step" : undefined}
            className={cn(
              "grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-line py-5 transition-colors duration-500 md:grid-cols-[2.5rem_minmax(0,1fr)] md:py-6",
              // Pinned on a phone, the list shares one screen with the drawing.
              "pinned:max-md:py-3 pinned:max-md:[@media(max-height:40rem)]:py-2",
              // Before hydration a pinned list shows p = 0: every part muted and folded.
              animated ? (current ? "text-fg" : "text-muted") : "text-fg pinned:text-muted",
            )}
          >
            <span aria-hidden className={cn(mono, "text-muted tabular-nums")}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[17px] font-semibold">{part.name}</h3>
            {/* Folds with its grid row, so the list eases open instead of jumping. */}
            <div
              className={cn(
                "col-start-2 grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo",
                folded ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                !animated && "pinned:grid-rows-[0fr] pinned:opacity-0",
              )}
              style={folded ? { opacity: 0 } : undefined}
            >
              <p className="min-h-0 overflow-hidden">
                <span className="block pt-2 text-[15px] leading-relaxed text-pretty text-soft">{part.body}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
