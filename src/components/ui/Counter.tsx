"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * A number that counts up from zero once it scrolls into view.
 *
 * The server, reduced motion and browsers without IntersectionObserver all get the final value,
 * so the real figure is never missing. Screen readers always read the final value from a static
 * copy; the animated digits are hidden from them.
 */
export function Counter({
  to,
  prefix = "",
  suffix = "",
  duration = 1.6,
}: {
  to: number;
  prefix?: string;
  suffix?: string;
  /** Seconds. */
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(to);
  const text = useTransform(count, (v) => `${prefix}${Math.round(v)}${suffix}`);
  const final = `${prefix}${to}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      count.set(to);
      return;
    }

    count.set(0);
    let controls: ReturnType<typeof animate> | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        controls = animate(count, to, { duration, ease: [0.16, 1, 0.3, 1] });
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      controls?.stop();
      count.set(to);
    };
  }, [count, to, duration]);

  return (
    <span ref={ref} className="inline-grid justify-items-start tabular-nums">
      <span className="sr-only">{final}</span>
      <motion.span aria-hidden="true" className="col-start-1 row-start-1">
        {text}
      </motion.span>
      {/* Reserves the final width, so the digits never push the layout around while counting. */}
      <span className="invisible col-start-1 row-start-1">{final}</span>
    </span>
  );
}
