import { ImageResponse } from "next/og";
import type { CSSProperties } from "react";
import { seoCopy } from "@/content/seo";
import { site } from "@/content/site";
import { defaultLocale, isLocale, locales } from "@/lib/i18n";

// Language-neutral on purpose: `alt` is a static export, so it cannot follow the locale.
export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Values of the theme tokens in globals.css. Satori cannot read CSS variables.
const color = {
  bg: "#050607",
  surface: "#0b0d10",
  surface2: "#12151a",
  fg: "#f2f4f7",
  muted: "#8a93a0",
  light: "#e8f4ff",
  accent: "#4cc3ff",
};

// The lens: its centre on the canvas, and every layer a circle around that point.
const lens = { x: 930, y: 315 };

function circle(diameter: number, style: CSSProperties): CSSProperties {
  return {
    position: "absolute",
    left: lens.x - diameter / 2,
    top: lens.y - diameter / 2,
    width: diameter,
    height: diameter,
    borderRadius: 9999,
    ...style,
  };
}

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
        }}
      >
        {/* Light spill into the room */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `radial-gradient(circle at ${lens.x}px ${lens.y}px, rgba(76,195,255,0.26) 0px, rgba(76,195,255,0.09) 230px, rgba(76,195,255,0) 520px)`,
          }}
        />
        {/* Housing and bezel */}
        <div
          style={circle(440, {
            backgroundImage: `radial-gradient(circle closest-side, ${color.surface} 0%, ${color.surface2} 100%)`,
            border: "2px solid rgba(138,147,160,0.35)",
          })}
        />
        <div
          style={circle(370, {
            background: "#07090b",
            border: "1px solid rgba(255,255,255,0.1)",
          })}
        />
        {/* The lit lens */}
        <div
          style={circle(380, {
            backgroundImage:
              "radial-gradient(circle closest-side, rgba(76,195,255,0.34) 0%, rgba(76,195,255,0.12) 72%, rgba(76,195,255,0) 100%)",
          })}
        />
        <div
          style={circle(310, {
            backgroundImage: `radial-gradient(circle closest-side, #ffffff 0%, ${color.light} 22%, ${color.accent} 62%, rgba(76,195,255,0.8) 90%, rgba(76,195,255,0) 100%)`,
          })}
        />
        <div
          style={circle(76, {
            background: "#ffffff",
            boxShadow: "0 0 64px 26px rgba(232,244,255,0.85)",
          })}
        />

        {/* Copy */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 660,
            height: "100%",
            padding: "72px 0 72px 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                background: color.accent,
                boxShadow: "0 0 16px 3px rgba(76,195,255,0.7)",
              }}
            />
            <div style={{ marginLeft: 18, fontSize: 26, letterSpacing: 7 }}>{site.name.toUpperCase()}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ width: 64, height: 3, background: color.accent }} />
            <div
              style={{
                marginTop: 26,
                fontSize: 24,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: color.muted,
              }}
            >
              {seoCopy[locale].ogKicker}
            </div>
            <div style={{ marginTop: 18, fontSize: 66, lineHeight: 1.08, textWrap: "balance" }}>{site.tagline[locale]}</div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
