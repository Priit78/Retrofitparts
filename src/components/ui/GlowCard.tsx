"use client";

import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A solid layer cut down to a 1px ring: the padding box is masked out of the border box. */
const ringMask: CSSProperties = {
  WebkitMaskImage: "linear-gradient(black, black), linear-gradient(black, black)",
  WebkitMaskClip: "content-box, border-box",
  WebkitMaskComposite: "xor",
  maskImage: "linear-gradient(black, black), linear-gradient(black, black)",
  maskClip: "content-box, border-box",
  maskComposite: "exclude",
};

const borderLight: CSSProperties = {
  ...ringMask,
  background:
    "radial-gradient(260px circle at var(--x) var(--y), var(--color-accent), color-mix(in oklab, var(--color-accent) 25%, transparent) 40%, transparent 70%)",
};

const innerWash: CSSProperties = {
  background:
    "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklab, var(--color-accent) 7%, transparent), transparent 65%)",
};

/**
 * A surface card whose border catches light where the cursor is. The pointer position is
 * written to the `--x`/`--y` custom properties; a radial gradient centred there is masked to
 * the 1px border. Keyboard focus inside the card lights the top edge (the default position).
 */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      className={cn(
        "group/glow relative isolate rounded-2xl border border-line bg-surface [--x:50%] [--y:0%]",
        className,
      )}
    >
      {/* Resting highlight along the top edge, as if lit from above. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -top-px h-px bg-linear-to-r from-transparent via-white/15 to-transparent"
      />
      <span
        aria-hidden
        style={innerWash}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/glow:opacity-100 motion-reduce:transition-none"
      />
      <span
        aria-hidden
        style={borderLight}
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent opacity-0 transition-opacity duration-500 group-focus-within/glow:opacity-100 group-hover/glow:opacity-100 motion-reduce:transition-none"
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
