/**
 * Home Page Model
 * Defines data structures and types for the homepage
 */

import type { Collection } from "./domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";

/**
 * Home Page State
 */
export type HomePageLoadState = "idle" | "loading" | "success" | "error";

/**
 * Home Page Data
 */
export interface HomePageData {
  collections: Collection[];
  heroContent: HeroSliderContent | null;
  loadState: HomePageLoadState;
  errorMessage: string;
}

/**
 * Home Page SEO Data
 */
export interface HomePageSeoData {
  title: string;
  description: string;
  keywords: string;
  path: string;
}

/**
 * Default SEO data for homepage
 */
export const DEFAULT_HOME_PAGE_SEO: HomePageSeoData = {
  title: `Florist Cirebon | Bouquet, Gift Box & Stand Acrylic Terbaik di Jawa Barat`,
  description:
    "Florist terpercaya di Cirebon, Jawa Barat. Menyediakan bouquet bunga segar, gift box, stand acrylic, artificial bouquet, dan berbagai produk gift lainnya. Pesan mudah via WhatsApp. Pengiriman cepat ke seluruh Cirebon dan sekitarnya.",
  keywords:
    "florist cirebon, bouquet cirebon, gift box cirebon, stand acrylic cirebon, florist jawa barat, toko bunga cirebon, artificial bouquet cirebon, hadiah cirebon, kado cirebon, florist mundu, florist pamengkang, gift shop cirebon, bunga cirebon, karangan bunga cirebon",
  path: "/",
};

/**
 * Initial Home Page Data
 */
export const INITIAL_HOME_PAGE_DATA: HomePageData = {
  collections: [],
  heroContent: null,
  loadState: "idle",
  errorMessage: "",
};

