import { cn } from "@/lib/cn";
import { assemblyOffset, type Offset } from "./anatomy";

/**
 * An original line drawing of a headlight in four layers, front to back: the outer lens, the
 * shroud, the projector (its lens carries the stepped low-beam cut-off) and the housing with its
 * reflector bowls. Drawn in a parallel projection whose depth axis is the explode direction
 * (`explodeOffset` in lib/story.ts), so the layers slide apart along the dashed assembly axes.
 *
 * Each layer has its front face and its depth: the edges that show its thickness (the lens edge,
 * the shroud's aperture lip, the projector's holder, body and heatsink, the housing's shell).
 * Masks hide the depth edges a solid part would cover. There are no fills: every line is
 * `currentColor` at `fg`/30, 1.1 px, and the active layer is `fg` at 1.6 px.
 *
 * A server component, so its path data stays out of the JS bundle. ExplodedHeadlight moves the
 * layers (`data-layer`), the whole assembly (`data-assembly`) and the depth edges (`data-depth`),
 * and marks the active layer (`data-active`). The mask ids are fixed: the drawing appears once
 * per page.
 */

type MaskId = "outline" | "aperture" | "holder" | "body";

interface Layer {
  /** The front face. */
  face: string;
  /** The depth edges; a mask hides what the part itself would cover. */
  depth: { mask: MaskId | null; d: string }[];
  /** The numbered callout, in the layer's own coordinates. */
  tag: { d: string; dot: number[]; x: number; y: number; anchor: string };
}

/*
 * How the data was made: a one-off script modelled each part in 3D (face plane x right, y down,
 * depth z back) and projected it as screen = x·X + y·Y + z·Z, with X = 0.92·(cos 24°, sin 24°),
 * Y = (0, 1) and Z the unit explode direction (120, −64)/136. Outlines are cubic Béziers mapped
 * point by point (a parallel projection keeps them Béziers), circles are four cubics, cylinder
 * silhouettes are the outer tangents of the projected end circles, and the masks are the parts'
 * projected hulls. The projector's far arc and its two hulls came out as dense polylines; they
 * were refitted as cubics (within 0.2 units). Coordinates are rounded to 0.1. To change the
 * drawing, edit the paths here, or rebuild them the same way.
 */
