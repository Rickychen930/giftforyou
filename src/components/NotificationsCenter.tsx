import React, { useEffect, useState, useCallback } from "react";
import "../styles/NotificationsCenter.css";
import { API_BASE } from "../config/api";
import { getAccessToken } from "../utils/auth-utils";
import { formatIDR } from "../utils/money";

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

interface NotificationsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick?: (notification: Notification) => void;
}

const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  isOpen,
  onClose,
  onNotificationClick,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | Notification["type"]>("all");

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      // Load orders for order notifications
      const ordersRes = await fetch(`${API_BASE}/api/orders?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const notifs: Notification[] = [];

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

      setNotifications(notifs);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      // Refresh every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, loadNotifications]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
    onClose();
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "all") return true;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="notificationsCenter" onClick={onClose}>
      <div className="notificationsCenter__overlay"></div>
      <div
        className="notificationsCenter__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="notifications-title"
        aria-modal="true"
      >
        <div className="notificationsCenter__header">
          <h2 id="notifications-title" className="notificationsCenter__title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Notifications
            {unreadCount > 0 && (
              <span className="notificationsCenter__badge">{unreadCount}</span>
            )}
          </h2>
          <div className="notificationsCenter__headerActions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notificationsCenter__markAllRead"
                onClick={markAllAsRead}
                title="Tandai semua sudah dibaca"
              >
                Tandai Semua Dibaca
              </button>
            )}
            <button
              type="button"
              className="notificationsCenter__close"
              onClick={onClose}
              aria-label="Tutup notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="notificationsCenter__filters">
          <button
            type="button"
            className={`notificationsCenter__filter ${filter === "all" ? "is-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Semua
          </button>
          <button
            type="button"
            className={`notificationsCenter__filter ${filter === "unread" ? "is-active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Belum Dibaca ({notifications.filter((n) => !n.read).length})
          </button>
          <button
            type="button"
            className={`notificationsCenter__filter ${filter === "order" ? "is-active" : ""}`}
            onClick={() => setFilter("order")}
          >
            Orders
          </button>
          <button
            type="button"
            className={`notificationsCenter__filter ${filter === "stock" ? "is-active" : ""}`}
            onClick={() => setFilter("stock")}
          >
            Stock
          </button>
          <button
            type="button"
            className={`notificationsCenter__filter ${filter === "payment" ? "is-active" : ""}`}
            onClick={() => setFilter("payment")}
          >
            Payment
          </button>
        </div>

        <div className="notificationsCenter__body">
          {loading ? (
            <div className="notificationsCenter__loading">
              <div className="notificationsCenter__spinner"></div>
              <p>Memuat notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="notificationsCenter__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Tidak ada notifications</p>
            </div>
          ) : (
            <div className="notificationsCenter__list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notificationsCenter__item ${!notification.read ? "is-unread" : ""} notificationsCenter__item--${notification.severity}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notificationsCenter__itemIcon">
                    {notification.type === "order" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM22 11l-4-4m0 0l-4 4m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {notification.type === "stock" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {notification.type === "payment" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                    {notification.type === "customer" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {notification.type === "system" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </div>
                  <div className="notificationsCenter__itemContent">
                    <div className="notificationsCenter__itemHeader">
                      <h3 className="notificationsCenter__itemTitle">{notification.title}</h3>
                      {!notification.read && (
                        <span className="notificationsCenter__itemUnread"></span>
                      )}
                    </div>
                    <p className="notificationsCenter__itemMessage">{notification.message}</p>
                    {notification.metadata?.amount && (
                      <p className="notificationsCenter__itemMeta">
                        {formatIDR(notification.metadata.amount)}
                      </p>
                    )}
                    <span className="notificationsCenter__itemTime">
                      {new Date(notification.timestamp).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;

