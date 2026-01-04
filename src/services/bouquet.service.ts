/**
 * Bouquet Service
 * Handles bouquet data fetching with caching and error handling
 * Follows SOLID, DRY principles
 */

import { API_BASE } from "../config/api";
import type { Bouquet } from "../models/domain/bouquet";
import { normalizeBouquets } from "../utils/bouquet-normalizer";

export interface BouquetQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  collectionName?: string;
  type?: string | string[];
  size?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  // Support multiple collections
  collections?: string[];
  types?: string[];
  sizes?: string[];
}

export interface BouquetResponse {
  bouquets: Bouquet[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Fetch bouquets from API with optional pagination
 */
/**
 * Apply client-side filtering and sorting
 * Optimized for 500+ bouquets with efficient filtering
 */
function applyFilters(
  bouquets: Bouquet[],
  params: BouquetQueryParams
): Bouquet[] {
  const {
    search,
    collectionName,
    type,
    size,
    minPrice,
    maxPrice,
    collections,
    types,
    sizes,
  } = params;

  let filtered = bouquets;

  // Price filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = minPrice ?? 0;
    const max = maxPrice ?? Number.MAX_SAFE_INTEGER;
    filtered = filtered.filter((b) => b.price >= min && b.price <= max);
  }

  // Collection filter (support multiple)
  const collectionFilters: string[] = [];
  if (collectionName) collectionFilters.push(collectionName);
  if (collections && collections.length > 0) {
    collectionFilters.push(...collections);
  }
  // Remove duplicates
  const uniqueCollectionFilters = Array.from(new Set(collectionFilters.map(c => c.trim().toLowerCase())));
  if (uniqueCollectionFilters.length > 0) {
    filtered = filtered.filter((b) => {
      const bCollection = (b.collectionName ?? "").trim().toLowerCase();
      return uniqueCollectionFilters.includes(bCollection);
    });
  }

  // Type filter (support multiple)
  const typeFilters: string[] = [];
  if (type) {
    if (Array.isArray(type)) {
      typeFilters.push(...type);
    } else {
      typeFilters.push(type);
    }
  }
  if (types && types.length > 0) {
    typeFilters.push(...types);
  }
  // Remove duplicates
  const uniqueTypeFilters = Array.from(new Set(typeFilters.map(t => t.trim().toLowerCase())));
  if (uniqueTypeFilters.length > 0) {
    filtered = filtered.filter((b) => {
      const bType = (b.type ?? "").trim().toLowerCase();
      return uniqueTypeFilters.includes(bType);
    });
  }

  // Size filter (support multiple)
  const sizeFilters: string[] = [];
  if (size) {
    if (Array.isArray(size)) {
      sizeFilters.push(...size);
    } else {
      sizeFilters.push(size);
    }
  }
  if (sizes && sizes.length > 0) {
    sizeFilters.push(...sizes);
  }
  // Remove duplicates
  const uniqueSizeFilters = Array.from(new Set(sizeFilters.map(s => s.trim().toLowerCase())));
  if (uniqueSizeFilters.length > 0) {
    filtered = filtered.filter((b) => {
      const bSize = (b.size ?? "").trim().toLowerCase();
      return uniqueSizeFilters.includes(bSize);
    });
  }

  // Search filter
  if (search && search.trim()) {
    const searchLower = search.trim().toLowerCase();
    filtered = filtered.filter((b) => {
      const searchable = [
        b.name,
        b.description,
        b.type,
        b.size,
        b.collectionName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return searchable.includes(searchLower);
    });
  }

  // Apply sorting
  const { sortBy } = params;
  if (sortBy) {
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  return filtered;
}

export async function getBouquets(
  params: BouquetQueryParams = {},
  signal?: AbortSignal
): Promise<BouquetResponse> {
  const {
    page = 1,
    limit = 20,
  } = params;

  const url = `${API_BASE}/api/bouquets`;

  try {
    const res = await fetch(url, { signal });

    // Check if request was aborted
    if (signal?.aborted) {
      throw new Error("Request was cancelled");
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch bouquets (${res.status}): ${text}`);
    }

    let data: unknown;
    try {
      const text = await res.text();
      data = text.trim() ? JSON.parse(text) : [];
    } catch (parseErr) {
      throw new Error(
        `Failed to parse response: ${
          parseErr instanceof Error ? parseErr.message : "Invalid JSON"
        }`
      );
    }

    if (!Array.isArray(data)) {
      throw new Error("API returned unexpected format (expected an array).");
    }

    const allBouquets = normalizeBouquets(data);
    
    // Apply client-side filtering and sorting
    const filtered = applyFilters(allBouquets, params);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBouquets = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < filtered.length;

    return {
      bouquets: paginatedBouquets,
      total: filtered.length,
      page,
      limit,
      hasMore,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new Error(
      `Failed to fetch bouquets: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Fetch a single bouquet by ID
 */
export async function getBouquetById(
  id: string,
  signal?: AbortSignal
): Promise<Bouquet> {
  const url = `${API_BASE}/api/bouquets/${id}`;

  const res = await fetch(url, { signal });

  if (signal?.aborted) {
    throw new Error("Request was cancelled");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch bouquet (${res.status}): ${text}`);
  }

  let data: unknown;
  try {
    const text = await res.text();
    if (!text.trim()) {
      throw new Error("Empty response body");
    }
    data = JSON.parse(text);
  } catch (parseErr) {
    throw new Error(
      `Failed to parse response: ${
        parseErr instanceof Error ? parseErr.message : "Invalid JSON"
      }`
    );
  }

  if (!Array.isArray(data) && typeof data === "object" && data !== null) {
    const normalized = normalizeBouquets([data]);
    if (normalized.length > 0) {
      return normalized[0];
    }
  }

  throw new Error("Bouquet not found or invalid format");
}

/**
 * Fetch all bouquets (for backward compatibility)
 */
export async function getAllBouquets(
  signal?: AbortSignal
): Promise<Bouquet[]> {
  const response = await getBouquets({ page: 1, limit: 10000 }, signal);
  return response.bouquets;
}

