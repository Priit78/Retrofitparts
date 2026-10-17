import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "404 – Retrofit Parts",
  description: "Lehte ei leitud. Page not found.",
};

// Unmatched URLs (e.g. an unknown locale like /de) skip the [locale] layout, so this
// page is bilingual and self-contained.
export default function GlobalNotFound() {
  return (
    <html lang="et" className={inter.variable}>
      <body>
        <main className="mx-auto flex min-h-svh max-w-[1280px] flex-col items-start justify-center gap-6 px-4 md:px-6">
          <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">404</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Lehte ei leitud</h1>
          <p className="text-muted">Page not found.</p>
          <div className="flex gap-3">
            <Link
              href="/et"
              className="inline-flex h-11 items-center rounded-full bg-light px-5 text-sm font-medium text-bg"
            >
              Avalehele
            </Link>
            <Link
              href="/en"
              className="inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-medium text-fg"
            >
              English
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