const DRAWING = {
  layers: [
    {
      face: "M30.3 153.5 C30.3 105.5 53.8 81.9 104.2 96.4 L319.4 172.2 C351.3 183.4 369.8 210.6 363.1 233.7 C358 251.4 344.6 257.4 322.7 255.7 L94.1 229.9 C55.5 224.7 30.3 195.5 30.3 153.5 Z M99.2 112.2 C151.3 127.4 220.2 150 270.6 167.5 M52.1 141.2 C55.5 122.7 65.6 113.2 80.7 111.9",
      depth: [
        { mask: "outline", d: "M39.1 148.8 C39.1 100.8 62.6 77.2 113 91.7 L328.2 167.5 C360.1 178.7 378.6 205.9 371.9 228.9 C366.9 246.7 353.4 252.7 331.6 251 L103 225.2 C64.3 220 39.1 190.8 39.1 148.8 Z" },
        { mask: null, d: "M54.9 97.1 L62 93.4 M350 251.5 L357.2 247.7" },
      ],
      tag: { d: "M55.5 196.7 L33.5 222.7 L15.5 222.7", dot: [55.5, 196.7], x: 9.5, y: 222.7, anchor: "end" },
    },
    {
      face: "M41.2 153.9 C41.2 113.5 63.2 94.8 110.3 109 L311.5 181.8 C341.4 192.6 358.7 216.2 352.4 235.3 C347.7 250 335.1 254.5 314.7 252.1 L100.9 220.8 C64.8 214.8 41.2 189.1 41.2 153.9 Z M168.1 192.8 C168.1 221.6 148.5 236.1 124.4 225.4 C100.3 214.6 80.7 182.6 80.7 153.9 C80.7 125.2 100.3 110.6 124.4 121.4 C148.5 132.1 168.1 164.1 168.1 192.8 Z M162.2 190.2 C162.2 215.1 145.3 227.7 124.4 218.4 C103.5 209.1 86.6 181.4 86.6 156.5 C86.6 131.7 103.5 119.1 124.4 128.4 C145.3 137.7 162.2 165.4 162.2 190.2 Z M300.9 218 C300.9 234.5 285.8 241.3 267.3 233 C248.7 224.7 233.6 204.6 233.6 188 C233.6 171.5 248.7 164.7 267.3 173 C285.8 181.3 300.9 201.4 300.9 218 Z M55.5 164.7 C55.5 166.9 54 168 52.1 167.2 C50.3 166.4 48.7 163.9 48.7 161.7 C48.7 159.5 50.3 158.4 52.1 159.2 C54 160 55.5 162.5 55.5 164.7 Z M342.9 220.7 C342.9 222.9 341.4 224 339.5 223.2 C337.7 222.3 336.2 219.9 336.2 217.7 C336.2 215.5 337.7 214.3 339.5 215.2 C341.4 216 342.9 218.5 342.9 220.7 Z",
      depth: [
        { mask: "aperture", d: "M174.6 183.6 C174.6 208.5 157.6 221.1 136.7 211.8 C115.9 202.5 98.9 174.8 98.9 150 C98.9 125.1 115.9 112.5 136.7 121.8 C157.6 131.1 174.6 158.8 174.6 183.6 Z M309.7 213.3 C309.7 229.8 294.7 236.6 276.1 228.3 C257.5 220 242.5 199.9 242.5 183.3 C242.5 166.8 257.5 160 276.1 168.3 C294.7 176.6 309.7 196.7 309.7 213.3 Z" },
      ],
      tag: { d: "M252.1 240.3 L268.1 270.3 L288.1 270.3", dot: [252.1, 240.3], x: 294.1, y: 270.3, anchor: "start" },
    },
    {
      face: "M158 188.3 C158 210.4 143 221.6 124.4 213.4 C105.8 205.1 90.8 180.5 90.8 158.4 C90.8 136.3 105.8 125.1 124.4 133.4 C143 141.6 158 166.3 158 188.3 Z M151.3 185.4 C151.3 203 139.2 212 124.4 205.4 C109.5 198.8 97.5 179.1 97.5 161.4 C97.5 143.7 109.5 134.8 124.4 141.4 C139.2 148 151.3 167.7 151.3 185.4 Z M100 169.5 L125.2 180.8 L133.6 174.5 L148.8 181.2",
      depth: [
        { mask: null, d: "M103.9 132.5 L121.3 123.3 M146.9 213.1 L164.3 203.9 M121.3 123.3 C123 122.4 123.6 121.9 125.5 121.3 C135.2 118.1 145.8 122.9 153.3 128.9 C167.4 140.2 176.8 158.8 177.4 176.9 C177.7 187.9 174.3 198.4 164.3 203.9" },
        { mask: "holder", d: "M105.1 101.8 L182.5 136.2 L182.5 224.2 L105.1 189.8 Z M135.1 85.8 L212.5 120.2 L212.5 208.2 M105.1 101.8 L135.1 85.8 M182.5 136.2 L212.5 120.2 M182.5 224.2 L212.5 208.2" },
        { mask: "body", d: "M135.3 82.4 L219.4 119.9 L219.4 207.9 M165.3 66.4 L249.4 103.9 L249.4 191.9 M135.3 82.4 L165.3 66.4 M219.4 119.9 L249.4 103.9 M219.4 207.9 L249.4 191.9 M145.5 85.2 L145.5 69.2 L171.9 55.1 L171.9 71.1 M162.3 92.7 L162.3 76.7 L188.8 62.6 L188.8 78.6 M179.1 100.2 L179.1 84.2 L205.6 70.1 L205.6 86.1 M195.9 107.7 L195.9 91.7 L222.4 77.6 L222.4 93.6 M212.7 115.2 L212.7 99.2 L239.2 85.1 L239.2 101.1" },
      ],
      tag: { d: "M107.6 129.9 L89.6 81.9 L71.6 81.9", dot: [107.6, 129.9], x: 65.6, y: 81.9, anchor: "end" },
    },
    {
      face: "M30.3 153.5 C30.3 105.5 53.8 81.9 104.2 96.4 L319.4 172.2 C351.3 183.4 369.8 210.6 363.1 233.7 C358 251.4 344.6 257.4 322.7 255.7 L94.1 229.9 C55.5 224.7 30.3 195.5 30.3 153.5 Z M35 153.6 C35 109 57.8 87.5 106.9 101.9 L316 176.4 C347 187.5 365 213.1 358.5 234.4 C353.6 250.8 340.5 256.2 319.3 254.1 L97 225.9 C59.5 220.3 35 192.7 35 153.6 Z M193.3 204.1 C193.3 235 162.5 246.3 124.4 229.4 C86.3 212.4 55.5 173.6 55.5 142.7 C55.5 111.8 86.3 100.4 124.4 117.4 C162.5 134.3 193.3 173.1 193.3 204.1 Z M183.6 187.7 C183.6 208.7 162.6 216.4 136.7 204.9 C110.9 193.3 89.9 167 89.9 145.9 C89.9 124.9 110.9 117.2 136.7 128.7 C162.6 140.2 183.6 166.6 183.6 187.7 Z M170.4 173.1 C170.4 184.3 159.3 188.3 145.6 182.2 C131.9 176.1 120.8 162.2 120.8 151 C120.8 139.9 131.9 135.8 145.6 141.9 C159.3 148 170.4 162 170.4 173.1 Z M156.7 163.6 C156.7 168.5 153.3 171.1 149.1 169.2 C144.9 167.3 141.5 161.8 141.5 156.8 C141.5 151.9 144.9 149.3 149.1 151.2 C153.3 153.1 156.7 158.6 156.7 163.6 Z M307.6 221 C307.6 240.8 289.5 248.9 267.3 239 C245 229.1 226.9 204.9 226.9 185 C226.9 165.2 245 157.1 267.3 167 C289.5 176.9 307.6 201.1 307.6 221 Z M302.9 208.5 C302.9 220.8 291.7 225.8 277.9 219.7 C264 213.5 252.8 198.5 252.8 186.2 C252.8 173.9 264 168.9 277.9 175 C291.7 181.2 302.9 196.2 302.9 208.5 Z M297 199 C297 204.9 291.6 207.4 284.9 204.4 C278.2 201.4 272.8 194.2 272.8 188.2 C272.8 182.2 278.2 179.8 284.9 182.8 C291.6 185.8 297 193 297 199 Z M293.5 193.9 C293.5 197.3 291.2 198.9 288.4 197.7 C285.7 196.5 283.4 192.8 283.4 189.5 C283.4 186.1 285.7 184.5 288.4 185.7 C291.2 186.9 293.5 190.6 293.5 193.9 Z",
      depth: [
        { mask: "outline", d: "M118.9 125.2 C118.9 89.7 138.7 73.3 181 86.3 L361.8 152 C388.6 161.7 404.1 182.7 398.5 199.4 C394.3 212.3 383 216.1 364.6 213.9 L172.6 184.6 C140.1 179.1 118.9 156.3 118.9 125.2 Z" },
        { mask: null, d: "M71.4 92.5 L147.9 82.4 M356.5 246.3 L393 208.4" },
      ],
      tag: { d: "M339.5 185.2 L357.5 157.2 L377.5 157.2", dot: [339.5, 185.2], x: 383.5, y: 157.2, anchor: "start" },
    },
  ],
  masks: {
    outline: "M30.3 153.5 C30.3 105.5 53.8 81.9 104.2 96.4 L319.4 172.2 C351.3 183.4 369.8 210.6 363.1 233.7 C358 251.4 344.6 257.4 322.7 255.7 L94.1 229.9 C55.5 224.7 30.3 195.5 30.3 153.5 Z",
    aperture: "M162.2 190.2 C162.2 215.1 145.3 227.7 124.4 218.4 C103.5 209.1 86.6 181.4 86.6 156.5 C86.6 131.7 103.5 119.1 124.4 128.4 C145.3 137.7 162.2 165.4 162.2 190.2 Z M300.9 218 C300.9 234.5 285.8 241.3 267.3 233 C248.7 224.7 233.6 204.6 233.6 188 C233.6 171.5 248.7 164.7 267.3 173 C285.8 181.3 300.9 201.4 300.9 218 Z",
    holder: "M90.8 158.4 C90.8 148.8 93.9 137.5 103.2 132.9 L122.6 122.5 C124.3 121.8 126 121.1 127.8 120.7 C136.6 118.9 145.6 123 152.5 128.3 C165.8 138.5 175.5 155.9 177.1 172.6 C178 182 176.9 192.8 169.9 199.8 C168.4 201.3 166.9 202.6 165 203.5 L145.5 213.9 C136.5 218.4 126.3 215.2 118.3 210 C102.9 200.1 90.8 177.8 90.8 159.5 Z",
    body: "M90.8 158.4 C90.8 154.6 91.3 150.9 92.3 147.2 L105.1 101.8 L135.1 85.8 L212.5 120.2 L212.5 208.2 L182.5 224.2 L132.3 215.8 C113.5 212.4 99.6 193.6 93.9 176.5 C92.1 171.2 90.8 165.5 90.8 159.8 Z",
  },
  axes: ["M-758 644 L1006.7 -297.2", "M-615.1 673.6 L1149.6 -267.6"],
} satisfies {
  layers: Layer[];
  masks: Record<MaskId, string>;
  axes: string[];
};

