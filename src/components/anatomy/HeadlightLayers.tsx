import {
  HOUSING_BACK,
  OUTLINE,
  PROJECTOR,
  REFLECTOR,
  SHROUD_OUTLINE,
  circle,
  depths,
  mix,
  placeAt,
  roundedRect,
} from "./geometry";

/*
 * The four parts of the exploded headlight. Each part is drawn at its own depth 0; the
 * caller moves it along the optical axis. Solid parts are extruded by stacking copies of
 * their outline from back to front with a colour ramp, which reads as shaded side walls.
 *
 * SVG-only colours: theme token values (bg, surface, surface-2, muted, light, accent) plus
 * neutral metal greys.
 */

const ids = {
  cavity: "hl-cavity",
  chrome: "hl-chrome",
  ring: "hl-ring",
  glass: "hl-glass",
  beam: "hl-beam",
  shroud: "hl-shroud",
  lensGlass: "hl-lens-glass",
  spec: "hl-spec",
  glow: "hl-glow",
  bloom: "hl-bloom",
  rim: "hl-rim",
  tube: "hl-tube",
  cutoff: "hl-cutoff",
  outline: "hl-outline-clip",
};

const url = (id: string) => `url(#${id})`;

function Extrusion({
  d,
  from,
  to,
  step,
  back,
  front,
  fillRule,
  stripes,
}: {
  d: string;
  from: number;
  to: number;
  step: number;
  /** Colour of the back-most copy (ramps to `front`). */
  back: string;
  front: string;
  fillRule?: "evenodd";
  /** Instead of a ramp, alternate `back` and `front` every n copies (heat-sink fins). */
  stripes?: number;
}) {
  const list = depths(from, to, step);
  return (
    <>
      {list.map((depth, index) => {
        const t = list.length > 1 ? index / (list.length - 1) : 1;
        const fill = stripes
          ? Math.floor(index / stripes) % 2
            ? front
            : back
          : mix(back, front, t);
        return <path key={depth} d={d} transform={placeAt(depth)} fill={fill} fillRule={fillRule} />;
      })}
    </>
  );
}

export function HeadlightDefs() {
  const { cx, cy } = PROJECTOR;
  return (
    <defs>
      <radialGradient id={ids.cavity} cx="0.42" cy="0.55" r="0.75">
        <stop offset="0" stopColor="#0b0d10" />
        <stop offset="0.7" stopColor="#050607" />
        <stop offset="1" stopColor="#14181d" />
      </radialGradient>
      <radialGradient id={ids.chrome} cx="0.45" cy="0.42" r="0.6">
        <stop offset="0" stopColor="#e8f4ff" stopOpacity="0.9" />
        <stop offset="0.25" stopColor="#8a93a0" />
        <stop offset="0.7" stopColor="#23272e" />
        <stop offset="1" stopColor="#0b0d10" />
      </radialGradient>
      <linearGradient id={ids.ring} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#b8c2cd" />
        <stop offset="0.45" stopColor="#2a3038" />
        <stop offset="1" stopColor="#7d8794" />
      </linearGradient>
      <radialGradient id={ids.glass} cx="0.42" cy="0.4" r="0.65">
        <stop offset="0" stopColor="#1a2b3d" />
        <stop offset="1" stopColor="#06090c" />
      </radialGradient>
      <radialGradient id={ids.beam} cx="0.5" cy="0.62" r="0.62">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#e8f4ff" />
        <stop offset="0.75" stopColor="#4cc3ff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#4cc3ff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ids.shroud} x1="0" y1="0" x2="0.3" y2="1">
        <stop offset="0" stopColor="#323843" />
        <stop offset="0.5" stopColor="#1b1f25" />
        <stop offset="1" stopColor="#121519" />
      </linearGradient>
      <linearGradient id={ids.lensGlass} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#e8f4ff" stopOpacity="0.1" />
        <stop offset="0.5" stopColor="#e8f4ff" stopOpacity="0.02" />
        <stop offset="1" stopColor="#e8f4ff" stopOpacity="0.07" />
      </linearGradient>
      <linearGradient id={ids.spec} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>

      <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={ids.bloom} x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="16" />
      </filter>

      {/* Inside of the housing, seen through its front opening. */}
      <clipPath id={ids.rim}>
        <path d={OUTLINE} transform={placeAt(0)} />
      </clipPath>
      {/* Everything in front of the housing rim, swept along the optical axis. Parts inside
          the housing are only visible through the opening. */}
      <clipPath id={ids.tube}>
        {depths(0, 640, 16).map((depth) => (
          <path key={depth} d={OUTLINE} transform={placeAt(depth)} />
        ))}
      </clipPath>
      {/* The lit lower part of the projector lens, with its stepped cutoff. Face space. */}
      <clipPath id={ids.cutoff}>
        <path d={`M${cx - 70} ${cy + 4}H${cx + 4}L${cx + 18} ${cy - 8}H${cx + 70}V${cy + 70}H${cx - 70}Z`} />
      </clipPath>
      <clipPath id={ids.outline}>
        <path d={OUTLINE} />
      </clipPath>
    </defs>
  );
}

/** Mounting tabs on the housing shell. Face space. */
const TABS = [
  { x: 226, y: -12, w: 48, h: 30, hole: [250, 1] },
  { x: -14, y: 108, w: 30, h: 44, hole: [-1, 130] },
  { x: 392, y: 180, w: 48, h: 32, hole: [416, 198] },
] as const;

