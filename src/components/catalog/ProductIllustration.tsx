"use client";

import type { CategoryId } from "@/data/types";
import { cn } from "@/lib/cn";

/**
 * Studio "product shots" drawn in SVG, one per kind of part, standing in for photos until the
 * client supplies real ones. Every render shares one set-up so a grid of them reads as a single
 * shoot: a key light from the upper left, a cold accent rim light from the back right, a dark
 * glossy plinth with an accent edge, a contact shadow and a soft reflection of the part.
 *
 * Performance: the catalog shows 63 of these. Each kind of shot is serialised once into a
 * data-URI background in a hoisted, de-duplicated `<style>` (React merges styles by `href`), and
 * every illustration is a single element using it. Inline SVGs would put roughly 7,000 extra
 * nodes in the catalog's DOM and make every filter change re-create them. No SVG filters
 * either: glows are radial gradients.
 *
 * It is a client component on purpose. Rendered from a Server Component, every instance's
 * `<style>` text would travel in the RSC payload (the DOM still holds one per shot), so a page
 * with 14 renders carried 14 copies. As a client leaf, the payload only holds
 * `{ category, className }` and the style text is built from this module's code.
 */

/**
 * The theme tokens from `globals.css`. An SVG used as an image is its own document, where the
 * page's CSS variables don't resolve, so the values are repeated here.
 */
const C = {
  bg: "#050607",
  surface: "#0b0d10",
  surface2: "#12151a",
  fg: "#f2f4f7",
  muted: "#8a93a0",
  light: "#e8f4ff",
  accent: "#4cc3ff",
  halogen: "#ffc46b",
} as const;

/** Plinth geometry, shared by every shot (viewBox 400 × 300, cropped to the 4:3 frame below). */
const P = { cx: 200, cy: 232, rx: 130, ry: 24, h: 16 } as const;
const FRAME = { x: 24, y: 30, w: 352, h: 264 } as const;

type Shot =
  | "projector-led"
  | "projector-xenon"
  | "lens"
  | "bulb-xenon"
  | "bulb-halogen"
  | "ballast"
  | "shroud"
  | "adapter"
  | "led-light"
  | "fitting";

const shotFor: Record<CategoryId, Shot> = {
  "led-projectors": "projector-led",
  "xenon-projectors": "projector-xenon",
  lenses: "lens",
  "xenon-bulbs": "bulb-xenon",
  halogen: "bulb-halogen",
  ballasts: "ballast",
  shrouds: "shroud",
  adapters: "adapter",
  "led-lights": "led-light",
  fitting: "fitting",
};

/* ----------------------------------------------------------------------------------------- */
/* A tiny SVG writer                                                                         */
/* ----------------------------------------------------------------------------------------- */

type Attrs = Record<string, string | number | undefined>;

/** `<tag a="1" …/>`, or with children `<tag …>…</tag>`. Undefined attributes are left out. */
function el(tag: string, attrs: Attrs, ...children: string[]): string {
  const list = Object.entries(attrs)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  return children.length > 0 ? `<${tag}${list}>${children.join("")}</${tag}>` : `<${tag}${list}/>`;
}

const g = (attrs: Attrs, ...children: string[]) => el("g", attrs, ...children);
const path = (d: string, attrs: Attrs = {}) => el("path", { d, ...attrs });
const ellipse = (cx: number, cy: number, rx: number, ry: number, attrs: Attrs = {}) =>
  el("ellipse", { cx, cy, rx, ry, ...attrs });
const stop = (offset: number, color: string, opacity = 1) =>
  el("stop", { offset, "stop-color": color, "stop-opacity": opacity === 1 ? undefined : opacity });
const url = (id: string) => `url(#${id})`;

/** A stroke-only path. */
const line = (d: string, stroke: string, width: number, extra: Attrs = {}) =>
  path(d, { fill: "none", stroke, "stroke-width": width, ...extra });

/* ----------------------------------------------------------------------------------------- */
/* Lights, materials and the set                                                            */
/* ----------------------------------------------------------------------------------------- */

