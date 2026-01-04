import React, { useEffect, useState, useCallback } from "react";
import "../styles/InventoryManager.css";
import { API_BASE } from "../config/api";
import { getAccessToken } from "../utils/auth-utils";
import { formatIDR } from "../utils/money";

interface BouquetInventory {
  _id: string;
  name: string;
  quantity: number;
  status: "ready" | "preorder";
  price: number;
  image?: string;
  collectionName?: string;
}

interface InventoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onBouquetClick?: (bouquetId: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  isOpen,
  onClose,
  onBouquetClick,
}) => {
  const [bouquets, setBouquets] = useState<BouquetInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "low" | "out" | "ready">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadBouquets = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/bouquets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        const bouquetsList = Array.isArray(data) ? data : [];
        setBouquets(
          bouquetsList.map((b: any) => ({
            _id: b._id || "",
            name: b.name || "",
            quantity: typeof b.quantity === "number" ? b.quantity : 0,
            status: b.status || "ready",
            price: typeof b.price === "number" ? b.price : 0,
            image: b.image || "",
            collectionName: b.collectionName || "",
          }))
        );
      }
    } catch (error) {
      console.error("Failed to load bouquets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBouquets();
      // Refresh every 30 seconds
      const interval = setInterval(loadBouquets, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, loadBouquets]);

  const filteredBouquets = bouquets.filter((b) => {
    // Filter by status
    if (filter === "low") {
      if (b.status !== "ready" || b.quantity >= 5) return false;
    } else if (filter === "out") {
      if (b.status !== "ready" || b.quantity > 0) return false;
    } else if (filter === "ready") {
      if (b.status !== "ready") return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(query) ||
        (b.collectionName || "").toLowerCase().includes(query)
      );
    }

    return true;
  });

  const lowStockCount = bouquets.filter(
    (b) => b.status === "ready" && b.quantity < 5 && b.quantity > 0
  ).length;
  const outOfStockCount = bouquets.filter(
    (b) => b.status === "ready" && b.quantity === 0
  ).length;

  const getStockStatus = (quantity: number, status: string) => {
    if (status !== "ready") return "preorder";
    if (quantity === 0) return "out";
    if (quantity < 5) return "low";
    return "ok";
  };

  const getStockLabel = (quantity: number, status: string) => {
    const stockStatus = getStockStatus(quantity, status);
    if (stockStatus === "preorder") return "Preorder";
    if (stockStatus === "out") return "Habis";
    if (stockStatus === "low") return `Menipis (${quantity})`;
    return `Tersedia (${quantity})`;
  };

  const getStockClass = (quantity: number, status: string) => {
    const stockStatus = getStockStatus(quantity, status);
    return `inventoryCard__stock inventoryCard__stock--${stockStatus}`;
  };

  if (!isOpen) return null;

  return (
    <div className="inventoryManager" onClick={onClose}>
      <div className="inventoryManager__overlay"></div>
      <div
        className="inventoryManager__panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="inventory-title"
        aria-modal="true"
      >
        <div className="inventoryManager__header">
          <h2 id="inventory-title" className="inventoryManager__title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Inventory Management
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <span className="inventoryManager__badge">
                {lowStockCount + outOfStockCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            className="inventoryManager__close"
            onClick={onClose}
            aria-label="Tutup inventory manager"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="inventoryManager__filters">
          <div className="inventoryManager__search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              id="inventory-manager-search"
              name="inventory-manager-search"
              placeholder="Cari bouquet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="inventoryManager__searchInput"
            />
          </div>
          <div className="inventoryManager__filterButtons">
            <button
              type="button"
              className={`inventoryManager__filter ${filter === "all" ? "is-active" : ""}`}
              onClick={() => setFilter("all")}
            >
              Semua ({bouquets.length})
            </button>
            <button
              type="button"
              className={`inventoryManager__filter ${filter === "low" ? "is-active" : ""}`}
              onClick={() => setFilter("low")}
            >
              Menipis ({lowStockCount})
            </button>
            <button
              type="button"
              className={`inventoryManager__filter ${filter === "out" ? "is-active" : ""}`}
              onClick={() => setFilter("out")}
            >
              Habis ({outOfStockCount})
            </button>
            <button
              type="button"
              className={`inventoryManager__filter ${filter === "ready" ? "is-active" : ""}`}
              onClick={() => setFilter("ready")}
            >
              Ready
            </button>
          </div>
        </div>

        <div className="inventoryManager__body">
          {loading ? (
            <div className="inventoryManager__loading">
              <div className="inventoryManager__spinner"></div>
              <p>Memuat inventory...</p>
            </div>
          ) : filteredBouquets.length === 0 ? (
            <div className="inventoryManager__empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Tidak ada bouquet ditemukan</p>
            </div>
          ) : (
            <div className="inventoryManager__list">
              {filteredBouquets.map((bouquet) => (
                <div
                  key={bouquet._id}
                  className="inventoryCard"
                  onClick={() => {
                    if (onBouquetClick) {
                      onBouquetClick(bouquet._id);
                    }
                  }}
                >
                  {bouquet.image && (
                    <div className="inventoryCard__image">
                      <img
                        src={bouquet.image}
                        alt={bouquet.name}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="inventoryCard__content">
                    <h3 className="inventoryCard__name">{bouquet.name}</h3>
                    {bouquet.collectionName && (
                      <p className="inventoryCard__collection">{bouquet.collectionName}</p>
                    )}
                    <div className="inventoryCard__details">
                      <span className="inventoryCard__price">{formatIDR(bouquet.price)}</span>
                      <span className={getStockClass(bouquet.quantity, bouquet.status)}>
                        {getStockLabel(bouquet.quantity, bouquet.status)}
                      </span>
                    </div>
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

export default InventoryManager;

