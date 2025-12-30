"use strict";
/**
 * Favorite/Wishlist system using localStorage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = getFavorites;
exports.isFavorite = isFavorite;
exports.addToFavorites = addToFavorites;
exports.removeFromFavorites = removeFromFavorites;
exports.toggleFavorite = toggleFavorite;
exports.clearFavorites = clearFavorites;
exports.getFavoritesCount = getFavoritesCount;
const FAVORITES_STORAGE_KEY = "giftforyou_favorites";
/**
 * Get all favorites
 */
function getFavorites() {
    if (typeof localStorage === "undefined")
        return [];
    try {
        const storage = localStorage;
        const stored = storage.getItem(FAVORITES_STORAGE_KEY);
        if (!stored)
            return [];
        const favorites = JSON.parse(stored);
        return Array.isArray(favorites) ? favorites : [];
    }
    catch {
        return [];
    }
}
/**
 * Check if bouquet is favorited
 */
function isFavorite(bouquetId) {
    const favorites = getFavorites();
    return favorites.some((fav) => fav.bouquetId === bouquetId);
}
/**
 * Add to favorites
 */
function addToFavorites(bouquetId, bouquetName, bouquetPrice, bouquetImage) {
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
        if (typeof localStorage === "undefined" || typeof window === "undefined")
            return;
        const storage = localStorage;
        const win = window;
        storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        // Dispatch custom event for other components to listen
        win.dispatchEvent(new CustomEvent("favoritesUpdated"));
    }
    catch (error) {
        console.error("Failed to add to favorites:", error);
    }
}
/**
 * Remove from favorites
 */
function removeFromFavorites(bouquetId) {
    try {
        const favorites = getFavorites();
        const filtered = favorites.filter((fav) => fav.bouquetId !== bouquetId);
        if (typeof localStorage === "undefined" || typeof window === "undefined")
            return;
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(filtered));
        // Dispatch custom event
        window.dispatchEvent(new CustomEvent("favoritesUpdated"));
    }
    catch (error) {
        console.error("Failed to remove from favorites:", error);
    }
}
/**
 * Toggle favorite status
 */
function toggleFavorite(bouquetId, bouquetName, bouquetPrice, bouquetImage) {
    if (isFavorite(bouquetId)) {
        removeFromFavorites(bouquetId);
        return false;
    }
    else {
        addToFavorites(bouquetId, bouquetName, bouquetPrice, bouquetImage);
        return true;
    }
}
/**
 * Clear all favorites
 */
function clearFavorites() {
    if (typeof localStorage === "undefined" || typeof window === "undefined")
        return;
    try {
        const storage = localStorage;
        const win = window;
        storage.removeItem(FAVORITES_STORAGE_KEY);
        win.dispatchEvent(new CustomEvent("favoritesUpdated"));
    }
    catch (error) {
        console.error("Failed to clear favorites:", error);
    }
}
/**
 * Get favorites count
 */
function getFavoritesCount() {
    return getFavorites().length;
}
//# sourceMappingURL=favorites.js.map