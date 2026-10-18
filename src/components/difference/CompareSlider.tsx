"use client";

import { ChevronsLeftRight } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

const START = 50;
const INTRO_FROM = 15;
const KEY_STEP = 5;
/** Touch moves (px) below this count as a tap. */
const TAP_SLOP = 6;
/**
 * A touch starts dragging only once it has moved this far (px) sideways and clearly more sideways
 * than vertically. Below that it may still be the start of a page scroll, which the browser
 * decides after a few more pixels.
 */
const DRAG_MIN_DX = 10;
const DRAG_RATIO = 1.5;
const PAGE_STEP = 10;
/** Length (px) of the fade of a side tag as the split nears it. */
const TAG_FADE_PX = 16;

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** Fills `{before}` and `{after}` in the value-text template. */
function formatValue(template: string, value: number) {
  const before = Math.round(value);
  return template.replace("{before}", String(before)).replace("{after}", String(100 - before));
}

export interface CompareSliderProps {
  before: ReactNode;
  after: ReactNode;
  /** Shown in the top-left corner of the `before` side. Fades out before the split reaches it. */
  beforeLabel?: ReactNode;
  /** Shown in the top-right corner of the `after` side. Fades out before the split reaches it. */
  afterLabel?: ReactNode;
  /** Accessible name of the slider. */
  label: string;
  /** Template for `aria-valuetext`, with `{before}` and `{after}` placeholders. */
  valueText: string;
  /** Id of visible help text describing how to operate the slider. */
  describedBy?: string;
  /**
   * A 0 to 100 position that moves the handle, such as the scroll progress of a chapter. While
   * it is given and the visitor has not moved the handle, the handle follows it and the intro
   * sweep does not run. The first time the visitor moves the handle (drag, tap or keys), the
   * driver is ignored for the rest of the page view.
   */
  drivenBy?: MotionValue<number>;
  /**
   * Called when the visitor takes the handle over from `drivenBy` (`true`), and when a touch drag
   * that did it is cancelled by the browser (a page scroll) and the driver has the handle back
   * (`false`). Not called per frame.
   */
  onClaimChange?: (claimed: boolean) => void;
  className?: string;
}

/**
 * Before/after comparison. `after` is laid over `before` and clipped to the right of the
 * handle. A visually hidden range input carries keyboard and screen reader support and is
 * kept in sync with the handle; pointer drag works with mouse, pen and touch.
 *
 * Renders at 50% on the server and under reduced motion. Otherwise it sweeps once from 15%
 * to 50% the first time it comes into view, unless `drivenBy` moves it instead.
 *
 * The position is a motion value, and everything that follows it is written without React state:
 * the clip, the handle (a transform), the side tags (opacity) and the range input's value and
 * `aria-valuetext`. So a driver that moves every scroll frame costs no React render.
 */
