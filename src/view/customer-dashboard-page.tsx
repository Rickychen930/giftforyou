import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerDashboardPage.css";
import { setSeo } from "../utils/seo";
import { API_BASE } from "../config/api";
import { getAccessToken, clearAuth, decodeToken } from "../utils/auth-utils";
import { formatIDR } from "../utils/money";
import { getFavoritesCount } from "../utils/favorites";
import LuxuryTooltip from "../components/LuxuryTooltip";
import EmptyState from "../components/EmptyState";
import { keyboardShortcuts } from "../utils/keyboard-shortcuts";

interface DashboardState {
  user: {
    username: string;
    email: string;
    fullName?: string;
    phoneNumber?: string;
    role: string;
  } | null;
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    favoritesCount: number;
  };
  recentOrders: Array<{
    _id: string;
    bouquetName: string;
    totalAmount: number;
    orderStatus: string;
    createdAt: string;
  }>;
  isLoading: boolean;
  error: string | null;
  activeTab: "overview" | "orders" | "favorites" | "profile" | "addresses" | "settings";
}

class CustomerDashboardPage extends Component<{}, DashboardState> {
  private unregisterShortcuts: (() => void) | null = null;

  state: DashboardState = {
    user: null,
    stats: {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      favoritesCount: 0,
    },
    recentOrders: [],
    isLoading: true,
    error: null,
    activeTab: "overview",
  };

