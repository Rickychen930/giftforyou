/**
 * Customer Dashboard Page - Modern Luxury Design
 * Uses React Hooks, React Query, and Virtualized Lists
 * Implements SOLID, DRY, MVP principles
 */

import React, { useEffect, useState, useCallback, useMemo, memo, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CustomerDashboardPage.css";
import { setSeo } from "../utils/seo";
import { getAccessToken, clearAuth } from "../utils/auth-utils";
import { formatIDR } from "../utils/money";
import { getFavoritesCount } from "../utils/favorites";
import LuxuryTooltip from "../components/LuxuryTooltip";
import EmptyState from "../components/EmptyState";
import CustomerDashboardErrorBoundary from "../components/CustomerDashboardErrorBoundary";
// FavoritesList is replaced by VirtualizedFavoritesList for better performance
import OrderSearchFilter, { type OrderStatusFilter } from "../components/OrderSearchFilter";
import { keyboardShortcuts } from "../utils/keyboard-shortcuts";
import {
  useCustomerProfile,
  useCustomerStats,
  useInfiniteCustomerOrders,
} from "../hooks/useCustomer";
import { useQueryClient } from "@tanstack/react-query";
import { customerKeys } from "../hooks/useCustomer";
import type { CustomerOrder } from "../services/customer.service";

// Lazy load components for code splitting
const VirtualizedOrderList = lazy(() => import("../components/VirtualizedOrderList"));
const VirtualizedFavoritesList = lazy(() => import("../components/VirtualizedFavoritesList"));

type ActiveTab = "overview" | "orders" | "favorites" | "profile" | "addresses" | "settings";

const CustomerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatusFilter>("all");
  
  // Real-time favorites count - must be before early returns
  const [favoritesCount, setFavoritesCount] = useState(() => getFavoritesCount());

  // Check authentication
  const token = getAccessToken();
  const isAuthenticated = !!token;

  // React Query hooks
  const {
    data: profile,
  } = useCustomerProfile({
    enabled: isAuthenticated,
  });

  const {
    data: stats,
    isLoading: statsLoading,
  } = useCustomerStats({
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute for real-time stats
  });

  const {
    data: ordersData,
    isLoading: ordersLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteCustomerOrders(
    { limit: 20 },
    {
      enabled: isAuthenticated && activeTab === "orders",
    }
  );

  // Flatten orders from all pages with validation
  const allOrders = useMemo(() => {
    if (!ordersData?.pages || !Array.isArray(ordersData.pages)) return [];
    try {
      return ordersData.pages
        .filter((page) => 
          page != null && 
          typeof page === "object" && 
          Array.isArray(page.orders)
        )
        .flatMap((page) => 
          page.orders.filter((order): order is CustomerOrder => 
            order != null && 
            typeof order === "object" && 
            order._id != null
          )
        );
    } catch (error) {
      console.error("[CustomerDashboard] Error flattening orders:", error);
      return [];
    }
  }, [ordersData]);

  // Filter orders based on search and status with validation
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(allOrders) || allOrders.length === 0) return [];
    
    let filtered = allOrders;

    // Filter by search query
    const searchQuery = typeof orderSearchQuery === "string" ? orderSearchQuery.trim() : "";
    if (searchQuery && searchQuery.length > 0) {
      try {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((order) => {
          if (!order || typeof order !== "object") return false;
          try {
            const bouquetName = typeof order.bouquetName === "string" ? order.bouquetName.toLowerCase() : "";
            const orderId = String(order._id || "").toLowerCase();
            return bouquetName.includes(query) || orderId.includes(query);
          } catch {
            return false;
          }
        });
      } catch (error) {
        console.error("[CustomerDashboard] Error filtering by search:", error);
      }
    }

    // Filter by status
    if (orderStatusFilter && orderStatusFilter !== "all") {
      try {
        filtered = filtered.filter((order) => {
          if (!order || typeof order !== "object") return false;
          const status = typeof order.orderStatus === "string" ? order.orderStatus : "";
          return status === orderStatusFilter;
        });
      } catch (error) {
        console.error("[CustomerDashboard] Error filtering by status:", error);
      }
    }

    return filtered;
  }, [allOrders, orderSearchQuery, orderStatusFilter]);

  // Recent orders (first 5) - sorted by date (newest first) with validation
  const recentOrders = useMemo(() => {
    if (!Array.isArray(allOrders) || allOrders.length === 0) return [];
    
    try {
      return [...allOrders]
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (!Number.isFinite(dateA)) return 1;
          if (!Number.isFinite(dateB)) return -1;
          return dateB - dateA; // Newest first
        })
        .slice(0, 5)
        .filter((order): order is CustomerOrder => 
          order != null && typeof order === "object" && order._id != null
        );
    } catch (error) {
      console.error("[CustomerDashboard] Error sorting recent orders:", error);
      return allOrders.slice(0, 5);
    }
  }, [allOrders]);

  // Update favorites count when favorites change - must be before early returns
  useEffect(() => {
    const updateFavorites = () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.stats() });
    };

    window.addEventListener("favoritesUpdated", updateFavorites);
    return () => {
      window.removeEventListener("favoritesUpdated", updateFavorites);
    };
  }, [queryClient]);

  // Update favorites count in real-time - must be before early returns
  useEffect(() => {
    const updateFavoritesCount = () => {
      const newCount = getFavoritesCount();
      setFavoritesCount(newCount);
      queryClient.setQueryData(customerKeys.stats(), (old: typeof stats) => {
        if (!old) return old;
        return {
          ...old,
          favoritesCount: newCount,
        };
      });
    };

    window.addEventListener("favoritesUpdated", updateFavoritesCount);
    return () => {
      window.removeEventListener("favoritesUpdated", updateFavoritesCount);
    };
  }, [queryClient]);

  // Auto-refresh orders when tab changes to orders - must be before early returns
  useEffect(() => {
    if (activeTab === "orders") {
      queryClient.invalidateQueries({ queryKey: customerKeys.orders() });
    }
  }, [activeTab, queryClient]);

  // SEO and initialization
  useEffect(() => {
    setSeo({
      title: "Dashboard | Giftforyou.idn",
      description: "Kelola akun, pesanan, dan favorit Anda di dashboard customer.",
      path: "/customer/dashboard",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Register keyboard shortcuts
    const unregister = keyboardShortcuts.register({
      key: "k",
      ctrl: true,
      action: () => {
        const searchInput = document.querySelector(
          'input[type="search"], input[placeholder*="cari" i]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          navigate("/collection");
        }
      },
      description: "Quick search",
    });

    return () => {
      if (unregister) unregister();
    };
  }, [navigate]);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/");
  }, [navigate]);

  const formatDate = useCallback((dateString: string): string => {
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
  }, []);

  const getStatusBadge = useCallback((status: string): { text: string; className: string } => {
    const statusMap: Record<string, { text: string; className: string }> = {
      bertanya: { text: "Bertanya", className: "status--info" },
      memesan: { text: "Memesan", className: "status--primary" },
      sedang_diproses: { text: "Diproses", className: "status--warning" },
      menunggu_driver: { text: "Menunggu Driver", className: "status--warning" },
      pengantaran: { text: "Pengantaran", className: "status--info" },
      terkirim: { text: "Terkirim", className: "status--success" },
    };
    return statusMap[status] || { text: status, className: "status--default" };
  }, []);

  // Validate and normalize stats with useMemo for performance - MUST be before early returns
  const displayStats = useMemo(() => {
    if (!stats || typeof stats !== "object") {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        favoritesCount: typeof favoritesCount === "number" && Number.isFinite(favoritesCount) ? favoritesCount : 0,
      };
    }
    return {
      totalOrders: typeof stats.totalOrders === "number" && Number.isFinite(stats.totalOrders) ? Math.max(0, stats.totalOrders) : 0,
      pendingOrders: typeof stats.pendingOrders === "number" && Number.isFinite(stats.pendingOrders) ? Math.max(0, stats.pendingOrders) : 0,
      completedOrders: typeof stats.completedOrders === "number" && Number.isFinite(stats.completedOrders) ? Math.max(0, stats.completedOrders) : 0,
      favoritesCount: typeof stats.favoritesCount === "number" && Number.isFinite(stats.favoritesCount) 
        ? Math.max(0, stats.favoritesCount)
        : (typeof favoritesCount === "number" && Number.isFinite(favoritesCount) ? Math.max(0, favoritesCount) : 0),
    };
  }, [stats, favoritesCount]);

  return (
    <CustomerDashboardErrorBoundary>
      <section className="customerDashboard" aria-labelledby="dashboard-title">
      <div className="customerDashboard__container">
        {/* Header */}
        <div className="customerDashboard__header">
          <div>
            <h1 id="dashboard-title" className="customerDashboard__title">
              Dashboard Saya
            </h1>
            <p className="customerDashboard__subtitle">
              Selamat datang kembali, {profile?.fullName || profile?.username || "Customer"}!
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="customerDashboard__logoutBtn"
            aria-label="Keluar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Keluar</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="customerDashboard__stats">
          <LuxuryTooltip content="Total semua pesanan yang pernah Anda buat" position="top">
            <div className="customerDashboard__statCard">
              <div className="customerDashboard__statIcon customerDashboard__statIcon--orders">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="customerDashboard__statContent">
                <p className="customerDashboard__statLabel">Total Pesanan</p>
                <p className="customerDashboard__statValue">
                  {statsLoading ? "..." : displayStats.totalOrders}
                </p>
              </div>
            </div>
          </LuxuryTooltip>

          <LuxuryTooltip content="Pesanan yang sedang dalam proses" position="top">
            <div className="customerDashboard__statCard">
              <div className="customerDashboard__statIcon customerDashboard__statIcon--pending">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="customerDashboard__statContent">
                <p className="customerDashboard__statLabel">Pesanan Pending</p>
                <p className="customerDashboard__statValue">
                  {statsLoading ? "..." : displayStats.pendingOrders}
                </p>
              </div>
            </div>
          </LuxuryTooltip>

          <LuxuryTooltip content="Pesanan yang sudah selesai dan terkirim" position="top">
            <div className="customerDashboard__statCard">
              <div className="customerDashboard__statIcon customerDashboard__statIcon--completed">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div className="customerDashboard__statContent">
                <p className="customerDashboard__statLabel">Pesanan Selesai</p>
                <p className="customerDashboard__statValue">
                  {statsLoading ? "..." : displayStats.completedOrders}
                </p>
              </div>
            </div>
          </LuxuryTooltip>

          <LuxuryTooltip content="Bouquet yang Anda simpan sebagai favorit" position="top">
            <div className="customerDashboard__statCard">
              <div className="customerDashboard__statIcon customerDashboard__statIcon--favorites">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="customerDashboard__statContent">
                <p className="customerDashboard__statLabel">Favorit</p>
                <p className="customerDashboard__statValue">
                  {statsLoading ? "..." : displayStats.favoritesCount}
                </p>
              </div>
            </div>
          </LuxuryTooltip>
        </div>

        {/* Navigation Tabs */}
        <div className="customerDashboard__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "overview"}
            className={`customerDashboard__tab ${
              activeTab === "overview" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="14"
                y="3"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="14"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3"
                y="14"
                width="7"
                height="7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Overview</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "orders"}
            className={`customerDashboard__tab ${
              activeTab === "orders" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("orders")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Pesanan</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "favorites"}
            className={`customerDashboard__tab ${
              activeTab === "favorites" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Favorit</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            className={`customerDashboard__tab ${
              activeTab === "profile" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Profil</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "addresses"}
            className={`customerDashboard__tab ${
              activeTab === "addresses" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("addresses")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Alamat</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "settings"}
            className={`customerDashboard__tab ${
              activeTab === "settings" ? "customerDashboard__tab--active" : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Pengaturan</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="customerDashboard__content">
          {activeTab === "overview" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <h2 className="customerDashboard__sectionTitle">Pesanan Terbaru</h2>
                {recentOrders.length === 0 ? (
                  <EmptyState
                    title="Belum Ada Pesanan"
                    description="Mulai jelajahi koleksi bouquet kami dan buat pesanan pertama Anda"
                    actionLabel="Mulai Belanja"
                    actionPath="/collection"
                    icon={
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.3"
                        />
                      </svg>
                    }
                  />
                ) : (
                  <div className="customerDashboard__ordersList">
                    {recentOrders.map((order) => {
                      const statusBadge = getStatusBadge(order.orderStatus);
                      return (
                        <Link
                          key={order._id}
                          to={`/customer/orders/${order._id}`}
                          className="customerDashboard__orderCard"
                        >
                          <div className="customerDashboard__orderHeader">
                            <h3 className="customerDashboard__orderTitle">{order.bouquetName}</h3>
                            <span className={`customerDashboard__status ${statusBadge.className}`}>
                              {statusBadge.text}
                            </span>
                          </div>
                          <div className="customerDashboard__orderDetails">
                            <div className="customerDashboard__orderDetailRow">
                              <span className="customerDashboard__orderDate">
                                {formatDate(order.createdAt)}
                              </span>
                              {order.paymentStatus && (
                                <span className={`customerDashboard__paymentStatus customerDashboard__paymentStatus--${order.paymentStatus}`}>
                                  {order.paymentStatus === "sudah_bayar" ? "Lunas" : order.paymentStatus === "dp" ? "DP" : "Belum Bayar"}
                                </span>
                              )}
                            </div>
                            <div className="customerDashboard__orderDetailRow">
                              <span className="customerDashboard__orderPrice">
                                {formatIDR(order.totalAmount)}
                              </span>
                              <span className="customerDashboard__orderId">
                                #{order._id && String(order._id).length > 8 ? String(order._id).slice(-8) : String(order._id || "")}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                    <Link to="/customer/orders" className="customerDashboard__viewAll">
                      Lihat Semua Pesanan →
                    </Link>
                  </div>
                )}
              </div>

              <div className="customerDashboard__section">
                <h2 className="customerDashboard__sectionTitle">Akses Cepat</h2>
                <div className="customerDashboard__quickActions">
                  <Link to="/collection" className="customerDashboard__quickAction">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Jelajahi Katalog</span>
                  </Link>
                  <Link to="/favorites" className="customerDashboard__quickAction">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Favorit Saya</span>
                  </Link>
                  <Link to="/order-history" className="customerDashboard__quickAction">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Riwayat Pesanan</span>
                  </Link>
                  <Link to="/customer/profile" className="customerDashboard__quickAction">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Edit Profil</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <div className="customerDashboard__sectionHeader">
                  <div>
                    <h2 className="customerDashboard__sectionTitle">Semua Pesanan</h2>
                    <p className="customerDashboard__sectionSubtitle">
                      Lihat dan kelola semua pesanan Anda
                    </p>
                  </div>
                </div>
                <OrderSearchFilter
                  searchQuery={orderSearchQuery}
                  statusFilter={orderStatusFilter}
                  onSearchChange={setOrderSearchQuery}
                  onStatusFilterChange={setOrderStatusFilter}
                />
                <Suspense
                  fallback={
                    <div className="customerDashboard__loading">
                      <div className="customerDashboard__spinner"></div>
                      <p>Memuat pesanan...</p>
                    </div>
                  }
                >
                  <VirtualizedOrderList
                    orders={filteredOrders}
                    isLoading={ordersLoading}
                    hasNextPage={hasNextPage}
                    fetchNextPage={fetchNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <div className="customerDashboard__sectionHeader">
                  <div>
                    <h2 className="customerDashboard__sectionTitle">Bouquet Favorit</h2>
                    <p className="customerDashboard__sectionSubtitle">
                      Bouquet yang Anda simpan untuk nanti
                    </p>
                  </div>
                  <Link to="/favorites" className="customerDashboard__viewAllLink">
                    Lihat Semua Favorit →
                  </Link>
                </div>
                <Suspense
                  fallback={
                    <div className="customerDashboard__loading">
                      <div className="customerDashboard__spinner"></div>
                      <p>Memuat favorit...</p>
                    </div>
                  }
                >
                  <VirtualizedFavoritesList limit={12} showRemoveButton={true} />
                </Suspense>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <h2 className="customerDashboard__sectionTitle">Informasi Profil</h2>
                <div className="customerDashboard__profileInfo">
                  <div className="customerDashboard__profileItem">
                    <span className="customerDashboard__profileLabel">Username</span>
                    <span className="customerDashboard__profileValue">{profile?.username || "-"}</span>
                  </div>
                  <div className="customerDashboard__profileItem">
                    <span className="customerDashboard__profileLabel">Email</span>
                    <span className="customerDashboard__profileValue">{profile?.email || "-"}</span>
                  </div>
                  {profile?.fullName && (
                    <div className="customerDashboard__profileItem">
                      <span className="customerDashboard__profileLabel">Nama Lengkap</span>
                      <span className="customerDashboard__profileValue">{profile.fullName}</span>
                    </div>
                  )}
                  {profile?.phoneNumber && (
                    <div className="customerDashboard__profileItem">
                      <span className="customerDashboard__profileLabel">Nomor Telepon</span>
                      <span className="customerDashboard__profileValue">{profile.phoneNumber}</span>
                    </div>
                  )}
                </div>
                <Link to="/customer/profile" className="customerDashboard__editBtn btn-luxury">
                  Edit Profil
                </Link>
              </div>
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <h2 className="customerDashboard__sectionTitle">Buku Alamat</h2>
                <p className="customerDashboard__sectionSubtitle">
                  Kelola alamat pengiriman Anda
                </p>
                <Link to="/customer/addresses" className="customerDashboard__viewAllLink btn-luxury">
                  Kelola Alamat →
                </Link>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="customerDashboard__tabPanel" role="tabpanel">
              <div className="customerDashboard__section">
                <h2 className="customerDashboard__sectionTitle">Pengaturan Akun</h2>
                <div className="customerDashboard__settingsList">
                  <Link
                    to="/customer/change-password"
                    className="customerDashboard__settingItem"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/customer/change-password");
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M7 11V7a5 5 0 0 1 10 0v4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Ubah Password</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link to="/customer/notifications" className="customerDashboard__settingItem">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Notifikasi</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                  <Link to="/customer/privacy" className="customerDashboard__settingItem">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>Privasi & Keamanan</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
    </CustomerDashboardErrorBoundary>
  );
};

// Memoize component to prevent unnecessary re-renders
export default memo(CustomerDashboardPage);
