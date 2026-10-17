"use client";

import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { catalog } from "@/content/catalog";
import { categories } from "@/data/products";
import type { CategoryId } from "@/data/types";
import { sorts, type CatalogFilters, type CatalogSort } from "@/lib/catalog";
import { selectOptions, type FacetCounts } from "@/lib/catalog-ui";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/Button";
import { usePrefersReducedMotion } from "@/components/ui/usePrefersReducedMotion";
import { useModal } from "./useModal";

const EASE = [0.16, 1, 0.3, 1] as const;
const SEARCH_DEBOUNCE_MS = 200;

const labelClass = "font-mono text-[11px] font-medium tracking-[0.16em] text-muted uppercase";
const controlClass =
  "block h-11 w-full rounded-xl border border-fg/40 bg-surface-2/70 text-[15px] text-fg transition-[border-color,background-color,box-shadow] duration-300 ease-out-expo hover:border-fg/60 focus:border-accent focus:bg-surface-2 focus:ring-4 focus:ring-accent/15";

export interface FilterProps {
  locale: Locale;
  filters: CatalogFilters;
  /**
   * Changes some filters (`undefined` removes one); the rest stay as they are in the URL.
   * `reveal` asks the catalog to bring the results into view.
   */
  onChange: (patch: Partial<CatalogFilters>, options?: { reveal?: boolean }) => void;
  /** Clears every filter (keeping the sort) and anything still being typed in the search. */
  onClear: (options?: { reveal?: boolean }) => void;
  /** Changes on every Clear, so search boxes drop a pending, debounced query. */
  searchReset: number;
  counts: FacetCounts;
  brands: string[];
  makes: string[];
}

const noSubscription = () => () => {};

/** False on the server (and while hydrating), true in the browser: gates the portal. */
function useIsClient() {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}

/** The patch that clears every filter but keeps the sort order. */
export const clearFilters: Partial<CatalogFilters> = {
  category: undefined,
  brand: undefined,
  make: undefined,
  q: undefined,
};

/** Number of active filters (sorting is not a filter). */
export function activeFilterCount(f: CatalogFilters) {
  return [f.category, f.brand, f.make, f.q].filter(Boolean).length;
}

export function hasFilters(f: CatalogFilters) {
  return activeFilterCount(f) > 0;
}

/* ----------------------------------------------------------------------------------------- */

/**
 * Search box. Typing updates the results after a 200 ms pause (Enter applies at once); the
 * box only adopts the URL's value when it changes from elsewhere (a pill, a link), so a slow
 * URL update never eats characters typed in the meantime. Clear (`resetSignal`) empties it and
 * cancels a query that is still waiting out the pause.
 */
export function SearchField({
  locale,
  query,
  onSearch,
  resetSignal,
  className,
}: {
  locale: Locale;
  query: string;
  onSearch: (q: string) => void;
  resetSignal: number;
  className?: string;
}) {
  const t = catalog.filters;
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(query);
  const [seen, setSeen] = useState(query);
  const [pushed, setPushed] = useState<string | null>(null);
  const [seenReset, setSeenReset] = useState(resetSignal);

  // A new URL value: our own push landing (keep what is typed since) or a change from elsewhere.
  if (query !== seen) {
    setSeen(query);
    if (query !== pushed) setDraft(query);
    setPushed(null);
  }

  // Clear: an empty draft matches the cleared URL, so the pending timer is cancelled below.
  if (resetSignal !== seenReset) {
    setSeenReset(resetSignal);
    setDraft("");
    setPushed(null);
  }

  function push(value: string) {
    setPushed(value);
    onSearch(value);
  }
  const pushAfterPause = useEffectEvent((value: string) => push(value));

  const next = draft.trim();
  useEffect(() => {
    if (next === query) return;
    const timer = window.setTimeout(() => pushAfterPause(next), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [next, query]);

  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (next !== query) push(next);
        // Closes the on-screen keyboard on phones.
        if (window.matchMedia("(pointer: coarse)").matches) inputRef.current?.blur();
      }}
    >
      <label htmlFor={inputId} className="sr-only">
        {t.search[locale]}
      </label>
      <Search
        aria-hidden
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted"
      />
      <input
        ref={inputRef}
        id={inputId}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        spellCheck={false}
        value={draft}
        placeholder={t.searchPlaceholder[locale]}
        onChange={(event) => setDraft(event.target.value)}
        className={cn(
          controlClass,
          "pl-11 placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none",
          draft ? "pr-11" : "pr-3",
        )}
      />
      {draft ? (
        <button
          type="button"
          aria-label={t.clearSearch[locale]}
          onClick={() => {
            setDraft("");
            push("");
            inputRef.current?.focus();
          }}
          className="absolute top-1/2 right-1.5 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
        >
          <X aria-hidden className="size-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </form>
  );
}

function SelectField({
  label,
  value,
  allLabel,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string | undefined;
  allLabel: string;
  options: string[];
  onChange: (value: string | undefined) => void;
  className?: string;
}) {
  const id = useId();
  const { options: list, selected } = selectOptions(options, value);
  return (
    <div className={className}>
      <label htmlFor={id} className={cn(labelClass, "mb-2 block")}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={selected}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value || undefined)}
          className={cn(controlClass, "cursor-pointer appearance-none pr-10 pl-3.5")}
        >
          <option value="">{allLabel}</option>
          {list.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted"
        />
      </div>
    </div>
  );
}

