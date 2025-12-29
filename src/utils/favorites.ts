/**
 * Favorite/Wishlist system using localStorage
 */

const FAVORITES_STORAGE_KEY = "giftforyou_favorites";

export interface FavoriteItem {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  bouquetImage?: string;
  addedAt: number; // timestamp
}

/**
 * Get all favorites
 */
export function getFavorites(): FavoriteItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const storage = localStorage as Storage;
    const stored = storage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    const favorites = JSON.parse(stored);
    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

/**
 * Check if bouquet is favorited
 */
export function isFavorite(bouquetId: string): boolean {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.bouquetId === bouquetId);
}

/**
 * Add to favorites
 */
export function addToFavorites(
  bouquetId: string,
  bouquetName: string,
  bouquetPrice: number,
  bouquetImage?: string
): void {
  try {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (favorites.some((fav) => fav.bouquetId === bouquetId)) {
      return; // Already in favorites
    }

    favorites.push({
      bouquetId,
      bouquetName,
      bouquetPrice,
      bouquetImage,
      addedAt: Date.now(),
    });

    if (typeof localStorage === "undefined" || typeof window === "undefined") return;
    const storage = localStorage as Storage;
    const win = window as Window;
    storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    
    // Dispatch custom event for other components to listen
    win.dispatchEvent(new CustomEvent("favoritesUpdated"));
  } catch (error) {
    console.error("Failed to add to favorites:", error);
  }
}

/**
 * Remove from favorites
 */
export function removeFromFavorites(bouquetId: string): void {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.bouquetId !== bouquetId);
    if (typeof localStorage === "undefined" || typeof window === "undefined") return;
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent("favoritesUpdated"));
  } catch (error) {
    console.error("Failed to remove from favorites:", error);
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(
  bouquetId: string,
  bouquetName: string,
  bouquetPrice: number,
  bouquetImage?: string
): boolean {
  if (isFavorite(bouquetId)) {
    removeFromFavorites(bouquetId);
    return false;
  } else {
    addToFavorites(bouquetId, bouquetName, bouquetPrice, bouquetImage);
    return true;
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  if (typeof localStorage === "undefined" || typeof window === "undefined") return;
  try {
    const storage = localStorage as Storage;
    const win = window as Window;
    storage.removeItem(FAVORITES_STORAGE_KEY);
    win.dispatchEvent(new CustomEvent("favoritesUpdated"));
  } catch (error) {
    console.error("Failed to clear favorites:", error);
  }
}

/**
 * Get favorites count
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