function defs(): string {
  const lin = (id: string, x2: number, y2: number, ...stops: string[]) =>
    el("linearGradient", { id, x1: 0, y1: 0, x2, y2 }, ...stops);
  const rad = (id: string, attrs: Attrs, ...stops: string[]) =>
    el("radialGradient", { id, ...attrs }, ...stops);
  const top = P.cy - P.ry;

  return el(
    "defs",
    {},
    // Scene
    lin("backdrop", 0, 1, stop(0, C.surface2), stop(0.62, C.surface), stop(1, C.bg)),
    rad("key", {}, stop(0, C.light, 0.11), stop(0.55, C.light, 0.03), stop(1, C.light, 0)),
    rad("rimlight", {}, stop(0, C.accent, 0.2), stop(0.5, C.accent, 0.06), stop(1, C.accent, 0)),
    lin("plinth-top", 0, 1, stop(0, C.surface2), stop(1, C.surface)),
    rad("plinth-sheen", { cx: 0.36, cy: 0.3, r: 0.7 }, stop(0, C.light, 0.1), stop(1, C.light, 0)),
    lin("plinth-side", 1, 0, stop(0, C.surface2), stop(0.55, C.bg), stop(1, C.surface)),
    lin(
      "plinth-edge",
      1,
      0,
      stop(0, C.light, 0),
      stop(0.3, C.light, 0.28),
      stop(0.62, C.accent, 0.55),
      stop(0.86, C.accent, 1),
      stop(1, C.accent, 0),
    ),
    rad("floor", {}, stop(0, C.accent, 0.12), stop(1, C.accent, 0)),
    rad("shadow", {}, stop(0, C.bg, 0.95), stop(0.6, C.bg, 0.5), stop(1, C.bg, 0)),
    el(
      "linearGradient",
      {
        id: "fade",
        gradientUnits: "userSpaceOnUse",
        x1: 0,
        y1: P.cy - 6,
        x2: 0,
        y2: P.cy + P.ry - 4,
      },
      stop(0, C.light, 0.32),
      stop(1, C.light, 0),
    ),
    el(
      "mask",
      { id: "reflection-mask", maskUnits: "userSpaceOnUse", x: 0, y: top, width: 400, height: P.ry * 2 },
      el("rect", { x: 0, y: top, width: 400, height: P.ry * 2, fill: url("fade") }),
    ),
    el("clipPath", { id: "plinth-clip" }, ellipse(P.cx, P.cy, P.rx, P.ry)),

    // Materials, lit from the upper left
    lin("metal", 1, 1, stop(0, C.muted), stop(0.4, C.surface2), stop(1, C.bg)),
    lin("metal-v", 0, 1, stop(0, C.muted), stop(0.35, C.surface2), stop(1, C.bg)),
    lin("dark", 1, 1, stop(0, C.surface2), stop(1, C.bg)),
    lin(
      "chrome",
      1,
      1,
      stop(0, C.light),
      stop(0.28, C.muted),
      stop(0.52, C.surface),
      stop(0.78, C.muted),
      stop(1, C.surface2),
    ),
    lin("rim", 1, 0, stop(0.35, C.accent, 0), stop(1, C.accent)),
    lin("spec", 1, 1, stop(0, C.light, 0.85), stop(1, C.light, 0)),
    rad(
      "glass",
      { cx: 0.4, cy: 0.36, r: 0.68 },
      stop(0, C.surface2),
      stop(0.55, C.bg),
      stop(0.86, C.surface),
      stop(1, C.accent, 0.55),
    ),
    rad(
      "emit",
      {},
      stop(0, C.light, 0.95),
      stop(0.18, C.light, 0.5),
      stop(0.42, C.accent, 0.22),
      stop(1, C.accent, 0),
    ),
  );
}

