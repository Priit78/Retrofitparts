import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { logoPath, logoViewBox } from "./logo";

/**
 * The client's own "RETROFIT PARTS" lettering in their brand orange. The orange belongs to the
 * logo only; the rest of the site keeps to the graphite and ivory tokens. Callers only rely on
 * `size` and `className`.
 */
export function Wordmark({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <svg
      role="img"
      aria-label={site.name}
      viewBox={logoViewBox}
      className={cn(
        "block w-auto shrink-0 text-brand",
        size === "lg" ? "h-[18px]" : "h-[15px] lg:h-4",
        className,
      )}
    >
      <path fill="currentColor" fillRule="evenodd" d={logoPath} />
    </svg>
  );
}
