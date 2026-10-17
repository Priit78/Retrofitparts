import type { DifferenceFactId } from "@/content/difference";

/*
 * Small decorative diagrams for the comparison facts. Each shows "before" in halogen warm
 * and "after" in cool white. SVG-only colours use the theme token values.
 */

const HALOGEN = "#ffc46b";
const LIGHT = "#e8f4ff";
const LINE = "rgb(255 255 255 / 0.08)";
const MUTED = "#8a93a0";

/** Colour temperature scale from about 2500 K to 7000 K, with the halogen and LED marks. */
function Temperature() {
  const x = (kelvin: number) => ((kelvin - 2500) / 4500) * 240;
  return (
    <>
      <defs>
        <linearGradient id="fact-kelvin" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff9a3c" />
          <stop offset="0.16" stopColor={HALOGEN} />
          <stop offset="0.45" stopColor="#fff1dc" />
          <stop offset="0.72" stopColor={LIGHT} />
          <stop offset="1" stopColor="#bcdcff" />
        </linearGradient>
      </defs>
      <rect x="0" y="33" width="240" height="6" rx="3" fill="url(#fact-kelvin)" opacity="0.9" />
      {[3000, 4000, 5000, 6000, 7000].map((k) => (
        <path key={k} d={`M${Math.min(239.5, x(k))} 46 v4`} stroke={MUTED} strokeOpacity="0.45" />
      ))}
      {/* Halogen ≈3200 K: a point. */}
      <circle cx={x(3200)} cy="36" r="6.5" fill="#050607" stroke={HALOGEN} strokeWidth="1.5" />
      <circle cx={x(3200)} cy="36" r="2.5" fill={HALOGEN} />
      {/* LED ≈5500–6000 K: a range. */}
      <rect
        x={x(5500)}
        y="29.5"
        width={x(6000) - x(5500)}
        height="13"
        rx="6.5"
        fill="#050607"
        fillOpacity="0.4"
        stroke={LIGHT}
        strokeWidth="1.5"
      />
    </>
  );
}

/** Beam pattern on a wall: a smeared blob versus a sharp, stepped cutoff. */
function Cutoff() {
  return (
    <>
      <defs>
        <filter id="fact-smear" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id="fact-beam" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={LIGHT} stopOpacity="0.95" />
          <stop offset="1" stopColor={LIGHT} stopOpacity="0.05" />
        </linearGradient>
        <clipPath id="fact-wall-a">
          <rect x="0" y="0" width="112" height="72" rx="10" />
        </clipPath>
        <clipPath id="fact-wall-b">
          <rect x="128" y="0" width="112" height="72" rx="10" />
        </clipPath>
      </defs>
      {[0, 128].map((left) => (
        <g key={left}>
          <rect x={left + 0.5} y="0.5" width="111" height="71" rx="10" fill="#050607" stroke={LINE} />
          <path d={`M${left + 56} 6 V66 M${left + 6} 32 H${left + 106}`} stroke={MUTED} strokeOpacity="0.25" strokeDasharray="2 3" />
        </g>
      ))}
      <g clipPath="url(#fact-wall-a)">
        <ellipse cx="58" cy="54" rx="40" ry="16" fill={HALOGEN} opacity="0.55" filter="url(#fact-smear)" />
      </g>
      <g clipPath="url(#fact-wall-b)">
        <path d="M128 38 H184 L198 27 H240 V72 H128 Z" fill="url(#fact-beam)" />
        <path d="M128 38 H184 L198 27 H240" fill="none" stroke={LIGHT} strokeWidth="1.5" strokeLinejoin="round" />
      </g>
    </>
  );
}

/** Rays through a hazy lens scatter; through a clear lens they stay together. */
function Haze() {
  const scattered = [-34, -22, -12, -4, 5, 14, 26, 38];
  return (
    <>
      <defs>
        <filter id="fact-haze" x="-100%" y="-50%" width="300%" height="200%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      {/* Before */}
      {[24, 36, 48].map((y) => (
        <path key={y} d={`M2 ${y} H40`} stroke={MUTED} strokeOpacity="0.5" />
      ))}
      <ellipse cx="44" cy="36" rx="6" ry="26" fill="#2b2417" stroke={HALOGEN} strokeOpacity="0.6" />
      <ellipse cx="44" cy="36" rx="9" ry="24" fill={HALOGEN} opacity="0.22" filter="url(#fact-haze)" />
      {scattered.map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const len = 46 + (i % 3) * 8;
        return (
          <path
            key={deg}
            d={`M50 36 L${(50 + Math.cos(rad) * len).toFixed(1)} ${(36 + Math.sin(rad) * len).toFixed(1)}`}
            stroke={HALOGEN}
            strokeOpacity={0.55 - Math.abs(deg) / 90}
            strokeLinecap="round"
          />
        );
      })}
      {/* After */}
      {[24, 36, 48].map((y) => (
        <path key={`a${y}`} d={`M130 ${y} H168`} stroke={MUTED} strokeOpacity="0.5" />
      ))}
      <ellipse cx="172" cy="36" rx="6" ry="26" fill="#0b1016" stroke={LIGHT} strokeOpacity="0.8" />
      <path d="M169 16 Q166 24 167 32" stroke="#fff" strokeOpacity="0.7" fill="none" strokeLinecap="round" />
      {[26, 36, 46].map((y) => (
        <path key={`b${y}`} d={`M178 ${y} H238`} stroke={LIGHT} strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </>
  );
}

export function FactVisual({ id, className }: { id: DifferenceFactId; className?: string }) {
  return (
    <svg viewBox="0 0 240 72" aria-hidden className={className} overflow="visible">
      {id === "temperature" ? <Temperature /> : id === "cutoff" ? <Cutoff /> : <Haze />}
    </svg>
  );
}
