import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { sitemapEntries } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(products.map((product) => product.slug));
}
