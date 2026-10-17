/**
 * A night road drawn in perspective, lit by either a faded halogen headlight ("before") or a
 * bi-LED projector ("after"). Pure SVG, rendered on the server.
 *
 * How it works: the scene geometry is drawn twice. The first copy is the unlit night (ambient
 * only). The second copy uses "lit" surface colours and is shown through a luminance mask that
 * holds the beam pattern, so markings, posts and asphalt texture only appear where light falls.
 * Right-hand traffic (Estonia): the low-beam cutoff is flat on the left and rises toward the
 * right-hand kerb.
 *
 * Colours: SVG-only illustration values. Tokens where they fit (bg, surface, light, halogen,
 * fg); the rest are night-photography greys and the sign's red.
 */

export type RoadVariant = "before" | "after";

/* ------------------------------------------------------------------ geometry */

const W = 1600;
const H = 900;
/** Vanishing point. */
const VX = 800;
const VY = 380;
/** Focal length in px and eye height in metres. */
const F = 1400;
const EYE = 1.25;

type Pt = [number, number];

/** Projects a point at lateral offset x (m, right positive), distance z (m) and height y (m). */
function p(x: number, z: number, y = 0): Pt {
  return [VX + (F * x) / z, VY + (F * (EYE - y)) / z];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const pts = (list: Pt[]) => list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");
const poly = (list: Pt[]) => `M${pts(list).replaceAll(" ", "L")}Z`;

/**
 * Compact polygon for the large forest path: whole pixels and relative moves, always
 * clockwise so overlapping trees in one path union cleanly under the nonzero rule.
 */
function cwPolyCompact(list: Pt[]): string {
  let area = 0;
  for (let i = 0; i < list.length; i++) {
    const [x1, y1] = list[i];
    const [x2, y2] = list[(i + 1) % list.length];
    area += x1 * y2 - x2 * y1;
  }
  const ordered = (area < 0 ? [...list].reverse() : list).map(([x, y]) => [Math.round(x), Math.round(y)]);
  const [first, ...rest] = ordered;
  let prev = first;
  let d = `M${first[0]} ${first[1]}l`;
  for (const point of rest) {
    const dx = point[0] - prev[0];
    const dy = point[1] - prev[1];
    d += `${dx < 0 ? "" : " "}${dx}${dy < 0 ? "" : " "}${dy}`;
    prev = point;
  }
  return `${d}z`;
}

/** A flat strip on the road surface between x0..x1 and z0..z1. */
function groundQuad(x0: number, x1: number, z0: number, z1: number): string {
  return poly([p(x0, z0), p(x1, z0), p(x1, z1), p(x0, z1)]);
}

/** Deterministic pseudo-random numbers, so server output is stable. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const Z_NEAR = 2.4;
const Z_FAR = 4000;

const ROAD_LEFT = -5.25;
const ROAD_RIGHT = 1.75;

const road = groundQuad(ROAD_LEFT, ROAD_RIGHT, Z_NEAR, Z_FAR);
const verges =
  groundQuad(ROAD_RIGHT, 3.4, Z_NEAR, Z_FAR) + groundQuad(-7.2, ROAD_LEFT, Z_NEAR, Z_FAR);

/** Edge lines plus the dashed centre line (3 m dash, 9 m gap). */
const markings = (() => {
  let d = groundQuad(1.6, 1.74, Z_NEAR, Z_FAR) + groundQuad(-5.22, -5.08, Z_NEAR, Z_FAR);
  for (let z = 3; z < 420; z += 12) d += groundQuad(-1.82, -1.68, z, z + 3);
  return d;
})();

/** Faint polished wheel tracks in our lane. */
const wheelTracks = groundQuad(-0.95, -0.45, Z_NEAR, Z_FAR) + groundQuad(0.45, 0.95, Z_NEAR, Z_FAR);

/** Spruce forest walls on both sides of the road. */
const forest = (() => {
  const rand = mulberry32(7);
  let d = "";
  for (const side of [-1, 1] as const) {
    const edge = side * 18;
    // Dense undergrowth band so there are no gaps between trunks.
    d += cwPolyCompact([p(edge, 12, 0), p(edge, Z_FAR, 0), p(edge, Z_FAR, 5), p(edge, 12, 5)]);
    for (let z = 14; z < 900; z *= 1.055) {
      const x = edge + side * rand() * 6;
      const height = 8 + rand() * 10;
      const half = 1.4 + rand() * 1.2;
      const [bx, by] = p(x, z, 2);
      const s = F / z;
      const top = by - (height - 2) * s;
      const hw = half * s;
      const tall = by - top;
      // Skip trees that are entirely outside the frame.
      if (bx + hw < -20 || bx - hw > W + 20) continue;
      const tiers = 5;
      const right: Pt[] = [];
      for (let i = 1; i <= tiers; i++) {
        const t = i / tiers;
        const w = hw * (0.2 + 0.8 * t) * (0.85 + rand() * 0.3);
        right.push([bx + w, top + tall * t]);
        if (i < tiers) right.push([bx + w * 0.4, top + tall * (t + 0.04)]);
      }
      const left = right.map(([x2, y2]): Pt => [2 * bx - x2, y2]).reverse();
      d += cwPolyCompact([[bx, top], ...right, [bx, by], ...left]);
    }
  }
  return d;
})();

/** Delineator posts: white body, black band, reflector. */
interface Post {
  x: number;
  z: number;
}
const posts: Post[] = [
  ...[8, 24, 40, 56, 72, 88, 104, 120, 136].map((z) => ({ x: 2.75, z })),
  ...[16, 32, 48, 64, 80, 96, 112].map((z) => ({ x: -6.3, z })),
];
const POST_W = 0.16;

function postRect(post: Post, y0: number, y1: number, inset = 0): string {
  const half = POST_W / 2 - inset;
  return poly([
    p(post.x - half, post.z, y0),
    p(post.x + half, post.z, y0),
    p(post.x + half, post.z, y1),
    p(post.x - half, post.z, y1),
  ]);
}
const postBodies = posts.map((post) => postRect(post, 0, 1)).join("");
const postBands = posts.map((post) => postRect(post, 0.72, 0.93)).join("");
const reflectors = posts.map((post) => ({ post, d: postRect(post, 0.78, 0.87, 0.035) }));

/** Moose warning sign on the right verge. */
const SIGN = { x: 3.6, z: 22, bottom: 1.45, side: 1.25 };
const signPole = poly([
  p(SIGN.x - 0.04, SIGN.z, 0),
  p(SIGN.x + 0.04, SIGN.z, 0),
  p(SIGN.x + 0.04, SIGN.z, SIGN.bottom + 0.4),
  p(SIGN.x - 0.04, SIGN.z, SIGN.bottom + 0.4),
]);
function triangle(inset: number): string {
  const h = (SIGN.side * Math.sqrt(3)) / 2;
  const half = SIGN.side / 2;
  // Inset measured perpendicular to each edge.
  const dy = inset;
  const dx = inset * Math.sqrt(3);
  return poly([
    p(SIGN.x - half + dx, SIGN.z, SIGN.bottom + dy),
    p(SIGN.x + half - dx, SIGN.z, SIGN.bottom + dy),
    p(SIGN.x, SIGN.z, SIGN.bottom + h - 2 * dy),
  ]);
}
const signOuter = triangle(0);
const signFace = triangle(0.13);
const [signCx, signTop] = p(SIGN.x, SIGN.z, SIGN.bottom + (SIGN.side * Math.sqrt(3)) / 2);
const [, signBottom] = p(SIGN.x, SIGN.z, SIGN.bottom);
const signHeight = signBottom - signTop;
/** Moose scale and offset so the 100×100 pictogram sits low in the triangle. */
const mooseScale = (signHeight * 0.5) / 50;
const mooseX = signCx - 50 * mooseScale;
const mooseY = signTop + signHeight * 0.66 - 55 * mooseScale;
/** Moose pictogram in a 100×100 box, facing left. */
const MOOSE =
  "M14 54 L21 47 L29 42 L27 33 L31 37 L33 29 L36 36 L40 31 L40 40 L46 44 L57 38 L77 40 L85 44 L87 52 L85 58 L85 78 L81 78 L80 62 L77 62 L76 78 L72 78 L71 60 L52 60 L50 78 L46 78 L46 62 L42 62 L41 78 L37 78 L38 58 L34 52 L29 54 L26 59 L23 54 L15 58 Z";

const VISIBLE_SKY = VY + 2;

/* ------------------------------------------------------------------ palettes */

interface Palette {
  ground: string;
  verge: string;
  road: string;
  markings: string;
  forest: string;
  postBody: string;
  postBand: string;
  pole: string;
}

const NIGHT: Palette = {
  ground: "#060708",
  verge: "#08090a",
  road: "#0a0b0d",
  markings: "#15171a",
  forest: "#030405",
  postBody: "#121417",
  postBand: "#07080a",
  pole: "#0d0e10",
};

const LIT: Record<RoadVariant, Palette> = {
  before: {
    ground: "#30291b",
    verge: "#6a5638",
    road: "#94784c",
    markings: "#ffd9a0",
    forest: "#17140d",
    postBody: "#f3d5a2",
    postBand: "#1a150d",
    pole: "#6b5d48",
  },
  after: {
    ground: "#1a201d",
    verge: "#5d646c",
    road: "#8a939e",
    markings: "#f2f4f7",
    forest: "#101512",
    postBody: "#e8f4ff",
    postBand: "#0b0d10",
    pole: "#8a93a0",
  },
};

/** How strongly each post's reflector returns light, by variant. */
function reflectorStrength(variant: RoadVariant, post: Post): number {
  if (variant === "after") {
    // Right verge: lit all the way out by the rising kink. Left: dark beyond the flat cutoff.
    if (post.x > 0) return Math.max(0.55, 1 - post.z / 300);
    return post.z <= 32 ? 0.75 : post.z <= 48 ? 0.3 : 0.08;
  }
  if (post.x > 0) return post.z <= 8 ? 0.6 : post.z <= 24 ? 0.16 : 0.05;
  return post.z <= 16 ? 0.22 : 0.04;
}

/* ------------------------------------------------------------------ component */

export function RoadScene({
  variant,
  label,
  className,
}: {
  variant: RoadVariant;
  /** Accessible description of the scene. */
  label: string;
  className?: string;
}) {
  const id = (name: string) => `rs-${variant}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const ref = (name: string) => `#${id(name)}`;
  const lit = LIT[variant];
  const after = variant === "after";
  const glint = after ? "#ffffff" : "#ffc46b";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      className={className}
    >
      <defs>
        {/* Shared geometry, filled differently by each copy. */}
        <path id={id("road")} d={road} />
        <path id={id("verges")} d={verges} />
        <path id={id("markings")} d={markings} />
        <path id={id("forest")} d={forest} />
        <path id={id("post-bodies")} d={postBodies} />
        <path id={id("post-bands")} d={postBands} />
        <path id={id("pole")} d={signPole} />

        <linearGradient id={id("sky")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#020304" />
          <stop offset="0.65" stopColor="#070a0e" />
          <stop offset="1" stopColor="#141c26" />
        </linearGradient>

        <radialGradient id={id("vignette")} cx="0.5" cy="0.55" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.7" />
        </radialGradient>

        {/* Asphalt grain, multiplied into the lit road only. */}
        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="speckle">
            <feFuncR type="linear" slope="1.1" intercept="0.25" />
            <feFuncG type="linear" slope="1.1" intercept="0.25" />
            <feFuncB type="linear" slope="1.1" intercept="0.25" />
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="speckle" mode="multiply" result="textured" />
          <feComposite in="textured" in2="SourceGraphic" operator="in" />
        </filter>

        <filter id={id("soft")} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="6" />
        </filter>

        <filter id={id("glow")} x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {after ? (
          <>
            {/* Sharp stepped cutoff: flat left at 420, elbow at the centre, 15° rise to the right. */}
            <clipPath id={id("cutoff")}>
              <path d="M0,900 L0,420 L800,420 L1600,205.6 L1600,900 Z" />
            </clipPath>
            <filter id={id("edge")} x="-5%" y="-5%" width="110%" height="110%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <radialGradient
              id={id("broad")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(820 660) scale(900 470)"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.62" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0.38" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id={id("hot")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(880 440) scale(560 120)"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="0.6" stopColor="#fff" stopOpacity="0.35" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id={id("kink")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(1000 405) rotate(-15) scale(330 46)"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={id("beam")} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <g filter={url("edge")}>
                <g clipPath={url("cutoff")}>
                  <rect width={W} height={H} fill={url("broad")} />
                  <rect width={W} height={H} fill={url("hot")} />
                  <rect width={W} height={H} fill={url("kink")} />
                </g>
              </g>
            </mask>
            <radialGradient
              id={id("air")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(880 410) scale(700 90)"
            >
              <stop offset="0" stopColor="#e8f4ff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#e8f4ff" stopOpacity="0" />
            </radialGradient>
          </>
        ) : (
          <>
            {/* The same stepped pattern, but low, short and smeared by a hazy lens. */}
            <clipPath id={id("cutoff")}>
              <path d="M0,900 L0,585 L780,585 L1600,400 L1600,900 Z" />
            </clipPath>
            <filter id={id("smear")} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="34" />
            </filter>
            <radialGradient
              id={id("pool")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(800 960) scale(880 420)"
            >
              <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="0.35" stopColor="#fff" stopOpacity="0.62" />
              <stop offset="0.7" stopColor="#fff" stopOpacity="0.2" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <mask id={id("beam")} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
              <g filter={url("smear")}>
                <g clipPath={url("cutoff")}>
                  <rect width={W} height={H} fill={url("pool")} />
                </g>
              </g>
            </mask>
            <radialGradient
              id={id("veil")}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(800 820) scale(1000 560)"
            >
              <stop offset="0" stopColor="#ffc46b" stopOpacity="0.22" />
              <stop offset="0.6" stopColor="#ffc46b" stopOpacity="0.08" />
              <stop offset="1" stopColor="#ffc46b" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>

      {/* Unlit night. */}
      <rect width={W} height={VISIBLE_SKY} fill={url("sky")} />
      <rect y={VY} width={W} height={H - VY} fill={NIGHT.ground} />
      <use href={ref("verges")} fill={NIGHT.verge} />
      <use href={ref("road")} fill={NIGHT.road} />
      <use href={ref("markings")} fill={NIGHT.markings} />
      <use href={ref("forest")} fill={NIGHT.forest} />
      <use href={ref("post-bodies")} fill={NIGHT.postBody} />
      <use href={ref("post-bands")} fill={NIGHT.postBand} />
      <use href={ref("pole")} fill={NIGHT.pole} />
      <path d={signOuter} fill="#101114" />

      {/* What the headlight reveals. */}
      <g mask={url("beam")}>
        <rect y={VY} width={W} height={H - VY} fill={lit.ground} />
        <use href={ref("verges")} fill={lit.verge} />
        <use href={ref("road")} fill={lit.road} filter={url("grain")} />
        <path d={wheelTracks} fill="#000" opacity={0.07} filter={url("soft")} />
        <use href={ref("markings")} fill={lit.markings} />
        <use href={ref("forest")} fill={lit.forest} />
        <use href={ref("post-bodies")} fill={lit.postBody} />
        <use href={ref("post-bands")} fill={lit.postBand} />
        <use href={ref("pole")} fill={lit.pole} />
      </g>

      {/* Retroreflectors return the light's own colour. */}
      <g filter={url("glow")}>
        {reflectors.map(({ post, d }) => (
          <path key={`${post.x}-${post.z}`} d={d} fill={glint} opacity={reflectorStrength(variant, post)} />
        ))}
      </g>

      {/* Retroreflective sign: blazing under the LED beam, barely there under the halogen. */}
      <g opacity={after ? 1 : 0.13} filter={after ? url("glow") : undefined}>
        <path d={signOuter} fill={after ? "#d0313d" : "#8c4a2a"} />
        <path d={signFace} fill={after ? "#f4f8ff" : "#ffe2b0"} />
        <path
          d={MOOSE}
          fill="#0b0d10"
          transform={`translate(${r1(mooseX)} ${r1(mooseY)}) scale(${mooseScale.toFixed(3)})`}
        />
      </g>

      {after ? (
        <rect width={W} height={H} fill={url("air")} />
      ) : (
        <>
          <rect width={W} height={H} fill={url("veil")} />
          <rect width={W} height={H} fill="#ffc46b" opacity={0.025} />
        </>
      )}

      <rect width={W} height={H} fill={url("vignette")} />
    </svg>
  );
}
