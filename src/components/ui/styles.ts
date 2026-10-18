/**
 * Class strings shared across sections, so the small type styles stay identical everywhere.
 * `cn` does not merge Tailwind classes, so pick the variant that already has the colour you
 * need instead of adding a second colour class on top.
 */

/**
 * Small uppercase mono type: IBM Plex Mono, 12 px, +0.08 em, regular weight (headings default to
 * semibold, and some labels are headings). Add a colour.
 */
export const mono = "font-mono text-xs font-normal tracking-[0.08em] uppercase";

/** The mono label in `muted`: eyebrows, captions, column labels. */
export const monoLabel = `${mono} text-muted`;

/** An inline text link: `fg`, with a quiet underline that firms up on hover. */
export const textLink =
  "text-fg underline decoration-fg/35 underline-offset-4 transition-colors duration-300 hover:decoration-fg";

/**
 * A section title's type, without its size from `md`: for a title that sets its own pinned sizes
 * around it (the difference chapter).
 */
export const sectionTitleType = "text-[32px] leading-[1.05] font-semibold tracking-[-0.025em] text-balance text-fg";

/** A section's title: SectionHeading's, and the chapters that render their own heading. */
export const sectionTitle = `${sectionTitleType} md:text-[52px]`;

/** A section's intro paragraph: under SectionHeading's title, or beside it in a chapter. */
export const sectionIntro = "mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft md:text-[17px]";
