import type { Locale } from "@/lib/i18n";

// Stub: replaced by Task 3.
export function Header({ locale }: { locale: Locale }) {
  return (
    <header id="site-header" data-stub="Header" data-locale={locale} className="flex h-16 items-center justify-center fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/70 font-mono text-sm text-muted">
      Header
    </header>
  );
}
