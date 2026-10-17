import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { GlowCard } from "@/components/ui/GlowCard";
import { catalog } from "@/content/catalog";
import { categories } from "@/data/products";
import type { Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { localePath, type Locale } from "@/lib/i18n";
import { IntentLink } from "./IntentLink";
import { ProductIllustration } from "./ProductIllustration";

const mono = "font-mono text-[11px] tracking-[0.16em] uppercase";

export function productHref(locale: Locale, product: Product) {
  return localePath(locale, `/catalog/${product.slug}`);
}

export function categoryName(product: Product, locale: Locale) {
  return categories.find((c) => c.id === product.category)?.name[locale] ?? "";
}

/** "Laos" with a lit dot, or "Tellimisel" with an unlit ring. */
export function StockBadge({
  stock,
  locale,
  className,
}: {
  stock: Product["stock"];
  locale: Locale;
  className?: string;
}) {
  const inStock = stock === "in-stock";
  return (
    <span
      className={cn(
        mono,
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 leading-none max-sm:text-[10px] max-sm:tracking-[0.12em] sm:gap-2 sm:px-2.5",
        inStock ? "border-accent/35 bg-bg/85 text-light" : "border-line bg-bg/85 text-muted",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          inStock ? "bg-accent shadow-[0_0_8px_var(--color-accent)]" : "border border-muted",
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
    lg: "text-4xl md:text-5xl",
  }[size];
  const ask = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-3xl md:text-4xl",
  }[size];
  return (
    <div className={className}>
      {price ? (
        <>
          <p
            className={cn(
              figure,
              "font-display leading-none font-semibold whitespace-nowrap text-light tabular-nums [font-stretch:125%]",
            )}
          >
            {price}
          </p>
          <p className={cn("text-muted", size === "lg" ? "mt-2.5 text-sm" : "mt-1.5 text-xs")}>
            {catalog.card.vat[locale]}
          </p>
        </>
      ) : (
        <p
          className={cn(
            ask,
            "font-display leading-none font-semibold text-fg [font-stretch:125%]",
          )}
        >
          {catalog.card.askPrice[locale]}
        </p>
      )}
    </div>
  );
}

type InquireAction =
  | { onInquire: (product: Product) => void; inquireHref?: undefined }
  | { onInquire?: undefined; inquireHref: string };

/**
 * A catalog card: studio render (or photo), brand, name, price and stock, linked to the
 * product page as a whole. "Request offer" either calls `onInquire` (the catalog opens its
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
    "relative z-10 inline-flex min-h-10 items-center justify-center rounded-full border border-line bg-white/[0.03] px-3.5 text-[13px] leading-tight font-medium text-fg transition-[background-color,border-color,color] duration-300 hover:border-accent/50 hover:bg-white/[0.07] sm:px-4";

  return (
    <GlowCard className={cn("h-full", className)}>
      <article
        data-product-card=""
        data-category={product.category}
        className="relative flex h-full flex-col"
      >
        <div className="relative m-1.5 overflow-hidden rounded-[0.875rem] bg-bg">
          <div className="transition-transform duration-700 ease-out-expo group-hover/glow:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover/glow:scale-100">
            {product.image ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <ProductIllustration category={product.category} className="aspect-[4/3] w-full" />
            )}
          </div>
          <StockBadge
            stock={product.stock}
            locale={locale}
            className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5"
          />
        </div>

        <div className="flex flex-1 flex-col px-3 pt-3 pb-3 sm:px-4.5 sm:pt-4 sm:pb-4.5">
          <p className={cn(mono, "truncate text-muted")}>{label}</p>
          <h3
            id={titleId}
            className="mt-2 font-sans text-sm leading-snug font-semibold text-pretty text-fg [font-stretch:100%] sm:text-[15px]"
          >
            <IntentLink
              href={productHref(locale, product)}
              className="rounded-sm outline-none after:absolute after:inset-0 after:z-0 after:rounded-2xl after:content-[''] hover:text-light focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-accent"
            >
              {product.name[locale]}
            </IntentLink>
          </h3>

          <Price product={product} locale={locale} className="mt-auto pt-4 sm:pt-5" />

          <div className="mt-3.5 flex items-center justify-between gap-2 sm:mt-4">
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
            <span
              aria-hidden
              className="hidden size-9 shrink-0 place-items-center rounded-full text-muted transition-[color,transform] duration-500 ease-out-expo group-hover/glow:translate-x-0.5 group-hover/glow:-translate-y-0.5 group-hover/glow:text-accent min-[400px]:grid"
            >
              <ArrowUpRight className="size-4" strokeWidth={1.75} />
            </span>
          </div>
        </div>
      </article>
    </GlowCard>
  );
}
