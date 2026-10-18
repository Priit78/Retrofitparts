import Image from "next/image";
import type { Product } from "@/data/types";
import { cn } from "@/lib/cn";
import { ProductIllustration } from "./ProductIllustration";

/**
 * A product's picture in a 4:3 box: the real photo when there is one (`Product.image`, a public
 * path), otherwise the category's studio render.
 *
 * The client's photos are bright inventory shots on a white backdrop. So they never fill the box
 * edge to edge: they sit contained (never cropped) in a frame inset by 6 % on every side (the
 * percentages keep it 4:3 at any size, from the drawer thumbnail to the product page) on the
 * neutral `surface-2` backdrop, toned down a little. A grid of them then reads as framed prints
 * next to the graphite renders rather than as white blocks.
 */
export function ProductMedia({
  product,
  sizes,
  alt = "",
  preload = false,
  className,
}: {
  product: Product;
  /** The `sizes` of the photo, for its `srcset`. */
  sizes: string;
  /** Alt text for the photo; empty (decorative) when the product's name is right beside it. */
  alt?: string;
  /** Only for the one image that is the page's LCP element. */
  preload?: boolean;
  className?: string;
}) {
  return (
    <div
      data-media={product.image ? "photo" : "illustration"}
      className={cn("relative aspect-[4/3] w-full overflow-hidden bg-surface-2", className)}
    >
      {product.image ? (
        <div className="absolute inset-[6%]">
          <Image
            src={product.image}
            alt={alt}
            fill
            sizes={sizes}
            preload={preload}
            className="rounded-[2px] object-contain brightness-[0.9] saturate-[0.9]"
          />
        </div>
      ) : (
        <ProductIllustration category={product.category} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