/** Category toggles: a list with counts in the sidebar, wrapping chips in the phone sheet. */
function CategoryOptions({
  locale,
  filters,
  counts,
  onChange,
  variant,
}: Pick<FilterProps, "locale" | "filters" | "counts" | "onChange"> & {
  variant: "list" | "chips";
}) {
  const labelId = useId();
  const t = catalog.filters;
  const options: { id: CategoryId | undefined; name: string; count: number }[] = [
    { id: undefined, name: t.all[locale], count: counts.all },
    ...categories.map((c) => ({ id: c.id, name: c.name[locale], count: counts.byCategory[c.id] })),
  ];

  return (
    <div role="group" aria-labelledby={labelId}>
      <p id={labelId} className={cn(labelClass, "mb-3")}>
        {t.category[locale]}
      </p>
      <ul className={variant === "list" ? "-mx-3 flex flex-col" : "flex flex-wrap gap-2"}>
        {options.map((option) => {
          const active = filters.category === option.id;
          // Empty categories stay clickable and readable: in the sheet their label drops from
          // `fg` to `muted` (5.9:1); in the list every inactive row is already `muted` (6.2:1).
          // No opacity dimming, which took them below AA.
          const empty = option.count === 0 && !active;
          return (
            <li key={option.id ?? "all"}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onChange({ category: option.id }, { reveal: variant === "list" })
                }
                className={cn(
                  "group/chip flex items-center text-left transition-[background-color,border-color,color] duration-300",
                  variant === "list"
                    ? "relative w-full justify-between gap-3 rounded-lg px-3 py-2 text-sm"
                    : "min-h-10 gap-2 rounded-full border px-3.5 text-sm",
                  variant === "list" &&
                    (active
                      ? "bg-white/[0.06] text-light"
                      : "text-muted hover:bg-white/[0.03] hover:text-fg"),
                  variant === "chips" &&
                    (active
                      ? "border-light bg-light text-bg"
                      : cn(
                          "border-line bg-white/[0.03] hover:border-accent/50",
                          empty ? "text-muted" : "text-fg",
                        )),
                )}
              >
                {variant === "list" ? (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-accent shadow-[0_0_10px_var(--color-accent)] transition-opacity duration-300",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                ) : null}
                <span className="min-w-0">{option.name}</span>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    variant === "chips" && active ? "text-bg/70" : "text-muted",
                  )}
                >
                  {option.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function BrandAndMake({
  locale,
  filters,
  brands,
  makes,
  onChange,
  reveal,
}: Pick<FilterProps, "locale" | "filters" | "brands" | "makes" | "onChange"> & { reveal: boolean }) {
  const t = catalog.filters;
  return (
    <>
      <SelectField
        label={t.make[locale]}
        allLabel={t.allMakes[locale]}
        value={filters.make}
        options={makes}
        onChange={(make) => onChange({ make }, { reveal })}
      />
      <SelectField
        label={t.brand[locale]}
        allLabel={t.allBrands[locale]}
        value={filters.brand}
        options={brands}
        onChange={(brand) => onChange({ brand }, { reveal })}
      />
    </>
  );
}

function ClearButton({
  locale,
  filters,
  onClear,
  className,
}: Pick<FilterProps, "locale" | "filters" | "onClear"> & { className?: string }) {
  const active = hasFilters(filters);
  return (
    // aria-disabled rather than disabled: a keyboard user's focus stays here after clearing.
    <button
      type="button"
      aria-disabled={!active}
      onClick={() => active && onClear({ reveal: true })}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-medium text-fg transition-[background-color,border-color,opacity] duration-300 hover:border-accent/50 hover:bg-white/[0.06] aria-disabled:cursor-default aria-disabled:opacity-40 aria-disabled:hover:border-line aria-disabled:hover:bg-transparent",
        className,
      )}
    >
      <X aria-hidden className="size-4" strokeWidth={1.75} />
      {catalog.filters.clear[locale]}
    </button>
  );
}

/* ----------------------------------------------------------------------------------------- */

/** Desktop filters: a sticky column next to the grid (hidden below `lg`). */
export function FilterSidebar(props: FilterProps) {
  const { locale, filters, onChange, onClear, searchReset } = props;
  return (
    <aside aria-label={catalog.filters.title[locale]} className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-7 pb-10">
        <SearchField
          locale={locale}
          query={filters.q ?? ""}
          onSearch={(q) => onChange({ q: q || undefined })}
          resetSignal={searchReset}
        />
        <CategoryOptions {...props} variant="list" />
        <div className="flex flex-col gap-5">
          <BrandAndMake {...props} reveal />
        </div>
        <ClearButton locale={locale} filters={filters} onClear={onClear} className="self-start" />
      </div>
    </aside>
  );
}

/**
 * Phone and tablet filters (hidden from `lg`): a sticky bar with the search box and a
 * "Filters" button that opens a bottom sheet with the categories, make and brand.
 */
export function FilterBar(
  props: FilterProps & {
    resultCount: number;
    /** Brings the results into view once the sheet has closed. */
    onReveal: () => void;
  },
) {
  const { locale, filters, onChange, onClear, searchReset, resultCount, onReveal } = props;
  const t = catalog.filters;
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const reduceMotion = usePrefersReducedMotion();
  const isClient = useIsClient();
  const active = activeFilterCount({ ...filters, q: undefined });

  useModal({ open, onClose: () => setOpen(false), container: sheetRef, initialFocus: closeRef });

  // Escape hatch: the sheet is for small screens only.
  useEffect(() => {
    if (!open) return;
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onViewport = () => desktop.matches && setOpen(false);
    desktop.addEventListener("change", onViewport);
    return () => desktop.removeEventListener("change", onViewport);
  }, [open]);

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-2 border-b border-line px-4 py-3 md:-mx-6 md:px-6 lg:hidden">
      {/* The blur sits on its own layer: on the bar itself it would trap the fixed sheet. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg/85 backdrop-blur-xl" />
      <div className="flex items-center gap-2.5">
        <SearchField
          locale={locale}
          query={filters.q ?? ""}
          onSearch={(q) => onChange({ q: q || undefined })}
          resetSignal={searchReset}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-fg/40 bg-surface-2/70 px-3.5 text-sm font-medium text-fg transition-[border-color,background-color] duration-300 hover:border-fg/60"
        >
          <SlidersHorizontal aria-hidden className="size-[18px]" strokeWidth={1.75} />
          <span className="max-[359px]:sr-only">{t.open[locale]}</span>
          {active > 0 ? (
            <span className="grid size-5 place-items-center rounded-full bg-accent font-mono text-[11px] font-semibold text-bg">
              <span aria-hidden>{active}</span>
              <span className="sr-only">, {t.activeCount[locale](active)}</span>
            </span>
          ) : null}
        </button>
      </div>

      {/* Portalled to <body>, so the sticky bar's stacking context can't put it under the header. */}
      {isClient
        ? createPortal(
      <AnimatePresence>
        {open ? (
          <div key="sheet" data-lenis-prevent="" className="fixed inset-0 z-[70] lg:hidden">
            <motion.div
              aria-hidden
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-bg/75"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: EASE }}
            />
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col overflow-hidden rounded-t-3xl border-t border-line bg-surface outline-none"
              initial={reduceMotion ? false : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-accent/70 to-transparent"
              />
              <div className="relative flex shrink-0 items-center justify-between gap-4 px-5 pt-6 pb-3 sm:px-7">
                <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-fg/15" />
                <h2 id={titleId} className="text-xl leading-tight font-semibold tracking-tight text-fg">
                  {t.title[locale]}
                </h2>
                <button
                  ref={closeRef}
                  type="button"
                  aria-label={t.close[locale]}
                  onClick={() => setOpen(false)}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line bg-white/[0.03] text-fg transition-[background-color,border-color] duration-300 hover:border-accent/50 hover:bg-white/[0.06]"
                >
                  <X aria-hidden className="size-[18px]" strokeWidth={1.75} />
                </button>
              </div>

              <div
                data-lenis-prevent=""
                className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain px-5 pt-3 pb-6 sm:px-7"
              >
                <CategoryOptions {...props} variant="chips" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <BrandAndMake {...props} reveal={false} />
                </div>
              </div>

              <div className="flex shrink-0 gap-3 border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
                <ClearButton locale={locale} filters={filters} onClear={onClear} />
                <Button
                  className="flex-1"
                  onClick={() => {
                    setOpen(false);
                    requestAnimationFrame(() => onReveal());
                  }}
                >
                  {t.showResults[locale](resultCount)}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}

/** "18 toodet", the active filters as removable pills, and the sort order. */
export function ResultsHeader({
  locale,
  filters,
  onChange,
  brands,
  makes,
  resultCount,
}: Pick<FilterProps, "locale" | "filters" | "onChange" | "brands" | "makes"> & {
  resultCount: number;
}) {
  const t = catalog.filters;
  const sortId = useId();
  const category = categories.find((c) => c.id === filters.category);
  const pills: { key: keyof CatalogFilters; label: ReactNode; text: string }[] = [];
  if (category) {
    pills.push({ key: "category", label: category.name[locale], text: category.name[locale] });
  }
  // The same spelling as the selects show (`?make=bmw` reads "BMW").
  if (filters.make) {
    const make = selectOptions(makes, filters.make).selected;
    pills.push({ key: "make", label: make, text: make });
  }
  if (filters.brand) {
    const brand = selectOptions(brands, filters.brand).selected;
    pills.push({ key: "brand", label: brand, text: brand });
  }
  if (filters.q) {
    pills.push({ key: "q", label: t.queryPill[locale](filters.q), text: filters.q });
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-3 pb-5 lg:pt-0 lg:pb-6">
      <p
        aria-live="polite"
        aria-atomic="true"
        className="font-mono text-xs tracking-[0.16em] whitespace-nowrap text-fg uppercase tabular-nums"
      >
        {t.results[locale](resultCount)}
      </p>

      {pills.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-2 max-sm:order-last max-sm:w-full">
          {pills.map((pill) => (
            <li key={pill.key}>
              <button
                type="button"
                aria-label={t.remove[locale](pill.text)}
                onClick={() => onChange({ [pill.key]: undefined })}
                className="group/pill inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.07] py-1 pr-2 pl-3 text-[13px] text-light transition-[background-color,border-color] duration-300 hover:border-accent/60 hover:bg-accent/[0.12]"
              >
                <span className="truncate">{pill.label}</span>
                <X aria-hidden className="size-3.5 shrink-0 text-muted transition-colors group-hover/pill:text-light" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="ml-auto flex items-center gap-2">
        <label htmlFor={sortId} className={cn(labelClass, "max-sm:sr-only")}>
          {t.sort[locale]}
        </label>
        <div className="relative">
          <select
            id={sortId}
            value={filters.sort ?? sorts[0]}
            onChange={(event) => {
              const sort = event.target.value as CatalogSort;
              onChange({ sort: sort === sorts[0] ? undefined : sort });
            }}
            className="h-10 cursor-pointer appearance-none rounded-full border border-fg/40 bg-surface-2/70 pr-9 pl-4 text-sm text-fg transition-[border-color] duration-300 hover:border-fg/60 focus:border-accent focus:ring-4 focus:ring-accent/15"
          >
            {sorts.map((sort) => (
              <option key={sort} value={sort}>
                {t.sorts[sort][locale]}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted"
          />
        </div>
      </div>
    </div>
  );
}
