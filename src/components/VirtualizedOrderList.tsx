/**
 * Virtualized Order List Component with React Window
 * Luxury, Elegant, High-Performance Order List
 * Implements infinite scroll, virtualization, and optimal caching
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from "react";
import { List, useListRef } from "react-window";
import { Link } from "react-router-dom";
import { formatIDR } from "../utils/money";
import type { CustomerOrder } from "../services/customer.service";
import "../styles/VirtualizedOrderList.css";

/**
 * Custom hook for Intersection Observer
 * Optimized for infinite scroll
 */
function useInView(options: { threshold?: number; rootMargin?: string } = {}) {
  const { threshold = 0, rootMargin = "200px" } = options;
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return { ref, inView };
}

interface VirtualizedOrderListProps {
  orders: CustomerOrder[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  itemHeight?: number;
  containerHeight?: number;
}

const getStatusBadge = (status: string): { text: string; className: string } => {
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

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!Number.isFinite(date.getTime())) return dateString;
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
 * Load More Trigger Component
 */
const LoadMoreTrigger: React.FC<{
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}> = memo(({ hasNextPage, fetchNextPage, isFetchingNextPage }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px",
  });

  useEffect(() => {
    if (inView && hasNextPage && fetchNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  if (!hasNextPage) return null;

  return (
    <div ref={ref} className="virtualizedOrderList__loadMore">
      {isFetchingNextPage && (
        <div className="virtualizedOrderList__spinner" aria-label="Loading more orders">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
      )}
    </div>
  );
});

LoadMoreTrigger.displayName = "LoadMoreTrigger";

/**
 * Main Virtualized Order List Component
 */
const VirtualizedOrderList: React.FC<VirtualizedOrderListProps> = ({
  orders,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  itemHeight = 140,
  containerHeight = 600,
}) => {
  const listRef = useListRef();

  // Validate and normalize orders
  const safeOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order): order is CustomerOrder => 
      order != null && 
      typeof order === "object" && 
      order._id != null
    );
  }, [orders]);

  // Calculate container height dynamically
  const calculatedHeight = useMemo(() => {
    if (typeof window === "undefined") return containerHeight;
    try {
      const windowHeight = window.innerHeight;
      const headerHeight = 200;
      const filtersHeight = 120;
      const padding = 100;
      const calculated = windowHeight - headerHeight - filtersHeight - padding;
      return Math.max(400, Math.min(calculated, containerHeight));
    } catch {
      return containerHeight;
    }
  }, [containerHeight]);

  // Container width is handled by react-window automatically

  // Handle item click
  const handleItemClick = useCallback((orderId: string) => {
    // Navigation is handled by Link component
    if (process.env.NODE_ENV === "development") {
      console.log("[VirtualizedOrderList] Order clicked:", orderId);
    }
  }, []);

  // Memoized item data for react-window
  // CRITICAL: Always return a valid object, never null/undefined
  // react-window's List uses Object.values() internally on itemData
  const itemData = useMemo(() => {
    // Ensure all values are valid before creating the object
    const validOrders = Array.isArray(safeOrders) ? safeOrders : [];
    
    return {
      orders: validOrders,
      onItemClick: handleItemClick || (() => {}),
    };
  }, [safeOrders, handleItemClick]);

  // Row component with proper typing
  const RowComponent = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const { orders, onItemClick } = itemData;
    
    // Edge case: index bounds checking
    if (!Array.isArray(orders) || index < 0 || index >= orders.length) {
      return <div style={style} />;
    }
    
    const order = orders[index];

    // Validate order data
    if (!order || typeof order !== "object" || !order._id) {
      return <div style={style} />;
    }

    const statusBadge = getStatusBadge(order.orderStatus || "");
    const orderId = String(order._id);
    const bouquetName = typeof order.bouquetName === "string" ? order.bouquetName : "Bouquet";
    const totalAmount = typeof order.totalAmount === "number" && Number.isFinite(order.totalAmount)
      ? order.totalAmount
      : 0;
    const createdAt = typeof order.createdAt === "string" ? order.createdAt : "";
    const paymentStatus = order.paymentStatus;

    return (
      <div style={style}>
        <Link
          to={`/customer/orders/${orderId}`}
          className="virtualizedOrderList__item"
          onClick={(e) => {
            e.preventDefault();
            onItemClick(orderId);
          }}
        >
          <div className="virtualizedOrderList__itemHeader">
            <h3 className="virtualizedOrderList__itemTitle" title={bouquetName}>
              {bouquetName}
            </h3>
            <span className={`virtualizedOrderList__status ${statusBadge.className}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="virtualizedOrderList__itemDetails">
            <div className="virtualizedOrderList__itemDetailRow">
              <span className="virtualizedOrderList__itemDate">{formatDate(createdAt)}</span>
              {paymentStatus && (
                <span className={`virtualizedOrderList__paymentStatus virtualizedOrderList__paymentStatus--${paymentStatus}`}>
                  {paymentStatus === "sudah_bayar" ? "Lunas" : paymentStatus === "dp" ? "DP" : "Belum Bayar"}
                </span>
              )}
            </div>
            <div className="virtualizedOrderList__itemDetailRow">
              <span className="virtualizedOrderList__itemPrice">{formatIDR(totalAmount)}</span>
              <span className="virtualizedOrderList__itemId" title={orderId}>
                #{orderId.length > 8 ? orderId.slice(-8) : orderId}
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  }, [itemData]);

  // Item click is handled by Link component

  // Loading state
  if (isLoading && safeOrders.length === 0) {
    return (
      <div className="virtualizedOrderList virtualizedOrderList--loading">
        <div className="virtualizedOrderList__spinner" aria-label="Loading orders">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <p>Memuat pesanan...</p>
      </div>
    );
  }

  // Empty state
  if (safeOrders.length === 0 && !isLoading) {
    return (
      <div className="virtualizedOrderList virtualizedOrderList--empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
        <h3>Belum Ada Pesanan</h3>
        <p>Mulai jelajahi koleksi bouquet kami dan buat pesanan pertama Anda</p>
        <Link to="/collection" className="virtualizedOrderList__cta btn-luxury">
          Jelajahi Katalog
        </Link>
      </div>
    );
  }

  // Use virtualization for 10+ items, regular list for fewer
  const shouldVirtualize = safeOrders.length > 10;

  // CRITICAL: Final validation before rendering List
  // Ensure itemData is always a valid object (never null/undefined)
  const finalItemData = (() => {
    if (!itemData || typeof itemData !== "object") {
      console.error("[VirtualizedOrderList] itemData is invalid:", itemData);
      return { orders: [], onItemClick: () => {} };
    }
    if (!Array.isArray(itemData.orders)) {
      console.error("[VirtualizedOrderList] itemData.orders is not an array:", itemData);
      return { orders: [], onItemClick: itemData.onItemClick || (() => {}) };
    }
    return itemData;
  })();

  return (
    <div className="virtualizedOrderList">
      {shouldVirtualize ? (
        <div className="virtualizedOrderList__virtualized" style={{ height: calculatedHeight }}>
          <List
            {...({
              listRef: listRef,
              height: calculatedHeight,
              itemCount: safeOrders.length,
              itemSize: itemHeight,
              width: "100%",
              itemData: finalItemData, // Always a valid object - never null/undefined
              overscanCount: 5,
              className: "virtualizedOrderList__list",
              rowComponent: RowComponent,
            } as any)}
          />
        </div>
      ) : (
        <div className="virtualizedOrderList__regularList">
          {safeOrders.map((order, idx) => {
            // Additional validation for regular list
            if (!order || typeof order !== "object" || !order._id) {
              return null;
            }
            
            const statusBadge = getStatusBadge(order.orderStatus || "");
            const orderId = String(order._id);
            const bouquetName = typeof order.bouquetName === "string" ? order.bouquetName : "Bouquet";
            const totalAmount = typeof order.totalAmount === "number" && Number.isFinite(order.totalAmount)
              ? order.totalAmount
              : 0;
            const createdAt = typeof order.createdAt === "string" ? order.createdAt : "";
            const paymentStatus = order.paymentStatus;
            
            return (
              <Link
                key={`${orderId}-${idx}`}
                to={`/customer/orders/${orderId}`}
                className="virtualizedOrderList__item"
              >
                <div className="virtualizedOrderList__itemHeader">
                  <h3 className="virtualizedOrderList__itemTitle" title={bouquetName}>
                    {bouquetName}
                  </h3>
                  <span className={`virtualizedOrderList__status ${statusBadge.className}`}>
                    {statusBadge.text}
                  </span>
                </div>
                <div className="virtualizedOrderList__itemDetails">
                  <div className="virtualizedOrderList__itemDetailRow">
                    <span className="virtualizedOrderList__itemDate">{formatDate(createdAt)}</span>
                    {paymentStatus && (
                      <span className={`virtualizedOrderList__paymentStatus virtualizedOrderList__paymentStatus--${paymentStatus}`}>
                        {paymentStatus === "sudah_bayar" ? "Lunas" : paymentStatus === "dp" ? "DP" : "Belum Bayar"}
                      </span>
                    )}
                  </div>
                  <div className="virtualizedOrderList__itemDetailRow">
                    <span className="virtualizedOrderList__itemPrice">{formatIDR(totalAmount)}</span>
                    <span className="virtualizedOrderList__itemId" title={orderId}>
                      #{orderId.length > 8 ? orderId.slice(-8) : orderId}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      <LoadMoreTrigger
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </div>
  );
};

export default memo(VirtualizedOrderList);
