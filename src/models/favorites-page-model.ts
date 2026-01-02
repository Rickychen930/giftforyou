/**
 * Favorites Page Model
 * Defines data structures and types for the favorites page
 */

import type { FavoriteItem } from "../utils/favorites";

/**
 * Favorites Page State
 */
export interface FavoritesPageState {
  favorites: FavoriteItem[];
  isLoading: boolean;
}

/**
 * Initial Favorites Page State
 */
export const INITIAL_FAVORITES_PAGE_STATE: FavoritesPageState = {
  favorites: [],
  isLoading: true,
};

/**
 * Default SEO for Favorites Page
 */
export const DEFAULT_FAVORITES_PAGE_SEO = {
  title: "Favorit Saya | Giftforyou.idn - Florist Cirebon",
  description: "Lihat dan kelola bouquet favorit Anda di Giftforyou.idn. Pesan dengan mudah dari daftar favorit.",
  keywords: "favorit, favorites, bouquet favorit, florist cirebon, toko bunga cirebon",
  path: "/favorites",
};

