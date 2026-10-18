import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A flat surface card: hairline border, 2px radius, and a border that brightens on hover or
 * when something inside it has keyboard focus. No light effects, no client JS.
 *
 * The name is kept from the first design because the catalog uses it. Children can still react
 * to hovering the card with the `group-hover/glow:` variant.
 */
export function GlowCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "group/glow relative rounded-[2px] border border-line bg-surface transition-colors duration-300 focus-within:border-fg/30 hover:border-fg/30 motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative h-full">{children}</div>
    </div>
  );
}