/**
 * The centre of the assembled drawing, callouts included (its bounding box is x −8…402,
 * y 55…278): the origin ExplodedHeadlight scales the assembly about. Re-measure it if the paths
 * above change.
 */
const ASSEMBLED_CENTRE = { x: 197, y: 167 };

/** Fits the assembled (scaled up) and the fully exploded drawing, with its callouts. */
const VIEW_BOX = "-198 -24 790 386";
/** Mask canvas: everything the drawing can cover, whatever its offsets. */
const CANVAS = { x: -600, y: -600, width: 2000, height: 1600 };

const maskId = (id: MaskId) => `headlight-mask-${id}`;

const translate = ({ x, y }: Offset) => (x === 0 && y === 0 ? undefined : `translate(${x} ${y})`);

export function HeadlightLines({
  label,
  offsets,
  className,
}: {
  /** Accessible name: the four parts, front to back. */
  label: string;
  /** Each layer's offset, front to back; omitted, the headlight is assembled. */
  offsets?: readonly Offset[];
  className?: string;
}) {
  const shift = assemblyOffset(offsets ?? []);

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={VIEW_BOX}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "block h-auto w-full text-fg/30",
        // Once here rather than on every element: strokes keep their width when the drawing
        // scales; each layer's highlight; the callout numbers (too small to read on phones).
        "[&_[data-assembly]_circle]:[vector-effect:non-scaling-stroke] [&_[data-assembly]_path]:[vector-effect:non-scaling-stroke]",
        "[&_[data-layer]]:transition-[color,stroke-width] [&_[data-layer]]:duration-500 [&_[data-layer]]:ease-out-expo",
        "[&_[data-layer][data-active]]:text-fg [&_[data-layer][data-active]]:[stroke-width:1.6]",
        "[&_text]:fill-muted [&_text]:font-mono [&_text]:text-[14px] [&_text]:tracking-[0.08em] [&_text]:transition-[fill] [&_text]:duration-500 [&_[data-active]_text]:fill-fg",
        "max-md:[&_[data-callout]]:hidden",
        className,
      )}
    >
      <defs>
        {(["outline", "holder", "body"] as const).map((id) => (
          // Hides the depth edges inside the part's own front.
          <mask key={id} id={maskId(id)} maskUnits="userSpaceOnUse" {...CANVAS}>
            <rect {...CANVAS} fill="white" />
            <path d={DRAWING.masks[id]} fill="black" />
          </mask>
        ))}
        {/* Shows the shroud's lip only through its openings. */}
        <mask id={maskId("aperture")} maskUnits="userSpaceOnUse" {...CANVAS}>
          <path d={DRAWING.masks.aperture} fill="white" />
        </mask>
      </defs>

      {/* Scaled about the assembled headlight's centre (ExplodedHeadlight shows it larger). */}
      <g
        data-assembly=""
        transform={translate(shift)}
        style={{ transformOrigin: `${ASSEMBLED_CENTRE.x}px ${ASSEMBLED_CENTRE.y}px` }}
      >
        {/* The assembly axes: the layers slide along them. */}
        <path d={DRAWING.axes.join(" ")} strokeWidth={1} strokeDasharray="12 4 2 4" className="opacity-60" />
        {DRAWING.layers.map((layer, index) => (
          <g
            key={index}
            data-layer={index}
            transform={offsets?.[index] ? translate(offsets[index]) : undefined}
          >
            <path d={layer.face} />
            <g data-depth="">
              {layer.depth.map((part) => (
                <path key={part.mask ?? "open"} d={part.d} mask={part.mask ? `url(#${maskId(part.mask)})` : undefined} />
              ))}
            </g>
            {/* Callouts match the list's numbers. */}
            <g data-callout="">
              <path d={layer.tag.d} />
              <circle cx={layer.tag.dot[0]} cy={layer.tag.dot[1]} r={2.2} />
              <text
                x={layer.tag.x}
                y={layer.tag.y}
                textAnchor={layer.tag.anchor === "end" ? "end" : "start"}
                dominantBaseline="central"
                stroke="none"
              >
                {String(index + 1).padStart(2, "0")}
              </text>
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}
