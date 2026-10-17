"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { IGNITION_DELAY, IGNITION_DURATION, ignitionLevel } from "./ignition";

/** Backing-store pixel ratio cap: the beam is soft, so 2× is already plenty. */
const MAX_DPR = 2;
/** …and a budget for the backing store, so very large screens stay light on memory and fill. */
const MAX_CANVAS_PIXELS = 4_000_000;
/** The cone is computed once per size at up to this fraction of CSS resolution, then upscaled. */
const CONE_SCALE = 0.5;
/** …and at most this many pixels, which keeps the one-off compute short. */
const CONE_MAX_PIXELS = 180_000;
/** Brightest the beam gets (alpha over the background). */
const BEAM_ALPHA = 0.5;
/** The glow around the lens housing: light spilling onto the bodywork and into the air. */
const GLOW_ALPHA = 0.09;
/** After the ignition the dust only needs 30 fps. */
const IDLE_FRAME_MS = 1000 / 30;

type RGB = [number, number, number];

interface Geometry {
  /** Canvas size in CSS pixels. */
  w: number;
  h: number;
  /** Beam origin (centre of the lens glass), in canvas CSS pixels. */
  ox: number;
  oy: number;
  /** Lens aperture radius. */
  ap: number;
  /** Unit vector along the beam, and its normal pointing to the spill (lower) side. */
  dx: number;
  dy: number;
  nx: number;
  ny: number;
  /** Reach of the beam. */
  reach: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 0.35 (far) to 1 (near): scales size, brightness and drift speed. */
  z: number;
  r: number;
  age: number;
  life: number;
  phase: number;
  twinkle: number;
}

// Cone profile in beam space: u along the beam, v across it (negative = the cutoff side).
const CUT_START = -0.5; // × aperture
const SPILL_START = 0.7; // × aperture
const CUT_SLOPE = Math.tan((1.2 * Math.PI) / 180);
const SPILL_SLOPE = Math.tan((17 * Math.PI) / 180);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

/** Resolves a theme token (e.g. `--color-light`) to RGB through the canvas colour parser. */
function readToken(ctx: CanvasRenderingContext2D, name: string, fallback: RGB): RGB {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  if (!raw) return fallback;
  ctx.fillStyle = raw;
  const parsed = String(ctx.fillStyle);
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(parsed);
  if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)];
  const rgb = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(parsed);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return fallback;
}

/**
 * The light model, in beam space: 0 outside the cone, about 1 in the hot spot just below the
 * cutoff near the lens. A low beam has a crisp upper edge (the cutoff) and a soft spill below.
 */
function beamLight(g: Geometry, u: number, v: number): number {
  if (u <= 0) return 0;
  const cut = g.ap * CUT_START - u * CUT_SLOPE;
  const spill = g.ap * SPILL_START + u * SPILL_SLOPE;
  const t = (v - cut) / (spill - cut); // 0 at the cutoff, 1 at the spill edge
  if (t < -0.1 || t > 1.3) return 0;
  const edge = 1.5 + u * 0.008;
  const top = smoothstep(-edge, edge, v - cut);
  const body = 1 - smoothstep(0.05, 1.25, t);
  const hot = Math.exp(-(((t - 0.12) / 0.18) ** 2));
  const across = top * (0.55 * body + 0.5 * hot);
  const along = (1 - clamp01(u / g.reach)) ** 1.8 / (1 + u / (g.ap * 6));
  return across * along;
}

function toBeam(g: Geometry, x: number, y: number): [number, number] {
  const rx = x - g.ox;
  const ry = y - g.oy;
  return [rx * g.dx + ry * g.dy, rx * g.nx + ry * g.ny];
}

/**
 * Computes the light per pixel, in floating point, once per size: the volumetric cone, with
 * faint shafts, cooling from white to the accent blue as it spreads, and the blue halo around
 * the lens housing. A random sub-step dither keeps faint light from banding on 8-bit displays.
 */
