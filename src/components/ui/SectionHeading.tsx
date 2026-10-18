import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { monoLabel, sectionIntro } from "./styles";

export function SectionHeading({
  id,
  eyebrow,
  title,
  intro,
  align = "left",
  as: Heading = "h2",
  className,
}: {
  /** Id on the heading itself, for `aria-labelledby`. */
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? <p className={cn(monoLabel, "mb-4")}>{eyebrow}</p> : null}
      <Heading
        id={id}
        className="text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px]"
      >
        {title}
      </Heading>
      {intro ? (
        <p className={cn(sectionIntro, align === "center" && "mx-auto")}>
          {intro}
        </p>
      ) : null}
    </div>
  );
}
