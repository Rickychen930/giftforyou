/**
 * Customer service for API calls
 * Handles authentication, error handling, and data transformation
 * Follows SOLID principles
 */

import { API_BASE } from "../config/api";
import { getAccessToken } from "../utils/auth-utils";

export interface CustomerProfile {
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  address?: string;
}

export interface CustomerAddress {
  _id?: string;
  label: string;
  address: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OrderActivity {
  at: string;
  kind: "created" | "status" | "payment" | "delivery" | "bouquet" | "edit";
  message: string;
}

export interface CustomerOrder {
  _id: string;
  bouquetName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus?: string;
  createdAt: string;
  deliveryAt?: string;
  bouquetId?: string;
  activity?: OrderActivity[];
}

export interface CustomerStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  favoritesCount: number;
}

export interface OrdersResponse {
  orders: CustomerOrder[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Get authentication headers
 */
function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Handle API response with proper error handling
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      errorMessage = data.error || data.message || errorMessage;
    } catch {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Ignore
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Fetch customer profile
 */
export async function getCustomerProfile(signal?: AbortSignal): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE}/api/customer/profile`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  return handleResponse<CustomerProfile>(response);
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(
  data: Partial<CustomerProfile>,
  signal?: AbortSignal
): Promise<CustomerProfile> {
  const response = await fetch(`${API_BASE}/api/customer/profile`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
    signal,
  });

  return handleResponse<CustomerProfile>(response);
}

/**
 * Fetch customer addresses
 */
export async function getCustomerAddresses(signal?: AbortSignal): Promise<CustomerAddress[]> {
  const response = await fetch(`${API_BASE}/api/customer/addresses`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse<{ addresses: CustomerAddress[] }>(response);
  return data.addresses || [];
}

/**
 * Create customer address
 */
export async function createCustomerAddress(
  address: Omit<CustomerAddress, "_id">,
  signal?: AbortSignal
): Promise<CustomerAddress> {
  const response = await fetch(`${API_BASE}/api/customer/addresses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(address),
    signal,
  });

  return handleResponse<CustomerAddress>(response);
}

/**
 * Update customer address
 */
export async function updateCustomerAddress(
  id: string,
  address: Partial<CustomerAddress>,
  signal?: AbortSignal
): Promise<CustomerAddress> {
  const response = await fetch(`${API_BASE}/api/customer/addresses/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(address),
    signal,
  });

  return handleResponse<CustomerAddress>(response);
}

/**
 * Delete customer address
 */
export async function deleteCustomerAddress(id: string, signal?: AbortSignal): Promise<void> {
  const response = await fetch(`${API_BASE}/api/customer/addresses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to delete address" }));
    throw new Error(error.message || "Failed to delete address");
  }
}

/**
 * Set default address
 */
export async function setDefaultAddress(id: string, signal?: AbortSignal): Promise<void> {
  const response = await fetch(`${API_BASE}/api/customer/addresses/${id}/set-default`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to set default address" }));
    throw new Error(error.message || "Failed to set default address");
  }
}

/**
 * Fetch customer orders with pagination
 */
export async function getCustomerOrders(
  params: { page?: number; limit?: number } = {},
  signal?: AbortSignal
): Promise<OrdersResponse> {
  const { page = 1, limit = 20 } = params;
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE}/api/orders?${queryParams}`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  const data = await handleResponse<OrdersResponse | CustomerOrder[]>(response);
  
  // Handle both paginated response and array response (backward compatibility)
  if (Array.isArray(data)) {
    // Legacy format: array of orders
    const hasMore = data.length === limit;
    return {
      orders: data,
      total: data.length,
      page,
      limit,
      hasMore,
    };
  }
  
  // New format: paginated response
  return data;
}

/**
 * Fetch customer dashboard stats
 */
export async function getCustomerStats(signal?: AbortSignal): Promise<CustomerStats> {
  // Fetch orders to calculate stats
  const ordersResponse = await getCustomerOrders({ page: 1, limit: 1000 }, signal);
  const orders = ordersResponse.orders;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus !== "terkirim"
  ).length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === "terkirim"
  ).length;

  // Get favorites count from localStorage
  const favoritesCount = (() => {
    try {
      const favorites = localStorage.getItem("favorites");
      if (!favorites) return 0;
      const parsed = JSON.parse(favorites);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  })();

  return {
    totalOrders,
    pendingOrders,
    completedOrders,
    favoritesCount,
  };
}

/**
 * Fetch single order by ID
 */
export async function getCustomerOrderById(
  orderId: string,
  signal?: AbortSignal
): Promise<CustomerOrder> {
  const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
    method: "GET",
    headers: getAuthHeaders(),
    signal,
  });

  return handleResponse<CustomerOrder>(response);
}

