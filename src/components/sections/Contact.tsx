import Image from "next/image";
import forestDrive from "@/assets/photos/forest-drive.jpg";
import { ContactDetails } from "@/components/inquiry/ContactDetails";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { contact } from "@/content/inquiry";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

const contactLink =
  "whitespace-nowrap text-fg underline decoration-fg/40 underline-offset-4 transition-colors duration-300 hover:decoration-fg";

export function Contact({ locale }: { locale: Locale }) {
  return (
    <section id="contact" aria-labelledby="contact-title">
      {/* CTA band: a night photo under a dark scrim that is strongest behind the text. */}
      <div className="relative isolate overflow-hidden">
        <Image
          src={forestDrive}
          alt=""
          fill
          sizes="100vw"
          className="-z-20 object-cover object-[center_55%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-linear-to-b from-bg/90 via-bg/80 via-50% to-bg/20 md:bg-linear-to-r md:from-bg/95 md:via-bg/70 md:via-50% md:to-bg/35"
        />
        <Container className="relative pt-20 pb-56 md:py-28 lg:py-36">
          <Reveal>
            <p className="mb-4 font-mono text-xs tracking-[0.08em] text-muted uppercase">
              {contact.eyebrow[locale]}
            </p>
            <h2
              id="contact-title"
              className="max-w-[18ch] text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg md:text-[52px]"
            >
              {contact.title[locale]}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-soft md:text-[17px]">
              {contact.reply[locale]}{" "}
              <a href={site.phoneHref} className={contactLink}>
                {site.phone}
              </a>
              <span aria-hidden> · </span>
              <a href={`mailto:${site.email}`} className={contactLink}>
                {site.email}
              </a>
            </p>
          </Reveal>
        </Container>
      </div>

      <Container className="grid gap-14 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <div className="flex h-full flex-col">
            <h3 className="mb-6 text-2xl font-semibold text-fg md:mb-8">
              {contact.formTitle[locale]}
            </h3>
            <InquiryForm locale={locale} />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <ContactDetails locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}