/** Backdrop, lights and plinth (identical in every shot) around the subject. */
function set(subject: string): string {
  const left = P.cx - P.rx;
  const right = P.cx + P.rx;
  return [
    el("rect", { width: 400, height: 300, fill: url("backdrop") }),
    ellipse(128, 34, 250, 170, { fill: url("key") }),
    ellipse(292, 128, 150, 120, { fill: url("rimlight") }),
    ellipse(P.cx, P.cy + P.h + 10, 190, 30, { fill: url("floor") }),
    // Plinth
    path(
      `M${left} ${P.cy} A${P.rx} ${P.ry} 0 0 0 ${right} ${P.cy} L${right} ${P.cy + P.h} A${P.rx} ${P.ry} 0 0 1 ${left} ${P.cy + P.h} Z`,
      { fill: url("plinth-side") },
    ),
    ellipse(P.cx, P.cy, P.rx, P.ry, { fill: url("plinth-top") }),
    ellipse(P.cx, P.cy, P.rx, P.ry, { fill: url("plinth-sheen") }),
    line(`M${left} ${P.cy} A${P.rx} ${P.ry} 0 0 1 ${right} ${P.cy}`, C.light, 1, {
      "stroke-opacity": 0.09,
    }),
    line(`M${left} ${P.cy + P.h} A${P.rx} ${P.ry} 0 0 0 ${right} ${P.cy + P.h}`, C.fg, 1, {
      "stroke-opacity": 0.06,
    }),
    subject,
    line(`M${left} ${P.cy} A${P.rx} ${P.ry} 0 0 0 ${right} ${P.cy}`, url("plinth-edge"), 1.25),
  ].join("");
}

/** The part, its reflection in the plinth and its contact shadow, plus any emitted light. */
function subject(shadow: { x: number; rx: number }, part: string, glow = ""): string {
  return [
    g(
      { "clip-path": url("plinth-clip") },
      g(
        { mask: url("reflection-mask") },
        el("use", { href: "#part", transform: `matrix(1 0 0 -1 0 ${P.cy * 2})` }),
      ),
    ),
    ellipse(shadow.x, P.cy - 1, shadow.rx, 9, { fill: url("shadow") }),
    g({ id: "part" }, part),
    glow,
  ].join("");
}

/* ----------------------------------------------------------------------------------------- */
/* Parts                                                                                     */
/* ----------------------------------------------------------------------------------------- */

