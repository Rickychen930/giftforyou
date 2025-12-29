import React from "react";
import "../../styles/catalog/CatalogPagination.css";

export interface CatalogPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);

  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="catalog-pagination-wrapper">
      <div className="catalog-pagination__info" aria-live="polite">
        Menampilkan <strong>{startItem}</strong>–<strong>{endItem}</strong> dari <strong>{totalItems}</strong> bouquet
      </div>
      <nav className="catalog-pagination" aria-label="Navigasi halaman">
        <button
          className="catalog-pagination__btn catalog-pagination__btn--prev"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Halaman sebelumnya"
          aria-disabled={currentPage === 1}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Sebelumnya</span>
        </button>

        <div className="catalog-pagination__pages" role="list">
          {start > 1 && (
            <>
              <button
                className="catalog-pagination__page"
                onClick={() => onPageChange(1)}
                aria-label="Halaman 1"
                role="listitem"
              >
                1
              </button>
              {start > 2 && (
                <span className="catalog-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              )}
            </>
          )}
          {pages.map((p) => (
            <button
              key={p}
              className={`catalog-pagination__page ${
                currentPage === p ? "is-active" : ""
              }`}
              onClick={() => onPageChange(p)}
              aria-label={`Halaman ${p}`}
              aria-current={currentPage === p ? "page" : undefined}
              role="listitem"
            >
              {p}
            </button>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <span className="catalog-pagination__ellipsis" aria-hidden="true">
                  …
                </span>
              )}
              <button
                className="catalog-pagination__page"
                onClick={() => onPageChange(totalPages)}
                aria-label={`Halaman ${totalPages}`}
                role="listitem"
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          className="catalog-pagination__btn catalog-pagination__btn--next"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Halaman berikutnya"
          aria-disabled={currentPage === totalPages}
        >
          <span>Berikutnya</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default CatalogPagination;

