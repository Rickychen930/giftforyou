/**
 * Customer Dashboard Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerDashboardPage.css";
import { formatIDR } from "../utils/money";
import EmptyState from "../components/common/EmptyState";
import StatCard from "../components/common/StatCard";
import TabNavigation from "../components/common/TabNavigation";
import LuxuryButton from "../components/buttons/LuxuryButton";
import {
  LogoutIcon,
  CheckIcon,
  ClockIcon,
  CheckCircleIcon,
  HeartIcon,
  GridIcon,
  UserIcon,
  LocationIcon,
  SettingsIcon,
  PackageIcon,
  FileTextIcon,
  LockIcon,
  ChevronRightIcon,
  BellIcon,
  ShieldIcon,
} from "../components/icons";
import type {
  DashboardUser,
  DashboardStats,
  RecentOrder,
  ActiveTab,
} from "../models/customer-dashboard-page-model";

interface CustomerDashboardPageViewProps {
  user: DashboardUser | null;
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  isLoading: boolean;
  error: string | null;
  activeTab: ActiveTab;
  formatDate: (dateString: string) => string;
  getStatusBadge: (status: string) => { text: string; className: string };
  onLogout: () => void;
  onTabChange: (tab: ActiveTab) => void;
}

/**
 * Customer Dashboard Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CustomerDashboardPageView extends Component<CustomerDashboardPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="customerDashboard customerDashboard--loading">
        <div className="customerDashboard__loading">
          <div className="customerDashboard__spinner"></div>
          <p>Memuat dashboard...</p>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      user,
      stats,
      recentOrders,
      isLoading,
      error,
      activeTab,
      formatDate,
      getStatusBadge,
      onLogout,
      onTabChange,
    } = this.props;

    if (isLoading) {
      return this.renderLoading();
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
          <LuxuryButton
            type="button"
            variant="outline"
            size="md"
            onClick={onLogout}
            className="customerDashboard__logoutBtn"
            icon={<LogoutIcon width={20} height={20} />}
            iconPosition="left"
          >
            Keluar
          </LuxuryButton>
        </div>

        {/* Stats Cards */}
        <div className="customerDashboard__stats">
          <StatCard
            icon={<CheckIcon width={24} height={24} />}
            label="Total Pesanan"
            value={stats.totalOrders}
            tooltip="Total semua pesanan yang pernah Anda buat"
            iconVariant="orders"
          />
          <StatCard
            icon={<ClockIcon width={24} height={24} />}
            label="Pesanan Pending"
            value={stats.pendingOrders}
            tooltip="Pesanan yang sedang dalam proses"
            iconVariant="pending"
          />
          <StatCard
            icon={<CheckCircleIcon width={24} height={24} />}
            label="Pesanan Selesai"
            value={stats.completedOrders}
            tooltip="Pesanan yang sudah selesai dan terkirim"
            iconVariant="completed"
          />
          <StatCard
            icon={<HeartIcon width={24} height={24} />}
            label="Favorit"
            value={stats.favoritesCount}
            tooltip="Bouquet yang Anda simpan sebagai favorit"
            iconVariant="favorites"
          />
        </div>

        {/* Navigation Tabs */}
        <TabNavigation
          tabs={[
            {
              key: "overview",
              label: "Overview",
              icon: <GridIcon width={18} height={18} />,
            },
            {
              key: "orders",
              label: "Pesanan",
              icon: <CheckIcon width={18} height={18} />,
            },
            {
              key: "favorites",
              label: "Favorit",
              icon: <HeartIcon width={18} height={18} />,
            },
            {
              key: "profile",
              label: "Profil",
              icon: <UserIcon width={18} height={18} />,
            },
            {
              key: "addresses",
              label: "Alamat",
              icon: <LocationIcon width={18} height={18} />,
            },
            {
              key: "settings",
              label: "Pengaturan",
              icon: <SettingsIcon width={18} height={18} />,
            },
          ]}
          activeTab={activeTab}
          onTabChange={(key) => onTabChange(key as ActiveTab)}
          className="customerDashboard__tabs"
        />

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
                    icon={<CheckIcon width={64} height={64} style={{ opacity: 0.3 }} />}
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
                            <span className="customerDashboard__orderDate">
                              {formatDate(order.createdAt)}
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
                    <PackageIcon width={24} height={24} />
                    <span>Jelajahi Katalog</span>
                  </Link>
                  <Link to="/favorites" className="customerDashboard__quickAction">
                    <HeartIcon width={24} height={24} />
                    <span>Favorit Saya</span>
                  </Link>
                  <Link to="/order-history" className="customerDashboard__quickAction">
                    <FileTextIcon width={24} height={24} />
                    <span>Riwayat Pesanan</span>
                  </Link>
                  <Link to="/customer/profile" className="customerDashboard__quickAction">
                    <UserIcon width={24} height={24} />
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
                <Link
                  to="/customer/profile"
                  className="luxuryBtn luxuryBtn--primary luxuryBtn--md customerDashboard__editBtn"
                >
                  <span className="luxuryBtn__content">Edit Profil</span>
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
                <Link
                  to="/customer/addresses"
                  className="luxuryBtn luxuryBtn--primary luxuryBtn--md customerDashboard__viewAllLink"
                >
                  <span className="luxuryBtn__content">Kelola Alamat →</span>
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
                    <LockIcon width={20} height={20} />
                    <span>Ubah Password</span>
                    <ChevronRightIcon width={16} height={16} />
                  </Link>
                  <Link to="/customer/notifications" className="customerDashboard__settingItem">
                    <BellIcon width={20} height={20} />
                    <span>Notifikasi</span>
                    <ChevronRightIcon width={16} height={16} />
                  </Link>
                  <Link to="/customer/privacy" className="customerDashboard__settingItem">
                    <ShieldIcon width={20} height={20} />
                    <span>Privasi & Keamanan</span>
                    <ChevronRightIcon width={16} height={16} />
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

export default CustomerDashboardPageView;
