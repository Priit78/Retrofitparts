"use client";

import { ArrowDown } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  CLUSTER,
  LAYER_DEPTH,
  VIEW,
  depthShift,
  project,
  round,
  type LayerId,
  type Pt,
} from "./geometry";
import { HeadlightDefs, Housing, OuterLens, Projector, Shroud, clipIds } from "./HeadlightLayers";

export interface ExplodedPart {
  id: LayerId;
  name: string;
  body: string;
}

/*
 * Layout modes, decided in CSS so the server render and first paint are always right:
 * - Pinned (lg and up, at least 720px tall, motion allowed): a 300vh track with a sticky
 *   stage; scrolling separates the parts. Before hydration the stage shows the assembled light.
 *   Below lg the two-column stage gets too narrow for the heading, and below 720px the
 *   content no longer fits one screen, so those get the static layout.
 * - Static (tablets, phones, short windows, or reduced motion): normal height, with the parts
 *   shown already separated.
 * After hydration the same media query (plus motion's useReducedMotion as a second guard)
 * switches on the scroll-linked motion values; until then, or without JS, the CSS below
 * holds the positions.
 */
const SIZE_QUERY = "(min-width: 64rem) and (min-height: 45rem)";
const PINNED_QUERY = `${SIZE_QUERY} and (prefers-reduced-motion: no-preference)`;
/** Short but pinned viewports (laptops): a more compact stage. */
const COMPACT_QUERY = `${PINNED_QUERY} and (max-height: 50rem)`;

const STAGE_CSS = `
.xh-move{transform:translate(var(--ex),var(--ey))}
.xh-cluster{transform:translate(var(--ex),var(--ey)) scale(var(--es))}
.xh-cue{display:none}
@media ${PINNED_QUERY}{
.xh-track{height:300vh}
.xh-stage{position:sticky;top:0;display:flex;align-items:center;align-items:safe center;height:100svh;padding-top:4rem}
.xh-figure svg{max-height:calc(100svh - 9rem)}
.xh-cue{display:flex}
.xh-cue svg{animation:xh-bob 2.4s cubic-bezier(0.16,1,0.3,1) infinite}
@keyframes xh-bob{0%,100%{transform:translateY(-2px);opacity:.5}50%{transform:translateY(3px);opacity:1}}
.xh-move{transform:translate(var(--ax),var(--ay))}
.xh-cluster{transform:translate(var(--ax),var(--ay)) scale(var(--as))}
.xh-tag{opacity:0}
.xh-rail{transform:scaleY(0)}
}
@media ${COMPACT_QUERY}{
.xh-grid{row-gap:1.75rem}
.xh-head h2{font-size:2.25rem}
.xh-head h2+p{margin-top:1rem;font-size:1rem}
.xh-list{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem;row-gap:1.25rem}
}`;

