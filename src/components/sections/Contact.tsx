import { ContactDetails } from "@/components/inquiry/ContactDetails";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { contact } from "@/content/inquiry";
import type { Locale } from "@/lib/i18n";

export function Contact({ locale }: { locale: Locale }) {
  return (
    <section id="contact" className="relative overflow-hidden border-b border-line py-20 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_12%_0%,rgb(76_195_255/0.09),transparent_70%)]"
      />
      <Container className="relative">
        <Reveal>
          <SectionHeading
            eyebrow={contact.eyebrow[locale]}
            title={contact.title[locale]}
            intro={contact.intro[locale]}
          />
        </Reveal>

        <div className="mt-12 grid gap-6 md:mt-16 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-7">
            <div className="relative flex h-full flex-col rounded-3xl border border-line bg-surface/70 p-5 before:absolute before:inset-x-10 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/50 before:to-transparent sm:p-8 md:p-10">
              <InquiryForm locale={locale} />
            </div>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <ContactDetails locale={locale} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
