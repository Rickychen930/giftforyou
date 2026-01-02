/**
 * Bouquet Catalog Page Model
 * Defines state interfaces and initial values for the Bouquet Catalog Page
 */

import type { Bouquet } from "./domain/bouquet";

/**
 * Price range type
 */
export type PriceRange = [number, number];

/**
 * Navigate function type
 */
export type NavigateFn = (to: any, options?: any) => void;

/**
 * Bouquet Catalog Page State
 */
export interface BouquetCatalogPageState {
  bouquets: Bouquet[];
  priceRange: PriceRange;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
  collectionNameFilter: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

/**
 * Default price range
 */
export const DEFAULT_PRICE_RANGE: PriceRange = [0, 1_000_000];

/**
 * Initial state for Bouquet Catalog Page
 */
export const INITIAL_BOUQUET_CATALOG_PAGE_STATE: BouquetCatalogPageState = {
  bouquets: [],
  priceRange: DEFAULT_PRICE_RANGE,
  selectedTypes: [],
  selectedSizes: [],
  selectedCollections: [],
  sortBy: "",
  currentPage: 1,
  itemsPerPage: 24,
  collectionNameFilter: "",
  searchQuery: "",
  loading: true,
  error: null,
};

/**
 * Default SEO data for Bouquet Catalog Page
 */
export const DEFAULT_BOUQUET_CATALOG_PAGE_SEO = {
  title: "Katalog Bouquet Cirebon | Giftforyou.idn - Florist Terbaik di Jawa Barat",
  description:
    "Katalog lengkap bouquet di Cirebon, Jawa Barat. Tersedia berbagai pilihan bouquet bunga segar, gift box, stand acrylic, dan artificial bouquet. Filter berdasarkan tipe, ukuran, dan harga. Pesan mudah via WhatsApp dengan pengiriman cepat ke seluruh Cirebon.",
  keywords:
    "katalog bouquet cirebon, bouquet cirebon murah, gift box cirebon, stand acrylic cirebon, florist cirebon online, toko bunga cirebon, artificial bouquet cirebon, hadiah cirebon, kado cirebon, florist jawa barat",
  path: "/collection",
};