export function Housing() {
  const tabDepth = -66;
  const tabs = TABS.map((tab) => roundedRect(tab.x, tab.y, tab.w, tab.h, 7)).join("");
  const holes = TABS.map((tab) => circle(tab.hole[0], tab.hole[1], 6)).join("");
  return (
    <g>
      <Extrusion d={OUTLINE} from={HOUSING_BACK} to={tabDepth - 8} step={3} back="#030405" front="#0f1215" />
      <Extrusion d={tabs} from={tabDepth - 8} to={tabDepth} step={2} back="#101317" front="#1c2026" />
      <path d={tabs + holes} transform={placeAt(tabDepth)} fill="#22272e" fillRule="evenodd" />
      <Extrusion d={OUTLINE} from={tabDepth - 6} to={0} step={3} back="#0f1215" front="#1d2228" />
      <path d={OUTLINE} transform={placeAt(0)} fill={url(ids.cavity)} />
      <g clipPath={url(ids.rim)}>
        {/* Projector seat and the high-beam reflector bowl, deep inside. */}
        <path d={circle(PROJECTOR.cx, PROJECTOR.cy, 66)} transform={placeAt(-80)} fill="#030405" stroke="#1d2228" strokeWidth="2" />
        <Extrusion d={circle(REFLECTOR.cx, REFLECTOR.cy, REFLECTOR.r + 6)} from={-70} to={-40} step={3} back="#07080a" front="#15181d" />
        <path d={circle(REFLECTOR.cx, REFLECTOR.cy, REFLECTOR.r)} transform={placeAt(-40)} fill={url(ids.chrome)} opacity="0.75" />
      </g>
      <path d={OUTLINE} transform={placeAt(0)} fill="none" stroke="#3a414b" strokeWidth="1.5" />
    </g>
  );
}

export function Projector() {
  const { cx, cy, lens, ring, barrel, sink } = PROJECTOR;
  const sinkPath = roundedRect(cx - sink, cy - sink, sink * 2, sink * 2, 10);
  return (
    <g>
      <Extrusion
        d={sinkPath}
        from={-150}
        to={-92}
        step={2.5}
        back="#0d0f12"
        front="#2f3640"
        stripes={2}
      />
      <path d={sinkPath} transform={placeAt(-92)} fill="#1a1e24" />
      <Extrusion d={circle(cx, cy, barrel)} from={-92} to={-14} step={3} back="#0d0f12" front="#2c333c" />
      <Extrusion d={circle(cx, cy, ring)} from={-14} to={-2} step={2} back="#2c333c" front="#56606c" />
      <path
        d={circle(cx, cy, ring) + circle(cx, cy, lens)}
        transform={placeAt(0)}
        fill={url(ids.ring)}
        fillRule="evenodd"
      />
      <path d={circle(cx, cy, lens)} transform={placeAt(0)} fill={url(ids.glass)} />
      {/* Light on: the lit lower half of the lens shows the stepped cutoff. */}
      <g transform={placeAt(0)}>
        <circle cx={cx} cy={cy} r={lens + 26} fill="#4cc3ff" opacity="0.28" filter={url(ids.bloom)} />
        <g clipPath={url(ids.cutoff)}>
          <circle cx={cx} cy={cy} r={lens - 2} fill={url(ids.beam)} />
        </g>
        <path
          d={`M${cx - lens + 10} ${cy - 18}A${lens - 8} ${lens - 8} 0 0 1 ${cx - 14} ${cy - lens + 9}`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.75"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

export function Shroud() {
  const { cx, cy } = PROJECTOR;
  const plate = SHROUD_OUTLINE + circle(cx, cy, 62) + circle(REFLECTOR.cx, REFLECTOR.cy, 51);
  return (
    <g>
      <Extrusion d={plate} from={-12} to={-2} step={2} back="#0b0d10" front="#262b33" fillRule="evenodd" />
      <path d={plate} transform={placeAt(0)} fill={url(ids.shroud)} fillRule="evenodd" />
      <path d={SHROUD_OUTLINE} transform={placeAt(0)} fill="none" stroke="#4a525d" strokeWidth="1.2" />
      <g transform={placeAt(0)} fill="none">
        <circle cx={cx} cy={cy} r={63} stroke={url(ids.ring)} strokeWidth="4" />
        <circle cx={REFLECTOR.cx} cy={REFLECTOR.cy} r={52} stroke={url(ids.ring)} strokeWidth="3" />
        {/* LED halo ring around the projector. */}
        <circle cx={cx} cy={cy} r={76} stroke="#4cc3ff" strokeOpacity="0.35" strokeWidth="10" filter={url(ids.bloom)} />
        <circle cx={cx} cy={cy} r={76} stroke="#e8f4ff" strokeWidth="3.5" filter={url(ids.glow)} />
      </g>
    </g>
  );
}

export function OuterLens() {
  return (
    <g>
      <path d={OUTLINE} transform={placeAt(-8)} fill="none" stroke="#e8f4ff" strokeOpacity="0.14" strokeWidth="1.2" />
      <path d={OUTLINE} transform={placeAt(0)} fill={url(ids.lensGlass)} stroke="#e8f4ff" strokeOpacity="0.55" strokeWidth="1.4" />
      <g transform={placeAt(0)} clipPath={url(ids.outline)}>
        <path d="M70 0L150 0L60 230L-20 230Z" fill={url(ids.spec)} />
        <path d="M190 0L214 0L124 230L100 230Z" fill={url(ids.spec)} opacity="0.6" />
      </g>
      <path
        d="M60 40C170 10 350 6 470 34"
        transform={placeAt(0)}
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </g>
  );
}

export const clipIds = ids;
