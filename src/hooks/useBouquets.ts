/**
 * Custom React Query hooks for bouquets
 * Implements caching, error handling, and infinite scroll support
 * Follows SOLID, DRY principles
 */

import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, type InfiniteData } from "@tanstack/react-query";
import { getBouquets, getAllBouquets, getBouquetById, type BouquetQueryParams, type BouquetResponse } from "../services/bouquet.service";
import type { Bouquet } from "../models/domain/bouquet";

// Re-export BouquetQueryParams for convenience
export type { BouquetQueryParams, BouquetResponse } from "../services/bouquet.service";

// Query keys for React Query cache
export const bouquetKeys = {
  all: ["bouquets"] as const,
  lists: () => [...bouquetKeys.all, "list"] as const,
  list: (filters?: BouquetQueryParams) => [...bouquetKeys.lists(), { filters }] as const,
  details: () => [...bouquetKeys.all, "detail"] as const,
  detail: (id: string) => [...bouquetKeys.details(), id] as const,
  infinite: (filters?: BouquetQueryParams) => [...bouquetKeys.lists(), "infinite", { filters }] as const,
};

/**
 * Fetch bouquets with React Query caching
 * Handles edge cases: network errors, empty responses, invalid data
 */
export function useBouquets(
  params: BouquetQueryParams = {},
  options?: Omit<UseQueryOptions<BouquetResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<BouquetResponse, Error>({
    queryKey: bouquetKeys.list(params),
    queryFn: async ({ signal }) => {
      try {
        return await getBouquets(params, signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch bouquets: ${error.message}`);
        }
        throw new Error("Failed to fetch bouquets: Unknown error");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? {
      bouquets: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    },
    structuralSharing: true,
    ...options,
  });
}

/**
 * Fetch all bouquets (for backward compatibility)
 */
export function useAllBouquets(
  options?: Omit<UseQueryOptions<Bouquet[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<Bouquet[], Error>({
    queryKey: [...bouquetKeys.lists(), "all"],
    queryFn: async ({ signal }) => {
      try {
        return await getAllBouquets(signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch bouquets: ${error.message}`);
        }
        throw new Error("Failed to fetch bouquets: Unknown error");
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
    structuralSharing: true,
    ...options,
  });
}

/**
 * Fetch a single bouquet by ID with React Query caching
 */
export function useBouquet(
  id: string | undefined,
  options?: Omit<UseQueryOptions<Bouquet, Error>, "queryKey" | "queryFn" | "enabled">
) {
  return useQuery<Bouquet, Error>({
    queryKey: bouquetKeys.detail(id || ""),
    queryFn: async ({ signal }) => {
      if (!id) {
        throw new Error("Bouquet ID is required");
      }
      try {
        return await getBouquetById(id, signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch bouquet: ${error.message}`);
        }
        throw new Error("Failed to fetch bouquet: Unknown error");
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    ...options,
  });
}

/**
 * Infinite scroll hook for bouquets
 * Supports pagination with infinite scroll
 * Automatically resets when filters change
 */
export function useInfiniteBouquets(
  params: Omit<BouquetQueryParams, "page"> = {},
  options?: Omit<UseInfiniteQueryOptions<BouquetResponse, Error, InfiniteData<BouquetResponse>, readonly unknown[], unknown>, "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam">
) {
  const limit = params.limit ?? 20;

  // Create stable query key that changes when filters change
  const queryKey = bouquetKeys.infinite(params);

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = 1, signal }) => {
      try {
        // AbortSignal is automatically passed by React Query
        // When queryKey changes, previous requests are automatically cancelled
        return await getBouquets({ ...params, page: pageParam as number, limit }, signal);
      } catch (error) {
        // Don't throw error if request was aborted (cancelled)
        if (error instanceof Error && error.name === "AbortError") {
          throw error; // Let React Query handle abort errors
        }
        if (error instanceof Error) {
          throw new Error(`Failed to fetch bouquets: ${error.message}`);
        }
        throw new Error("Failed to fetch bouquets: Unknown error");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    // Reset when filters change (queryKey changes automatically cancel previous requests)
    refetchOnMount: true,
    // React Query automatically cancels in-flight requests when queryKey changes
    ...options,
  });
}

