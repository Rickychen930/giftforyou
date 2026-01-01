/**
 * Catalog Header Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/catalog/CatalogHeader.css";
import { formatIDR } from "../../utils/money";

export interface CatalogHeaderProps {
  title?: string;
  subtitle?: string;
  totalItems?: number;
  minPrice?: number;
  loading?: boolean;
}

interface CatalogHeaderState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Header Component
 * Class-based component for catalog header
 */
class CatalogHeader extends Component<CatalogHeaderProps, CatalogHeaderState> {
  private baseClass: string = "catalog-header";

  private getDefaultSubtitle(): string {
    const { loading = false, totalItems = 0 } = this.props;
    if (loading) return "Memuat bouquet…";
    if (totalItems > 0) {
      return `Temukan ${totalItems} bouquet impian Anda dari koleksi terpilih kami`;
    }
    return "Temukan bouquet impian Anda dari koleksi terpilih kami";
  }

  render(): React.ReactNode {
    const {
      title = "Katalog Bouquet",
      subtitle,
      totalItems = 0,
      minPrice,
      loading = false,
    } = this.props;

    return (
      <header className={this.baseClass}>
        <div className={`${this.baseClass}__content`}>
          <h1 id="catalog-title" className={`${this.baseClass}__title`}>
            {title}
          </h1>
          <p className={`${this.baseClass}__subtitle`}>
            {subtitle || this.getDefaultSubtitle()}
          </p>
          {!loading && totalItems > 0 && (
            <div className={`${this.baseClass}__stats`}>
              <div className={`${this.baseClass}__stat`}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{totalItems} Bouquet Tersedia</span>
              </div>
              {minPrice !== undefined && (
                <div className={`${this.baseClass}__stat`}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>Harga Mulai {formatIDR(minPrice)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
}

export default CatalogHeader;
