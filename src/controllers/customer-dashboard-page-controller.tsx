/**
 * Customer Dashboard Page Controller
 * OOP-based controller for managing customer dashboard page state and data
 */

import React, { Component } from "react";
import { API_BASE } from "../config/api";
import { getAccessToken, clearAuth, decodeToken } from "../utils/auth-utils";
import { getFavoritesCount } from "../utils/favorites";
import { keyboardShortcuts } from "../utils/keyboard-shortcuts";
import { setSeo } from "../utils/seo";
import {
  type DashboardPageState,
  type DashboardUser,
  type RecentOrder,
  INITIAL_DASHBOARD_PAGE_STATE,
  DEFAULT_DASHBOARD_PAGE_SEO,
  getStatusBadge,
} from "../models/customer-dashboard-page-model";
import CustomerDashboardPageView from "../view/customer-dashboard-page";

interface CustomerDashboardPageControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Dashboard Page Controller Class
 * Manages all business logic, data fetching, and state for the dashboard
 */
export class CustomerDashboardPageController extends Component<
  CustomerDashboardPageControllerProps,
  DashboardPageState
> {
  private unregisterShortcuts: (() => void) | null = null;
  private favoritesUpdateListener: (() => void) | null = null;

  constructor(props: CustomerDashboardPageControllerProps) {
    super(props);
    this.state = { ...INITIAL_DASHBOARD_PAGE_STATE };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_DASHBOARD_PAGE_SEO);
  }

  /**
   * Update favorites count
   */
  private updateFavoritesCount = (): void => {
    const favoritesCount = getFavoritesCount();
    this.setState((prevState) => ({
      stats: {
        ...prevState.stats,
        favoritesCount,
      },
    }));
  };

  /**
   * Load dashboard data
   */
  private loadDashboardData = async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) {
      this.setState({ error: "Tidak terautentikasi", isLoading: false });
      return;
    }

    try {
      // Decode token to get user info
      const decoded = decodeToken(token);
      if (decoded) {
        this.setState({
          user: {
            username: (decoded.username as string) || "",
            email: (decoded.email as string) || "",
            role: (decoded.role as string) || "customer",
          },
        });
      }

      // Load user profile and orders in parallel for better performance
      const [profileResponse, ordersResponse] = await Promise.all([
        fetch(`${API_BASE}/api/customer/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        this.setState((prevState) => ({
          user: {
            ...prevState.user!,
            fullName: profileData.fullName,
            phoneNumber: profileData.phoneNumber,
          },
        }));
      }

      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        const totalOrders = orders.length;
        const pendingOrders = orders.filter((o: { orderStatus?: string }) => 
          o.orderStatus !== "terkirim"
        ).length;
        const completedOrders = orders.filter((o: { orderStatus?: string }) => 
          o.orderStatus === "terkirim"
        ).length;

        this.setState({
          stats: {
            totalOrders,
            pendingOrders,
            completedOrders,
            favoritesCount: getFavoritesCount(),
          },
          recentOrders: orders.slice(0, 5),
        });
      }

      this.setState({ isLoading: false });
    } catch (error) {
      // Only log in development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load dashboard data:", error);
      }
      this.setState({
        error: "Gagal memuat data dashboard",
        isLoading: false,
      });
    }
  };

  /**
   * Handle logout
   */
  handleLogout = (): void => {
    clearAuth();
    window.location.href = "/";
  };

  /**
   * Handle tab change
   */
  handleTabChange = (tab: DashboardPageState["activeTab"]): void => {
    this.setState({ activeTab: tab });
  };

  /**
   * Format date
   */
  formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.initializeSeo();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Check authentication
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }

    this.loadDashboardData();

    // Listen for favorites updates
    this.favoritesUpdateListener = this.updateFavoritesCount;
    window.addEventListener("favoritesUpdated", this.favoritesUpdateListener);

    // Register keyboard shortcuts
    this.unregisterShortcuts = keyboardShortcuts.register({
      key: "k",
      ctrl: true,
      action: () => {
        // Quick search - focus search if available, or navigate to collection
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="cari" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          window.location.href = "/collection";
        }
      },
      description: "Quick search",
    });
  }

  /**
   * Component lifecycle: Unmount
   */
  componentWillUnmount(): void {
    if (this.favoritesUpdateListener) {
      window.removeEventListener("favoritesUpdated", this.favoritesUpdateListener);
    }
    if (this.unregisterShortcuts) {
      this.unregisterShortcuts();
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerDashboardPageView
        user={this.state.user}
        stats={this.state.stats}
        recentOrders={this.state.recentOrders}
        isLoading={this.state.isLoading}
        error={this.state.error}
        activeTab={this.state.activeTab}
        formatDate={this.formatDate}
        getStatusBadge={getStatusBadge}
        onLogout={this.handleLogout}
        onTabChange={this.handleTabChange}
      />
    );
  }
}

export default CustomerDashboardPageController;

