/**
 * Inventory Manager Component (OOP)
 * Class-based component extending BaseModal
 */

import React from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/InventoryManager.css";
import { API_BASE } from "../../config/api";
import { getAccessToken } from "../../utils/auth-utils";
import { formatIDR } from "../../utils/money";

interface BouquetInventory {
  _id: string;
  name: string;
  quantity: number;
  status: "ready" | "preorder";
  price: number;
  image?: string;
  collectionName?: string;
}

interface InventoryManagerProps extends Omit<BaseModalProps, "title" | "children"> {
  onBouquetClick?: (bouquetId: string) => void;
}

interface InventoryManagerState extends BaseModalState {
  bouquets: BouquetInventory[];
  loading: boolean;
  filter: "all" | "low" | "out" | "ready";
  searchQuery: string;
  intervalId: NodeJS.Timeout | null;
}

/**
 * Inventory Manager Component
 * Class-based component extending BaseModal
 */
class InventoryManager extends BaseModal<InventoryManagerProps, InventoryManagerState> {
  protected baseClass: string = "inventoryManager";

  constructor(props: InventoryManagerProps) {
    super(props);
    this.state = {
      ...this.state,
      bouquets: [],
      loading: false,
      filter: "all",
      searchQuery: "",
      intervalId: null,
    };
  }

  componentDidUpdate(prevProps: InventoryManagerProps): void {
    super.componentDidUpdate(prevProps);
    if (this.props.isOpen && !prevProps.isOpen) {
      this.loadBouquets();
      const intervalId = setInterval(this.loadBouquets, 30000);
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

  private loadBouquets = async (): Promise<void> => {
    this.setState({ loading: true });
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
        this.setState({
          bouquets: bouquetsList.map((b: any) => ({
            _id: b._id || "",
            name: b.name || "",
            quantity: typeof b.quantity === "number" ? b.quantity : 0,
            status: b.status || "ready",
            price: typeof b.price === "number" ? b.price : 0,
            image: b.image || "",
            collectionName: b.collectionName || "",
          })),
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to load bouquets:", error);
      this.setState({ loading: false });
    }
  };

  private handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ searchQuery: e.target.value });
  };

  private handleFilterChange = (filter: "all" | "low" | "out" | "ready"): void => {
    this.setState({ filter });
  };

  private handleBouquetClick = (bouquetId: string): void => {
    const { onBouquetClick } = this.props;
    if (onBouquetClick) {
      onBouquetClick(bouquetId);
    }
  };

  private getFilteredBouquets(): BouquetInventory[] {
    const { bouquets, filter, searchQuery } = this.state;

    return bouquets.filter((b) => {
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
  }

  private getStockStatus(quantity: number, status: string): "preorder" | "out" | "low" | "ok" {
    if (status !== "ready") return "preorder";
    if (quantity === 0) return "out";
    if (quantity < 5) return "low";
    return "ok";
  }

  private getStockLabel(quantity: number, status: string): string {
    const stockStatus = this.getStockStatus(quantity, status);
    if (stockStatus === "preorder") return "Preorder";
    if (stockStatus === "out") return "Habis";
    if (stockStatus === "low") return `Menipis (${quantity})`;
    return `Tersedia (${quantity})`;
  }

  private getStockClass(quantity: number, status: string): string {
    const stockStatus = this.getStockStatus(quantity, status);
    return `inventoryCard__stock inventoryCard__stock--${stockStatus}`;
  }

  private getLowStockCount(): number {
    return this.state.bouquets.filter(
      (b) => b.status === "ready" && b.quantity < 5 && b.quantity > 0
    ).length;
  }

  private getOutOfStockCount(): number {
    return this.state.bouquets.filter((b) => b.status === "ready" && b.quantity === 0).length;
  }

  private renderBouquetCard(bouquet: BouquetInventory): React.ReactNode {
    return (
      <div
        key={bouquet._id}
        className="inventoryCard"
        onClick={() => this.handleBouquetClick(bouquet._id)}
      >
        {bouquet.image && (
          <div className="inventoryCard__image">
            <img src={bouquet.image} alt={bouquet.name} loading="lazy" />
          </div>
        )}
        <div className="inventoryCard__content">
          <h3 className="inventoryCard__name">{bouquet.name}</h3>
          {bouquet.collectionName && (
            <p className="inventoryCard__collection">{bouquet.collectionName}</p>
          )}
          <div className="inventoryCard__details">
            <span className="inventoryCard__price">{formatIDR(bouquet.price)}</span>
            <span className={this.getStockClass(bouquet.quantity, bouquet.status)}>
              {this.getStockLabel(bouquet.quantity, bouquet.status)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  protected renderHeader(): React.ReactNode {
    const lowStockCount = this.getLowStockCount();
    const outOfStockCount = this.getOutOfStockCount();

    return (
      <div className={`${this.baseClass}__header`}>
        <h2 id="inventory-title" className={`${this.baseClass}__title`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Inventory Management
          {(lowStockCount > 0 || outOfStockCount > 0) && (
            <span className={`${this.baseClass}__badge`}>
              {lowStockCount + outOfStockCount}
            </span>
          )}
        </h2>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup inventory manager"
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
    );
  }

  protected renderBody(): React.ReactNode {
    const { loading, filter, bouquets } = this.state;
    const filteredBouquets = this.getFilteredBouquets();
    const lowStockCount = this.getLowStockCount();
    const outOfStockCount = this.getOutOfStockCount();

    return (
      <>
        <div className={`${this.baseClass}__filters`}>
          <div className={`${this.baseClass}__search`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path
                d="m21 21-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari bouquet..."
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
              className={`${this.baseClass}__searchInput`}
            />
          </div>
          <div className={`${this.baseClass}__filterButtons`}>
            <button
              type="button"
              className={`${this.baseClass}__filter ${filter === "all" ? "is-active" : ""}`}
              onClick={() => this.handleFilterChange("all")}
            >
              Semua ({bouquets.length})
            </button>
            <button
              type="button"
              className={`${this.baseClass}__filter ${filter === "low" ? "is-active" : ""}`}
              onClick={() => this.handleFilterChange("low")}
            >
              Menipis ({lowStockCount})
            </button>
            <button
              type="button"
              className={`${this.baseClass}__filter ${filter === "out" ? "is-active" : ""}`}
              onClick={() => this.handleFilterChange("out")}
            >
              Habis ({outOfStockCount})
            </button>
            <button
              type="button"
              className={`${this.baseClass}__filter ${filter === "ready" ? "is-active" : ""}`}
              onClick={() => this.handleFilterChange("ready")}
            >
              Ready
            </button>
          </div>
        </div>

        <div className={`${this.baseClass}__body`}>
          {loading ? (
            <div className={`${this.baseClass}__loading`}>
              <div className={`${this.baseClass}__spinner`} />
              <p>Memuat inventory...</p>
            </div>
          ) : filteredBouquets.length === 0 ? (
            <div className={`${this.baseClass}__empty`}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
                <path
                  d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>Tidak ada bouquet ditemukan</p>
            </div>
          ) : (
            <div className={`${this.baseClass}__list`}>
              {filteredBouquets.map((bouquet) => this.renderBouquetCard(bouquet))}
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
          aria-labelledby="inventory-title"
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

export default InventoryManager;

