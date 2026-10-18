import { site } from "@/content/site";
import { cn } from "@/lib/cn";

const [first, ...rest] = site.name.split(" ");

/**
 * Text wordmark: "Retrofit" in bold, "Parts" in regular weight and `muted`. The client's logo
 * is a separate brand decision (see docs/CONTENT-TODO.md); callers only rely on `size` and
 * `className`.
 */
export function Wordmark({ size = "md", className }: { size?: "md" | "lg"; className?: string }) {
  return (
    <span
      className={cn(
        "font-display leading-none tracking-[0.02em] whitespace-nowrap text-fg",
        size === "lg" ? "text-xl" : "text-[17px]",
        className,
      )}
    >
      <span className="font-bold">{first}</span> <span className="font-normal text-muted">{rest.join(" ")}</span>
    </span>
  );
}
