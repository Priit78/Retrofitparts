import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { common } from "@/content/common";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/i18n";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
});
const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `404 – ${site.name}`,
  description: `${common.notFoundTitle.et}. ${common.notFoundTitle.en}.`,
};

// Unmatched URLs (e.g. an unknown locale like /de) skip the [locale] layout, so this
// page is bilingual and self-contained.
export default function GlobalNotFound() {
  return (
    <html lang="et" className={cn(archivo.variable, inter.variable)}>
      <body>
        <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col items-start justify-center gap-6 px-4 md:px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">404</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{common.notFoundTitle.et}</h1>
          <p className="text-muted">
            {common.notFoundBody.et} <span lang="en">{common.notFoundBody.en}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath("et")}
              className="inline-flex min-h-11 items-center rounded-full bg-light px-5 text-sm font-medium text-bg"
            >
              {common.backHome.et}
            </Link>
            <Link
              href={localePath("en")}
              lang="en"
              className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-fg"
            >
              {common.backHome.en}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