/** Bi-LED or bi-xenon projector: lens and barrel up front, heat sink or bulb socket behind. */
function projector(kind: "led" | "xenon"): string {
  const lens = { x: 166, y: 148, rx: 52, ry: 66 };
  const rear = { x: 222, y: 150, rx: 42, ry: 54 };
  const glass = { rx: lens.rx - 7, ry: lens.ry - 8 };

  const fins = Array.from({ length: 10 }, (_, i) => {
    const t = i / 9;
    const x = 238 + t * 58;
    const y1 = 104 + t * 10;
    const y2 = 204 - t * 10;
    return (
      path(`M${x} ${y1} L${x + 4} ${y1 + 0.7} L${x + 4} ${y2 - 0.7} L${x} ${y2} Z`, {
        fill: url("metal-v"),
      }) + line(`M${x} ${y1} L${x} ${y2}`, C.light, 0.75, { "stroke-opacity": 0.3 })
    );
  }).join("");

  const lead = (d: string, highlight: string) =>
    line(d, C.surface2, 5, { "stroke-linecap": "round" }) +
    line(highlight, C.light, 1, { "stroke-opacity": 0.18 });

  const back =
    kind === "led"
      ? // Finned heat sink and driver lead
        path("M230 102 L300 114 L300 192 L230 206 Z", { fill: C.bg }) +
        fins +
        line("M304 116 L304 190", url("rim"), 1.75) +
        lead("M290 192 C 302 206, 312 216, 330 222", "M290 190 C 302 204, 312 214, 330 220")
      : // Reflector bowl, bulb socket and lead
        ellipse(250, 150, 40, 58, { fill: url("dark") }) +
        line("M250 92 A40 58 0 0 1 250 208", url("rim"), 1.75) +
        path("M268 128 L302 132 L302 170 L268 174 Z", { fill: url("metal-v") }) +
        ellipse(302, 151, 7, 19, { fill: url("metal") }) +
        line("M302 132 A7 19 0 0 1 302 170", C.accent, 1.25) +
        lead("M302 166 C 312 190, 318 210, 334 222", "M302 164 C 312 188, 318 208, 334 220");

  return subject(
    { x: 214, rx: 100 },
    [
      back,
      // Mounting foot
      path("M182 206 L222 200 L226 232 L176 232 Z", { fill: url("dark") }),
      line("M222 200 L226 232", url("rim"), 1.25),
      // Barrel
      path(
        `M${lens.x} ${lens.y - lens.ry} L${rear.x} ${rear.y - rear.ry} A${rear.rx} ${rear.ry} 0 0 1 ${rear.x} ${rear.y + rear.ry} L${lens.x} ${lens.y + lens.ry} Z`,
        { fill: url("metal-v") },
      ),
      line(
        `M${rear.x} ${rear.y - rear.ry} A${rear.rx} ${rear.ry} 0 0 1 ${rear.x} ${rear.y + rear.ry}`,
        url("rim"),
        1.75,
      ),
      line(`M${lens.x} ${lens.y - lens.ry} L${rear.x} ${rear.y - rear.ry}`, C.light, 1, {
        "stroke-opacity": 0.5,
      }),
      // Retaining ring and glass
      ellipse(lens.x, lens.y, lens.rx, lens.ry, { fill: url("chrome") }),
      ellipse(lens.x - 1, lens.y, glass.rx, glass.ry, { fill: url("glass") }),
      ellipse(lens.x + 2, lens.y + 2, glass.rx - 12, glass.ry - 14, {
        fill: "none",
        stroke: C.light,
        "stroke-opacity": 0.06,
        "stroke-width": 6,
      }),
      // Cut-off shield, seen through the glass
      line(
        `M${lens.x - 34} ${lens.y + 8} L${lens.x - 2} ${lens.y + 8} L${lens.x + 10} ${lens.y - 2} L${lens.x + 34} ${lens.y - 2}`,
        C.accent,
        1,
        { "stroke-opacity": 0.28 },
      ),
      // Softbox reflection, crescent and glints
      el("rect", {
        x: lens.x - 30,
        y: lens.y - 46,
        width: 26,
        height: 14,
        rx: 4,
        transform: `rotate(-30 ${lens.x - 17} ${lens.y - 39})`,
        fill: C.light,
        "fill-opacity": 0.2,
      }),
      line(
        `M${lens.x - 38} ${lens.y - 12} C ${lens.x - 38} ${lens.y - 40}, ${lens.x - 22} ${lens.y - 56}, ${lens.x} ${lens.y - 57}`,
        url("spec"),
        4,
        { "stroke-linecap": "round", "stroke-opacity": 0.8 },
      ),
      el("circle", { cx: lens.x - 22, cy: lens.y - 30, r: 2, fill: C.light }),
      line(
        `M${lens.x + 8} ${lens.y + glass.ry - 2} A${glass.rx} ${glass.ry} 0 0 0 ${lens.x + glass.rx - 4} ${lens.y + 16}`,
        C.accent,
        1.75,
        { "stroke-linecap": "round" },
      ),
      line(
        `M${lens.x + glass.rx - 2} ${lens.y + 8} A${glass.rx} ${glass.ry} 0 0 0 ${lens.x + glass.rx - 10} ${lens.y - 30}`,
        C.accent,
        1,
        { "stroke-opacity": 0.35, "stroke-linecap": "round" },
      ),
    ].join(""),
  );
}

/** Replacement headlight lens: a clear, domed polycarbonate outer cover. */
function lens(): string {
  const outline =
    "M92 156 C 92 116, 118 98, 160 98 L 298 112 C 326 115, 336 134, 324 154 L 302 198 C 294 214, 278 222, 254 224 L 140 228 C 108 229, 92 200, 92 156 Z";
  return subject(
    { x: 210, rx: 118 },
    [
      // Mounting flange behind the clear face
      path(outline, { transform: "translate(12 -6)", fill: C.surface }),
      path(outline, {
        transform: "translate(12 -6)",
        fill: "none",
        stroke: C.muted,
        "stroke-opacity": 0.45,
        "stroke-width": 1,
      }),
      line("M310 106 C 338 109, 348 128, 336 148 L 314 192", url("rim"), 1.75),
      // Clear face: the backdrop shows through, lifted by the key light
      path(outline, { fill: url("backdrop"), "fill-opacity": 0.85 }),
      path(outline, { fill: url("key") }),
      path(outline, { fill: C.light, "fill-opacity": 0.04 }),
      // Inner edge of the lens
      line(
        "M106 156 C 106 124, 126 110, 162 110 L 294 123 C 314 125, 320 138, 312 152 L 292 192 C 286 204, 274 210, 254 211 L 142 214 C 118 215, 106 194, 106 156 Z",
        C.light,
        1,
        { "stroke-opacity": 0.14 },
      ),
      line(outline, C.light, 1.25, { "stroke-opacity": 0.6 }),
      // Specular streaks following the dome
      line("M110 136 C 128 112, 168 106, 280 118", url("spec"), 7, {
        "stroke-linecap": "round",
        "stroke-opacity": 0.6,
      }),
      line("M118 176 C 150 150, 220 142, 300 148", C.light, 3, {
        "stroke-linecap": "round",
        "stroke-opacity": 0.1,
      }),
      line(
        "M298 112 C 326 115, 336 134, 324 154 L 302 198 C 294 214, 278 222, 254 224",
        url("rim"),
        1.75,
      ),
    ].join(""),
  );
}

