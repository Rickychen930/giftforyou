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