function subscribePinned(onChange: () => void) {
  const query = window.matchMedia(PINNED_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const matchesPinned = () => window.matchMedia(PINNED_QUERY).matches;
/** The server (and hydration) never assume the pinned mode; CSS covers the first paint. */
const notOnServer = () => false;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const segment = (p: number, [from, to]: readonly [number, number]) => clamp01((p - from) / (to - from));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Scroll progress windows (0–1 over the pinned track). */
const MOVE: Record<LayerId, readonly [number, number]> = {
  lens: [0.06, 0.58],
  shroud: [0.12, 0.64],
  projector: [0.18, 0.7],
  housing: [0.06, 0.7],
};
const REVEAL: Record<LayerId, readonly [number, number]> = {
  lens: [0.42, 0.54],
  shroud: [0.5, 0.62],
  projector: [0.58, 0.7],
  housing: [0.66, 0.78],
};

/** Where each part's tag points (face x, y, local depth) and where the tag text sits. */
const TAGS: Record<LayerId, { anchor: [number, number, number]; offset: Pt; align: "start" | "end" }> = {
  lens: { anchor: [300, 200, 0], offset: [-20, 92], align: "end" },
  shroud: { anchor: [470, 60, 0], offset: [34, -74], align: "start" },
  projector: { anchor: [96, 150, -40], offset: [-60, 66], align: "end" },
  housing: { anchor: [330, 14, 0], offset: [60, -58], align: "start" },
};

const NUMBERS: Record<LayerId, string> = { lens: "01", shroud: "02", projector: "03", housing: "04" };

function layerShift(id: LayerId, progress: number): Pt {
  const { assembled, exploded } = LAYER_DEPTH[id];
  return depthShift(lerp(assembled, exploded, easeInOut(segment(progress, MOVE[id]))));
}

function clusterTransform(progress: number) {
  const t = easeInOut(segment(progress, MOVE.housing));
  const a = CLUSTER.assembled;
  const e = CLUSTER.exploded;
  return `translate(${round(lerp(a.x, e.x, t))}px, ${round(lerp(a.y, e.y, t))}px) scale(${round(
    lerp(a.scale, e.scale, t),
  )})`;
}

const px = ([x, y]: Pt) => [`${round(x)}px`, `${round(y)}px`];

/** CSS fallbacks for both layout modes, used until (or instead of) the motion values. */
function fallbackVars(assembled: Pt, exploded: Pt, extra?: Record<string, string>): CSSProperties {
  const [ax, ay] = px(assembled);
  const [ex, ey] = px(exploded);
  return { "--ax": ax, "--ay": ay, "--ex": ex, "--ey": ey, ...extra } as CSSProperties;
}

/**
 * Transform origin at the viewBox origin. motion puts its own origin (50% 50%) on SVG
 * elements, so it is also given through motion's originX/originY.
 */
const SVG_ORIGIN = { transformBox: "view-box", transformOrigin: "0 0", originX: 0, originY: 0 } as const;

function usePartTransform(id: LayerId, progress: MotionValue<number>) {
  return useTransform(progress, (p) => {
    const [x, y] = layerShift(id, p);
    return `translate(${round(x)}px, ${round(y)}px)`;
  });
}

function partStyle(id: LayerId) {
  return { ...SVG_ORIGIN, ...fallbackVars(layerShift(id, 0), layerShift(id, 1)) };
}

/** One part of the headlight, moved along the optical axis by scroll. */
function MovingPart({
  id,
  progress,
  enabled,
  children,
}: {
  id: LayerId;
  progress: MotionValue<number>;
  enabled: boolean;
  children: ReactNode;
}) {
  const transform = usePartTransform(id, progress);
  const style = partStyle(id);
  return (
    <motion.g className="xh-move" style={enabled ? { ...style, transform } : style}>
      {children}
    </motion.g>
  );
}

/** Numbered name tag with a leader line; follows its part and fades in once it has separated. */
function PartTag({
  id,
  progress,
  enabled,
  label,
}: {
  id: LayerId;
  progress: MotionValue<number>;
  enabled: boolean;
  label: string;
}) {
  const transform = usePartTransform(id, progress);
  const opacity = useTransform(progress, (p) => round(segment(p, REVEAL[id])));
  const style = partStyle(id);

  const tag = TAGS[id];
  const [ax, ay] = project(...tag.anchor);
  const [tx, ty] = [ax + tag.offset[0], ay + tag.offset[1]];
  const elbowX = tx + (tag.align === "start" ? -12 : 12);
  const textX = round(tx + (tag.align === "start" ? 6 : -6));

  return (
    <motion.g
      className="xh-move xh-tag"
      style={enabled ? { ...style, transform, opacity } : style}
    >
      <path
        d={`M${round(ax)} ${round(ay)}L${round(elbowX)} ${round(ty)}H${round(tx)}`}
        fill="none"
        stroke="#e8f4ff"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />
      <circle cx={round(ax)} cy={round(ay)} r="4.5" fill="#e8f4ff" />
      <circle cx={round(ax)} cy={round(ay)} r="10" fill="none" stroke="#4cc3ff" strokeOpacity="0.5" />
      {/* Names fit beside the parts only on wide stages; elsewhere the numbers point to the list. */}
      <text
        x={textX}
        y={round(ty)}
        dominantBaseline="middle"
        textAnchor={tag.align}
        className="hidden text-[19px] xl:block"
      >
        <tspan className="fill-accent font-mono" fontSize="0.8em">
          {NUMBERS[id]}
        </tspan>
        <tspan className="fill-fg font-sans font-medium" dx="0.5em">
          {label}
        </tspan>
      </text>
      <text
        x={textX}
        y={round(ty)}
        dominantBaseline="middle"
        textAnchor={tag.align}
        className="fill-accent font-mono text-[34px] md:text-[22px] lg:text-[25px] xl:hidden"
      >
        {NUMBERS[id]}
      </text>
    </motion.g>
  );
}

function Rail({ id, progress, enabled }: { id: LayerId; progress: MotionValue<number>; enabled: boolean }) {
  const scaleY = useTransform(progress, (p) => round(segment(p, REVEAL[id])));
  return (
    <span aria-hidden className="absolute inset-y-1 left-0 w-px overflow-hidden bg-line">
      <motion.span
        className="xh-rail absolute inset-0 origin-top bg-accent"
        style={enabled ? { scaleY } : undefined}
      />
    </span>
  );
}

export function ExplodedHeadlight({
  heading,
  parts,
  figureLabel,
  scrollHint,
}: {
  heading: ReactNode;
  /** Front to back: lens, shroud, projector, housing. */
  parts: ExplodedPart[];
  figureLabel: string;
  /** Short cue shown under the drawing in the pinned (scroll-driven) layout only. */
  scrollHint: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pinned = useSyncExternalStore(subscribePinned, matchesPinned, notOnServer);
  const reduceMotion = useReducedMotion();
  const enabled = pinned && !reduceMotion;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const cluster = useTransform(scrollYProgress, clusterTransform);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const names = Object.fromEntries(parts.map((part) => [part.id, part.name])) as Record<LayerId, string>;
  const a = CLUSTER.assembled;
  const e = CLUSTER.exploded;
  const clusterStyle = {
    ...SVG_ORIGIN,
    ...fallbackVars([a.x, a.y], [e.x, e.y], { "--as": String(a.scale), "--es": String(e.scale) }),
  };

  return (
    <div ref={trackRef} className="xh-track relative">
      <style dangerouslySetInnerHTML={{ __html: STAGE_CSS }} />
      <div className="xh-stage">
        <div
          className={cn(
            "xh-grid mx-auto grid w-full max-w-[1280px] gap-10 px-4 md:px-6",
            "[grid-template-areas:'head'_'figure'_'list']",
            "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-12 lg:gap-y-10",
            "lg:[grid-template-areas:'head_figure'_'list_figure']",
          )}
        >
          <div className="xh-head [grid-area:head] lg:self-end">{heading}</div>

          <figure className="xh-figure [grid-area:figure] md:max-lg:mx-auto md:max-lg:w-full md:max-lg:max-w-[640px] lg:self-center">
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              role="img"
              aria-label={figureLabel}
              className="h-auto w-full overflow-visible"
            >
              <HeadlightDefs />
              <motion.g
                className="xh-cluster"
                style={enabled ? { ...clusterStyle, transform: cluster } : clusterStyle}
              >
                <MovingPart id="housing" progress={scrollYProgress} enabled={enabled}>
                  <Housing />
                </MovingPart>
                <g clipPath={`url(#${clipIds.tube})`}>
                  <MovingPart id="projector" progress={scrollYProgress} enabled={enabled}>
                    <Projector />
                  </MovingPart>
                  <MovingPart id="shroud" progress={scrollYProgress} enabled={enabled}>
                    <Shroud />
                  </MovingPart>
                </g>
                <MovingPart id="lens" progress={scrollYProgress} enabled={enabled}>
                  <OuterLens />
                </MovingPart>
                <g aria-hidden>
                  {(["housing", "projector", "shroud", "lens"] as const).map((id) => (
                    <PartTag key={id} id={id} progress={scrollYProgress} enabled={enabled} label={names[id]} />
                  ))}
                </g>
              </motion.g>
            </svg>
            <motion.p
              className="xh-cue mt-2 items-center justify-center gap-2 font-mono text-xs tracking-[0.16em] text-muted uppercase"
              style={enabled ? { opacity: cueOpacity } : undefined}
            >
              <ArrowDown aria-hidden className="size-3.5 text-accent" strokeWidth={1.75} />
              {scrollHint}
            </motion.p>
          </figure>

          <ol className="xh-list grid gap-5 [grid-area:list] sm:grid-cols-2 lg:grid-cols-1 lg:self-start">
            {parts.map((part) => (
              <li key={part.id} className="relative pl-5">
                <Rail id={part.id} progress={scrollYProgress} enabled={enabled} />
                <p className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-accent">{NUMBERS[part.id]}</span>
                  <span className="font-medium text-fg">{part.name}</span>
                </p>
                <p className="mt-1 text-sm leading-relaxed text-pretty text-muted">{part.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
