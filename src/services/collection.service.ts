// src/services/collection.service.ts

import { API_BASE } from "../config/api";
import type { Collection } from "../models/domain/collection";
import { apiCache } from "../utils/api-cache";

const CACHE_KEY = "collections";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Request deduplication: prevent multiple simultaneous requests
let pendingRequest: Promise<Collection[]> | null = null;

export async function getCollections(
  signal?: AbortSignal
): Promise<Collection[]> {
  // Check cache first
  const cached = apiCache.get<Collection[]>(CACHE_KEY);
  if (cached) {
    return cached;
  }

  // If there's a pending request, return it instead of making a new one
  if (pendingRequest) {
    return pendingRequest;
  }

  // If API_BASE="" => "/api/collections"
  const url = `${API_BASE}/api/collections`;

  // Create the request promise
  pendingRequest = (async () => {
    try {
      const res = await fetch(url, { signal });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch collections (${res.status}): ${text}`);
      }

      const data = (await res.json()) as unknown;
      const collections = Array.isArray(data) ? (data as Collection[]) : [];

      // Cache the result
      apiCache.set(CACHE_KEY, collections, CACHE_TTL);

      return collections;
    } finally {
      // Clear pending request after completion
      pendingRequest = null;
    }
  })();

  return pendingRequest;
}