/** D-series xenon capsule, or a halogen bulb. The light source glows. */
function bulb(kind: "xenon" | "halogen"): string {
  if (kind === "halogen") {
    return subject(
      { x: 202, rx: 64 },
      [
        // Metal holder and flange
        path("M178 186 L222 186 L222 228 L178 228 Z", { fill: url("metal") }),
        line("M222 186 L222 228", url("rim"), 1.5),
        ellipse(200, 186, 44, 8, { fill: url("chrome") }),
        line("M244 186 A44 8 0 0 1 156 186", C.accent, 1, { "stroke-opacity": 0.7 }),
        // Glass envelope with its dark tip
        path("M184 182 L184 98 C 184 84, 216 84, 216 98 L 216 182 Z", {
          fill: C.light,
          "fill-opacity": 0.08,
        }),
        line("M184 182 L184 98 C 184 84, 216 84, 216 98 L 216 182", C.light, 1, {
          "stroke-opacity": 0.5,
        }),
        path("M188 92 C 196 84, 206 84, 212 92 L 212 100 L 188 100 Z", { fill: C.bg }),
        line("M190 104 L190 170", url("spec"), 3, { "stroke-linecap": "round" }),
        // Filament and supports
        line("M196 182 L196 132 M204 182 L204 132", C.muted, 1),
        line("M188 128 l3 -4 l3 8 l3 -8 l3 8 l3 -8 l3 8 l3 -8 l3 4", C.light, 1.5, {
          "stroke-linejoin": "round",
        }),
      ].join(""),
      g(
        {},
        ellipse(200, 128, 74, 74, { fill: url("emit"), opacity: 0.75 }),
        ellipse(200, 128, 22, 12, { fill: C.halogen, "fill-opacity": 0.18 }),
      ),
    );
  }

  return subject(
    { x: 202, rx: 70 },
    [
      // Plastic base with ribs
      path("M170 172 L230 172 L230 228 L170 228 Z", { fill: url("dark") }),
      ...[184, 196, 208].map((y) =>
        line(`M170 ${y} L230 ${y}`, C.fg, 1, { "stroke-opacity": 0.07 }),
      ),
      line("M230 172 L230 228", url("rim"), 1.5),
      // Metal mounting ring with tabs
      path("M158 164 L242 164 L242 174 L158 174 Z", { fill: url("chrome") }),
      path("M150 166 L158 166 L158 172 L150 172 Z M242 166 L250 166 L250 172 L242 172 Z", {
        fill: url("metal"),
      }),
      line("M158 164 L242 164", C.light, 0.75, { "stroke-opacity": 0.6 }),
      // Outer glass tube
      path("M190 164 L190 66 C 190 56, 210 56, 210 66 L 210 164 Z", {
        fill: C.light,
        "fill-opacity": 0.07,
      }),
      line("M190 164 L190 66 C 190 56, 210 56, 210 66 L 210 164", C.light, 1, {
        "stroke-opacity": 0.45,
      }),
      line("M194 74 L194 150", url("spec"), 2.5, { "stroke-linecap": "round" }),
      // Arc capsule and electrodes
      line("M200 66 L200 90 M200 118 L200 164", C.muted, 1.25),
      ellipse(200, 104, 7, 15, { fill: C.light, "fill-opacity": 0.3 }),
      ellipse(200, 104, 3, 6, { fill: C.light }),
      // Return wire
      line("M222 164 L222 70 C 222 62, 214 60, 206 62", C.muted, 1.25),
      line("M222 164 L222 70", C.accent, 0.75, { "stroke-opacity": 0.6 }),
    ].join(""),
    ellipse(200, 104, 78, 78, { fill: url("emit") }),
  );
}

