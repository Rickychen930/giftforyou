// Recently Viewed Products Utility

export interface RecentlyViewedItem {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  bouquetImage?: string;
  viewedAt: number;
}

const RECENTLY_VIEWED_KEY = "recently_viewed_products";
const MAX_RECENT_ITEMS = 20;

/**
 * Add product to recently viewed
 */
export function addToRecentlyViewed(
  bouquetId: string,
  bouquetName: string,
  bouquetPrice: number,
  bouquetImage?: string
): void {
  try {
    const items = getRecentlyViewed();
    
    // Remove if already exists
    const filtered = items.filter((item) => item.bouquetId !== bouquetId);
    
    // Add to beginning
    const newItem: RecentlyViewedItem = {
      bouquetId,
      bouquetName,
      bouquetPrice,
      bouquetImage,
      viewedAt: Date.now(),
    };
    
    const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    
    // Dispatch event for reactivity
    window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to add to recently viewed:", error);
    }
  }
}

/**
 * Get recently viewed products
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  try {
    const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (saved) {
      const items = JSON.parse(saved);
      return Array.isArray(items) ? items : [];
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to load recently viewed:", error);
    }
  }
  return [];
}

/**
 * Clear recently viewed
 */
export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
    window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to clear recently viewed:", error);
    }
  }
}

/**
 * Remove specific item from recently viewed
 */
export function removeFromRecentlyViewed(bouquetId: string): void {
  try {
    const items = getRecentlyViewed().filter((item) => item.bouquetId !== bouquetId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("recentlyViewedUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to remove from recently viewed:", error);
    }
  }
}

