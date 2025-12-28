import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerNotificationsPage.css";
import { setSeo } from "../utils/seo";
import { getAccessToken } from "../utils/auth-utils";

interface NotificationSettings {
  email: {
    orders: boolean;
    promotions: boolean;
    updates: boolean;
  };
  push: {
    orders: boolean;
    promotions: boolean;
    updates: boolean;
  };
  sms: {
    orders: boolean;
    promotions: boolean;
  };
}

interface NotificationsState {
  settings: NotificationSettings;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
}

class CustomerNotificationsPage extends Component<{}, NotificationsState> {
  state: NotificationsState = {
    settings: {
      email: {
        orders: true,
        promotions: true,
        updates: true,
      },
      push: {
        orders: true,
        promotions: false,
        updates: true,
      },
      sms: {
        orders: true,
        promotions: false,
      },
    },
    isLoading: true,
    isSaving: false,
    isAuthenticated: false,
    showSuccess: false,
  };

  componentDidMount(): void {
    setSeo({
      title: "Pengaturan Notifikasi | Giftforyou.idn",
      description: "Kelola preferensi notifikasi Anda.",
      path: "/customer/notifications",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true });
    this.loadSettings();
  }

  private loadSettings = (): void => {
    try {
      const saved = localStorage.getItem("notificationSettings");
      if (saved) {
        const settings = JSON.parse(saved) as NotificationSettings;
        this.setState({ settings, isLoading: false });
      } else {
        this.setState({ isLoading: false });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load notification settings:", error);
      }
      this.setState({ isLoading: false });
    }
  };

  private saveSettings = (): void => {
    try {
      localStorage.setItem("notificationSettings", JSON.stringify(this.state.settings));
      this.setState({ showSuccess: true });
      setTimeout(() => {
        this.setState({ showSuccess: false });
      }, 3000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save notification settings:", error);
      }
    }
  };

  private handleChange = (category: keyof NotificationSettings, type: string, value: boolean): void => {
    this.setState((prevState) => ({
      settings: {
        ...prevState.settings,
        [category]: {
          ...prevState.settings[category],
          [type]: value,
        },
      },
      showSuccess: false,
    }), () => {
      this.saveSettings();
    });
  };

  render(): React.ReactNode {
    const { settings, isLoading, isAuthenticated, showSuccess } = this.state;

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    if (isLoading) {
      return (
        <section className="customerNotifications customerNotifications--loading">
          <div className="customerNotifications__loading">
            <div className="customerNotifications__spinner"></div>
            <p>Memuat pengaturan...</p>
          </div>
        </section>
      );
    }

    return (
      <section className="customerNotifications" aria-labelledby="notifications-title">
        <div className="customerNotifications__container">
          <div className="customerNotifications__header">
            <Link to="/customer/dashboard" className="customerNotifications__back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Kembali ke Dashboard</span>
            </Link>
            <h1 id="notifications-title" className="customerNotifications__title">Pengaturan Notifikasi</h1>
            <p className="customerNotifications__subtitle">
              Kelola bagaimana Anda ingin menerima notifikasi
            </p>
          </div>

          {showSuccess && (
            <div className="customerNotifications__success" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          )}

          <div className="customerNotifications__card">
            <div className="customerNotifications__section">
              <h2 className="customerNotifications__sectionTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>Email</span>
              </h2>
              <div className="customerNotifications__options">
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.email.orders}
                    onChange={(e) => this.handleChange("email", "orders", e.target.checked)}
                  />
                  <span>Pembaruan Pesanan</span>
                </label>
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.email.promotions}
                    onChange={(e) => this.handleChange("email", "promotions", e.target.checked)}
                  />
                  <span>Promosi & Penawaran</span>
                </label>
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.email.updates}
                    onChange={(e) => this.handleChange("email", "updates", e.target.checked)}
                  />
                  <span>Pembaruan Produk</span>
                </label>
              </div>
            </div>

            <div className="customerNotifications__section">
              <h2 className="customerNotifications__sectionTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Push Notifications</span>
              </h2>
              <div className="customerNotifications__options">
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.push.orders}
                    onChange={(e) => this.handleChange("push", "orders", e.target.checked)}
                  />
                  <span>Pembaruan Pesanan</span>
                </label>
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.push.promotions}
                    onChange={(e) => this.handleChange("push", "promotions", e.target.checked)}
                  />
                  <span>Promosi & Penawaran</span>
                </label>
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.push.updates}
                    onChange={(e) => this.handleChange("push", "updates", e.target.checked)}
                  />
                  <span>Pembaruan Produk</span>
                </label>
              </div>
            </div>

            <div className="customerNotifications__section">
              <h2 className="customerNotifications__sectionTitle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>SMS</span>
              </h2>
              <div className="customerNotifications__options">
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.sms.orders}
                    onChange={(e) => this.handleChange("sms", "orders", e.target.checked)}
                  />
                  <span>Pembaruan Pesanan</span>
                </label>
                <label className="customerNotifications__option">
                  <input
                    type="checkbox"
                    checked={settings.sms.promotions}
                    onChange={(e) => this.handleChange("sms", "promotions", e.target.checked)}
                  />
                  <span>Promosi & Penawaran</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default CustomerNotificationsPage;

