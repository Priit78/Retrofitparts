import { ArrowRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import catLed from "@/assets/photos/cat-led.jpg";
import catLens from "@/assets/photos/cat-lens.jpg";
import catXenon from "@/assets/photos/cat-xenon.jpg";
import { ProductMedia } from "@/components/catalog/ProductMedia";
import { CatalogStrip } from "@/components/story/CatalogStrip";
import { ScrollChapter } from "@/components/story/ScrollChapter";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { catalog } from "@/content/catalog";
import { site } from "@/content/site";
import { categories, products } from "@/data/products";
import type { CategoryId, Product } from "@/data/types";
import { filterProducts, filtersToQuery, type CatalogFilters } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { localePath, type Locale, type Localized } from "@/lib/i18n";

/** A category photo from `src/assets/photos/`. */
interface PhotoMedia {
  photo: StaticImageData;
  /** Where the frame crops the photo (CSS `object-position`). */
  position: string;
  /** Per-photo adjustments: tone, and on phones a zoom that keeps the crop clean. */
  photoClass?: string;
}

interface Tile {
  id: keyof typeof catalog.teaser.tiles;
  /** A category photo, or a real product, shown in its catalog frame. */
  media: PhotoMedia | { product: Product };
  /** The categories the tile covers, in display order; its main link shows all of them. */
  categories: readonly [CategoryId, ...CategoryId[]];
}

/** The first complete headlight the client has photographed (a white-backdrop inventory shot). */
const headlightUnit =
  products.find((product) => product.category === "headlights" && product.image) ??
  products.find((product) => product.category === "headlights");

const tiles: readonly Tile[] = [
  { id: "lenses", media: { photo: catLens, position: "50% 50%" }, categories: ["lenses"] },
  ...(headlightUnit
    ? [{ id: "headlights", media: { product: headlightUnit }, categories: ["headlights"] } as const]
    : []),
  {
    id: "led",
    media: {
      photo: catLed,
      position: "72% 50%",
      // A matte light-grey car: toned down to sit with the two night shots. The 4:3 phone frame
      // can't crop out the badge script and blue reflection at the lamp's outer end, so it zooms
      // in from the right; the 4:5 frame at 72 % already leaves them out. The pinned strip's
      // frame grows wider than 4:5 on shorter screens, so there it zooms the same way once the
      // frame is wider than 5:6, and further from 3:2.
      photoClass:
        "brightness-[0.82] max-sm:origin-right max-sm:scale-[1.4] pinned-lg:[@container(min-aspect-ratio:5/6)]:origin-right pinned-lg:[@container_(min-aspect-ratio:5/6)_and_(max-aspect-ratio:3/2)]:scale-[1.4] pinned-lg:[@container(min-aspect-ratio:3/2)]:scale-[1.6]",
    },
    categories: ["led-projectors", "led-lights"],
  },
  {
    id: "xenon",
    media: { photo: catXenon, position: "8% 50%" },
    categories: ["xenon-projectors", "xenon-bulbs", "ballasts"],
  },
];

const partNames: Partial<Record<CategoryId, Localized<string>>> = catalog.teaser.parts;

/**
 * A tile: one column of the strip (CatalogStrip sets the widths). Pinned, it spans the strip's
 * three shared rows (photo; title and count; sub-links) as a subgrid, so every photo gets the
 * same height.
 */
const tileClass = "snap-start pinned-lg:row-span-3 pinned-lg:grid pinned-lg:grid-rows-subgrid";

/**
 * The tile frame's shape: 4:3 on phones, 4:5 from `sm`. In the pinned strip it fills the shared
 * photo row instead (4:5 at most, wider on short screens).
 */
const frameShape = "aspect-[4/3] rounded-[2px] sm:aspect-[4/5] pinned-lg:aspect-auto pinned-lg:h-full";

/**
 * A photo frame. Pinned, it is a size container, so a photo can adjust its crop to the frame's
 * shape.
 */
const photoFrame = cn(frameShape, "relative overflow-hidden pinned-lg:@container-size");

/** The tile's photo width, for `srcset` (the strip's column width). */
const photoSizes = "(min-width: 1400px) 420px, (min-width: 1024px) 30vw, (min-width: 513px) 400px, 78vw";

/**
 * Hover zoom, on a box around the photo (so it adds to a photo's own crop zoom): only from `sm`,
 * and never with reduced motion.
 */
const hoverZoom =
  "absolute inset-0 transition-transform duration-700 ease-out-expo motion-reduce:transition-none sm:group-hover/tile:scale-[1.03] sm:motion-reduce:group-hover/tile:scale-100";

/** The car makes with the most products in a category, most first (ties in `site` order). */
function topMakes(id: CategoryId, n: number): string[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (product.category !== id) continue;
    for (const make of product.makes) counts.set(make, (counts.get(make) ?? 0) + 1);
  }
  const order = (make: string) => (site.vehicleMakes as readonly string[]).indexOf(make);
  return [...counts.keys()]
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || order(a) - order(b))
    .slice(0, n);
}

/**
 * The landing page's catalog chapter: a strip of tiles (lenses, complete headlights, LED, xenon)
 * with real product counts, closed by a card to the whole catalog. On desktop (from 1024 px, with
 * motion) the chapter pins and scrolling moves the strip sideways; elsewhere the strip is a
 * native swipe row (CatalogStrip).
 *
 * Each tile links to the catalog filtered by every category it covers
 * (`?category=led-projectors,led-lights`), and its count is that view's length, computed with
 * the catalog's own filter. A tile that groups several categories also lists each with its own
 * count and link.
 */
