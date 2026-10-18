"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { common } from "@/content/common";
import { layout } from "@/content/layout";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { localePath, type Locale } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { navLinks } from "./nav";
import { Wordmark } from "./Wordmark";

const SHEET_ID = "mobile-menu";
const EASE = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const iconButton =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-[2px] border border-line text-fg transition-[color,background-color,border-color] duration-300 hover:border-fg/35 hover:bg-fg/[0.04]";

/**
 * Menu button (below `lg`) and the full-screen sheet it opens. The sheet traps focus,
 * closes on Escape, on any link click and when the viewport grows to `lg`, and locks
 * page scroll while open.
 */
export function MobileMenu({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Return focus to the menu button on close, except after a link took the user elsewhere. */
  const restoreFocus = useRef(true);

  const close = useCallback((returnFocus: boolean) => {
    restoreFocus.current = returnFocus;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const toggle = toggleRef.current;
    const flags = restoreFocus;
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, gutter: root.style.scrollbarGutter };

    // Lock page scroll; keep the scrollbar's space so nothing shifts on desktop browsers.
    if (window.innerWidth > root.clientWidth) root.style.scrollbarGutter = "stable";
    root.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab" || !sheet) return;
      const focusable = Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!sheet.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const desktop = window.matchMedia("(min-width: 64rem)");
    const onViewportChange = () => {
      if (desktop.matches) close(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewportChange);
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.gutter;
      if (flags.current) toggle?.focus();
    };
  }, [open, close]);

  // Every link in the sheet (nav, CTA, phone, email, language) closes it.
  const onSheetClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a")) close(false);
  };

  const items = navLinks(locale);
  const t = layout.header;
  const enter = (delay: number) =>
    reduceMotion
      ? { initial: false as const }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: EASE },
        };

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label={t.openMenu[locale]}
        aria-expanded={open}
        aria-controls={open ? SHEET_ID : undefined}
        onClick={() => setOpen(true)}
        className={cn(iconButton, "lg:hidden")}
      >
        <span aria-hidden className="relative block h-2.5 w-[18px]">
          <span className="absolute inset-x-0 top-0 h-[1.5px] bg-current" />
          <span className="absolute right-0 bottom-0 h-[1.5px] w-3 bg-current" />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            ref={sheetRef}
            id={SHEET_ID}
            role="dialog"
            aria-modal="true"
            aria-label={t.menu[locale]}
            data-lenis-prevent=""
            onClick={onSheetClick}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-bg lg:hidden"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: EASE }}
          >
            <Container className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line">
              <Link href={localePath(locale)} className="-mx-1 flex items-center rounded-[2px] px-1 py-2">
                <Wordmark />
              </Link>
              <button
                ref={closeRef}
                type="button"
                aria-label={t.closeMenu[locale]}
                onClick={() => close(true)}
                className={iconButton}
              >
                <span aria-hidden className="relative block size-[18px]">
                  <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 rotate-45 bg-current" />
                  <span className="absolute inset-x-0 top-1/2 h-[1.5px] -translate-y-1/2 -rotate-45 bg-current" />
                </span>
              </button>
            </Container>

            <nav aria-label={t.mainNav[locale]} className="pt-4 sm:pt-8">
              <Container as="ul" className="flex flex-col">
                {items.map((item, index) => (
                  <motion.li key={item.id} className="border-b border-line" {...enter(0.04 + index * 0.04)}>
                    <Link href={item.href} className="group flex items-center gap-4 py-4 sm:py-5">
                      <span className="min-w-0 font-display text-[clamp(1.75rem,8vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-fg [overflow-wrap:anywhere]">
                        {item.label}
                      </span>
                      <ArrowUpRight
                        aria-hidden
                        strokeWidth={1.5}
                        className="ml-auto size-5 shrink-0 text-muted transition-colors duration-300 group-hover:text-fg"
                      />
                    </Link>
                  </motion.li>
                ))}
              </Container>
            </nav>

            <motion.div className="mt-auto" {...enter(0.04 + items.length * 0.04)}>
              <Container className="flex flex-col gap-7 pt-12 pb-[max(2rem,env(safe-area-inset-bottom))]">
                <Button href={localePath(locale, "#contact")} size="lg" className="w-full">
                  {common.requestOffer[locale]}
                  <ArrowRight aria-hidden className="size-4" />
                </Button>
                <div className="flex items-end justify-between gap-4">
                  <div className="flex min-w-0 flex-col items-start font-mono text-[13px] tracking-wide">
                    <a href={site.phoneHref} className="py-1.5 text-fg transition-colors duration-300 hover:text-soft">
                      {site.phone}
                    </a>
                    <a
                      href={`mailto:${site.email}`}
                      className="max-w-full truncate py-1.5 text-soft transition-colors duration-300 hover:text-fg"
                    >
                      {site.email}
                    </a>
                  </div>
                  <LanguageSwitch locale={locale} className="shrink-0" />
                </div>
              </Container>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
