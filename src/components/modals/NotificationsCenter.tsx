/**
 * Notifications Center Component (OOP)
 * Class-based component extending BaseModal
 */

import React, { Component } from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/NotificationsCenter.css";
import { API_BASE } from "../../config/api";
import { getAccessToken } from "../../utils/auth-utils";
import { formatIDR } from "../../utils/money";

interface Notification {
  id: string;
  type: "order" | "stock" | "payment" | "customer" | "system";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    orderId?: string;
    customerId?: string;
    bouquetId?: string;
    amount?: number;
  };
}

interface NotificationsCenterProps extends Omit<BaseModalProps, "title" | "children"> {
  onNotificationClick?: (notification: Notification) => void;
}

interface NotificationsCenterState extends BaseModalState {
  notifications: Notification[];
  loading: boolean;
  filter: "all" | "unread" | Notification["type"];
  intervalId: NodeJS.Timeout | null;
}

/**
 * Notifications Center Component
 * Class-based component extending BaseModal
 */
class NotificationsCenter extends BaseModal<NotificationsCenterProps, NotificationsCenterState> {
  protected baseClass: string = "notificationsCenter";

  constructor(props: NotificationsCenterProps) {
    super(props);
    this.state = {
      ...this.state,
      notifications: [],
      loading: false,
      filter: "all",
      intervalId: null,
    };
  }

