/**
 * Custom React Query hooks for customer data
 * Implements caching, error handling, and infinite scroll support
 * Follows SOLID, DRY principles
 */

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  type InfiniteData,
} from "@tanstack/react-query";
import {
  getCustomerProfile,
  updateCustomerProfile,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
  getCustomerOrders,
  getCustomerStats,
  getCustomerOrderById,
  type CustomerProfile,
  type CustomerAddress,
  type CustomerStats,
  type OrdersResponse,
  type CustomerOrder,
} from "../services/customer.service";
import { getFavoritesCount } from "../utils/favorites";

// Query keys for React Query cache
export const customerKeys = {
  all: ["customer"] as const,
  profile: () => [...customerKeys.all, "profile"] as const,
  addresses: () => [...customerKeys.all, "addresses"] as const,
  address: (id: string) => [...customerKeys.addresses(), id] as const,
  orders: () => [...customerKeys.all, "orders"] as const,
  ordersList: (params?: { page?: number; limit?: number }) =>
    [...customerKeys.orders(), "list", params] as const,
  ordersInfinite: (params?: { limit?: number }) =>
    [...customerKeys.orders(), "infinite", params] as const,
  order: (id: string) => [...customerKeys.orders(), id] as const,
  stats: () => [...customerKeys.all, "stats"] as const,
  favorites: () => [...customerKeys.all, "favorites"] as const,
};

/**
 * Fetch customer profile with React Query caching
 */
export function useCustomerProfile(
  options?: Omit<UseQueryOptions<CustomerProfile, Error>, "queryKey" | "queryFn">
) {
  return useQuery<CustomerProfile, Error>({
    queryKey: customerKeys.profile(),
    queryFn: async ({ signal }) => {
      try {
        return await getCustomerProfile(signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }
        throw new Error("Failed to fetch profile: Unknown error");
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    ...options,
  });
}

/**
 * Mutation hook for updating customer profile
 */
export function useUpdateCustomerProfile(
  options?: Omit<UseMutationOptions<CustomerProfile, Error, Partial<CustomerProfile>, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CustomerProfile>) => {
      return await updateCustomerProfile(data);
    },
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: customerKeys.profile() });
    },
    ...options,
  });
}

/**
 * Fetch customer addresses with React Query caching
 */
export function useCustomerAddresses(
  options?: Omit<UseQueryOptions<CustomerAddress[], Error>, "queryKey" | "queryFn">
) {
  return useQuery<CustomerAddress[], Error>({
    queryKey: customerKeys.addresses(),
    queryFn: async ({ signal }) => {
      try {
        return await getCustomerAddresses(signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch addresses: ${error.message}`);
        }
        throw new Error("Failed to fetch addresses: Unknown error");
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData ?? [],
    ...options,
  });
}

/**
 * Mutation hook for creating customer address
 */
export function useCreateCustomerAddress(
  options?: Omit<UseMutationOptions<CustomerAddress, Error, Omit<CustomerAddress, "_id">, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (address: Omit<CustomerAddress, "_id">) => {
      return await createCustomerAddress(address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
    ...options,
  });
}

/**
 * Mutation hook for updating customer address
 */
export function useUpdateCustomerAddress(
  options?: Omit<UseMutationOptions<CustomerAddress, Error, { id: string; address: Partial<CustomerAddress> }, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, address }: { id: string; address: Partial<CustomerAddress> }) => {
      return await updateCustomerAddress(id, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
    ...options,
  });
}

/**
 * Mutation hook for deleting customer address
 */
export function useDeleteCustomerAddress(
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await deleteCustomerAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
    ...options,
  });
}

/**
 * Mutation hook for setting default address
 */
export function useSetDefaultAddress(
  options?: Omit<UseMutationOptions<void, Error, string, unknown>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await setDefaultAddress(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.addresses() });
    },
    ...options,
  });
}

/**
 * Fetch customer orders with pagination
 */
export function useCustomerOrders(
  params: { page?: number; limit?: number } = {},
  options?: Omit<UseQueryOptions<OrdersResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery<OrdersResponse, Error>({
    queryKey: customerKeys.ordersList(params),
    queryFn: async ({ signal }) => {
      try {
        return await getCustomerOrders(params, signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch orders: ${error.message}`);
        }
        throw new Error("Failed to fetch orders: Unknown error");
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (orders change more frequently)
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
    placeholderData: (previousData) =>
      previousData ?? {
        orders: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      },
    ...options,
  });
}

/**
 * Infinite scroll hook for customer orders
 */
export function useInfiniteCustomerOrders(
  params: { limit?: number } = {},
  options?: Omit<
    UseInfiniteQueryOptions<OrdersResponse, Error, InfiniteData<OrdersResponse>, readonly unknown[], unknown>,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) {
  const limit = params.limit ?? 20;

  return useInfiniteQuery({
    queryKey: customerKeys.ordersInfinite(params),
    queryFn: async ({ pageParam = 1, signal }) => {
      try {
        return await getCustomerOrders({ page: pageParam as number, limit }, signal);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        if (error instanceof Error) {
          throw new Error(`Failed to fetch orders: ${error.message}`);
        }
        throw new Error("Failed to fetch orders: Unknown error");
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    ...options,
  });
}

/**
 * Fetch customer dashboard stats
 */
export function useCustomerStats(
  options?: Omit<UseQueryOptions<CustomerStats, Error>, "queryKey" | "queryFn">
) {
  return useQuery<CustomerStats, Error>({
    queryKey: customerKeys.stats(),
    queryFn: async ({ signal }) => {
      try {
        const stats = await getCustomerStats(signal);
        // Update favorites count from localStorage
        stats.favoritesCount = getFavoritesCount();
        return stats;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch stats: ${error.message}`);
        }
        throw new Error("Failed to fetch stats: Unknown error");
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute (stats change frequently)
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    placeholderData: (previousData) =>
      previousData ?? {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        favoritesCount: 0,
      },
    ...options,
  });
}

/**
 * Fetch single order by ID
 */
export function useCustomerOrder(
  orderId: string,
  options?: Omit<UseQueryOptions<CustomerOrder, Error>, "queryKey" | "queryFn">
) {
  return useQuery<CustomerOrder, Error>({
    queryKey: customerKeys.order(orderId),
    queryFn: async ({ signal }) => {
      try {
        return await getCustomerOrderById(orderId, signal);
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch order: ${error.message}`);
        }
        throw new Error("Failed to fetch order: Unknown error");
      }
    },
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: true,
    ...options,
  });
}

