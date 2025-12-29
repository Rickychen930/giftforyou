import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../styles/AnalyticsDashboard.css";
import { API_BASE } from "../config/api";
import { getAccessToken } from "../utils/auth-utils";
import { formatIDR } from "../utils/money";

interface AnalyticsData {
  revenueTrends: Array<{ date: string; revenue: number; orders: number }>;
  customerGrowth: Array<{ date: string; count: number }>;
  orderStatusBreakdown: {
    bertanya: number;
    memesan: number;
    sedang_diproses: number;
    menunggu_driver: number;
    pengantaran: number;
    terkirim: number;
  };
  paymentBreakdown: {
    belum_bayar: number;
    dp: number;
    sudah_bayar: number;
  };
  topBouquets: Array<{ bouquetId: string; bouquetName: string; revenue: number; orders: number }>;
}

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  period?: "7d" | "30d" | "90d" | "1y";
  inline?: boolean; // If true, render as inline content instead of modal
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  isOpen,
  onClose,
  period = "30d",
  inline = false,
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">(period);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const days = selectedPeriod === "7d" ? 7 : selectedPeriod === "30d" ? 30 : selectedPeriod === "90d" ? 90 : 365;
      
      // Fetch orders
      const ordersRes = await fetch(`${API_BASE}/api/orders?limit=10000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!ordersRes.ok) return;

      const orders = await ordersRes.json();
      if (!Array.isArray(orders)) return;

      const now = Date.now();
      const cutoff = now - days * 24 * 60 * 60 * 1000;

      // Filter orders by date
      const recentOrders = orders.filter((o: any) => {
        const created = o.createdAt ? new Date(o.createdAt).getTime() : 0;
        return created >= cutoff;
      });

      // Group by date for revenue trends
      const revenueByDate = new Map<string, { revenue: number; orders: number }>();
      const customerByDate = new Map<string, Set<string>>();

      recentOrders.forEach((order: any) => {
        const date = order.createdAt
          ? new Date(order.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        
        const revenue = typeof order.totalAmount === "number" ? order.totalAmount : 0;
        const existing = revenueByDate.get(date) || { revenue: 0, orders: 0 };
        revenueByDate.set(date, {
          revenue: existing.revenue + revenue,
          orders: existing.orders + 1,
        });

        // Track unique customers
        const customerId = order.customerId || order.phoneNumber || "guest";
        if (!customerByDate.has(date)) {
          customerByDate.set(date, new Set());
        }
        customerByDate.get(date)?.add(customerId);
      });

      // Convert to arrays and sort
      const revenueTrends = Array.from(revenueByDate.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const customerGrowth = Array.from(customerByDate.entries())
        .map(([date, customers]) => ({ date, count: customers.size }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate order status breakdown
      const orderStatusBreakdown = {
        bertanya: 0,
        memesan: 0,
        sedang_diproses: 0,
        menunggu_driver: 0,
        pengantaran: 0,
        terkirim: 0,
      };

      const paymentBreakdown = {
        belum_bayar: 0,
        dp: 0,
        sudah_bayar: 0,
      };

      const bouquetRevenue = new Map<string, { bouquetName: string; revenue: number; orders: number }>();

      recentOrders.forEach((order: any) => {
        const status = order.orderStatus || "bertanya";
        if (status in orderStatusBreakdown) {
          orderStatusBreakdown[status as keyof typeof orderStatusBreakdown]++;
        }

        const paymentStatus = order.paymentStatus || "belum_bayar";
        if (paymentStatus in paymentBreakdown) {
          paymentBreakdown[paymentStatus as keyof typeof paymentBreakdown]++;
        }

        const bouquetId = order.bouquetId || "";
        const bouquetName = order.bouquetName || "Unknown";
        const revenue = typeof order.totalAmount === "number" ? order.totalAmount : 0;
        
        if (bouquetId) {
          const existing = bouquetRevenue.get(bouquetId) || { bouquetName, revenue: 0, orders: 0 };
          bouquetRevenue.set(bouquetId, {
            bouquetName: existing.bouquetName || bouquetName,
            revenue: existing.revenue + revenue,
            orders: existing.orders + 1,
          });
        }
      });

      const topBouquets = Array.from(bouquetRevenue.entries())
        .map(([bouquetId, data]) => ({ bouquetId, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      setData({
        revenueTrends,
        customerGrowth,
        orderStatusBreakdown,
        paymentBreakdown,
        topBouquets,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen, loadAnalytics]);

  const revenueChart = useMemo(() => {
    if (!data || data.revenueTrends.length === 0) return null;

    const maxRevenue = Math.max(...data.revenueTrends.map((d) => d.revenue), 1);
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const points = data.revenueTrends.map((d, i) => {
      const x = padding.left + (i / (data.revenueTrends.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - (d.revenue / maxRevenue) * chartHeight;
      return { x, y, ...d };
    });

    const pathData = points
      .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
      .join(" ");

    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

    return (
      <svg width={width} height={height} className="analyticsChart">
        <defs>
          <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(212, 140, 156, 0.3)" />
            <stop offset="100%" stopColor="rgba(212, 140, 156, 0.05)" />
          </linearGradient>
        </defs>
        <g>
          <path d={areaPath} fill="url(#revenueGradient)" />
          <path d={pathData} fill="none" stroke="var(--brand-rose-600)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="var(--brand-rose-600)" />
              {i % Math.ceil(points.length / 5) === 0 && (
                <text x={p.x} y={height - 10} textAnchor="middle" className="analyticsChart__label">
                  {new Date(p.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>
    );
  }, [data]);

  const orderChart = useMemo(() => {
    if (!data || data.revenueTrends.length === 0) return null;

    const maxOrders = Math.max(...data.revenueTrends.map((d) => d.orders), 1);
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    const barWidth = chartWidth / data.revenueTrends.length - 2;

    return (
      <svg width={width} height={height} className="analyticsChart">
        {data.revenueTrends.map((d, i) => {
          const x = padding.left + i * (chartWidth / data.revenueTrends.length);
          const barHeight = (d.orders / maxOrders) * chartHeight;
          const y = padding.top + chartHeight - barHeight;
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="var(--brand-sage-600)"
                rx="4"
                className="analyticsChart__bar"
              />
              {i % Math.ceil(data.revenueTrends.length / 5) === 0 && (
                <text x={x + barWidth / 2} y={height - 10} textAnchor="middle" className="analyticsChart__label">
                  {new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [data]);

  if (!isOpen) return null;

  // Inline mode: render as regular content without modal overlay
  if (inline) {
    return (
      <div className="analyticsDashboard analyticsDashboard--inline">
        <div
          className="analyticsDashboard__panel"
          role="region"
          aria-labelledby="analytics-title"
        >
          <div className="analyticsDashboard__header">
          <h2 id="analytics-title" className="analyticsDashboard__title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Advanced Analytics
          </h2>
          <div className="analyticsDashboard__headerActions">
            <div className="analyticsDashboard__periodSelector">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`analyticsDashboard__periodBtn ${selectedPeriod === p ? "is-active" : ""}`}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p === "7d" ? "7 Hari" : p === "30d" ? "30 Hari" : p === "90d" ? "90 Hari" : "1 Tahun"}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="analyticsDashboard__close"
              onClick={onClose}
              aria-label="Tutup analytics dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="analyticsDashboard__body">
          {loading ? (
            <div className="analyticsDashboard__loading">
              <div className="analyticsDashboard__spinner"></div>
              <p>Memuat analytics...</p>
            </div>
          ) : !data ? (
            <div className="analyticsDashboard__empty">
              <p>Tidak ada data analytics</p>
            </div>
          ) : (
            <>
              {/* Revenue Trends */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Revenue Trends</h3>
                <div className="analyticsCard__content">
                  {revenueChart}
                  <div className="analyticsCard__stats">
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Total Revenue</span>
                      <span className="analyticsCard__statValue">
                        {formatIDR(data.revenueTrends.reduce((sum, d) => sum + d.revenue, 0))}
                      </span>
                    </div>
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Average Daily</span>
                      <span className="analyticsCard__statValue">
                        {formatIDR(
                          data.revenueTrends.length > 0
                            ? data.revenueTrends.reduce((sum, d) => sum + d.revenue, 0) / data.revenueTrends.length
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Trends */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Order Trends</h3>
                <div className="analyticsCard__content">
                  {orderChart}
                  <div className="analyticsCard__stats">
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Total Orders</span>
                      <span className="analyticsCard__statValue">
                        {data.revenueTrends.reduce((sum, d) => sum + d.orders, 0)}
                      </span>
                    </div>
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Average Daily</span>
                      <span className="analyticsCard__statValue">
                        {data.revenueTrends.length > 0
                          ? Math.round(
                              data.revenueTrends.reduce((sum, d) => sum + d.orders, 0) / data.revenueTrends.length
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Order Status Breakdown</h3>
                <div className="analyticsCard__content">
                  <div className="analyticsBreakdown">
                    {Object.entries(data.orderStatusBreakdown).map(([status, count]) => {
                      const total = Object.values(data.orderStatusBreakdown).reduce((sum, c) => sum + c, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={status} className="analyticsBreakdown__item">
                          <div className="analyticsBreakdown__header">
                            <span className="analyticsBreakdown__label">{status.replace(/_/g, " ")}</span>
                            <span className="analyticsBreakdown__value">{count}</span>
                          </div>
                          <div className="analyticsBreakdown__bar">
                            <div
                              className="analyticsBreakdown__fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Selling Bouquets */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Top Selling Bouquets</h3>
                <div className="analyticsCard__content">
                  <div className="analyticsRanking">
                    {data.topBouquets.map((bouquet, index) => (
                      <div key={bouquet.bouquetId} className="analyticsRanking__item">
                        <span className="analyticsRanking__rank">#{index + 1}</span>
                        <div className="analyticsRanking__content">
                          <span className="analyticsRanking__name">{bouquet.bouquetName}</span>
                          <span className="analyticsRanking__meta">
                            {bouquet.orders} orders • {formatIDR(bouquet.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          </div>
        </div>
      </div>
    );
  }

  // Modal mode: render with overlay
  return (
    <div className="analyticsDashboard" onClick={(e) => {
      // Only close if clicking the overlay, not the panel
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="analyticsDashboard__overlay"></div>
      <div
        className="analyticsDashboard__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="analytics-title"
        aria-modal="true"
      >
        <div className="analyticsDashboard__header">
          <h2 id="analytics-title" className="analyticsDashboard__title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3v18h18M7 16l4-4 4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Advanced Analytics
          </h2>
          <div className="analyticsDashboard__headerActions">
            <div className="analyticsDashboard__periodSelector">
              {(["7d", "30d", "90d", "1y"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`analyticsDashboard__periodBtn ${selectedPeriod === p ? "is-active" : ""}`}
                  onClick={() => setSelectedPeriod(p)}
                >
                  {p === "7d" ? "7 Hari" : p === "30d" ? "30 Hari" : p === "90d" ? "90 Hari" : "1 Tahun"}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="analyticsDashboard__close"
              onClick={onClose}
              aria-label="Tutup analytics dashboard"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="analyticsDashboard__body">
          {loading ? (
            <div className="analyticsDashboard__loading">
              <div className="analyticsDashboard__spinner"></div>
              <p>Memuat analytics...</p>
            </div>
          ) : !data ? (
            <div className="analyticsDashboard__empty">
              <p>Tidak ada data analytics</p>
            </div>
          ) : (
            <>
              {/* Revenue Trends */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Revenue Trends</h3>
                <div className="analyticsCard__content">
                  {revenueChart}
                  <div className="analyticsCard__stats">
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Total Revenue</span>
                      <span className="analyticsCard__statValue">
                        {formatIDR(data.revenueTrends.reduce((sum, d) => sum + d.revenue, 0))}
                      </span>
                    </div>
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Average Daily</span>
                      <span className="analyticsCard__statValue">
                        {formatIDR(
                          data.revenueTrends.length > 0
                            ? data.revenueTrends.reduce((sum, d) => sum + d.revenue, 0) / data.revenueTrends.length
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Trends */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Order Trends</h3>
                <div className="analyticsCard__content">
                  {orderChart}
                  <div className="analyticsCard__stats">
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Total Orders</span>
                      <span className="analyticsCard__statValue">
                        {data.revenueTrends.reduce((sum, d) => sum + d.orders, 0)}
                      </span>
                    </div>
                    <div className="analyticsCard__stat">
                      <span className="analyticsCard__statLabel">Average Daily</span>
                      <span className="analyticsCard__statValue">
                        {data.revenueTrends.length > 0
                          ? Math.round(
                              data.revenueTrends.reduce((sum, d) => sum + d.orders, 0) / data.revenueTrends.length
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Status Breakdown */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Order Status Breakdown</h3>
                <div className="analyticsCard__content">
                  <div className="analyticsBreakdown">
                    {Object.entries(data.orderStatusBreakdown).map(([status, count]) => {
                      const total = Object.values(data.orderStatusBreakdown).reduce((sum, c) => sum + c, 0);
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      
                      return (
                        <div key={status} className="analyticsBreakdown__item">
                          <div className="analyticsBreakdown__header">
                            <span className="analyticsBreakdown__label">{status.replace(/_/g, " ")}</span>
                            <span className="analyticsBreakdown__value">{count}</span>
                          </div>
                          <div className="analyticsBreakdown__bar">
                            <div
                              className="analyticsBreakdown__fill"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Selling Bouquets */}
              <div className="analyticsCard">
                <h3 className="analyticsCard__title">Top Selling Bouquets</h3>
                <div className="analyticsCard__content">
                  <div className="analyticsRanking">
                    {data.topBouquets.map((bouquet, index) => (
                      <div key={bouquet.bouquetId} className="analyticsRanking__item">
                        <span className="analyticsRanking__rank">#{index + 1}</span>
                        <div className="analyticsRanking__content">
                          <span className="analyticsRanking__name">{bouquet.bouquetName}</span>
                          <span className="analyticsRanking__meta">
                            {bouquet.orders} orders • {formatIDR(bouquet.revenue)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

