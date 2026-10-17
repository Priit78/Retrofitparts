import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p
          className={cn(
            "mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase",
            align === "center" && "justify-center",
          )}
        >
          <span aria-hidden className="h-px w-8 bg-accent/60" />
          {eyebrow}
        </p>
      ) : null}
      <Heading className="text-3xl leading-[1.05] font-semibold tracking-tight text-balance text-fg md:text-5xl">
        {title}
      </Heading>
      {intro ? (
        <p className="mt-5 text-base leading-relaxed text-pretty text-muted md:text-lg">{intro}</p>
      ) : null}
    </div>
  );
}
