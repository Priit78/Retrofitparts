"use client";

import {
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import {
  IGNITION_DELAY,
  IGNITION_DURATION,
  IGNITION_EASE,
  IGNITION_LEVELS,
  IGNITION_TIMES,
} from "./ignition";

/** Maximum cursor parallax, in CSS pixels, for the layer at depth 1. */
const MAX_SHIFT = 12;

/** Theme tokens (globals.css `@theme`). */
const c = {
  bg: "var(--color-bg)",
  surface: "var(--color-surface)",
  surface2: "var(--color-surface-2)",
  fg: "var(--color-fg)",
  muted: "var(--color-muted)",
  light: "var(--color-light)",
  accent: "var(--color-accent)",
  halogen: "var(--color-halogen)",
};

/** A token at a given opacity, for CSS gradients. */
const a = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;
/** Polished metal: a mix of the brightest and darkest tokens. */
const chrome = (pct: number) => `color-mix(in oklab, ${c.fg} ${pct}%, ${c.surface2})`;

/** Gradient stop with its color in `style`, so CSS variables work in every browser. */
function Stop({ at, color, opacity = 1 }: { at: number; color: string; opacity?: number }) {
  return <stop offset={at} style={{ stopColor: color, stopOpacity: opacity }} />;
}

/*
 * Masks use only alpha, so any opaque token serves as their "on" colour.
 *
 * Geometry, in a 600 × 600 viewBox centred on (300, 300):
 * housing r300 · shroud r292 → r232 · chrome bezel r232 → r197 · retaining lip r197 → r186 · glass r186.
 * The CSS layers use the same radii as insets and `closest-side` percentages.
 */
const CSS = `
.pl-root { container-type: inline-size; }
.pl-sheen {
  inset: 1.333%;
  border-radius: 9999px;
  /* A cone-shaped satin surface reflects light as radial streaks: a conic gradient. */
  background: conic-gradient(from 0deg,
    ${a(c.fg, 4)} 0deg, ${a(c.fg, 12)} 22deg, ${a(c.fg, 3)} 52deg, transparent 80deg,
    transparent 118deg, ${a(c.light, 9)} 146deg, ${a(c.fg, 2)} 170deg, transparent 196deg,
    transparent 236deg, ${a(c.fg, 6)} 262deg, ${a(c.fg, 22)} 304deg, ${a(c.fg, 30)} 318deg,
    ${a(c.fg, 9)} 336deg, ${a(c.fg, 4)} 360deg);
  -webkit-mask: radial-gradient(closest-side, transparent 79%, ${c.bg} 80.5%, ${c.bg} 97.5%, transparent 99.5%);
  mask: radial-gradient(closest-side, transparent 79%, ${c.bg} 80.5%, ${c.bg} 97.5%, transparent 99.5%);
}
.pl-chrome, .pl-sweep {
  inset: 11.333%;
  border-radius: 9999px;
  -webkit-mask: radial-gradient(closest-side, transparent 84.6%, ${c.bg} 85.1%, ${c.bg} 99.3%, transparent 100%);
  mask: radial-gradient(closest-side, transparent 84.6%, ${c.bg} 85.1%, ${c.bg} 99.3%, transparent 100%);
}
.pl-chrome {
  /* Angular bands: a studio environment reflected in polished, turned metal. The radial
     layer shapes the bezel's rounded profile: dark where it turns away, a bright crest. */
  background:
    radial-gradient(closest-side,
      ${a(c.bg, 85)} 85%, ${a(c.bg, 30)} 87.5%, transparent 90%,
      transparent 91.5%, ${a(c.fg, 22)} 93%, transparent 94.5%,
      transparent 96.5%, ${a(c.bg, 55)} 98.5%, ${a(c.bg, 90)} 100%),
    conic-gradient(from 0deg,
      ${chrome(62)} 0deg, ${chrome(30)} 16deg, ${chrome(86)} 34deg, ${chrome(40)} 46deg,
      ${chrome(14)} 78deg, ${chrome(44)} 104deg, ${chrome(10)} 132deg, ${chrome(4)} 162deg,
      ${chrome(24)} 186deg, ${chrome(6)} 204deg, ${chrome(32)} 232deg, ${chrome(12)} 258deg,
      ${chrome(58)} 288deg, ${chrome(96)} 309deg, ${chrome(46)} 324deg, ${chrome(90)} 342deg,
      ${chrome(62)} 360deg);
}
.pl-sweep {
  opacity: 0;
  background: conic-gradient(from 0deg,
    transparent 0deg, transparent 316deg, ${a(c.light, 50)} 344deg, ${a(c.fg, 95)} 353deg, transparent 360deg);
}
.pl-bevel-light {
  inset: 11.333%;
  border-radius: 9999px;
  /* The lit lens throws light onto the inner bevel of the chrome. */
  background: radial-gradient(closest-side,
    transparent 84.6%, ${a(c.light, 55)} 85.4%, ${a(c.accent, 30)} 87%, transparent 91%);
}
.pl-bloom {
  inset: 15%;
  border-radius: 9999px;
  background: radial-gradient(closest-side,
    ${a(c.light, 92)} 0%, ${a(c.light, 62)} 20%, ${a(c.accent, 26)} 46%, ${a(c.accent, 6)} 70%, transparent 86%);
  filter: blur(4.2cqw);
}
.pl-core {
  inset: 39.5% 38% 41.5%;
  border-radius: 9999px;
  background: radial-gradient(closest-side, ${c.fg} 0%, ${a(c.light, 94)} 42%, ${a(c.light, 30)} 74%, transparent 100%);
  filter: blur(0.45cqw);
}
@media (hover: hover) and (pointer: fine) {
  .pl-layer { will-change: transform; }
}
/* Unlit until the ignition runs: only when JS runs and motion is allowed, so the lens is
   lit at first paint under reduced motion or without JS. */
@media (prefers-reduced-motion: no-preference) {
  html.js .pl-root [data-ignite] { opacity: 0; }
}
`;

function Layer({
  depth,
  mx,
  my,
  className,
  children,
}: {
  depth: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
  className?: string;
  children: ReactNode;
}) {
  const x = useTransform(mx, (v) => v * depth * MAX_SHIFT);
  const y = useTransform(my, (v) => v * depth * MAX_SHIFT);
  return (
    <motion.div className={cn("pl-layer absolute inset-0", className)} style={{ x, y }}>
      {children}
    </motion.div>
  );
}

/** Concentric machining grooves on the shroud. */
const grooves = [240, 249, 258, 267, 276, 285];

/** The cutoff shield edge: flat on the oncoming side, with the 15° step. */
const CUTOFF = "M96 326 H286 L314 308 H504";

/**
 * A code-drawn bi-LED projector, seen head-on: housing, satin shroud, chrome bezel, glass dome
 * and the LED behind it. On mount it switches on (flicker, flicker, bloom); the layers shift
 * with the cursor at different depths. The glow around the housing is drawn by BeamCanvas, in
 * sync with the same ignition timeline. Decorative, so hidden from assistive tech.
 */
export function ProjectorLens({ className, style }: { className?: string; style?: CSSProperties }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  // Cursor position, −1 to 1 on each axis, smoothed by a spring.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mx = useSpring(pointerX, { stiffness: 60, damping: 18, mass: 0.6 });
  const my = useSpring(pointerY, { stiffness: 60, damping: 18, mass: 0.6 });
  // The chrome's reflections turn a little as the viewpoint moves.
  const chromeTurn = useTransform(mx, (v) => v * 7);

  // Ignition: flicker, flicker, bloom. Under reduced motion the CSS above leaves it lit.
  useEffect(() => {
    const root = rootRef.current;
    const sweep = sweepRef.current;
    if (!root || !sweep || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pick = (role: string) => Array.from(root.querySelectorAll(`[data-ignite="${role}"]`));

    const timing = {
      duration: IGNITION_DURATION,
      times: IGNITION_TIMES,
      ease: IGNITION_EASE,
      delay: IGNITION_DELAY,
    };
    const controls = [
      animate(pick("lit"), { opacity: [...IGNITION_LEVELS] }, timing),
      // The bloom stays tight while the driver flickers, then spreads.
      animate(
        pick("bloom"),
        {
          opacity: [...IGNITION_LEVELS],
          filter: [
            "blur(0.6cqw)",
            "blur(1cqw)",
            "blur(0.6cqw)",
            "blur(1.2cqw)",
            "blur(0.8cqw)",
            "blur(1cqw)",
            "blur(4.2cqw)",
          ],
        },
        timing,
      ),
      // One glint travels round the chrome once the light has settled.
      animate(
        sweep,
        { rotate: [-30, 330], opacity: [0, 1, 1, 0] },
        { duration: 2.4, delay: IGNITION_DELAY + 1.1, ease: [0.45, 0, 0.2, 1] },
      ),
    ];
    return () => controls.forEach((control) => control.stop());
  }, []);

  // Cursor parallax: mouse only, only while the lens is on screen, never under reduced motion.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    let listening = false;
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener("pointermove", onMove, { passive: true });
      } else {
        window.removeEventListener("pointermove", onMove);
        pointerX.set(0);
        pointerY.set(0);
      }
    };

    let inView = true;
    const update = () => listen(inView && fine.matches && !reduce.matches);
    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver((entries) => {
            // Entries are queued oldest first; only the latest reflects the current state.
            inView = entries[entries.length - 1].isIntersecting;
            update();
          });
    observer?.observe(root);
    reduce.addEventListener("change", update);
    fine.addEventListener("change", update);
    update();

    return () => {
      observer?.disconnect();
      reduce.removeEventListener("change", update);
      fine.removeEventListener("change", update);
      listen(false);
    };
  }, [pointerX, pointerY]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("pl-root pointer-events-none relative aspect-square select-none", className)}
      style={style}
    >
      <style>{CSS}</style>

      {/* Housing and shroud: black satin, turned. */}
      <Layer depth={0.2} mx={mx} my={my}>
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full">
          <defs>
            <radialGradient id="pl-shroud" cx="300" cy="300" r="300" gradientUnits="userSpaceOnUse">
              <Stop at={0.77} color={c.bg} />
              <Stop at={0.82} color={c.bg} />
              <Stop at={0.9} color={c.surface} />
              <Stop at={0.945} color={c.surface2} />
              <Stop at={0.959} color={c.muted} opacity={0.55} />
              <Stop at={0.968} color={c.surface} />
              <Stop at={0.985} color={c.bg} />
              <Stop at={1} color={c.bg} />
            </radialGradient>
            <linearGradient id="pl-housing-edge" x1="0" y1="0" x2="1" y2="1">
              <Stop at={0} color={c.fg} opacity={0.4} />
              <Stop at={0.45} color={c.fg} opacity={0.04} />
              <Stop at={1} color={c.light} opacity={0.18} />
            </linearGradient>
          </defs>
          <circle cx="300" cy="300" r="299" fill="url(#pl-shroud)" />
          <circle
            cx="300"
            cy="300"
            r="298.5"
            fill="none"
            stroke="url(#pl-housing-edge)"
            strokeWidth="1.5"
          />
          {grooves.map((r) => (
            <circle
              key={r}
              cx="300"
              cy="300"
              r={r}
              fill="none"
              style={{ stroke: c.fg }}
              strokeOpacity={0.03}
              strokeWidth="0.75"
            />
          ))}
        </svg>
        <div className="pl-sheen absolute" />
        {/* The lit lens lights the inside of the shroud. */}
        <div
          data-ignite="lit"
          className="absolute inset-[1.333%] rounded-full"
          style={{
            background: `radial-gradient(closest-side, transparent 78.5%, ${a(c.accent, 24)} 79.8%, ${a(c.accent, 6)} 84%, transparent 91%)`,
          }}
        />
        {/* Contact shadow where the shroud meets the bezel. */}
        <div
          className="absolute inset-[1.333%] rounded-full"
          style={{
            background: `radial-gradient(closest-side, transparent 78%, ${a(c.bg, 90)} 79.6%, transparent 85%)`,
          }}
        />
      </Layer>

      {/* What you see through the glass: the cavity, reflector bowl, cutoff shield and LED chips. */}
      <Layer depth={0.55} mx={mx} my={my}>
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full">
          <defs>
            <radialGradient id="pl-cavity" cx="282" cy="270" r="230" gradientUnits="userSpaceOnUse">
              <Stop at={0} color={c.surface2} />
              <Stop at={0.5} color={c.surface} />
              <Stop at={0.9} color={c.bg} />
            </radialGradient>
            <radialGradient id="pl-bowl" cx="300" cy="300" r="176" gradientUnits="userSpaceOnUse">
              <Stop at={0.42} color={c.muted} opacity={0} />
              <Stop at={0.62} color={c.muted} opacity={0.2} />
              <Stop at={0.7} color={c.fg} opacity={0.16} />
              <Stop at={0.8} color={c.muted} opacity={0.05} />
              <Stop at={0.92} color={c.muted} opacity={0.14} />
              <Stop at={1} color={c.muted} opacity={0} />
            </radialGradient>
            {/* A projector spreads its LED wide: the lit image is a flattened, very bright oval. */}
            <radialGradient
              id="pl-lit"
              cx="300"
              cy="300"
              r="194"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(300 296) scale(1.25 1) translate(-300 -300)"
            >
              <Stop at={0} color={c.fg} opacity={1} />
              <Stop at={0.12} color={c.light} opacity={0.95} />
              <Stop at={0.3} color={c.light} opacity={0.66} />
              <Stop at={0.5} color={c.light} opacity={0.32} />
              <Stop at={0.7} color={c.accent} opacity={0.2} />
              <Stop at={0.9} color={c.accent} opacity={0.11} />
              <Stop at={1} color={c.accent} opacity={0.3} />
            </radialGradient>
            <linearGradient id="pl-cut-dim" x1="0" y1="0" x2="1" y2="0">
              <Stop at={0} color={c.muted} opacity={0} />
              <Stop at={0.5} color={c.muted} opacity={0.35} />
              <Stop at={1} color={c.muted} opacity={0} />
            </linearGradient>
            <linearGradient id="pl-cut-lit" x1="0" y1="0" x2="1" y2="0">
              <Stop at={0.05} color={c.fg} opacity={0} />
              <Stop at={0.45} color={c.fg} opacity={0.55} />
              <Stop at={0.95} color={c.fg} opacity={0} />
            </linearGradient>
            <linearGradient id="pl-cut-fringe" x1="0" y1="0" x2="1" y2="0">
              <Stop at={0.05} color={c.accent} opacity={0} />
              <Stop at={0.4} color={c.accent} opacity={0.6} />
              <Stop at={0.95} color={c.accent} opacity={0} />
            </linearGradient>
            <filter id="pl-blur-2" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <filter id="pl-blur-6" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
            <clipPath id="pl-cavity-clip">
              <circle cx="300" cy="300" r="192" />
            </clipPath>
          </defs>
          <g clipPath="url(#pl-cavity-clip)">
            <circle cx="300" cy="300" r="192" fill="url(#pl-cavity)" />
            {/* The polished reflector bowl, magnified and soft through the lens. */}
            <circle cx="304" cy="306" r="176" fill="url(#pl-bowl)" filter="url(#pl-blur-6)" />
            {/* The cutoff shield and the dark plate below its edge. */}
            <path
              d={`${CUTOFF} V520 H96 Z`}
              style={{ fill: c.bg }}
              fillOpacity={0.5}
              filter="url(#pl-blur-2)"
            />
            <path d={CUTOFF} fill="none" stroke="url(#pl-cut-dim)" strokeWidth="1.5" />
            {/* LED chips: yellow phosphor while unlit. */}
            <g filter="url(#pl-blur-2)">
              <rect x="262" y="262" width="22" height="16" rx="3" style={{ fill: c.halogen }} fillOpacity={0.28} />
              <rect x="289" y="262" width="22" height="16" rx="3" style={{ fill: c.halogen }} fillOpacity={0.32} />
              <rect x="316" y="262" width="22" height="16" rx="3" style={{ fill: c.halogen }} fillOpacity={0.28} />
            </g>
          </g>
        </svg>

        {/* The same view, lit. */}
        <div data-ignite="lit" className="absolute inset-0">
          <svg viewBox="0 0 600 600" className="absolute inset-0 size-full">
            <g clipPath="url(#pl-cavity-clip)">
              <circle cx="300" cy="300" r="192" fill="url(#pl-lit)" />
              {/* The lit reflector bowl. */}
              <circle
                cx="302"
                cy="300"
                r="150"
                fill="none"
                style={{ stroke: c.light }}
                strokeOpacity={0.1}
                strokeWidth="18"
                filter="url(#pl-blur-6)"
              />
              <circle
                cx="301"
                cy="298"
                r="104"
                fill="none"
                style={{ stroke: c.light }}
                strokeOpacity={0.08}
                strokeWidth="8"
                filter="url(#pl-blur-6)"
              />
              {/* Below the cutoff the lens is dimmer: the projector's signature split. */}
              <path
                d={`${CUTOFF} V520 H96 Z`}
                style={{ fill: c.bg }}
                fillOpacity={0.3}
                filter="url(#pl-blur-2)"
              />
              {/* The cutoff with its faint blue fringe, as a real projector shows it. */}
              <path
                d={CUTOFF}
                transform="translate(0 2.5)"
                fill="none"
                stroke="url(#pl-cut-fringe)"
                strokeWidth="3"
                filter="url(#pl-blur-2)"
              />
              <path d={CUTOFF} fill="none" stroke="url(#pl-cut-lit)" strokeWidth="1" />
              {/* Light piping through the edge of the glass. */}
              <circle
                cx="300"
                cy="300"
                r="183"
                fill="none"
                style={{ stroke: c.light }}
                strokeOpacity={0.3}
                strokeWidth="2.5"
                filter="url(#pl-blur-2)"
              />
            </g>
          </svg>
        </div>
      </Layer>

      {/* Chrome bezel and the dark retaining lip. */}
      <Layer depth={0.3} mx={mx} my={my}>
        <motion.div className="pl-chrome absolute" style={{ rotate: chromeTurn }} />
        <div data-ignite="lit" className="pl-bevel-light absolute" />
        <div ref={sweepRef} className="pl-sweep absolute" />
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full">
          <defs>
            <linearGradient id="pl-edge" x1="0.15" y1="0.1" x2="0.85" y2="0.9">
              <Stop at={0} color={c.fg} opacity={0.9} />
              <Stop at={0.5} color={c.fg} opacity={0.12} />
              <Stop at={1} color={c.light} opacity={0.55} />
            </linearGradient>
            <linearGradient id="pl-edge-inv" x1="0.85" y1="0.9" x2="0.15" y2="0.1">
              <Stop at={0} color={c.fg} opacity={0.7} />
              <Stop at={0.55} color={c.fg} opacity={0.06} />
              <Stop at={1} color={c.fg} opacity={0.35} />
            </linearGradient>
            <radialGradient id="pl-lip" cx="300" cy="300" r="197" gradientUnits="userSpaceOnUse">
              <Stop at={0.94} color={c.bg} />
              <Stop at={0.975} color={c.surface2} />
              <Stop at={1} color={c.bg} />
            </radialGradient>
          </defs>
          {/* Outer and inner bevels catch the key light from the upper left. */}
          <circle cx="300" cy="300" r="231.4" fill="none" stroke="url(#pl-edge)" strokeWidth="1.2" />
          <circle cx="300" cy="300" r="197.6" fill="none" stroke="url(#pl-edge-inv)" strokeWidth="1" />
          {/* Retaining lip between bezel and glass. */}
          <path
            d="M300 103 a197 197 0 1 0 0.01 0 Z M300 114 a186 186 0 1 1 -0.01 0 Z"
            fill="url(#pl-lip)"
            fillRule="evenodd"
          />
        </svg>
      </Layer>

      {/* The LED: a hot core and its bloom. */}
      <Layer depth={1} mx={mx} my={my}>
        <div data-ignite="lit" className="pl-core absolute" />
        <div data-ignite="bloom" className="pl-bloom absolute" />
      </Layer>

      {/* Glass dome: fresnel rim, studio reflections, chromatic edge. Moves against the cursor. */}
      <Layer depth={-0.4} mx={mx} my={my}>
        <svg viewBox="0 0 600 600" className="absolute inset-0 size-full">
          <defs>
            <radialGradient id="pl-fresnel" cx="300" cy="300" r="186" gradientUnits="userSpaceOnUse">
              <Stop at={0.8} color={c.fg} opacity={0} />
              <Stop at={0.95} color={c.fg} opacity={0.07} />
              <Stop at={0.992} color={c.fg} opacity={0.24} />
              <Stop at={1} color={c.fg} opacity={0} />
            </radialGradient>
            <radialGradient id="pl-dome" cx="250" cy="236" r="250" gradientUnits="userSpaceOnUse">
              <Stop at={0} color={c.fg} opacity={0.07} />
              <Stop at={0.45} color={c.fg} opacity={0} />
              <Stop at={0.8} color={c.bg} opacity={0.18} />
              <Stop at={1} color={c.bg} opacity={0.38} />
            </radialGradient>
            <linearGradient id="pl-crescent" x1="0.2" y1="0.1" x2="0.75" y2="0.8">
              <Stop at={0} color={c.fg} opacity={0.6} />
              <Stop at={0.55} color={c.fg} opacity={0.08} />
              <Stop at={1} color={c.fg} opacity={0} />
            </linearGradient>
            <filter id="pl-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
            <filter id="pl-softer" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="7" />
            </filter>
            <clipPath id="pl-glass-clip">
              <circle cx="300" cy="300" r="186" />
            </clipPath>
          </defs>
          <g clipPath="url(#pl-glass-clip)">
            <circle cx="300" cy="300" r="186" fill="url(#pl-dome)" />
            <circle cx="300" cy="300" r="186" fill="url(#pl-fresnel)" />
            {/* Crescent along the upper-left rim: the glass circle minus an offset circle. */}
            <path
              d="M300 114 a186 186 0 1 0 0.01 0 Z M318 128 a178 178 0 1 1 -0.01 0 Z"
              fill="url(#pl-crescent)"
              fillRule="evenodd"
              filter="url(#pl-soft)"
            />
            {/* Studio softbox reflection, and its smaller twin on the far side. */}
            <g transform="rotate(-34 214 176)">
              <rect x="170" y="156" width="88" height="40" rx="20" style={{ fill: c.fg }} fillOpacity={0.3} filter="url(#pl-softer)" />
              <rect x="180" y="163" width="66" height="25" rx="12.5" style={{ fill: c.fg }} fillOpacity={0.62} filter="url(#pl-soft)" />
            </g>
            <ellipse
              cx="396"
              cy="420"
              rx="34"
              ry="9"
              transform="rotate(-40 396 420)"
              style={{ fill: c.light }}
              fillOpacity={0.2}
              filter="url(#pl-softer)"
            />
            <circle cx="252" cy="222" r="4.5" style={{ fill: c.fg }} fillOpacity={0.75} filter="url(#pl-soft)" />
            {/* Light caught in the thick lower-right edge of the glass. */}
            <path
              d="M462 385 A178 178 0 0 1 330 476"
              fill="none"
              style={{ stroke: c.light }}
              strokeOpacity={0.4}
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#pl-soft)"
            />
          </g>
          {/* Chromatic edge: the rim splits a little blue outward, ice-white inward. */}
          <circle cx="300" cy="300" r="185.6" fill="none" style={{ stroke: c.accent }} strokeOpacity={0.45} strokeWidth="1.2" />
          <circle cx="300" cy="300" r="183.6" fill="none" style={{ stroke: c.light }} strokeOpacity={0.14} strokeWidth="1" />
        </svg>
      </Layer>

      {/* Where the beam canvas starts its cone: the glass aperture. */}
      <div data-beam-origin className="absolute inset-[19%] rounded-full" />
    </div>
  );
}
