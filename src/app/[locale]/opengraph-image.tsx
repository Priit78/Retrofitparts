import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { hero } from "@/content/hero";
import { seoCopy } from "@/content/seo";
import { site } from "@/content/site";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

// Language-neutral on purpose: `alt` is a static export, so it cannot follow the locale.
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Values of the theme tokens in globals.css. Satori cannot read CSS variables.
const color = {
  bg: "#0e1013",
  fg: "#eeece8",
  muted: "#a2a6ac",
};
/** `bg` at a given opacity, for the scrims over the photo. */
const bg = (alpha: number) => `rgba(14,16,19,${alpha})`;

// Read once at build time; the images are prerendered for each locale. Literal paths, so the
// output file trace lists exactly these files.
const [photo, albert400, albert600] = await Promise.all([
  readFile(join(process.cwd(), "src/assets/og/hero-og.jpg")),
  readFile(join(process.cwd(), "src/assets/fonts/AlbertSans-400.ttf")),
  readFile(join(process.cwd(), "src/assets/fonts/AlbertSans-600.ttf")),
]);
const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

/*
 * `hero-og.jpg` is `photos/hero-headlight.jpg` prepared as this 1200×630 canvas, so it is drawn
 * 1:1: the photo scaled to 920 px wide and anchored bottom right (30 px past the edge), its top
 * 30 % faded into `bg`, film grain softened (6 px in the dark hood, 1.3 px on the lit headlight),
 * dimmed 22 % towards `bg`, JPEG quality 68. Made once with PIL. The raw photo's grain made the
 * PNG about 870 KB; prepared, it stays under 300 KB.
 */

const [wordFirst, ...wordRest] = site.name.split(" ");

// A route handler does not inherit the layout's `generateStaticParams`, so it lists the locales itself.
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background: color.bg,
          color: color.fg,
          fontFamily: "Albert Sans",
        }}
      >
        <img
          src={photoSrc}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", left: 0, top: 0 }}
        />
        {/* Scrims: fade the photo into `bg` from the left and the bottom. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundImage: [
              `linear-gradient(90deg, ${bg(1)} 0%, ${bg(1)} 12%, ${bg(0.88)} 34%, ${bg(0.35)} 58%, ${bg(0)} 78%)`,
              `linear-gradient(0deg, ${bg(0.75)} 0%, ${bg(0)} 30%)`,
            ].join(", "),
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 80px 72px",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 0.6 }}>
            <span style={{ fontWeight: 600 }}>{wordFirst}</span>
            <span style={{ fontWeight: 400, color: color.muted, marginLeft: 8 }}>{wordRest.join(" ")}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 20, fontWeight: 400, letterSpacing: 2.4, textTransform: "uppercase", color: color.muted }}>
              {seoCopy[locale].ogKicker}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 22,
                fontSize: 88,
                fontWeight: 600,
                lineHeight: 0.98,
                letterSpacing: -3,
              }}
            >
              {hero.title[locale].map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Albert Sans", data: albert400, weight: 400, style: "normal" },
        { name: "Albert Sans", data: albert600, weight: 600, style: "normal" },
      ],
    },
  );
}