/** Finned aluminium ballast with its lead. */
function ballast(): string {
  const fins = Array.from({ length: 6 }, (_, i) => {
    const t = (i + 1) / 7;
    const x1 = 112 + (156 - 112) * t;
    const y1 = 146 + (126 - 146) * t;
    const x2 = 250 + (292 - 250) * t;
    const y2 = 156 + (134 - 156) * t;
    return (
      line(`M${x1} ${y1} L${x2} ${y2}`, C.bg, 2.5, { "stroke-opacity": 0.8 }) +
      line(`M${x1} ${y1 - 1.5} L${x2} ${y2 - 1.5}`, C.light, 0.75, { "stroke-opacity": 0.3 })
    );
  }).join("");

  return subject(
    { x: 206, rx: 108 },
    [
      // Lead and connector
      line("M286 190 C 306 196, 318 208, 316 224", C.surface2, 6, { "stroke-linecap": "round" }),
      path("M306 214 L326 214 L326 230 L306 230 Z", { fill: url("dark") }),
      line("M326 214 L326 230", C.accent, 1.25),
      // Front, top and right faces
      path("M112 146 L250 156 L250 226 L112 216 Z", { fill: url("metal-v") }),
      path("M112 146 L250 156 L292 134 L156 126 Z", { fill: url("metal") }),
      path("M250 156 L292 134 L292 202 L250 226 Z", { fill: url("dark") }),
      line("M292 134 L292 202 L250 226", url("rim"), 1.5),
      fins,
      line("M112 146 L250 156", C.light, 1, { "stroke-opacity": 0.55 }),
      // Label plate and status light
      path("M128 168 L198 173 L198 202 L128 197 Z", { fill: C.bg, "fill-opacity": 0.55 }),
      line("M136 178 L180 181 M136 186 L170 188.5", C.muted, 1.5, { "stroke-opacity": 0.5 }),
      el("circle", { cx: 226, cy: 185, r: 3, fill: C.accent, "fill-opacity": 0.9 }),
    ].join(""),
  );
}

/** Projector shroud: a deep bezel ring. */
function shroud(): string {
  return subject(
    { x: 204, rx: 90 },
    [
      // Back edge, for thickness
      ellipse(206, 146, 78, 84, { fill: C.surface }),
      line("M206 62 A78 84 0 0 1 206 230", url("rim"), 1.75),
      // Face of the bezel and the cone into the opening
      ellipse(196, 146, 78, 84, { fill: url("chrome") }),
      ellipse(196, 146, 72, 78, { fill: url("dark") }),
      ellipse(200, 148, 50, 56, { fill: url("metal") }),
      ellipse(206, 150, 38, 43, { fill: C.bg }),
      ellipse(208, 151, 30, 34, { fill: url("glass") }),
      // Highlights
      line("M132 120 C 140 92, 166 72, 196 68", url("spec"), 4, { "stroke-linecap": "round" }),
      line("M160 128 C 164 112, 176 102, 190 98", C.light, 1.5, {
        "stroke-opacity": 0.35,
        "stroke-linecap": "round",
      }),
      line("M244 120 A50 56 0 0 1 222 200", C.accent, 1.25, { "stroke-opacity": 0.6 }),
    ].join(""),
  );
}

/** Adapter: a machined bracket ring with three mounting tabs. */
function adapter(): string {
  const ringPath =
    "M200 74 C 248 74, 276 108, 276 148 C 276 188, 248 222, 200 222 C 152 222, 124 188, 124 148 C 124 108, 152 74, 200 74 Z M200 110 C 222 110, 238 126, 238 148 C 238 170, 222 186, 200 186 C 178 186, 162 170, 162 148 C 162 126, 178 110, 200 110 Z";
  const tab = (cx: number, cy: number, angle: number) =>
    g(
      { transform: `rotate(${angle} ${cx} ${cy})` },
      path(
        `M${cx - 13} ${cy + 10} L${cx - 10} ${cy - 8} C ${cx - 8} ${cy - 16}, ${cx + 8} ${cy - 16}, ${cx + 10} ${cy - 8} L${cx + 13} ${cy + 10} Z`,
        { fill: url("metal") },
      ),
      el("circle", { cx, cy: cy - 5, r: 4, fill: C.bg }),
    );
  const holes = [
    [200, 92],
    [248, 176],
    [152, 176],
  ]
    .map(([cx, cy]) =>
      el("circle", { cx, cy, r: 3.5, fill: C.bg, stroke: C.light, "stroke-opacity": 0.25 }),
    )
    .join("");

  return subject(
    { x: 206, rx: 96 },
    [
      path(ringPath, { "fill-rule": "evenodd", fill: C.surface, transform: "translate(8 4)" }),
      line(
        "M208 78 C 256 78, 284 112, 284 152 C 284 192, 256 226, 208 226",
        url("rim"),
        1.75,
      ),
      tab(200, 70, 0),
      tab(268, 196, 128),
      tab(132, 196, -128),
      path(ringPath, { "fill-rule": "evenodd", fill: url("chrome") }),
      // Machined face: concentric tool marks
      ellipse(200, 148, 57, 56, { fill: "none", stroke: C.bg, "stroke-opacity": 0.35 }),
      ellipse(200, 148, 47, 46, { fill: "none", stroke: C.light, "stroke-opacity": 0.18 }),
      line("M140 118 C 150 96, 172 82, 196 80", url("spec"), 3.5, { "stroke-linecap": "round" }),
      holes,
    ].join(""),
  );
}

