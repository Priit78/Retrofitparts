import { Container } from "@/components/ui/Container";
import { polish } from "@/content/polish";
import type { Locale } from "@/lib/i18n";

/** Stub until the fix chapter lands (plan Task 3). */
export function AnatomyChapter({ locale }: { locale: Locale }) {
  return (
    <section id="anatomy" className="border-t border-line py-18 md:py-30">
      <Container>
        <h2 className="text-[32px] leading-[1.05] text-fg md:text-[52px]">{polish.partsHeading[locale]}</h2>
      </Container>
    </section>
  );
}
