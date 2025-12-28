import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/CustomersSection.css";
import { API_BASE } from "../../config/api";
import { formatIDR } from "../../utils/money";
import { getAccessToken } from "../../utils/auth-utils";

type Customer = {
  _id?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  addresses?: Array<{
    label: string;
    address: string;
    isDefault?: boolean;
    coordinates?: { lat: number; lng: number };
  }>;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerStats = {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  favoriteBouquets: Array<{ bouquetId: string; bouquetName: string; count: number }>;
  orderStatusBreakdown: {
    bertanya: number;
    memesan: number;
    sedang_diproses: number;
    menunggu_driver: number;
    pengantaran: number;
    terkirim: number;
  };
};

type CustomerWithStats = Customer & {
  stats?: CustomerStats;
  user?: {
    username: string;
    email: string;
    role: string;
  };
};

type Props = {
  onSelectCustomer?: (customerId: string) => void;
};


const formatDate = (v?: string): string => {
  if (!v) return "—";
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CustomersSection({ onSelectCustomer }: Props) {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [sortBy, setSortBy] = useState<"name" | "orders" | "spent" | "date">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<"all" | "registered" | "guest">("all");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load customers
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = debouncedSearchQuery ? `?q=${encodeURIComponent(debouncedSearchQuery)}` : "";
      const token = getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/api/customers${query}`, {
        headers,
      });

      if (!res.ok) {
        throw new Error(`Failed to load customers: ${res.status}`);
      }

      const data = await res.json();
      const customersList: Customer[] = Array.isArray(data) ? data : [];

      // Load stats for each customer
      const customersWithStats = await Promise.all(
        customersList.map(async (customer) => {
          try {
            // Get orders for this customer
            const ordersToken = getAccessToken();
            const ordersHeaders: HeadersInit = {
              "Content-Type": "application/json",
            };
            if (ordersToken) {
              ordersHeaders["Authorization"] = `Bearer ${ordersToken}`;
            }
            const ordersRes = await fetch(
              `${API_BASE}/api/orders?customerId=${customer._id}&limit=1000`,
              {
                headers: ordersHeaders,
              }
            );

            let orders: any[] = [];
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();
              orders = Array.isArray(ordersData) ? ordersData : [];
            }

            // Calculate stats
            const stats: CustomerStats = {
              totalOrders: orders.length,
              totalSpent: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
              lastOrderDate: orders.length > 0
                ? orders.sort((a, b) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                  })[0]?.createdAt
                : undefined,
              favoriteBouquets: [],
              orderStatusBreakdown: {
                bertanya: 0,
                memesan: 0,
                sedang_diproses: 0,
                menunggu_driver: 0,
                pengantaran: 0,
                terkirim: 0,
              },
            };

            // Count bouquet preferences
            const bouquetCounts: Record<string, { name: string; count: number }> = {};
            orders.forEach((order) => {
              if (order.bouquetId && order.bouquetName) {
                if (!bouquetCounts[order.bouquetId]) {
                  bouquetCounts[order.bouquetId] = {
                    name: order.bouquetName,
                    count: 0,
                  };
                }
                bouquetCounts[order.bouquetId].count++;
              }

              // Count order statuses
              if (order.orderStatus && stats.orderStatusBreakdown[order.orderStatus as keyof typeof stats.orderStatusBreakdown] !== undefined) {
                stats.orderStatusBreakdown[order.orderStatus as keyof typeof stats.orderStatusBreakdown]++;
              }
            });

            stats.favoriteBouquets = Object.entries(bouquetCounts)
              .map(([bouquetId, data]) => ({
                bouquetId,
                bouquetName: data.name,
                count: data.count,
              }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Load user data if userId exists
            // For now, we'll just mark if customer has userId (registered)
            // User details can be fetched separately if needed
            let user = undefined;
            if (customer.userId) {
              // Customer is registered (has userId)
              // We can enhance this later to fetch full user details
              user = {
                id: customer.userId,
                registered: true,
              } as any;
            }

            return {
              ...customer,
              stats,
              user,
            };
          } catch (err) {
            console.error(`Failed to load stats for customer ${customer._id}:`, err);
            return {
              ...customer,
              stats: {
                totalOrders: 0,
                totalSpent: 0,
                favoriteBouquets: [],
                orderStatusBreakdown: {
                  bertanya: 0,
                  memesan: 0,
                  sedang_diproses: 0,
                  menunggu_driver: 0,
                  pengantaran: 0,
                  terkirim: 0,
                },
              },
            };
          }
        })
      );

      setCustomers(customersWithStats);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    // Filter by registration status
    if (filterBy === "registered") {
      filtered = filtered.filter((c) => c.userId);
    } else if (filterBy === "guest") {
      filtered = filtered.filter((c) => !c.userId);
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.buyerName.toLowerCase();
          bValue = b.buyerName.toLowerCase();
          break;
        case "orders":
          aValue = a.stats?.totalOrders || 0;
          bValue = b.stats?.totalOrders || 0;
          break;
        case "spent":
          aValue = a.stats?.totalSpent || 0;
          bValue = b.stats?.totalSpent || 0;
          break;
        case "date":
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return filtered;
  }, [customers, sortBy, sortDirection, filterBy]);

  const handleCustomerClick = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    setViewMode("detail");
    if (onSelectCustomer && customer._id) {
      onSelectCustomer(customer._id);
    }
  };

  if (viewMode === "detail" && selectedCustomer) {
    return (
      <div className="customersSection">
        <div className="customersSection__header">
          <button
            type="button"
            className="customersSection__backBtn"
            onClick={() => {
              setViewMode("list");
              setSelectedCustomer(null);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Kembali ke Daftar
          </button>
          <h2 className="customersSection__title">Detail Customer</h2>
        </div>

        <div className="customersDetail">
          {/* Quick Actions */}
          <div className="customersDetail__quickActions">
            <a
              href={`https://wa.me/${selectedCustomer.phoneNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="customersDetail__quickAction customersDetail__quickAction--whatsapp"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" fill="currentColor"/>
              </svg>
              WhatsApp
            </a>
            <a
              href={`tel:${selectedCustomer.phoneNumber}`}
              className="customersDetail__quickAction customersDetail__quickAction--call"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Telepon
            </a>
            {selectedCustomer.stats && selectedCustomer.stats.totalOrders > 0 && (
              <button
                type="button"
                className="customersDetail__quickAction customersDetail__quickAction--orders"
                onClick={() => {
                  // Navigate to orders section with customer filter
                  window.location.href = `/dashboard?tab=orders&customerId=${selectedCustomer._id}`;
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0zM22 11l-4-4m0 0l-4 4m4-4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Lihat Orders ({selectedCustomer.stats.totalOrders})
              </button>
            )}
          </div>

          <div className="customersDetail__card">
            <h3 className="customersDetail__cardTitle">Informasi Customer</h3>
            <div className="customersDetail__infoGrid">
              <div className="customersDetail__infoItem">
                <span className="customersDetail__label">Nama</span>
                <span className="customersDetail__value">{selectedCustomer.buyerName}</span>
              </div>
              <div className="customersDetail__infoItem">
                <span className="customersDetail__label">No. Telepon</span>
                <span className="customersDetail__value">
                  <a href={`tel:${selectedCustomer.phoneNumber}`} className="customersDetail__link">
                    {selectedCustomer.phoneNumber}
                  </a>
                </span>
              </div>
              <div className="customersDetail__infoItem">
                <span className="customersDetail__label">Alamat Utama</span>
                <span className="customersDetail__value">{selectedCustomer.address || "—"}</span>
              </div>
              <div className="customersDetail__infoItem">
                <span className="customersDetail__label">Status</span>
                <span className="customersDetail__value">
                  {selectedCustomer.userId ? (
                    <span className="customersDetail__badge customersDetail__badge--registered">
                      Terdaftar
                    </span>
                  ) : (
                    <span className="customersDetail__badge customersDetail__badge--guest">
                      Guest
                    </span>
                  )}
                </span>
              </div>
              {selectedCustomer.userId && (
                <div className="customersDetail__infoItem">
                  <span className="customersDetail__label">User ID</span>
                  <span className="customersDetail__value">
                    <code style={{ fontSize: "0.85rem", color: "var(--ink-600)", fontFamily: "monospace" }}>
                      {selectedCustomer.userId}
                    </code>
                  </span>
                </div>
              )}
              <div className="customersDetail__infoItem">
                <span className="customersDetail__label">Bergabung</span>
                <span className="customersDetail__value">{formatDate(selectedCustomer.createdAt)}</span>
              </div>
            </div>

            {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
              <div className="customersDetail__addresses">
                <h4 className="customersDetail__addressesTitle">Alamat Tersimpan</h4>
                <div className="customersDetail__addressesList">
                  {selectedCustomer.addresses.map((addr, idx) => (
                    <div key={idx} className="customersDetail__addressItem">
                      <div className="customersDetail__addressHeader">
                        <span className="customersDetail__addressLabel">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="customersDetail__badge customersDetail__badge--default">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="customersDetail__addressText">{addr.address}</p>
                      {addr.coordinates && (
                        <p className="customersDetail__addressCoords">
                          📍 {addr.coordinates.lat.toFixed(6)}, {addr.coordinates.lng.toFixed(6)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedCustomer.stats && (
            <>
              <div className="customersDetail__card">
                <h3 className="customersDetail__cardTitle">Statistik Pesanan</h3>
                <div className="customersDetail__statsGrid">
                  <div className="customersDetail__statCard">
                    <span className="customersDetail__statLabel">Total Pesanan</span>
                    <span className="customersDetail__statValue">{selectedCustomer.stats.totalOrders}</span>
                  </div>
                  <div className="customersDetail__statCard">
                    <span className="customersDetail__statLabel">Total Belanja</span>
                    <span className="customersDetail__statValue">
                      {formatIDR(selectedCustomer.stats.totalSpent)}
                    </span>
                  </div>
                  <div className="customersDetail__statCard">
                    <span className="customersDetail__statLabel">Pesanan Terakhir</span>
                    <span className="customersDetail__statValue">
                      {formatDate(selectedCustomer.stats.lastOrderDate)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedCustomer.stats.favoriteBouquets.length > 0 && (
                <div className="customersDetail__card">
                  <h3 className="customersDetail__cardTitle">Bouquet Favorit</h3>
                  <div className="customersDetail__favoritesList">
                    {selectedCustomer.stats.favoriteBouquets.map((fav) => (
                      <div key={fav.bouquetId} className="customersDetail__favoriteItem">
                        <span className="customersDetail__favoriteName">{fav.bouquetName}</span>
                        <span className="customersDetail__favoriteCount">{fav.count}x dipesan</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="customersDetail__card">
                <h3 className="customersDetail__cardTitle">Status Pesanan</h3>
                <div className="customersDetail__statusBreakdown">
                  {Object.entries(selectedCustomer.stats.orderStatusBreakdown).map(([status, count]) => (
                    count > 0 && (
                      <div key={status} className="customersDetail__statusItem">
                        <span className="customersDetail__statusLabel">{status.replace(/_/g, " ")}</span>
                        <span className="customersDetail__statusValue">{count}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="customersSection">
      <div className="customersSection__header">
        <h2 className="customersSection__title">Customer Management</h2>
        <div className="customersSection__controls">
          <button
            type="button"
            className="customersSection__exportBtn"
            onClick={() => {
              // Export to CSV
              const csv = [
                ["Nama", "Telepon", "Alamat", "Total Pesanan", "Total Belanja", "Status", "Bergabung"],
                ...filteredAndSortedCustomers.map((c) => [
                  c.buyerName,
                  c.phoneNumber,
                  c.address || "",
                  (c.stats?.totalOrders || 0).toString(),
                  (c.stats?.totalSpent || 0).toString(),
                  c.userId ? "Terdaftar" : "Guest",
                  formatDate(c.createdAt),
                ]),
              ]
                .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
                .join("\n");
              
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `customers_${new Date().toISOString().split("T")[0]}.csv`);
              link.style.visibility = "hidden";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            title="Export ke CSV"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
          <div className="customersSection__search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="Cari customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customersSection__searchInput"
            />
          </div>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value as "all" | "registered" | "guest")}
            className="customersSection__filter"
          >
            <option value="all">Semua</option>
            <option value="registered">Terdaftar</option>
            <option value="guest">Guest</option>
          </select>
          <select
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [by, dir] = e.target.value.split("-");
              setSortBy(by as typeof sortBy);
              setSortDirection(dir as typeof sortDirection);
            }}
            className="customersSection__sort"
          >
            <option value="date-desc">Terbaru</option>
            <option value="date-asc">Terlama</option>
            <option value="name-asc">Nama A-Z</option>
            <option value="name-desc">Nama Z-A</option>
            <option value="orders-desc">Pesanan Terbanyak</option>
            <option value="spent-desc">Belanja Terbanyak</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="customersSection__loading">
          <div className="customersSection__spinner"></div>
          <p>Memuat data customer...</p>
        </div>
      )}

      {error && (
        <div className="customersSection__error">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredAndSortedCustomers.length === 0 && (
        <div className="customersSection__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
          </svg>
          <p>Tidak ada customer ditemukan</p>
        </div>
      )}

      {!loading && !error && filteredAndSortedCustomers.length > 0 && (
        <div className="customersSection__list">
          {filteredAndSortedCustomers.map((customer) => (
            <div
              key={customer._id}
              className="customersSection__card"
              onClick={() => handleCustomerClick(customer)}
            >
              <div className="customersSection__cardHeader">
                <div className="customersSection__cardInfo">
                  <h3 className="customersSection__cardName">{customer.buyerName}</h3>
                  <p className="customersSection__cardPhone">{customer.phoneNumber}</p>
                </div>
                <div className="customersSection__cardBadges">
                  {customer.userId ? (
                    <span className="customersSection__badge customersSection__badge--registered">
                      Terdaftar
                    </span>
                  ) : (
                    <span className="customersSection__badge customersSection__badge--guest">
                      Guest
                    </span>
                  )}
                </div>
              </div>
              <div className="customersSection__cardStats">
                <div className="customersSection__stat">
                  <span className="customersSection__statLabel">Pesanan</span>
                  <span className="customersSection__statValue">{customer.stats?.totalOrders || 0}</span>
                </div>
                <div className="customersSection__stat">
                  <span className="customersSection__statLabel">Total Belanja</span>
                  <span className="customersSection__statValue">
                    {formatIDR(customer.stats?.totalSpent || 0)}
                  </span>
                </div>
                <div className="customersSection__stat">
                  <span className="customersSection__statLabel">Bergabung</span>
                  <span className="customersSection__statValue">{formatDate(customer.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