/** Round LED driving light with a glowing ring. */
function ledLight(): string {
  const f = { x: 186, y: 136, rx: 64, ry: 70 };
  return subject(
    { x: 204, rx: 90 },
    [
      // Bracket
      path("M176 196 L164 228 L240 228 L228 196", { fill: url("dark") }),
      line("M240 228 L228 196", url("rim"), 1.5),
      // Housing
      path(
        `M${f.x} ${f.y - f.ry} L228 ${f.y - 56} A46 56 0 0 1 228 ${f.y + 56} L${f.x} ${f.y + f.ry} Z`,
        { fill: url("metal-v") },
      ),
      line(`M228 ${f.y - 56} A46 56 0 0 1 228 ${f.y + 56}`, url("rim"), 1.75),
      line(`M${f.x} ${f.y - f.ry} L228 ${f.y - 56}`, C.light, 1, { "stroke-opacity": 0.4 }),
      // Bezel and reflector
      ellipse(f.x, f.y, f.rx, f.ry, { fill: url("chrome") }),
      ellipse(f.x, f.y, f.rx - 7, f.ry - 7, { fill: url("glass") }),
      ...[38, 28, 18].map((r) =>
        ellipse(f.x, f.y, r, r * 1.09, { fill: "none", stroke: C.light, "stroke-opacity": 0.1 }),
      ),
      el("circle", { cx: f.x, cy: f.y, r: 8, fill: C.surface2 }),
      el("circle", { cx: f.x, cy: f.y, r: 4, fill: C.light }),
      line(
        `M${f.x - 46} ${f.y - 22} C ${f.x - 42} ${f.y - 48}, ${f.x - 22} ${f.y - 60}, ${f.x} ${f.y - 60}`,
        url("spec"),
        4,
        { "stroke-linecap": "round" },
      ),
    ].join(""),
    g(
      {},
      ellipse(f.x, f.y, f.rx + 30, f.ry + 30, { fill: url("emit"), opacity: 0.55 }),
      ellipse(f.x, f.y, 44, 48, {
        fill: "none",
        stroke: C.accent,
        "stroke-opacity": 0.35,
        "stroke-width": 7,
      }),
      ellipse(f.x, f.y, 44, 48, { fill: "none", stroke: C.light, "stroke-width": 2 }),
    ),
  );
}

