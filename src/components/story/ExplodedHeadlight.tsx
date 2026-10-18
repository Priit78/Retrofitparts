"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { explodeOffset } from "@/lib/story";
import { activePartAt, assemblyTransform, depthAt, explodeAt, type Offset } from "./anatomy";
import { useChapter } from "./ScrollChapter";

const translate = ({ x, y }: Offset) => `translate(${x}px, ${y}px)`;

/**
 * Takes the fix chapter's line drawing (HeadlightLines, rendered fully apart for the static
 * layout) apart with the scroll: layer `i` moves by `explodeOffset(i, e)` as `e` runs from 0 to 1
 * between p 0.02 and 0.30, the drawing stays centred, and the depth edges draw in. Then the active
 * part's layer is marked (`data-active`) while the parts list steps through them.
 *
 * It writes the styles straight onto the drawing's elements (no React render per frame), and
 * removes them when the chapter stops animating. Before hydration, the `pinned:` classes give a
 * pinned stage the p = 0 look: assembled, with no depth edges.
 */
export function ExplodedHeadlight({ children, className }: { children: ReactNode; className?: string }) {
  const { progress, animated } = useChapter();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!animated || !root) return;
    const layers = [...root.querySelectorAll<SVGGElement>("[data-layer]")];
    const assembly = root.querySelector<SVGGElement>("[data-assembly]");
    const depths = [...root.querySelectorAll<SVGGElement>("[data-depth]")];

    const apply = (p: number) => {
      const e = explodeAt(p);
      const offsets = layers.map((_, layer) => explodeOffset(layer, e));
      layers.forEach((layer, index) => {
        layer.style.transform = translate(offsets[index]);
      });
      if (assembly) assembly.style.transform = assemblyTransform(offsets, e);
      const depth = String(depthAt(e));
      for (const edges of depths) edges.style.opacity = depth;
      const active = activePartAt(p);
      layers.forEach((layer, index) => layer.toggleAttribute("data-active", index === active));
    };

    apply(progress.get());
    const unsubscribe = progress.on("change", apply);
    return () => {
      unsubscribe();
      for (const el of [...layers, ...depths, assembly]) {
        el?.style.removeProperty("transform");
        el?.style.removeProperty("opacity");
      }
      for (const layer of layers) layer.removeAttribute("data-active");
    };
  }, [animated, progress]);

  return (
    <div
      ref={ref}
      className={cn(
        // p = 0 before hydration: assembled at ASSEMBLED_SCALE, no depth edges.
        "pinned:[&_[data-assembly]]:[transform:scale(1.25)] pinned:[&_[data-depth]]:opacity-0 pinned:[&_[data-layer]]:transform-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
