/**
 * Customer Notifications Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "../styles/CustomerNotificationsPage.css";
import type { NotificationSettings } from "../models/customer-notifications-page-model";
import BackLink from "../components/common/BackLink";
import AlertMessage from "../components/common/AlertMessage";

interface CustomerNotificationsPageViewProps {
  settings: NotificationSettings;
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showSuccess: boolean;
  onSettingChange: (category: keyof NotificationSettings, type: string, value: boolean) => void;
}

/**
 * Customer Notifications Page View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CustomerNotificationsPageView extends Component<CustomerNotificationsPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="customerNotifications customerNotifications--loading">
        <div className="customerNotifications__loading">
          <div className="customerNotifications__spinner"></div>
          <p>Memuat pengaturan...</p>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const { settings, isLoading, isAuthenticated, showSuccess, onSettingChange } = this.props;

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    if (isLoading) {
      return this.renderLoading();
    }

    return (
    <section className="customerNotifications" aria-labelledby="notifications-title">
      <div className="customerNotifications__container">
        <div className="customerNotifications__header">
          <BackLink to="/customer/dashboard" className="customerNotifications__back">
            Kembali ke Dashboard
          </BackLink>
          <h1 id="notifications-title" className="customerNotifications__title">Pengaturan Notifikasi</h1>
          <p className="customerNotifications__subtitle">
            Kelola bagaimana Anda ingin menerima notifikasi
          </p>
        </div>

        {showSuccess && (
          <AlertMessage
            variant="success"
            message="Pengaturan berhasil disimpan!"
            className="customerNotifications__success"
          />
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
                  id="notifications-email-orders"
                  name="email.orders"
                  checked={settings.email.orders}
                  onChange={(e) => onSettingChange("email", "orders", e.target.checked)}
                />
                <span>Pembaruan Pesanan</span>
              </label>
              <label className="customerNotifications__option">
                <input
                  type="checkbox"
                  id="notifications-email-promotions"
                  name="email.promotions"
                  checked={settings.email.promotions}
                  onChange={(e) => onSettingChange("email", "promotions", e.target.checked)}
                />
                <span>Promosi & Penawaran</span>
              </label>
              <label className="customerNotifications__option">
                <input
                  type="checkbox"
                  id="notifications-email-updates"
                  name="email.updates"
                  checked={settings.email.updates}
                  onChange={(e) => onSettingChange("email", "updates", e.target.checked)}
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
                  id="notifications-push-orders"
                  name="push.orders"
                  checked={settings.push.orders}
                  onChange={(e) => onSettingChange("push", "orders", e.target.checked)}
                />
                <span>Pembaruan Pesanan</span>
              </label>
              <label className="customerNotifications__option">
                <input
                  type="checkbox"
                  id="notifications-push-promotions"
                  name="push.promotions"
                  checked={settings.push.promotions}
                  onChange={(e) => onSettingChange("push", "promotions", e.target.checked)}
                />
                <span>Promosi & Penawaran</span>
              </label>
              <label className="customerNotifications__option">
                <input
                  type="checkbox"
                  id="notifications-push-updates"
                  name="push.updates"
                  checked={settings.push.updates}
                  onChange={(e) => onSettingChange("push", "updates", e.target.checked)}
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
                  id="notifications-sms-orders"
                  name="sms.orders"
                  checked={settings.sms.orders}
                  onChange={(e) => onSettingChange("sms", "orders", e.target.checked)}
                />
                <span>Pembaruan Pesanan</span>
              </label>
              <label className="customerNotifications__option">
                <input
                  type="checkbox"
                  id="notifications-sms-promotions"
                  name="sms.promotions"
                  checked={settings.sms.promotions}
                  onChange={(e) => onSettingChange("sms", "promotions", e.target.checked)}
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

export default CustomerNotificationsPageView;
