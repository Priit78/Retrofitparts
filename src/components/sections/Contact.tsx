import Image from "next/image";
import forestDrive from "@/assets/photos/forest-drive.jpg";
import { ContactDetails } from "@/components/inquiry/ContactDetails";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { textLink } from "@/components/ui/styles";
import { contact } from "@/content/inquiry";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/** Phones: one item per line. From `sm`: one line, with a separator between the items. */
const lineItem = "block sm:inline";
const separator = <span aria-hidden className="hidden sm:inline"> · </span>;

export function Contact({ locale }: { locale: Locale }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="border-t border-line">
      {/* CTA band: a night photo of a car on a forest road. */}
      <div className="relative isolate overflow-hidden">
        {/*
          Below `md` the photo is a band under the text, zoomed in on the car, so the copy sits on
          plain `bg` and the car shows whole instead of under the text. From `md` it fills the band
          behind a scrim that is strongest behind the text.
        */}
        <div className="absolute inset-x-0 bottom-0 -z-20 h-60 overflow-hidden md:inset-0 md:h-auto">
          <Image
            src={forestDrive}
            alt=""
            fill
            // Phones show the photo zoomed 1.45×, so they need a wider file than the viewport.
            sizes="(min-width: 768px) 100vw, 150vw"
            className="object-cover object-[52%_42%] max-md:origin-[52%_40%] max-md:scale-[1.45] md:object-[center_55%]"
          />
          <div aria-hidden className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-bg to-transparent md:hidden" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-10 hidden bg-linear-to-r from-bg/95 via-bg/70 via-50% to-bg/35 md:block"
        />
        <Container className="relative pt-18 pb-56 md:py-28 lg:py-36">
          <Reveal>
            <SectionHeading
              id="contact-title"
              eyebrow={contact.eyebrow[locale]}
              // Kept to the left half of the band, clear of the car.
              title={<span className="block max-w-[18ch]">{contact.title[locale]}</span>}
            />
            {/* The sentence says the photo goes by email, so the address comes first. */}
            <p className="mt-6 text-base leading-relaxed text-soft md:text-[17px]">
              <span className={lineItem}>{contact.reply[locale]} </span>
              <a href={`mailto:${site.email}`} className={`${textLink} whitespace-nowrap`}>
                {site.email}
              </a>
              {separator}
              <span className={lineItem}>
                <a href={site.phoneHref} className={`${textLink} whitespace-nowrap`}>
                  {site.phone}
                </a>
              </span>
            </p>
          </Reveal>
        </Container>
      </div>

      <Container className="grid gap-14 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <div className="flex h-full flex-col">
            <InquiryForm locale={locale} title={contact.formTitle[locale]} />
          </div>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-5">
          <ContactDetails locale={locale} />
        </Reveal>
      </Container>
    </section>
  );
}
