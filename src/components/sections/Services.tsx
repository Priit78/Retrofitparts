import type { Locale } from "@/lib/i18n";

// Stub: replaced by Task 6.
export function Services({ locale }: { locale: Locale }) {
  return (
    <section id="services" data-stub="Services" data-locale={locale} className="flex min-h-[40vh] items-center justify-center border-b border-line font-mono text-sm text-muted">
      Services
    </section>
  );
}
