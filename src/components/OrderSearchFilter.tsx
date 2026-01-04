/**
 * Order Search and Filter Component
 * Provides search and filter functionality for orders
 */

import React, { memo, useState, useCallback, useMemo } from "react";
import "../styles/OrderSearchFilter.css";

export type OrderStatusFilter =
  | "all"
  | "bertanya"
  | "memesan"
  | "sedang_diproses"
  | "menunggu_driver"
  | "pengantaran"
  | "terkirim";

interface OrderSearchFilterProps {
  searchQuery: string;
  statusFilter: OrderStatusFilter;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: OrderStatusFilter) => void;
}

const OrderSearchFilter: React.FC<OrderSearchFilterProps> = ({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearch(value);
      onSearchChange(value);
    },
    [onSearchChange]
  );

  const handleClearSearch = useCallback(() => {
    setLocalSearch("");
    onSearchChange("");
  }, [onSearchChange]);

  const statusOptions: Array<{ value: OrderStatusFilter; label: string }> = useMemo(
    () => [
      { value: "all", label: "Semua Status" },
      { value: "bertanya", label: "Bertanya" },
      { value: "memesan", label: "Memesan" },
      { value: "sedang_diproses", label: "Diproses" },
      { value: "menunggu_driver", label: "Menunggu Driver" },
      { value: "pengantaran", label: "Pengantaran" },
      { value: "terkirim", label: "Terkirim" },
    ],
    []
  );

  return (
    <div className="orderSearchFilter">
      <div className="orderSearchFilter__search">
        <div className="orderSearchFilter__searchWrapper">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="orderSearchFilter__searchIcon"
            aria-hidden="true"
          >
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
            id="order-search-filter-input"
            name="order-search-filter"
            className="orderSearchFilter__input"
            placeholder="Cari pesanan..."
            value={localSearch}
            onChange={handleSearchChange}
            aria-label="Cari pesanan"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="orderSearchFilter__clearBtn"
              aria-label="Hapus pencarian"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="orderSearchFilter__filters">
        <label className="orderSearchFilter__filterLabel">
          <span>Filter Status:</span>
          <select
            className="orderSearchFilter__select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as OrderStatusFilter)}
            aria-label="Filter status pesanan"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default memo(OrderSearchFilter);

