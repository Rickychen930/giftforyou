import React from "react";
import "../../styles/catalog/CatalogHeader.css";
import { formatIDR } from "../../utils/money";

export interface CatalogHeaderProps {
  title?: string;
  subtitle?: string;
  totalItems?: number;
  minPrice?: number;
  loading?: boolean;
}

const CatalogHeader: React.FC<CatalogHeaderProps> = ({
  title = "Katalog Bouquet",
  subtitle,
  totalItems = 0,
  minPrice,
  loading = false,
}) => {
  const defaultSubtitle = loading
    ? "Memuat bouquet…"
    : totalItems > 0
      ? `Temukan ${totalItems} bouquet impian Anda dari koleksi terpilih kami`
      : "Temukan bouquet impian Anda dari koleksi terpilih kami";

  return (
    <header className="catalog-header">
      <div className="catalog-header__content">
        <h1 id="catalog-title" className="catalog-header__title">
          {title}
        </h1>
        <p className="catalog-header__subtitle">
          {subtitle || defaultSubtitle}
        </p>
        {!loading && totalItems > 0 && (
          <div className="catalog-header__stats">
            <div className="catalog-header__stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{totalItems} Bouquet Tersedia</span>
            </div>
            {minPrice !== undefined && (
              <div className="catalog-header__stat">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Harga Mulai {formatIDR(minPrice)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default CatalogHeader;

