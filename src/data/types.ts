import type { Localized } from "@/lib/i18n";

export type CategoryId =
  | "led-projectors"
  | "led-lights"
  | "xenon-projectors"
  | "xenon-bulbs"
  | "ballasts"
  | "halogen"
  | "lenses"
  | "shrouds"
  | "adapters"
  | "fitting";

export interface Category {
  id: CategoryId;
  name: Localized<string>;
  description: Localized<string>;
}

export interface ProductSpec {
  label: Localized<string>;
  value: Localized<string>;
}

export interface Product {
  slug: string;
  sku?: string;
  name: Localized<string>;
  category: CategoryId;
  brand?: string;
  /** Values from site.vehicleMakes only. */
  makes: string[];
  /** EUR including 24% VAT; null means "ask for price". */
  price: number | null;
  stock: "in-stock" | "backorder";
  description: Localized<string>;
  specs: ProductSpec[];
  /** Human-readable vehicle models this fits, one entry per vehicle, in both languages. */
  fitment: Localized<string>[];
  warrantyYears?: number;
  featured?: boolean;
  /** Path to a real product photo, once the client supplies one. */
  image?: string;
}
