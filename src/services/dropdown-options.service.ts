// src/services/dropdown-options.service.ts
/**
 * Service to fetch unique dropdown options from database
 * Used by upload and editor sections to sync with database
 */

import { API_BASE } from "../config/api";
import { getAuthHeaders } from "../utils/auth-utils";

export interface DropdownOptions {
  collections: string[];
  types: string[];
  occasions: string[];
  flowers: string[];
  stockLevels: string[]; // Keep as static, but can be customized
}

/**
 * Fetch all unique collections from database
 */
async function fetchCollections(signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/collections`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      signal,
    });

    if (res.ok) {
      const collections = await res.json();
      if (Array.isArray(collections)) {
        return Array.from(
          new Set(
            collections
              .map((c: any) => (typeof c?.name === "string" ? c.name.trim() : ""))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));
      }
    }
  } catch (err) {
    // Don't log AbortError - it's expected during component cleanup
    if (!(err instanceof DOMException && err.name === "AbortError")) {
      console.warn("Failed to fetch collections:", err);
    }
  }
  return [];
}

/**
 * Fetch all unique types from bouquets
 */
async function fetchTypes(signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/bouquets`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      signal,
    });

    if (res.ok) {
      const bouquets = await res.json();
      if (Array.isArray(bouquets)) {
        return Array.from(
          new Set(
            bouquets
              .map((b: any) => (typeof b?.type === "string" ? b.type.trim() : ""))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));
      }
    }
  } catch (err) {
    // Don't log AbortError - it's expected during component cleanup
    if (!(err instanceof DOMException && err.name === "AbortError")) {
      console.warn("Failed to fetch types:", err);
    }
  }
  return [];
}

/**
 * Fetch all unique occasions from bouquets
 */
async function fetchOccasions(signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/bouquets`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      signal,
    });

    if (res.ok) {
      const bouquets = await res.json();
      if (Array.isArray(bouquets)) {
        const allOccasions = bouquets
          .flatMap((b: any) => (Array.isArray(b?.occasions) ? b.occasions : []))
          .map((o: any) => (typeof o === "string" ? o.trim() : ""))
          .filter(Boolean);
        
        return Array.from(new Set(allOccasions)).sort((a, b) => a.localeCompare(b));
      }
    }
  } catch (err) {
    // Don't log AbortError - it's expected during component cleanup
    if (!(err instanceof DOMException && err.name === "AbortError")) {
      console.warn("Failed to fetch occasions:", err);
    }
  }
  return [];
}

/**
 * Fetch all unique flowers from bouquets
 */
async function fetchFlowers(signal?: AbortSignal): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/api/bouquets`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      signal,
    });

    if (res.ok) {
      const bouquets = await res.json();
      if (Array.isArray(bouquets)) {
        const allFlowers = bouquets
          .flatMap((b: any) => (Array.isArray(b?.flowers) ? b.flowers : []))
          .map((f: any) => (typeof f === "string" ? f.trim() : ""))
          .filter(Boolean);
        
        return Array.from(new Set(allFlowers)).sort((a, b) => a.localeCompare(b));
      }
    }
  } catch (err) {
    // Don't log AbortError - it's expected during component cleanup
    if (!(err instanceof DOMException && err.name === "AbortError")) {
      console.warn("Failed to fetch flowers:", err);
    }
  }
  return [];
}

/**
 * Fetch all dropdown options from database
 * Returns default values if fetch fails
 */
export async function getDropdownOptions(
  signal?: AbortSignal,
  defaults?: Partial<DropdownOptions>
): Promise<DropdownOptions> {
  const defaultOptions: DropdownOptions = {
    collections: defaults?.collections || [
      "Best Sellers",
      "Wedding Collection",
      "Sympathy Flowers",
      "New Edition",
      "Featured",
      "Special Occasions",
    ],
    types: defaults?.types || [
      "bouquet",
      "gift box",
      "stand acrylic",
      "artificial bouquet",
      "fresh flowers",
      "custom arrangement",
    ],
    occasions: defaults?.occasions || [],
    flowers: defaults?.flowers || [],
    stockLevels: defaults?.stockLevels || [
      "0",
      "1",
      "5",
      "10",
      "20",
      "50",
      "100",
      "200",
      "500",
      "1000",
    ],
  };

  try {
    const [collections, types, occasions, flowers] = await Promise.all([
      fetchCollections(signal),
      fetchTypes(signal),
      fetchOccasions(signal),
      fetchFlowers(signal),
    ]);

    return {
      collections: collections.length > 0 ? collections : defaultOptions.collections,
      types: types.length > 0 ? types : defaultOptions.types,
      occasions: occasions.length > 0 ? occasions : defaultOptions.occasions,
      flowers: flowers.length > 0 ? flowers : defaultOptions.flowers,
      stockLevels: defaultOptions.stockLevels,
    };
  } catch (err) {
    console.error("Failed to fetch dropdown options:", err);
    return defaultOptions;
  }
}

