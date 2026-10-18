import { ArrowRight } from "lucide-react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import catLed from "@/assets/photos/cat-led.jpg";
import catLens from "@/assets/photos/cat-lens.jpg";
import catXenon from "@/assets/photos/cat-xenon.jpg";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { catalog } from "@/content/catalog";
import { site } from "@/content/site";
import { categories, products } from "@/data/products";
import type { CategoryId } from "@/data/types";
import { localePath, type Locale, type Localized } from "@/lib/i18n";

interface Tile {
  id: keyof typeof catalog.teaser.tiles;
  photo: StaticImageData;
  /** Where the 4:5 frame crops the photo (CSS `object-position`). */
  position: string;
  /** The categories the tile covers. The first is its main one, which the tile links to. */
  categories: readonly [CategoryId, ...CategoryId[]];
}

const tiles: readonly Tile[] = [
  { id: "lenses", photo: catLens, position: "50% 50%", categories: ["lenses"] },
  { id: "led", photo: catLed, position: "96% 50%", categories: ["led-projectors", "led-lights"] },
  {
    id: "xenon",
    photo: catXenon,
    position: "8% 50%",
    categories: ["xenon-projectors", "xenon-bulbs", "ballasts"],
  },
];

const partNames: Partial<Record<CategoryId, Localized<string>>> = catalog.teaser.parts;

function countIn(id: CategoryId) {
  return products.filter((p) => p.category === id).length;
}

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
 * Landing-page catalog section: three large photo tiles (lenses, LED, xenon) with real product
 * counts, each linking to the catalog filtered by its main category, then a link to the whole
 * catalog. A tile that groups several categories lists them with their own counts and links,
 * so its total never promises more than one filtered view shows.
 */
export function CatalogTeaser({ locale }: { locale: Locale }) {
  const t = catalog.teaser;
  const catalogHref = localePath(locale, "/catalog");
  const categoryHref = (id: CategoryId) => `${catalogHref}?category=${id}`;

  return (
    <section id="catalog-teaser" className="border-t border-line py-24 md:py-[120px]">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={t.eyebrow[locale]} title={t.title[locale]} intro={t.intro[locale]} />
        </Reveal>

        <ul className="mt-12 grid gap-x-5 gap-y-12 sm:grid-cols-3 md:mt-14">
          {tiles.map((tile, index) => {
            const copy = t.tiles[tile.id];
            const parts = tile.categories
              .map((id) => ({ id, count: countIn(id) }))
              .filter((part) => part.count > 0);
            const total = parts.reduce((sum, part) => sum + part.count, 0);
            const makes = tile.categories.length === 1 ? topMakes(tile.categories[0], 4) : [];

            return (
              <Reveal as="li" key={tile.id} delay={index * 0.06} className="min-w-0">
                <div data-teaser-tile={tile.id} className="group/tile relative">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-surface">
                    <Image
                      src={tile.photo}
                      alt={copy.alt[locale]}
                      fill
                      sizes="(min-width: 1280px) 400px, (min-width: 640px) 31vw, 100vw"
                      style={{ objectPosition: tile.position }}
                      className="object-cover saturate-85 transition-transform duration-700 ease-out-expo group-hover/tile:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/tile:scale-100"
                    />
                  </div>

                  <h3 className="mt-4 text-lg leading-snug font-semibold tracking-[-0.01em] text-balance text-fg md:text-[19px]">
                    <Link
                      href={categoryHref(tile.categories[0])}
                      className="rounded-[2px] underline-offset-4 outline-none group-hover/tile:underline after:absolute after:inset-0 after:rounded-[2px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
                    >
                      {copy.title[locale]}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {catalog.productCount[locale](total)}
                    {makes.length > 0 ? ` · ${makes.join(", ")}` : null}
                  </p>

                  {parts.length > 1 ? (
                    <ul className="relative z-10 mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      {parts.map((part) => (
                        <li key={part.id}>
                          <Link
                            href={categoryHref(part.id)}
                            className="group/part inline-flex min-h-6 items-center gap-1.5 rounded-[2px] text-soft transition-colors hover:text-fg"
                          >
                            <span className="underline decoration-fg/30 underline-offset-4 transition-[text-decoration-color] group-hover/part:decoration-fg/70">
                              {partNames[part.id]?.[locale] ??
                                categories.find((c) => c.id === part.id)?.name[locale]}
                            </span>
                            <span className="text-muted tabular-nums">{part.count}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-12 md:mt-14">
          <Button href={catalogHref} variant="ghost" size="lg">
            {t.viewAll[locale](products.length)}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </Reveal>
      </Container>
    </section>
  );
}
