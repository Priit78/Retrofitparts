import { catalog } from "@/content/catalog";
import { categories } from "@/data/products";
import type { Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatPrice, keepNumbersTogether } from "@/lib/format";
import { localePath, type Locale } from "@/lib/i18n";
import { IntentLink } from "./IntentLink";
import { ProductMedia } from "./ProductMedia";

/** The small uppercase label used across the catalog (brand, stock, table headings). */
export const mono = "font-mono text-xs tracking-[0.08em] uppercase";

export function productHref(locale: Locale, product: Product) {
  return localePath(locale, `/catalog/${product.slug}`);
}

export function categoryName(product: Product, locale: Locale) {
  return categories.find((c) => c.id === product.category)?.name[locale] ?? "";
}

/**
 * "Laos" with a filled dot, or "Tellimisel" with an open ring. `overlay` sits on a picture (a
 * dark plate keeps it legible on white photos); `inline` is a hairline label.
 */
export function StockBadge({
  stock,
  locale,
  variant = "overlay",
  className,
}: {
  stock: Product["stock"];
  locale: Locale;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const inStock = stock === "in-stock";
  return (
    <span
      className={cn(
        mono,
        "inline-flex items-center gap-2 rounded-[2px] px-2 py-1.5 leading-none",
        variant === "overlay" ? "bg-bg/85 max-sm:text-[11px] max-sm:tracking-[0.06em]" : "border border-line",
        inStock ? "text-fg" : "text-soft",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          inStock ? "bg-fg" : "border border-soft",
        )}
      />
      {catalog.card.stock[stock][locale]}
    </span>
  );
}

/** The VAT-inclusive price with its note, or "Küsi hinda" when there is none. */
export function Price({
  product,
  locale,
  size = "md",
  className,
}: {
  product: Product;
  locale: Locale;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const price = formatPrice(product.price, locale);
  const figure = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-[40px] tracking-[-0.025em] md:text-5xl",
  }[size];
  const ask = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-3xl tracking-[-0.02em] md:text-4xl",
  }[size];
  return (
    <div className={className}>
      {price ? (
        <>
          <p className={cn(figure, "leading-none font-semibold whitespace-nowrap text-fg tabular-nums")}>
            {price}
          </p>
          <p className={cn("text-muted", size === "lg" ? "mt-3 text-sm" : "mt-1.5 text-xs")}>
            {catalog.card.vat[locale]}
          </p>
        </>
      ) : (
        <p className={cn(ask, "leading-none font-semibold text-fg")}>{catalog.card.askPrice[locale]}</p>
      )}
    </div>
  );
}

type InquireAction =
  | { onInquire: (product: Product) => void; inquireHref?: undefined }
  | { onInquire?: undefined; inquireHref: string };

/**
 * A catalog card: the photo (or studio render), brand, name, price and stock, linked to the
 * product page as a whole. Flat: the picture on its own backdrop and the text below it, with
 * a hairline above the price. "Request offer" either calls `onInquire` (the catalog opens its
 * drawer) or links to `inquireHref` where no client handler is available.
 */
export function ProductCard({
  product,
  locale,
  className,
  ...action
}: { product: Product; locale: Locale; className?: string } & InquireAction) {
  const titleId = `product-card-${product.slug}`;
  const label = product.brand ?? categoryName(product, locale);
  const inquireClass =
    "relative z-10 inline-flex min-h-10 items-center justify-center rounded-[2px] border border-fg/35 px-3 text-[13px] leading-tight font-semibold text-fg transition-[background-color,border-color] duration-300 hover:border-fg/70 hover:bg-fg/[0.04] sm:px-4";

  return (
    <article
      data-product-card=""
      data-category={product.category}
      className={cn("group/card relative flex h-full flex-col", className)}
    >
      <div className="relative overflow-hidden rounded-[2px] bg-surface-2">
        <div className="transition-transform duration-700 ease-out-expo group-hover/card:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
          <ProductMedia
            product={product}
            sizes="(min-width: 1280px) 290px, (min-width: 1024px) 30vw, (min-width: 768px) 33vw, 50vw"
          />
        </div>
        <StockBadge
          stock={product.stock}
          locale={locale}
          className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5"
        />
      </div>

      <div className="flex flex-1 flex-col pt-3.5 sm:pt-4">
        <p className={cn(mono, "truncate text-muted max-sm:text-[11px]")}>{label}</p>
        <h3
          id={titleId}
          className="mt-1.5 font-sans text-sm leading-snug font-semibold tracking-[-0.005em] text-pretty text-fg sm:text-[15px]"
        >
          <IntentLink
            href={productHref(locale, product)}
            className="rounded-[2px] underline-offset-4 outline-none group-hover/card:underline after:absolute after:inset-0 after:z-0 after:rounded-[2px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
          >
            {keepNumbersTogether(product.name[locale])}
          </IntentLink>
        </h3>

        <div className="mt-auto pt-4">
          <Price product={product} locale={locale} className="border-t border-line pt-3.5 sm:pt-4" />
        </div>

        <div className="mt-3.5 sm:mt-4">
          {action.onInquire ? (
            <button
              type="button"
              aria-describedby={titleId}
              aria-haspopup="dialog"
              onClick={() => action.onInquire(product)}
              className={inquireClass}
            >
              {catalog.card.inquire[locale]}
            </button>
          ) : (
            <a href={action.inquireHref} aria-describedby={titleId} className={inquireClass}>
              {catalog.card.inquire[locale]}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
