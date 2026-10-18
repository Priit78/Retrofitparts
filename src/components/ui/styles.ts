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
