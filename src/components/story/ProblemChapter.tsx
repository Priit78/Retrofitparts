import { Container } from "@/components/ui/Container";
import { story } from "@/content/story";
import type { Locale } from "@/lib/i18n";

/** Stub until the problem chapter lands (plan Task 3). */
export function ProblemChapter({ locale }: { locale: Locale }) {
  return (
    <section id="problem" className="border-t border-line py-18 md:py-30">
      <Container>
        <h2 className="text-[32px] leading-[1.05] text-fg md:text-[52px]">{story.problem.beats[0].title[locale]}</h2>
      </Container>
    </section>
  );
}
