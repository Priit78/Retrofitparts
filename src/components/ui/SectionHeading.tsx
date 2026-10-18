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
        <p className="mb-4 font-mono text-xs tracking-[0.08em] text-muted uppercase">{eyebrow}</p>
      ) : null}
      <Heading className="text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px]">
        {title}
      </Heading>
      {intro ? (
        <p
          className={cn(
            "mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft md:text-[17px]",
            align === "center" && "mx-auto",
          )}
        >
          {intro}
        </p>
      ) : null}
    </div>
  );
}
