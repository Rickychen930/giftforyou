// Save for Later Utility

export interface SaveForLaterItem {
  bouquetId: string;
  bouquetName: string;
  bouquetPrice: number;
  quantity: number;
  image?: string;
  savedAt: number;
}

const SAVE_FOR_LATER_KEY = "save_for_later_items";

/**
 * Get all saved items
 */
export function getSavedForLater(): SaveForLaterItem[] {
  try {
    const saved = localStorage.getItem(SAVE_FOR_LATER_KEY);
    if (saved) {
      const items = JSON.parse(saved);
      return Array.isArray(items) ? items : [];
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to load saved for later:", error);
    }
  }
  return [];
}

/**
 * Save item for later
 */
export function saveForLater(
  bouquetId: string,
  bouquetName: string,
  bouquetPrice: number,
  quantity: number,
  image?: string
): void {
  try {
    const items = getSavedForLater();
    
    // Remove if already exists
    const filtered = items.filter((item) => item.bouquetId !== bouquetId);
    
    // Add new item
    const newItem: SaveForLaterItem = {
      bouquetId,
      bouquetName,
      bouquetPrice,
      quantity,
      image,
      savedAt: Date.now(),
    };
    
    localStorage.setItem(SAVE_FOR_LATER_KEY, JSON.stringify([...filtered, newItem]));
    window.dispatchEvent(new CustomEvent("saveForLaterUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to save for later:", error);
    }
  }
}

/**
 * Remove from saved for later
 */
export function removeFromSavedForLater(bouquetId: string): void {
  try {
    const items = getSavedForLater().filter((item) => item.bouquetId !== bouquetId);
    localStorage.setItem(SAVE_FOR_LATER_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("saveForLaterUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to remove from saved for later:", error);
    }
  }
}

/**
 * Clear all saved for later
 */
export function clearSavedForLater(): void {
  try {
    localStorage.removeItem(SAVE_FOR_LATER_KEY);
    window.dispatchEvent(new CustomEvent("saveForLaterUpdated"));
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to clear saved for later:", error);
    }
  }
}

