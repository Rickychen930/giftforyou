/**
 * Custom React Query hook for collections
 * Implements caching, error handling, and infinite scroll support
 * Follows SOLID, DRY principles
 */

import { useQuery, useInfiniteQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCollections } from "../services/collection.service";
import type { Collection } from "../models/domain/collection";

// Query keys for React Query cache
export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) => [...collectionKeys.lists(), { filters }] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
};

/**
 * Fetch collections with React Query caching
 * Handles edge cases: network errors, empty responses, invalid data
 */
export function useCollections(
  options?: Omit<UseQueryOptions<Collection[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Collection[], Error>({
    queryKey: collectionKeys.lists(),
    queryFn: async ({ signal }) => {
      try {
        const data = await getCollections(signal);
        // Ensure we return an array even if API returns null/undefined
        return Array.isArray(data) ? data : [];
      } catch (error) {
        // Re-throw with more context for better error handling
        if (error instanceof Error) {
          throw new Error(`Failed to fetch collections: ${error.message}`);
        }
        throw new Error("Failed to fetch collections: Unknown error");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false, // Don't refetch on mount if data exists
    // Handle edge cases
    placeholderData: (previousData) => previousData ?? [],
    // Performance: Use structural sharing for better performance
    structuralSharing: true,
    ...options,
  });
}

/**
 * Infinite scroll hook for collections
 * Supports pagination if API supports it
 * NOTE: Prepared for future use when API supports pagination
 * Currently not used as all collections are loaded at once
 */
export function useInfiniteCollections() {
  // This hook is prepared for future implementation
  // when the API supports pagination
  // For now, use useCollections() which loads all data
  return useInfiniteQuery({
    queryKey: [...collectionKeys.lists(), "infinite"],
    queryFn: async ({ signal }) => {
      const data = await getCollections(signal);
      return data;
    },
    initialPageParam: 0,
    getNextPageParam: () => undefined, // Disable infinite scroll for now
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

