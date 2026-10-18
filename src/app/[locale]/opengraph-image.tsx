import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { logoPath, logoViewBox } from "@/components/layout/logo";
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
  brand: "#fc7d07",
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
 * `hero-og.jpg` is `photos/hero-headlight.jpg` (the edited photo on its 2560×1440 `bg` canvas)
 * prepared as this 1200×630 canvas, so it is drawn 1:1: scaled to 52.4 % and placed at
 * (−140, −215), which puts the lens (source x 1030–2500, y 620–1130) at x 400, y 110, upper
 * right and clear of the kicker and h1; the hero canvas's cut bottom edge (y 540) faded into
 * `bg` over 140 px; the grain in the dark bodywork softened; dimmed 10 % towards `bg`; JPEG
 * quality 72. Made once with PIL. Keep the PNG under about 300 KB.
 */

/** The logo's height on the card; its width follows the lettering's proportions. */
const LOGO_HEIGHT = 30;
const [, , logoWidth, logoHeight] = logoViewBox.split(" ").map(Number);

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
          <svg
            viewBox={logoViewBox}
            width={Math.round((LOGO_HEIGHT * logoWidth) / logoHeight)}
            height={LOGO_HEIGHT}
          >
            <path d={logoPath} fill={color.brand} fillRule="evenodd" />
          </svg>

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