/** Installation accessories: a roll of butyl sealing cord. */
function fitting(): string {
  const top = { x: 194, y: 188, rx: 86, ry: 22 };
  const h = 26;
  const ratio = top.ry / top.rx;
  const l = top.x - top.rx;
  const r = top.x + top.rx;
  return subject(
    { x: 200, rx: 104 },
    [
      // Side of the roll: wound layers
      path(
        `M${l} ${top.y} A${top.rx} ${top.ry} 0 0 0 ${r} ${top.y} L${r} ${top.y + h} A${top.rx} ${top.ry} 0 0 1 ${l} ${top.y + h} Z`,
        { fill: url("dark") },
      ),
      ...[7, 13, 19].map((dy) =>
        line(`M${l} ${top.y + dy} A${top.rx} ${top.ry} 0 0 0 ${r} ${top.y + dy}`, C.light, 1, {
          "stroke-opacity": 0.07,
        }),
      ),
      line(
        `M${r} ${top.y} L${r} ${top.y + h} A${top.rx} ${top.ry} 0 0 1 ${top.x + 30} ${top.y + top.ry + h - 2}`,
        url("rim"),
        1.75,
      ),
      // Loose end of the cord
      line(
        `M${r - 14} ${top.y + h + 12} C ${r + 6} ${top.y + h + 18}, ${r + 26} ${top.y + h + 14}, ${r + 46} ${top.y + h + 26}`,
        C.surface2,
        8,
        { "stroke-linecap": "round" },
      ),
      line(
        `M${r - 12} ${top.y + h + 8.5} C ${r + 6} ${top.y + h + 14.5}, ${r + 26} ${top.y + h + 10.5}, ${r + 46} ${top.y + h + 22.5}`,
        C.light,
        1,
        { "stroke-opacity": 0.22 },
      ),
      // Wound top face
      ellipse(top.x, top.y, top.rx, top.ry, { fill: url("metal") }),
      ellipse(top.x, top.y, top.rx, top.ry, { fill: C.bg, "fill-opacity": 0.3 }),
      ...[76, 66, 56, 46, 38].map((rx) =>
        ellipse(top.x, top.y, rx, rx * ratio, {
          fill: "none",
          stroke: C.bg,
          "stroke-opacity": 0.55,
          "stroke-width": 1.5,
        }),
      ),
      ellipse(top.x, top.y + 1, 30, 30 * ratio, { fill: C.bg }),
      line(
        `M${top.x - 30} ${top.y + 1} A30 ${30 * ratio} 0 0 0 ${top.x + 30} ${top.y + 1}`,
        C.light,
        1,
        { "stroke-opacity": 0.2 },
      ),
      line(
        `M${l + 4} ${top.y - 3} A${top.rx} ${top.ry} 0 0 1 ${top.x + 20} ${top.y - top.ry}`,
        url("spec"),
        2,
        { "stroke-linecap": "round" },
      ),
    ].join(""),
  );
}

const parts: Record<Shot, () => string> = {
  "projector-led": () => projector("led"),
  "projector-xenon": () => projector("xenon"),
  lens,
  "bulb-xenon": () => bulb("xenon"),
  "bulb-halogen": () => bulb("halogen"),
  ballast,
  shroud,
  adapter,
  "led-light": ledLight,
  fitting,
};

/* ----------------------------------------------------------------------------------------- */

/** The complete, standalone SVG document for a category's shot (4:3). */
export function illustrationSvg(category: CategoryId): string {
  return el(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: `${FRAME.x} ${FRAME.y} ${FRAME.w} ${FRAME.h}`,
      width: FRAME.w,
      height: FRAME.h,
    },
    defs(),
    set(parts[shotFor[category]]()),
  );
}

/** Minimal escaping for an SVG inside `url("data:…")`, much shorter than encodeURIComponent. */
function toDataUri(svg: string): string {
  const escaped = svg
    .replace(/"/g, "'")
    .replace(/%/g, "%25")
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
  return `data:image/svg+xml,${escaped}`;
}

const rules = new Map<Shot, string>();

/** The CSS rule that paints one kind of shot, built once per module instance. */
function ruleFor(category: CategoryId): string {
  const shot = shotFor[category];
  let rule = rules.get(shot);
  if (!rule) {
    rule = `.rp-shot-${shot}{background-image:url("${toDataUri(illustrationSvg(category))}")}`;
    rules.set(shot, rule);
  }
  return rule;
}

/**
 * A decorative studio render of a product category (hidden from assistive technology; the
 * product name next to it says what it is). It fills its box and crops evenly, like
 * `object-fit: cover`, when the box isn't 4:3; give it a size, usually `aspect-[4/3] w-full`.
 */
export function ProductIllustration({
  category,
  className,
}: {
  category: CategoryId;
  className?: string;
}) {
  const shot = shotFor[category];
  return (
    <>
      <style href={`rp-shot-${shot}`} precedence="default">
        {ruleFor(category)}
      </style>
      <span
        aria-hidden="true"
        data-shot={shot}
        className={cn("block bg-cover bg-center bg-no-repeat", `rp-shot-${shot}`, className)}
      />
    </>
  );
}
