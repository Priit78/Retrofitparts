import type { Metadata } from "next";
import { Albert_Sans, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { common } from "@/content/common";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { localePath } from "@/lib/i18n";

const albert = Albert_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-albert" });
// For the mono "404" label, as in the [locale] layout.
const plex = IBM_Plex_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "500"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: `404 – ${site.name}`,
  description: `${common.notFoundTitle.et}. ${common.notFoundTitle.en}.`,
};

// Unmatched URLs (e.g. an unknown locale like /de) skip the [locale] layout, so this
// page is bilingual and self-contained.
export default function GlobalNotFound() {
  return (
    <html lang="et" className={cn(albert.variable, plex.variable)}>
      <body>
        <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col items-start justify-center gap-6 px-4 md:px-6">
          <p className="font-mono text-xs tracking-[0.08em] text-muted uppercase">404</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">{common.notFoundTitle.et}</h1>
          <p className="text-muted">
            {common.notFoundBody.et} <span lang="en">{common.notFoundBody.en}</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localePath("et")}
              className="inline-flex min-h-11 items-center rounded-[2px] bg-light px-5 text-sm font-medium text-bg"
            >
              {common.backHome.et}
            </Link>
            <Link
              href={localePath("en")}
              lang="en"
              className="inline-flex min-h-11 items-center rounded-[2px] border border-fg/35 px-5 text-sm font-medium text-fg"
            >
              {common.backHome.en}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
