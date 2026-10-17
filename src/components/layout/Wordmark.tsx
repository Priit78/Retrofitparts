import { site } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Placeholder wordmark until the client supplies a logo. Swap the internals for the SVG
 * when it arrives; callers only rely on `size` and `className`.
 */
export function Wordmark({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  const lg = size === "lg";
  return (
    <span className={cn("inline-flex items-center", lg ? "gap-3" : "gap-2.5", className)}>
      <span className="sr-only">{site.name}</span>
      {/* An LED-like dot: a white-hot core inside an ice-blue bloom. */}
      <span
        aria-hidden
        className={cn(
          "shrink-0 rounded-full bg-light transition-shadow duration-500 ease-out-expo",
          "shadow-[0_0_6px_1px_var(--color-accent),0_0_18px_3px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]",
          "group-hover:shadow-[0_0_8px_2px_var(--color-accent),0_0_26px_6px_color-mix(in_oklab,var(--color-accent)_55%,transparent)]",
          lg ? "size-2" : "size-1.5",
        )}
      />
      <span aria-hidden className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-display leading-none font-bold tracking-[0.01em] text-fg uppercase [font-stretch:125%]",
            lg ? "text-xl" : "text-[15px]",
          )}
        >
          Retrofit
        </span>
        <span
          className={cn(
            "font-mono leading-none font-medium text-muted uppercase",
            lg ? "text-xs tracking-[0.38em]" : "text-[10px] tracking-[0.34em]",
          )}
        >
          Parts
        </span>
      </span>
    </span>
  );
}
