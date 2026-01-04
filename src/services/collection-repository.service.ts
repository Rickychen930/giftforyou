/**
 * Collection Repository Service
 * Implements Repository Pattern for data access with caching (OOP, SOLID, DRY)
 * 
 * Single Responsibility: Handles collection data access and caching
 * Open/Closed: Can be extended without modification
 * Dependency Inversion: Abstract data access layer
 */

import type { Collection } from "../models/domain/collection";
import { API_BASE } from "../config/api";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CollectionRepository {
  private cache: Map<string, CacheEntry<Collection[]>> = new Map();
  private readonly CACHE_KEY = "collections";
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private activeRequests: Map<string, Promise<Collection[]>> = new Map();

  /**
   * Get collections with caching and request deduplication
   * Prevents redundant API calls when multiple components request simultaneously
   */
  async getCollections(signal?: AbortSignal): Promise<Collection[]> {
    // Check cache first
    const cached = this.getFromCache();
    if (cached) {
      return cached;
    }

    // Check if there's already an active request
    const existingRequest = this.activeRequests.get(this.CACHE_KEY);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request
    const request = this.fetchCollections(signal);
    this.activeRequests.set(this.CACHE_KEY, request);

    try {
      const data = await request;
      this.setCache(data);
      return data;
    } catch (error) {
      // Remove from active requests on error
      this.activeRequests.delete(this.CACHE_KEY);
      throw error;
    } finally {
      // Clean up active request after completion
      setTimeout(() => {
        this.activeRequests.delete(this.CACHE_KEY);
      }, 100);
    }
  }

  /**
   * Fetch collections from API
   */
  private async fetchCollections(signal?: AbortSignal): Promise<Collection[]> {
    const url = `${API_BASE}/api/collections`;
    const res = await fetch(url, { signal });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch collections (${res.status}): ${text}`);
    }

    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Collection[]) : [];
  }

  /**
   * Get data from cache if valid
   */
  private getFromCache(): Collection[] | null {
    const entry = this.cache.get(this.CACHE_KEY);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(this.CACHE_KEY);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in cache
   */
  private setCache(data: Collection[]): void {
    const now = Date.now();
    this.cache.set(this.CACHE_KEY, {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
    });
  }

  /**
   * Clear cache (useful for cache invalidation)
   */
  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  /**
   * Invalidate cache (useful after mutations)
   */
  invalidateCache(): void {
    this.cache.delete(this.CACHE_KEY);
  }
}

// Singleton instance (follows Singleton pattern for service layer)
export const collectionRepository = new CollectionRepository();

// Export the original function for backward compatibility
export async function getCollections(signal?: AbortSignal): Promise<Collection[]> {
  return collectionRepository.getCollections(signal);
}