  componentDidUpdate(prevProps: NotificationsCenterProps): void {
    super.componentDidUpdate(prevProps);
    if (this.props.isOpen && !prevProps.isOpen) {
      this.loadNotifications();
      const intervalId = setInterval(this.loadNotifications, 30000);
      this.setState({ intervalId });
    } else if (!this.props.isOpen && prevProps.isOpen) {
      if (this.state.intervalId) {
        clearInterval(this.state.intervalId);
        this.setState({ intervalId: null });
      }
    }
  }

  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.state.intervalId) {
      clearInterval(this.state.intervalId);
    }
  }

  private loadNotifications = async (): Promise<void> => {
    this.setState({ loading: true });
    try {
      const token = getAccessToken();
      if (!token) return;

      const notifs: Notification[] = [];

      // Load orders for order notifications
      const ordersRes = await fetch(`${API_BASE}/api/orders?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const now = Date.now();
        const oneHourAgo = now - 60 * 60 * 1000;

        // New orders in last hour
        const recentOrders = Array.isArray(orders)
          ? orders.filter((o: any) => {
              const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
              return created > oneHourAgo;
            })
          : [];

        recentOrders.forEach((order: any) => {
          notifs.push({
            id: `order-${order._id}`,
            type: "order",
            severity: "info",
            title: "Order Baru",
            message: `${order.buyerName} memesan ${order.bouquetName}`,
            timestamp: order.createdAt ? new Date(order.createdAt).getTime() : Date.now(),
            read: false,
            actionUrl: `/dashboard?tab=orders&orderId=${order._id}`,
            metadata: {
              orderId: order._id,
              amount: order.totalAmount,
            },
          });
        });

        // Unpaid orders
        const unpaidOrders = Array.isArray(orders)
          ? orders.filter((o: any) => o.paymentStatus === "belum_bayar")
          : [];

        if (unpaidOrders.length > 0) {
          notifs.push({
            id: "unpaid-orders",
            type: "payment",
            severity: unpaidOrders.length > 10 ? "critical" : "warning",
            title: "Pesanan Belum Bayar",
            message: `${unpaidOrders.length} pesanan belum dibayar`,
            timestamp: Date.now(),
            read: false,
            actionUrl: `/dashboard?tab=orders&filter=unpaid`,
          });
        }

        // Overdue orders
        const overdueOrders = Array.isArray(orders)
          ? orders.filter((o: any) => {
              if (o.orderStatus === "terkirim") return false;
              const deliveryDate = o.deliveryAt ? new Date(o.deliveryAt).getTime() : 0;
              return deliveryDate > 0 && deliveryDate < Date.now();
            })
          : [];

        if (overdueOrders.length > 0) {
          notifs.push({
            id: "overdue-orders",
            type: "order",
            severity: "critical",
            title: "Pesanan Terlambat",
            message: `${overdueOrders.length} pesanan melewati tanggal pengiriman`,
            timestamp: Date.now(),
            read: false,
            actionUrl: `/dashboard?tab=orders&filter=overdue`,
          });
        }
      }

      // Load bouquets for stock notifications
      const bouquetsRes = await fetch(`${API_BASE}/api/bouquets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (bouquetsRes.ok) {
        const bouquets = await bouquetsRes.json();
        const lowStock = Array.isArray(bouquets)
          ? bouquets.filter((b: any) => {
              const qty = typeof b.quantity === "number" ? b.quantity : 0;
              return b.status === "ready" && qty < 5 && qty > 0;
            })
          : [];

        if (lowStock.length > 0) {
          notifs.push({
            id: "low-stock",
            type: "stock",
            severity: lowStock.length > 10 ? "critical" : "warning",
            title: "Stok Menipis",
            message: `${lowStock.length} bouquet stok menipis (< 5 unit)`,
            timestamp: Date.now(),
            read: false,
            actionUrl: `/dashboard?tab=edit`,
          });
        }

        const outOfStock = Array.isArray(bouquets)
          ? bouquets.filter((b: any) => {
              const qty = typeof b.quantity === "number" ? b.quantity : 0;
              return b.status === "ready" && qty === 0;
            })
          : [];

        if (outOfStock.length > 0) {
          notifs.push({
            id: "out-of-stock",
            type: "stock",
            severity: "critical",
            title: "Stok Habis",
            message: `${outOfStock.length} bouquet stok habis`,
            timestamp: Date.now(),
            read: false,
            actionUrl: `/dashboard?tab=edit`,
          });
        }
      }

      // Sort by timestamp (newest first)
      notifs.sort((a, b) => b.timestamp - a.timestamp);

      this.setState({ notifications: notifs, loading: false });
    } catch (error) {
      console.error("Failed to load notifications:", error);
      this.setState({ loading: false });
    }
  };

  private handleNotificationClick = (notification: Notification): void => {
    const { onNotificationClick } = this.props;
    const { notifications } = this.state;

    if (!notification.read) {
      this.setState({
        notifications: notifications.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n
        ),
      });
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }

    this.handleClose();
  };

  private handleFilterChange = (filter: "all" | "unread" | Notification["type"]): void => {
    this.setState({ filter });
  };

  private markAllAsRead = (): void => {
    this.setState({
      notifications: this.state.notifications.map((n) => ({ ...n, read: true })),
    });
  };

  private getFilteredNotifications(): Notification[] {
    const { notifications, filter } = this.state;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }

  private getUnreadCount(): number {
    return this.state.notifications.filter((n) => !n.read).length;
  }

  private renderNotificationIcon(type: Notification["type"]): React.ReactNode {
    const iconProps = {
      width: "20",
      height: "20",
      viewBox: "0 0 24 24",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
    };

    switch (type) {
      case "order":
        return (
          <svg {...iconProps}>
            <path
              d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM22 11l-4-4m0 0l-4 4m4-4v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "stock":
        return (
          <svg {...iconProps}>
            <path
              d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "payment":
        return (
          <svg {...iconProps}>
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
            <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case "customer":
        return (
          <svg {...iconProps}>
            <path
              d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "system":
        return (
          <svg {...iconProps}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return null;
    }
  }

  private renderNotification(notification: Notification): React.ReactNode {
    return (
      <div
        key={notification.id}
        className={`${this.baseClass}__item ${!notification.read ? "is-unread" : ""} ${this.baseClass}__item--${notification.severity}`}
        onClick={() => this.handleNotificationClick(notification)}
      >
        <div className={`${this.baseClass}__itemIcon`}>
          {this.renderNotificationIcon(notification.type)}
        </div>
        <div className={`${this.baseClass}__itemContent`}>
          <div className={`${this.baseClass}__itemHeader`}>
            <h3 className={`${this.baseClass}__itemTitle`}>{notification.title}</h3>
            {!notification.read && <span className={`${this.baseClass}__itemUnread`} />}
          </div>
          <p className={`${this.baseClass}__itemMessage`}>{notification.message}</p>
          {notification.metadata?.amount && (
            <p className={`${this.baseClass}__itemMeta`}>
              {formatIDR(notification.metadata.amount)}
            </p>
          )}
          <span className={`${this.baseClass}__itemTime`}>
            {new Date(notification.timestamp).toLocaleString("id-ID", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    );
  }

  protected renderHeader(): React.ReactNode {
    const unreadCount = this.getUnreadCount();

    return (
      <div className={`${this.baseClass}__header`}>
        <h2 id="notifications-title" className={`${this.baseClass}__title`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Notifications
          {unreadCount > 0 && <span className={`${this.baseClass}__badge`}>{unreadCount}</span>}
        </h2>
        <div className={`${this.baseClass}__headerActions`}>
          {unreadCount > 0 && (
            <button
              type="button"
              className={`${this.baseClass}__markAllRead`}
              onClick={this.markAllAsRead}
              title="Tandai semua sudah dibaca"
            >
              Tandai Semua Dibaca
            </button>
          )}
          <button
            type="button"
            className={`${this.baseClass}__close`}
            onClick={this.handleClose}
            aria-label="Tutup notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  protected renderBody(): React.ReactNode {
    const { loading, filter, notifications } = this.state;
    const filteredNotifications = this.getFilteredNotifications();

    return (
      <>
        <div className={`${this.baseClass}__filters`}>
          <button
            type="button"
            className={`${this.baseClass}__filter ${filter === "all" ? "is-active" : ""}`}
            onClick={() => this.handleFilterChange("all")}
          >
            Semua
          </button>
          <button
            type="button"
            className={`${this.baseClass}__filter ${filter === "unread" ? "is-active" : ""}`}
            onClick={() => this.handleFilterChange("unread")}
          >
            Belum Dibaca ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            type="button"
            className={`${this.baseClass}__filter ${filter === "order" ? "is-active" : ""}`}
            onClick={() => this.handleFilterChange("order")}
          >
            Orders
          </button>
          <button
            type="button"
            className={`${this.baseClass}__filter ${filter === "stock" ? "is-active" : ""}`}
            onClick={() => this.handleFilterChange("stock")}
          >
            Stock
          </button>
          <button
            type="button"
            className={`${this.baseClass}__filter ${filter === "payment" ? "is-active" : ""}`}
            onClick={() => this.handleFilterChange("payment")}
          >
            Payment
          </button>
        </div>

        <div className={`${this.baseClass}__body`}>
          {loading ? (
            <div className={`${this.baseClass}__loading`}>
              <div className={`${this.baseClass}__spinner`} />
              <p>Memuat notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className={`${this.baseClass}__empty`}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path
                  d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>Tidak ada notifications</p>
            </div>
          ) : (
            <div className={`${this.baseClass}__list`}>
              {filteredNotifications.map((notification) => this.renderNotification(notification))}
            </div>
          )}
        </div>
      </>
    );
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer needed
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isVisible } = this.state;

    if (!isOpen && !isVisible) return null;

    return (
      <div className={this.baseClass} onClick={this.handleOverlayClick}>
        <div className={`${this.baseClass}__overlay`} />
        <div
          className={`${this.baseClass}__panel`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="notifications-title"
          aria-modal="true"
        >
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </div>
    );
  }
}

export default NotificationsCenter;