export function CompareSlider({
  before,
  after,
  beforeLabel,
  afterLabel,
  label,
  valueText,
  describedBy,
  drivenBy,
  onClaimChange,
  className,
}: CompareSliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const beforeTagRef = useRef<HTMLDivElement>(null);
  const afterTagRef = useRef<HTMLDivElement>(null);
  // Only the first render's position is read by React: later values are written to the input.
  const [initial] = useState(() => (drivenBy ? clamp(drivenBy.get()) : START));
  const position = useMotionValue(initial);
  const clipPath = useTransform(position, (v) => `inset(0 0 0 ${v}%)`);
  // The handle fills the frame and moves by a percentage of its own width.
  const handleX = useTransform(position, (v) => `${v}%`);

  // Where the side tags sit, as a share (%) of the frame width: the before tag ends at
  // `beforeEdge` and the after tag starts at `afterEdge`. Each tag is fully faded out by the
  // time the split reaches it, so it is never shown cut in half. Measured after mount and on
  // resize; until then (and without layout) both tags stay visible.
  const beforeEdge = useMotionValue(0);
  const afterEdge = useMotionValue(100);
  const tagFade = useMotionValue(1);
  const beforeTagOpacity = useTransform<number, number>([position, beforeEdge, tagFade], ([v, edge, fade]) =>
    clamp01((v - edge) / fade),
  );
  const afterTagOpacity = useTransform<number, number>([position, afterEdge, tagFade], ([v, edge, fade]) =>
    clamp01((edge - v) / fade),
  );

  const touched = useRef(false);
  /** The visitor moved the handle: a `drivenBy` value no longer moves it. */
  const claimed = useRef(false);
  const intro = useRef<{ stop: () => void } | null>(null);
  const drag = useRef<{ id: number; engaged: boolean; x: number; y: number; wasClaimed: boolean } | null>(null);

  const claim = (next: boolean) => {
    if (claimed.current === next) return;
    claimed.current = next;
    onClaimChange?.(next);
  };

  // The range input is uncontrolled: its value and `aria-valuetext` are written straight from the
  // position, so moving the handle never renders React. Only when the rounded value (or the text)
  // changes: a driver moves the position by fractions every scroll frame.
  const writeValue = useCallback(
    (v: number) => {
      const input = inputRef.current;
      if (!input) return;
      const rounded = Math.round(v);
      const value = String(rounded);
      const text = formatValue(valueText, rounded);
      if (input.value === value && input.getAttribute("aria-valuetext") === text) return;
      input.value = value;
      input.setAttribute("aria-valuetext", text);
    },
    [valueText],
  );
  useMotionValueEvent(position, "change", writeValue);
  useEffect(() => writeValue(position.get()), [position, writeValue]);

  /** Any direct input from the user ends the intro sweep for good. */
  const takeOver = () => {
    touched.current = true;
    intro.current?.stop();
    intro.current = null;
  };

  /**
   * Every move by the visitor (drag, tap, keys, assistive tech) goes through here, so this is
   * where the driver is given up. A touch that only scrolls the page never gets here.
   */
  const setTo = (next: number) => {
    claim(true);
    position.set(clamp(next));
  };

  // Follow the driver until the visitor takes over, and rest at the middle again if it goes.
  useEffect(() => {
    if (!drivenBy) return;
    const follow = (v: number) => {
      if (!claimed.current) position.set(clamp(v));
    };
    follow(drivenBy.get());
    const stop = drivenBy.on("change", follow);
    return () => {
      stop();
      if (!claimed.current) position.set(START);
    };
  }, [drivenBy, position]);

  // Measure the side tags against the frame.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const width = root.clientWidth;
      if (!width) return;
      const share = (px: number) => (px / width) * 100;
      tagFade.set(share(TAG_FADE_PX));
      const beforeTag = beforeTagRef.current;
      const afterTag = afterTagRef.current;
      if (beforeTag) beforeEdge.set(share(beforeTag.offsetLeft + beforeTag.offsetWidth));
      if (afterTag) afterEdge.set(share(afterTag.offsetLeft));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    for (const el of [root, beforeTagRef.current, afterTagRef.current]) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [afterEdge, beforeEdge, tagFade]);

  useEffect(() => {
    const el = rootRef.current;
    if (drivenBy || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Park the handle at the intro start just before the slider scrolls into view…
    const arm = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        arm.disconnect();
        if (!touched.current) position.set(INTRO_FROM);
      },
      { rootMargin: "0px 0px 25% 0px" },
    );
    // …then sweep to the middle once it is well in view.
    const play = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        play.disconnect();
        if (touched.current) return;
        intro.current = animate(position, [INTRO_FROM, START], {
          duration: 1.8,
          delay: 0.25,
          ease: [0.16, 1, 0.3, 1],
        });
      },
      { threshold: 0.45 },
    );
    arm.observe(el);
    play.observe(el);
    return () => {
      arm.disconnect();
      play.disconnect();
      intro.current?.stop();
    };
  }, [drivenBy, position]);

  const positionFromPointer = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setTo(((clientX - rect.left) / rect.width) * 100);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    takeOver();
    // Touch only engages once the finger moves clearly sideways, so vertical page scrolls pass
    // through; a tap without movement jumps to that spot (see onPointerUp).
    const engaged = event.pointerType !== "touch";
    drag.current = {
      id: event.pointerId,
      engaged,
      x: event.clientX,
      y: event.clientY,
      wasClaimed: claimed.current,
    };
    event.currentTarget.setPointerCapture?.(event.pointerId);
    if (engaged) {
      event.preventDefault();
      positionFromPointer(event.clientX);
      inputRef.current?.focus({ preventScroll: true });
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (!current.engaged) {
      const dx = Math.abs(event.clientX - current.x);
      const dy = Math.abs(event.clientY - current.y);
      if (dx < DRAG_MIN_DX || dx <= DRAG_RATIO * dy) return;
      current.engaged = true;
    }
    positionFromPointer(event.clientX);
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === event.pointerId) drag.current = null;
  };

  /**
   * The browser took the gesture over (it became a page scroll). A drag it had let us start does
   * not count as the visitor taking the handle: the driver gets it back.
   */
  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (current?.id === event.pointerId && !current.wasClaimed && claimed.current) {
      claim(false);
      if (drivenBy) position.set(clamp(drivenBy.get()));
    }
    endDrag(event);
  };

  /** A touch tap (no real movement) moves the handle there: a single-pointer alternative to dragging. */
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (current?.id === event.pointerId && !current.engaged) {
      const moved = Math.max(Math.abs(event.clientX - current.x), Math.abs(event.clientY - current.y));
      if (moved < TAP_SLOP) positionFromPointer(current.x);
    }
    endDrag(event);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const current = position.get();
    const next: Record<string, number> = {
      ArrowLeft: current - KEY_STEP,
      ArrowDown: current - KEY_STEP,
      ArrowRight: current + KEY_STEP,
      ArrowUp: current + KEY_STEP,
      PageDown: current - PAGE_STEP,
      PageUp: current + PAGE_STEP,
      Home: 0,
      End: 100,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    takeOver();
    setTo(next[event.key]);
  };

  const initialValue = Math.round(initial);

  return (
    <div
      ref={rootRef}
      className={cn(
        "group/compare relative isolate cursor-ew-resize touch-pan-y touch-pinch-zoom overflow-hidden select-none",
        className,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={endDrag}
    >
      {/* Each scene sits in its own composited layer, so moving the clip doesn't re-filter the photo. */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 transform-gpu">{before}</div>
        {beforeLabel ? (
          <motion.div
            ref={beforeTagRef}
            className="absolute top-3 left-3 md:top-4 md:left-4"
            style={{ opacity: beforeTagOpacity }}
          >
            {beforeLabel}
          </motion.div>
        ) : null}
      </div>

      <motion.div className="absolute inset-0" style={{ clipPath }}>
        <div className="absolute inset-0 transform-gpu">{after}</div>
        {afterLabel ? (
          <motion.div
            ref={afterTagRef}
            className="absolute top-3 right-3 md:top-4 md:right-4"
            style={{ opacity: afterTagOpacity }}
          >
            {afterLabel}
          </motion.div>
        ) : null}
      </motion.div>

      {/* step 1, not KEY_STEP: the value is written from the position, and a range input rounds a
          written value to its step. The arrow and page keys are handled above, in steps of 5. */}
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={100}
        step={1}
        defaultValue={initialValue}
        aria-label={label}
        aria-valuetext={formatValue(valueText, initialValue)}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        onChange={(event) => {
          takeOver();
          setTo(Number(event.target.value));
        }}
        className="peer sr-only"
      />

      {/* The handle is a frame-sized layer moved by a transform (never by `left`): the line sits
          at its left edge. */}
      <motion.div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-10",
          // Focus ring on the knob while the hidden range input has keyboard focus.
          "[.peer:focus-visible~&_span]:outline-2 [.peer:focus-visible~&_span]:outline-offset-4 [.peer:focus-visible~&_span]:outline-accent",
        )}
        style={{ x: handleX }}
      >
        <div className="absolute inset-y-0 left-0 -ml-px w-0.5 bg-light">
          <span
            className={cn(
              "absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
              // Flat: a plain knob with a small neutral shadow to lift it off bright snow.
              // `shadow-black` is that deliberate neutral shadow, outside the theme tokens.
              "bg-light text-bg shadow-md shadow-black/35",
              "transition-transform duration-300 ease-out-expo",
              "group-hover/compare:scale-105 group-active/compare:scale-95",
            )}
          >
            <ChevronsLeftRight className="size-5" strokeWidth={1.75} />
          </span>
        </div>
      </motion.div>
    </div>
  );
}
