import { cn } from "@/lib/cn";
import type { RoadVariant } from "./RoadScene";

/** The headlight itself, seen head-on: a yellowed, hazy lens or a clear projector lens. */
function LensIcon({ variant, className }: { variant: RoadVariant; className?: string }) {
  const id = (name: string) => `lens-${variant}-${name}`;
  const after = variant === "after";
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className}>
      <defs>
        <radialGradient id={id("glass")} cx="0.5" cy="0.5" r="0.5">
          {after ? (
            <>
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.28" stopColor="#e8f4ff" />
              <stop offset="0.55" stopColor="#4cc3ff" stopOpacity="0.45" />
              <stop offset="1" stopColor="#0b1016" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#b8904f" />
              <stop offset="0.45" stopColor="#7a6237" />
              <stop offset="1" stopColor="#2b2417" />
            </>
          )}
        </radialGradient>
        <filter id={id("haze")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      {after ? <circle cx="20" cy="20" r="19" fill="#4cc3ff" opacity="0.18" filter={`url(#${id("haze")})`} /> : null}
      <circle cx="20" cy="20" r="18" fill="#12151a" stroke={after ? "#8a93a0" : "#4a4232"} strokeWidth="1.2" />
      <circle cx="20" cy="20" r="14" fill={`url(#${id("glass")})`} />
      {after ? (
        <>
          <path d="M10.5 15.5 A10.5 10.5 0 0 1 17 9.6" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
          <circle cx="20" cy="20" r="14" fill="none" stroke="#e8f4ff" strokeOpacity="0.5" strokeWidth="0.6" />
        </>
      ) : (
        <g filter={`url(#${id("haze")})`} fill="#e8d2a6">
          <ellipse cx="15" cy="15" rx="6" ry="3.5" opacity="0.35" />
          <ellipse cx="25" cy="25" rx="5" ry="3" opacity="0.25" />
          <ellipse cx="22" cy="17" rx="7" ry="5" opacity="0.18" />
        </g>
      )}
      {after ? null : (
        <g stroke="#e8d2a6" strokeWidth="0.4" opacity="0.4" strokeLinecap="round">
          <path d="M11 22 L18 19" />
          <path d="M21 28 L29 23" />
          <path d="M14 27 L17 26" />
        </g>
      )}
    </svg>
  );
}

/** Corner chip on the comparison scene: lens icon, label and a short caption. */
export function SceneLabel({
  variant,
  label,
  caption,
}: {
  variant: RoadVariant;
  label: string;
  caption: string;
}) {
  const after = variant === "after";
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-full border border-line bg-bg/60 py-1 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.9)] backdrop-blur-md md:gap-3 md:py-1.5",
        after ? "flex-row-reverse pr-1 pl-3.5 md:pr-1.5 md:pl-4" : "pr-3.5 pl-1 md:pr-4 md:pl-1.5",
      )}
    >
      <LensIcon variant={variant} className="size-7 shrink-0 md:size-9" />
      <div className={cn("leading-tight", after && "text-right")}>
        <p
          className={cn(
            "font-mono text-[11px] font-medium tracking-[0.18em] uppercase",
            after ? "text-light" : "text-halogen",
          )}
        >
          {label}
        </p>
        <p className="hidden text-xs text-fg/80 sm:block">{caption}</p>
      </div>
    </div>
  );
}
