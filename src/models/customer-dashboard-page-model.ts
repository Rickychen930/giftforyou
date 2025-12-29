/**
 * Customer Dashboard Page Model
 * Defines data structures and types for the customer dashboard page
 */

/**
 * User Info
 */
export interface DashboardUser {
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  role: string;
}

/**
 * Dashboard Stats
 */
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  favoritesCount: number;
}

/**
 * Recent Order
 */
export interface RecentOrder {
  _id: string;
  bouquetName: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
}

/**
 * Active Tab
 */
export type ActiveTab = "overview" | "orders" | "favorites" | "profile" | "addresses" | "settings";

/**
 * Dashboard Page State
 */
export interface DashboardPageState {
  user: DashboardUser | null;
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
}

/**
 * Initial Dashboard Stats
 */
export const INITIAL_DASHBOARD_STATS: DashboardStats = {
  totalOrders: 0,
  pendingOrders: 0,
  completedOrders: 0,
  favoritesCount: 0,
};

/**
 * Initial Dashboard Page State
 */
export const INITIAL_DASHBOARD_PAGE_STATE: DashboardPageState = {
  user: null,
  stats: INITIAL_DASHBOARD_STATS,
  recentOrders: [],
  isLoading: true,
  error: null,
  activeTab: "overview",
};

/**
 * Dashboard Page SEO Data
 */
export interface DashboardPageSeoData {
  title: string;
  description: string;
  path: string;
}

/**
 * Default SEO data for dashboard page
 */
export const DEFAULT_DASHBOARD_PAGE_SEO: DashboardPageSeoData = {
  title: "Dashboard | Giftforyou.idn",
  description: "Kelola akun, pesanan, dan favorit Anda di dashboard customer.",
  path: "/customer/dashboard",
};

/**
 * Get status badge info
 */
export const getStatusBadge = (status: string): { text: string; className: string } => {
  const statusMap: Record<string, { text: string; className: string }> = {
    bertanya: { text: "Bertanya", className: "status--info" },
    memesan: { text: "Memesan", className: "status--primary" },
    sedang_diproses: { text: "Diproses", className: "status--warning" },
    menunggu_driver: { text: "Menunggu Driver", className: "status--warning" },
    pengantaran: { text: "Pengantaran", className: "status--info" },
    terkirim: { text: "Terkirim", className: "status--success" },
  };
  return statusMap[status] || { text: status, className: "status--default" };
};

