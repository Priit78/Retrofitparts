import { Container } from "@/components/ui/Container";
import { processCopy } from "@/content/process";
import type { Locale } from "@/lib/i18n";

/** Stub until the process chapter lands (plan Task 5). The header nav links to `#process`. */
export function ProcessChapter({ locale }: { locale: Locale }) {
  return (
    <section id="process" aria-labelledby="process-title" className="border-t border-line py-18 md:py-30">
      <Container>
        <h2 id="process-title" className="text-[32px] leading-[1.05] text-fg md:text-[52px]">
          {processCopy.title[locale]}
        </h2>
      </Container>
    </section>
  );
}
