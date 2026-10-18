"use client";

import { motion, useMotionValueEvent, useTransform } from "motion/react";
import { useState, type ReactNode } from "react";
import { mono, monoLabel } from "@/components/ui/styles";
import { cn } from "@/lib/cn";
import { segment } from "@/lib/story";
import { useChapter } from "./ScrollChapter";

/** How far the polished photo is revealed, from 0 to 1, between p 0.30 and 0.62. */
const wipeAt = (p: number) => segment(p, 0.3, 0.62);

/** The same frame for both photos, so the headlight lines up under the wipe. */
const frame = "relative aspect-[32/15] overflow-hidden rounded-[2px] bg-surface";

/**
 * The same headlight before and after polishing. While the problem chapter is pinned, the
 * photos share one frame and the polished one is wiped in from the left (`clip-path`), with a
 * 1 px seam at its edge; the caption switches to the after caption at the wipe's midpoint.
 * Static, the two photos stack, each with its own caption.
 *
 * The caption chip is aria-hidden: the photos' alt texts already say which is which. Before
 * hydration the `pinned:` classes give a pinned stage the p = 0 look.
 */
export function PolishWipe({
  before,
  after,
  beforeCaption,
  afterCaption,
  className,
}: {
  /** The unpolished photo: a `fill` image. */
  before: ReactNode;
  /** The polished photo, framed the same way. */
  after: ReactNode;
  beforeCaption: string;
  afterCaption: string;
  className?: string;
}) {
  const { progress, animated } = useChapter();
  const clipPath = useTransform(progress, (p) => `inset(0 ${100 - 100 * wipeAt(p)}% 0 0)`);
  const seamX = useTransform(progress, (p) => `${100 * wipeAt(p)}%`);
  const seamOpacity = useTransform(progress, (p) => {
    const w = wipeAt(p);
    return w > 0 && w < 1 ? 1 : 0;
  });
  // React renders only when the caption flips, not per frame.
  const [polished, setPolished] = useState(() => wipeAt(progress.get()) >= 0.5);
  useMotionValueEvent(progress, "change", (p) => setPolished(wipeAt(p) >= 0.5));

  const photos = [
    { key: "before", photo: before, caption: beforeCaption },
    { key: "after", photo: after, caption: afterCaption },
  ];

  return (
    <div
      className={cn(
        // Static: stacked, side by side on tablets. Pinned: one frame.
        "grid gap-x-3 gap-y-5 sm:max-lg:grid-cols-2",
        "pinned:relative pinned:block pinned:aspect-[32/15] pinned:overflow-hidden pinned:rounded-[2px] pinned:bg-surface",
        // A container, so the caption can step aside when a short screen shrinks the frame.
        "pinned:@container",
        className,
      )}
    >
      {photos.map(({ key, photo, caption }) => {
        const wiped = key === "after";
        return (
          <motion.figure
            // A fresh element when the chapter stops animating, so no bound clip-path lingers.
            key={`${key}-${animated}`}
            className={cn("pinned:absolute pinned:inset-0", wiped && "pinned:[clip-path:inset(0_100%_0_0)]")}
            style={wiped && animated ? { clipPath } : undefined}
          >
            <div className={cn(frame, "pinned:aspect-auto pinned:h-full pinned:rounded-none")}>{photo}</div>
            {animated ? null : <figcaption className={cn(monoLabel, "mt-3 pinned:hidden")}>{caption}</figcaption>}
          </motion.figure>
        );
      })}
      <motion.div
        key={`seam-${animated}`}
        aria-hidden
        data-wipe-seam=""
        className="pointer-events-none absolute inset-0 hidden pinned:block pinned:opacity-0"
        style={animated ? { x: seamX, opacity: seamOpacity } : undefined}
      >
        <span className="absolute inset-y-0 left-0 w-px bg-fg" />
      </motion.div>
      <p
        aria-hidden
        data-wipe-caption=""
        className={cn(
          mono,
          "absolute bottom-3 left-3 hidden rounded-[2px] bg-bg/85 px-2.5 py-1.5 leading-none whitespace-nowrap text-fg pinned:block",
          // In a frame too narrow for it, the caption would cover the photo: the alt texts say it.
          "pinned:@max-[12.5rem]:hidden",
        )}
      >
        {animated && polished ? afterCaption : beforeCaption}
      </p>
    </div>
  );
}