  componentDidMount(): void {
    setSeo({
      title: "Dashboard | Giftforyou.idn",
      description: "Kelola akun, pesanan, dan favorit Anda di dashboard customer.",
      path: "/customer/dashboard",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Check authentication
    const token = getAccessToken();
    if (!token) {
      window.location.href = "/customer/login";
      return;
    }

    this.loadDashboardData();
    
    // Listen for favorites updates
    window.addEventListener("favoritesUpdated", this.updateFavoritesCount);

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

  componentWillUnmount(): void {
    window.removeEventListener("favoritesUpdated", this.updateFavoritesCount);
    if (this.unregisterShortcuts) {
      this.unregisterShortcuts();
    }
  }

  private updateFavoritesCount = (): void => {
    const favoritesCount = getFavoritesCount();
    this.setState((prevState) => ({
      stats: {
        ...prevState.stats,
        favoritesCount,
      },
    }));
  };

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

  private handleLogout = (): void => {
    clearAuth();
    window.location.href = "/";
  };

  private formatDate = (dateString: string): string => {
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

  private getStatusBadge = (status: string): { text: string; className: string } => {
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

  render(): React.ReactNode {
    const { user, stats, recentOrders, isLoading, error, activeTab } = this.state;

    if (isLoading) {
      return (
        <section className="customerDashboard customerDashboard--loading">
          <div className="customerDashboard__loading">
            <div className="customerDashboard__spinner"></div>
            <p>Memuat dashboard...</p>
          </div>
        </section>
      );
    }

    if (error || !user) {
      return <Navigate to="/customer/login" replace />;
    }

    return (
      <section className="customerDashboard" aria-labelledby="dashboard-title">
        <div className="customerDashboard__container">
          {/* Header */}
          <div className="customerDashboard__header">
            <div>
              <h1 id="dashboard-title" className="customerDashboard__title">
                Dashboard Saya
              </h1>
              <p className="customerDashboard__subtitle">
                Selamat datang kembali, {user.fullName || user.username}!
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleLogout}
              className="customerDashboard__logoutBtn"
              aria-label="Keluar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Keluar</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="customerDashboard__stats">
            <LuxuryTooltip content="Total semua pesanan yang pernah Anda buat" position="top">
              <div className="customerDashboard__statCard">
                <div className="customerDashboard__statIcon customerDashboard__statIcon--orders">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="customerDashboard__statContent">
                  <p className="customerDashboard__statLabel">Total Pesanan</p>
                  <p className="customerDashboard__statValue">{stats.totalOrders}</p>
                </div>
              </div>
            </LuxuryTooltip>

            <LuxuryTooltip content="Pesanan yang sedang dalam proses" position="top">
              <div className="customerDashboard__statCard">
                <div className="customerDashboard__statIcon customerDashboard__statIcon--pending">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="customerDashboard__statContent">
                  <p className="customerDashboard__statLabel">Pesanan Pending</p>
                  <p className="customerDashboard__statValue">{stats.pendingOrders}</p>
                </div>
              </div>
            </LuxuryTooltip>

            <LuxuryTooltip content="Pesanan yang sudah selesai dan terkirim" position="top">
              <div className="customerDashboard__statCard">
                <div className="customerDashboard__statIcon customerDashboard__statIcon--completed">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="customerDashboard__statContent">
                  <p className="customerDashboard__statLabel">Pesanan Selesai</p>
                  <p className="customerDashboard__statValue">{stats.completedOrders}</p>
                </div>
              </div>
            </LuxuryTooltip>

            <LuxuryTooltip content="Bouquet yang Anda simpan sebagai favorit" position="top">
              <div className="customerDashboard__statCard">
                <div className="customerDashboard__statIcon customerDashboard__statIcon--favorites">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="customerDashboard__statContent">
                  <p className="customerDashboard__statLabel">Favorit</p>
                  <p className="customerDashboard__statValue">{stats.favoritesCount}</p>
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
              className={`customerDashboard__tab ${activeTab === "overview" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "overview" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Overview</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "orders"}
              className={`customerDashboard__tab ${activeTab === "orders" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "orders" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Pesanan</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "favorites"}
              className={`customerDashboard__tab ${activeTab === "favorites" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "favorites" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Favorit</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "profile"}
              className={`customerDashboard__tab ${activeTab === "profile" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "profile" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Profil</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "addresses"}
              className={`customerDashboard__tab ${activeTab === "addresses" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "addresses" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Alamat</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "settings"}
              className={`customerDashboard__tab ${activeTab === "settings" ? "customerDashboard__tab--active" : ""}`}
              onClick={() => this.setState({ activeTab: "settings" })}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                        </svg>
                      }
                    />
                  ) : (
                    <div className="customerDashboard__ordersList">
                      {recentOrders.map((order) => {
                        const statusBadge = this.getStatusBadge(order.orderStatus);
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
                              <span className="customerDashboard__orderDate">
                                {this.formatDate(order.createdAt)}
                              </span>
                              <span className="customerDashboard__orderPrice">
                                {formatIDR(order.totalAmount)}
                              </span>
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Jelajahi Katalog</span>
                    </Link>
                    <Link to="/favorites" className="customerDashboard__quickAction">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Favorit Saya</span>
                    </Link>
                    <Link to="/order-history" className="customerDashboard__quickAction">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Riwayat Pesanan</span>
                    </Link>
                    <Link to="/customer/profile" className="customerDashboard__quickAction">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                  <h2 className="customerDashboard__sectionTitle">Semua Pesanan</h2>
                  <p className="customerDashboard__sectionSubtitle">
                    Lihat dan kelola semua pesanan Anda
                  </p>
                  <Link to="/order-history" className="customerDashboard__viewAllLink">
                    Lihat Riwayat Lengkap →
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "favorites" && (
              <div className="customerDashboard__tabPanel" role="tabpanel">
                <div className="customerDashboard__section">
                  <h2 className="customerDashboard__sectionTitle">Bouquet Favorit</h2>
                  <p className="customerDashboard__sectionSubtitle">
                    Bouquet yang Anda simpan untuk nanti
                  </p>
                  <Link to="/favorites" className="customerDashboard__viewAllLink">
                    Lihat Semua Favorit →
                  </Link>
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
                      <span className="customerDashboard__profileValue">{user.username}</span>
                    </div>
                    <div className="customerDashboard__profileItem">
                      <span className="customerDashboard__profileLabel">Email</span>
                      <span className="customerDashboard__profileValue">{user.email}</span>
                    </div>
                    {user.fullName && (
                      <div className="customerDashboard__profileItem">
                        <span className="customerDashboard__profileLabel">Nama Lengkap</span>
                        <span className="customerDashboard__profileValue">{user.fullName}</span>
                      </div>
                    )}
                    {user.phoneNumber && (
                      <div className="customerDashboard__profileItem">
                        <span className="customerDashboard__profileLabel">Nomor Telepon</span>
                        <span className="customerDashboard__profileValue">{user.phoneNumber}</span>
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
                    <Link to="/customer/change-password" className="customerDashboard__settingItem" onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "/customer/change-password";
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Ubah Password</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <Link to="/customer/notifications" className="customerDashboard__settingItem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Notifikasi</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <Link to="/customer/privacy" className="customerDashboard__settingItem">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Privasi & Keamanan</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }
}

export default CustomerDashboardPage;

