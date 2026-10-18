"use client";

import { useTransform } from "motion/react";
import { useChapter } from "@/components/story/ScrollChapter";
import { segment } from "@/lib/story";
import { CompareSlider, type CompareSliderProps } from "./CompareSlider";

/** The split sits at 10% while the chapter settles, and ends at 90% just before it releases. */
const FROM = 10;
const TO = 90;
const SCROLL_START = 0.08;
const SCROLL_END = 0.92;

/**
 * The before/after slider with the chapter's scroll moving the split from 10% to 90%. When the
 * chapter does not animate (no JS, reduced motion, a short viewport) nothing drives it and it
 * rests at 50%, a plain draggable slider. Once the visitor drags or uses the keys, their
 * position wins (see `CompareSlider`).
 */
export function ScrollDrivenSlider(props: Omit<CompareSliderProps, "drivenBy">) {
  const { progress, animated } = useChapter();
  const position = useTransform(progress, (p) => FROM + (TO - FROM) * segment(p, SCROLL_START, SCROLL_END));
  return <CompareSlider {...props} drivenBy={animated ? position : undefined} />;
}

/**
 * The line under the slider that says how to use it. While the chapter animates it asks the
 * visitor to keep scrolling; otherwise it is the drag hint. Either way the drag hint stays in the
 * text, so the slider's description (`aria-describedby` this element) always says how to operate it.
 */
export function SliderHint({
  id,
  scroll,
  drag,
}: {
  id: string;
  /** Shown while the chapter animates. */
  scroll: string;
  /** Shown otherwise; for assistive tech also after the scroll hint. */
  drag: string;
}) {
  const { animated } = useChapter();
  return (
    <span id={id}>
      {animated ? (
        <>
          {scroll}{" "}
          <span className="sr-only">{drag}</span>
        </>
      ) : (
        drag
      )}
    </span>
  );
}