function renderCone(cone: HTMLCanvasElement, g: Geometry, light: RGB, accent: RGB) {
  const scale = Math.min(CONE_SCALE, Math.sqrt(CONE_MAX_PIXELS / (g.w * g.h)));
  const cw = Math.max(1, Math.round(g.w * scale));
  const ch = Math.max(1, Math.round(g.h * scale));
  cone.width = cw;
  cone.height = ch;
  const ctx = cone.getContext("2d");
  if (!ctx) return;

  // Two slow sine waves across the beam's angle make the shafts; random phases per render.
  const f1 = lerp(26, 34, Math.random());
  const f2 = lerp(57, 71, Math.random());
  const p1 = Math.random() * Math.PI * 2;
  const p2 = Math.random() * Math.PI * 2;
  const apex = g.ap * 2.5;

  const img = ctx.createImageData(cw, ch);
  const px = img.data;
  const step = 1 / scale;
  const invAp2 = 1 / (g.ap * g.ap);
  for (let j = 0; j < ch; j++) {
    const ry = (j + 0.5) * step - g.oy;
    let rx = 0.5 * step - g.ox;
    for (let i = 0; i < cw; i++, rx += step) {
      // Halo: brightest at the housing edge (≈1.6 apertures), gone by 3.2.
      const r2 = (rx * rx + ry * ry) * invAp2;
      let glow = 0;
      if (r2 < 10.24) {
        const fall = clamp01(1 - (Math.max(Math.sqrt(r2), 1.6) - 1.6) / 1.6);
        glow = GLOW_ALPHA * fall * fall * fall;
      }

      const u = rx * g.dx + ry * g.dy;
      const v = rx * g.nx + ry * g.ny;
      const lit = u > 0 ? beamLight(g, u, v) : 0;
      if (lit <= 0 && glow <= 0.002) continue;

      let beam = 0;
      let cool = 0;
      if (lit > 0) {
        const angle = v / (u + apex);
        const shafts = 1 + 0.1 * Math.sin(angle * f1 + p1) + 0.07 * Math.sin(angle * f2 + p2);
        beam = BEAM_ALPHA * lit * shafts;
        // Cooler towards the spill side and with distance.
        cool = clamp01((v / (g.ap + u * SPILL_SLOPE)) * 0.6 + (u / g.reach) * 0.7) * 0.85;
      }
      // Mix the white-to-blue beam with the accent-blue halo by their share of the light.
      const alpha = Math.min(1, beam + glow);
      const blue = (beam * cool + glow) / (beam + glow);
      const k = (j * cw + i) * 4;
      px[k] = lerp(light[0], accent[0], blue);
      px[k + 1] = lerp(light[1], accent[1], blue);
      px[k + 2] = lerp(light[2], accent[2], blue);
      px[k + 3] = alpha * 255 + Math.random() - 0.5;
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** A soft round dust mote, drawn once and stamped per particle. */
function renderSprite(light: RGB): HTMLCanvasElement {
  const size = 32;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const [r, g, b] = light;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  grad.addColorStop(0.28, `rgba(${r}, ${g}, ${b}, 0.55)`);
  grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

/** A random point inside the visible part of the cone, biased towards the lens. */
function spawn(p: Particle, g: Geometry, fresh: boolean) {
  const u = lerp(g.ap * 0.9, g.reach * 0.75, Math.random() ** 1.5);
  const cut = g.ap * CUT_START - u * CUT_SLOPE;
  const spill = g.ap * SPILL_START + u * SPILL_SLOPE;
  const v = lerp(cut, lerp(cut, spill, 0.75), Math.random());
  p.x = g.ox + u * g.dx + v * g.nx;
  p.y = g.oy + u * g.dy + v * g.ny;
  p.z = lerp(0.35, 1, Math.random());
  const bokeh = Math.random() < 0.07;
  p.r = bokeh ? lerp(4, 8, Math.random()) : lerp(0.6, 2, p.z);
  const speed = lerp(3, 9, Math.random()) * p.z * (bokeh ? 0.5 : 1);
  const heading = Math.random() * Math.PI * 2;
  p.vx = Math.cos(heading) * speed;
  p.vy = Math.sin(heading) * speed - 1.5; // warm air rises a little
  p.life = lerp(6, 14, Math.random());
  p.age = fresh ? Math.random() * p.life : 0;
  p.phase = Math.random() * Math.PI * 2;
  p.twinkle = lerp(0.6, 1.8, Math.random());
  if (bokeh) p.z *= 0.35;
}

/**
 * A soft volumetric cone of light from the lens, with slowly drifting dust, and the halo the
 * lit lens throws around its housing.
 *
 * One 2D canvas, sized by devicePixelRatio (capped at 2). The cone is computed once per size;
 * each frame stamps it and 60–120 motes. The loop stops when the hero is offscreen or the
 * tab is hidden. Under reduced motion it draws one static, fully lit frame.
 *
 * The beam starts at the `[data-beam-origin]` element inside the same parent and points
 * along that element's `--beam-angle` (degrees, 0 = right, 90 = down).
 */
export function BeamCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const light = readToken(ctx, "--color-light", [255, 255, 255]);
    const accent = readToken(ctx, "--color-accent", light);
    const cone = document.createElement("canvas");
    const sprite = renderSprite(light);
    const particles: Particle[] = [];

    const start = performance.now();
    let geometry: Geometry | null = null;
    let dpr = 1;
    let frame = 0;
    let lastTick = 0;
    let lastDraw = 0;
    let inView = true;
    let pageVisible = document.visibilityState !== "hidden";

    /** Reads the layout (only on resize) and rebuilds the cone and the dust if it changed. */
    const measure = () => {
      const origin = host.querySelector<HTMLElement>("[data-beam-origin]");
      const box = canvas.getBoundingClientRect();
      if (!origin || box.width === 0 || box.height === 0) return;
      const o = origin.getBoundingClientRect();
      const deg = parseFloat(getComputedStyle(origin).getPropertyValue("--beam-angle")) || 180;
      const rad = (deg * Math.PI) / 180;
      const dx = Math.cos(rad);
      const dy = Math.sin(rad);
      // The normal that points down the screen is the soft spill side; the other is the cutoff.
      let nx = -dy;
      let ny = dx;
      if (ny < 0 || (ny === 0 && nx < 0)) {
        nx = -nx;
        ny = -ny;
      }
      const next: Geometry = {
        w: box.width,
        h: box.height,
        ox: o.left + o.width / 2 - box.left,
        oy: o.top + o.height / 2 - box.top,
        ap: o.width / 2,
        dx,
        dy,
        nx,
        ny,
        reach: Math.hypot(box.width, box.height) * 0.75,
      };
      const nextDpr = Math.min(
        window.devicePixelRatio || 1,
        MAX_DPR,
        Math.sqrt(MAX_CANVAS_PIXELS / (box.width * box.height)),
      );
      const prev = geometry;
      const same =
        prev !== null &&
        nextDpr === dpr &&
        (["w", "h", "ox", "oy", "ap"] as const).every((key) => Math.abs(prev[key] - next[key]) < 0.5) &&
        Math.abs(prev.dx - next.dx) < 1e-3 &&
        Math.abs(prev.dy - next.dy) < 1e-3;
      if (same) return;

      geometry = next;
      dpr = nextDpr;
      canvas.width = Math.round(box.width * dpr);
      canvas.height = Math.round(box.height * dpr);
      renderCone(cone, next, light, accent);

      // 60–120 motes, scaled by area.
      const count = Math.round(Math.min(120, Math.max(60, (box.width * box.height) / 14000)));
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        const p = {} as Particle;
        spawn(p, next, true);
        particles.push(p);
      }
    };

    const draw = (now: number, dt: number) => {
      const g = geometry;
      if (!g) return;
      const reduce = reduceQuery.matches;
      const t = (now - start) / 1000;
      const level = reduce ? 1 : ignitionLevel(t - IGNITION_DELAY);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, g.w, g.h);
      if (level <= 0.001) return;

      // The beam breathes very slightly, like air moving through it.
      ctx.globalAlpha = level * (reduce ? 1 : 0.95 + 0.05 * Math.sin(t * 0.5));
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(cone, 0, 0, g.w, g.h);

      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        if (dt > 0) {
          p.age += dt;
          if (p.age >= p.life) spawn(p, g, false);
          p.x += (p.vx + Math.sin(t * 0.7 + p.phase) * 2.2 * p.z) * dt;
          p.y += (p.vy + Math.cos(t * 0.5 + p.phase) * 1.6 * p.z) * dt;
        }
        const [u, v] = toBeam(g, p.x, p.y);
        if (u < g.ap * 1.2) continue; // behind the lens
        const lit = Math.min(1, beamLight(g, u, v) * 2.2);
        if (lit < 0.01) continue;
        const fade = Math.sin((Math.PI * p.age) / p.life);
        const twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * p.twinkle + p.phase);
        const alpha = lit * fade * twinkle * level * lerp(0.35, 1, p.z);
        if (alpha < 0.01) continue;
        ctx.globalAlpha = Math.min(1, alpha);
        const size = p.r * 3;
        ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const igniting = (now - start) / 1000 < IGNITION_DELAY + IGNITION_DURATION + 0.2;
      if (!igniting && now - lastDraw < IDLE_FRAME_MS - 2) return;
      const dt = Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;
      lastDraw = now;
      draw(now, dt);
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const run = () => {
      if (reduceQuery.matches || !inView || !pageVisible) {
        stop();
        return;
      }
      if (frame) return;
      lastTick = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const drawStatic = () => draw(performance.now(), 0);

    let pending = 0;
    let disposed = false;
    const onResize = () => {
      if (disposed) return;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        measure();
        if (!frame) drawStatic();
      });
    };

    // The first measure (which computes the light texture) runs on the next frame, outside the
    // hydration task; nothing is drawn before the ignition delay anyway.
    onResize();
    run();

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onResize);
    resizeObserver?.observe(canvas);
    // Web fonts can shift the layout without resizing the canvas.
    document.fonts?.ready.then(onResize).catch(() => {});

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            run();
          });
    io?.observe(canvas);

    const onVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      run();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onMotionPreference = () => {
      run();
      if (!frame) drawStatic();
    };
    reduceQuery.addEventListener("change", onMotionPreference);

    return () => {
      disposed = true;
      stop();
      cancelAnimationFrame(pending);
      resizeObserver?.disconnect();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      reduceQuery.removeEventListener("change", onMotionPreference);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none", className)} />;
}
