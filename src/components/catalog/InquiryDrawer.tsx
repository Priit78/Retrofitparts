"use client";

import { X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { catalog } from "@/content/catalog";
import type { Product } from "@/data/types";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { mono, Price } from "./ProductCard";
import { ProductMedia } from "./ProductMedia";
import { useModal } from "./useModal";

/** What the drawer asks about: a product, or a general inquiry (`key` resets the form). */
export interface InquiryRequest {
  key: string;
  product?: Product;
}

/**
 * "Request offer" sheet: from the right on larger screens, from the bottom on phones.
 *
 * The (closed, inert) shell is always mounted so the first opening slides in like the rest. The
 * form mounts on first use and then stays, so text typed into it survives closing and reopening
 * for the same product; it is keyed on the request, so another product starts a fresh form with
 * that product as the topic. Modal while open: focus is trapped,
 * Escape and the backdrop close it, and focus returns to the button that opened it.
 */
export function InquiryDrawer({
  locale,
  request,
  onClose,
}: {
  locale: Locale;
  request: InquiryRequest | null;
  onClose: () => void;
}) {
  const open = request !== null;
  // The last request stays on screen while the sheet slides away.
  const [shown, setShown] = useState<InquiryRequest | null>(request);
  if (request && request !== shown) setShown(request);

  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const t = catalog.drawer;

  useModal({ open, onClose, container: panelRef, initialFocus: closeRef });

  const product = shown?.product;

  return (
    <div
      data-lenis-prevent=""
      inert={!open}
      className={cn(
        "fixed inset-0 z-[70]",
        open ? "visible" : "invisible transition-[visibility] delay-500 motion-reduce:delay-0",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-bg/75 transition-opacity duration-500 ease-out-expo",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col overflow-hidden rounded-t-[2px] border-t border-line bg-surface outline-none",
          "md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(34rem,100%)] md:rounded-none md:border-t-0 md:border-l",
          "transition-transform duration-500 ease-out-expo motion-reduce:transition-none",
          open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-x-full md:translate-y-0",
        )}
      >
        <div className="relative flex shrink-0 items-center justify-between gap-4 px-5 pt-3 pb-3 sm:px-7 md:pt-6">
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-[2px] bg-fg/15 md:hidden" />
          <h2
            id={titleId}
            className="mt-3 text-xl leading-tight font-semibold tracking-[-0.02em] text-fg md:mt-0 md:text-2xl"
          >
            {t.title[locale]}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.close[locale]}
            className="mt-3 inline-flex size-11 shrink-0 items-center justify-center rounded-[2px] border border-line text-fg transition-[background-color,border-color] duration-300 hover:border-fg/50 hover:bg-fg/[0.04] md:mt-0"
          >
            <X aria-hidden className="size-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        <div
          data-lenis-prevent=""
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-7 md:pb-8"
        >
          {product ? (
            <div className="mt-2 flex items-center gap-4 border-y border-line py-4">
              <div className="w-24 shrink-0 overflow-hidden rounded-[2px] sm:w-28">
                <ProductMedia product={product} sizes="112px" />
              </div>
              <div className="min-w-0">
                {product.brand ? <p className={cn(mono, "text-muted")}>{product.brand}</p> : null}
                <p className="mt-1 text-sm leading-snug font-semibold text-pretty text-fg">
                  {product.name[locale]}
                </p>
                <Price product={product} locale={locale} size="sm" className="mt-2.5" />
              </div>
            </div>
          ) : null}

          <p className="mt-5 text-sm leading-relaxed text-pretty text-soft">
            {product ? t.intro[locale] : t.general[locale]}
          </p>

          {shown ? (
            <div className="mt-6 flex flex-col">
              <InquiryForm
                key={shown.key}
                locale={locale}
                compact
                defaultTopic={product?.name[locale]}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