export function CatalogTeaser({ locale }: { locale: Locale }) {
  const t = catalog.teaser;
  const catalogHref = localePath(locale, "/catalog");
  const hrefFor = (filters: CatalogFilters) => `${catalogHref}${filtersToQuery(filters)}`;

  return (
    <ScrollChapter
      id="catalog-teaser"
      labelledBy="catalog-teaser-title"
      pinFrom="lg"
      // `base` is unused: the chapter never pins below lg.
      length={{ base: 0, md: 280 }}
      className="border-t border-line"
      stageClassName="py-18 md:py-30 pinned-lg:flex pinned-lg:flex-col pinned-lg:justify-center pinned-lg:pt-24 pinned-lg:pb-8"
    >
      <Container className="lg:grid lg:grid-cols-12 lg:items-end lg:gap-x-6">
        <Reveal className="lg:col-span-8">
          <SectionHeading
            id="catalog-teaser-title"
            eyebrow={t.eyebrow[locale]}
            // Pinned, the title scales down on shorter screens, to leave the tiles room.
            title={<span className="block pinned-lg:text-[clamp(36px,6.4svh,52px)]">{t.title[locale]}</span>}
          />
        </Reveal>
        <Reveal delay={0.06} className="lg:col-span-4">
          <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-soft md:text-[17px] lg:mt-0">
            {t.intro[locale]}
          </p>
        </Reveal>
      </Container>

      <CatalogStrip className="mt-10 md:mt-12 pinned-lg:mt-8">
        {tiles.map((tile) => {
          const copy = t.tiles[tile.id];
          const group: CatalogFilters = { category: [...tile.categories] };
          const total = filterProducts(products, group, locale).length;
          const parts = tile.categories
            .map((id) => ({ id, count: filterProducts(products, { category: [id] }, locale).length }))
            .filter((part) => part.count > 0);
          const makes = tile.categories.length === 1 ? topMakes(tile.categories[0], 4) : [];

          return (
            <li key={tile.id} data-teaser-tile={tile.id} className={tileClass}>
              {/* The photo, title and count are one link; only hovering it animates. */}
              <div className="group/tile relative pinned-lg:row-span-2 pinned-lg:grid pinned-lg:grid-rows-subgrid">
                {"product" in tile.media ? (
                  // A white-backdrop product shot, framed and toned as in the catalog.
                  <div className={cn(photoFrame, "bg-surface-2")}>
                    <div className={hoverZoom}>
                      <ProductMedia
                        product={tile.media.product}
                        sizes={photoSizes}
                        alt={copy.alt[locale]}
                        className="h-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={cn(photoFrame, "bg-surface")}>
                    <div className={hoverZoom}>
                      <Image
                        src={tile.media.photo}
                        alt={copy.alt[locale]}
                        fill
                        sizes={photoSizes}
                        style={{ objectPosition: tile.media.position }}
                        className={cn("object-cover saturate-85", tile.media.photoClass)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mt-4 text-lg leading-snug font-semibold tracking-[-0.01em] text-balance text-fg md:text-[19px]">
                    <Link
                      href={hrefFor(group)}
                      className="rounded-[2px] underline-offset-4 outline-none group-hover/tile:underline after:absolute after:inset-0 after:rounded-[2px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
                    >
                      {copy.title[locale]}
                    </Link>
                  </h3>
                  <p data-tile-count={total} className="mt-1 text-sm leading-relaxed text-muted">
                    {catalog.productCount[locale](total)}
                    {makes.length > 0 ? ` · ${makes.join(", ")}` : null}
                  </p>
                </div>
              </div>

              {parts.length > 1 ? (
                <ul className="mt-2 flex flex-wrap content-start gap-x-5 gap-y-1 text-sm">
                  {parts.map((part) => (
                    <li key={part.id}>
                      <Link
                        href={hrefFor({ category: [part.id] })}
                        className="group/part inline-flex min-h-6 items-center gap-1.5 rounded-[2px] text-soft transition-colors hover:text-fg"
                      >
                        <span className="underline decoration-fg/30 underline-offset-4 transition-[text-decoration-color] group-hover/part:decoration-fg/70">
                          {partNames[part.id]?.[locale] ?? categories.find((c) => c.id === part.id)?.name[locale]}
                        </span>
                        <span className="text-muted tabular-nums">{part.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}

        <li data-teaser-tile="all" className={tileClass}>
          <Link
            href={catalogHref}
            data-tile-link=""
            // Pinned on a short screen the card is short too: its padding and title shrink, and
            // should the text still not fit, it runs out at the bottom rather than being cut off.
            className={cn(
              frameShape,
              "group/all flex flex-col justify-end-safe border border-line bg-surface p-6 transition-colors duration-300 hover:border-fg/30 md:p-7 pinned-lg:p-[clamp(20px,3svh,28px)]",
            )}
          >
            <span className="text-[26px] leading-[1.1] font-semibold tracking-[-0.02em] text-balance text-fg md:text-[28px] pinned-lg:text-[clamp(20px,3.6svh,28px)]">
              {t.closing.title[locale]}
            </span>{" "}
            <span className="mt-3 inline-flex items-center gap-2 text-sm text-muted">
              <span data-tile-count={products.length}>{t.closing.count[locale](products.length)}</span>
              <ArrowRight
                aria-hidden
                className="size-4 transition-transform duration-300 group-hover/all:translate-x-1 motion-reduce:transition-none"
              />
            </span>
          </Link>
        </li>
      </CatalogStrip>
    </ScrollChapter>
  );
}
