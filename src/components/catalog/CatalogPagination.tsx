/**
 * Catalog Pagination Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/catalog/CatalogPagination.css";

export interface CatalogPaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

interface CatalogPaginationState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Pagination Component
 * Class-based component for catalog pagination
 */
class CatalogPagination extends Component<CatalogPaginationProps, CatalogPaginationState> {
  private baseClass: string = "catalog-pagination";

  private calculatePages(): {
    totalPages: number;
    start: number;
    end: number;
    pages: number[];
    startItem: number;
    endItem: number;
  } {
    const { currentPage, totalItems, itemsPerPage } = this.props;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return { totalPages, start, end, pages, startItem, endItem };
  }

  private handlePageChange = (page: number): void => {
    this.props.onPageChange(page);
  };

  render(): React.ReactNode {
    const { currentPage, totalItems } = this.props;
    const { totalPages, start, end, pages, startItem, endItem } = this.calculatePages();

    if (totalPages <= 1) return null;

    return (
      <div className={`${this.baseClass}-wrapper`}>
        <div className={`${this.baseClass}__info`} aria-live="polite">
          Menampilkan <strong>{startItem}</strong>–<strong>{endItem}</strong> dari{" "}
          <strong>{totalItems}</strong> bouquet
        </div>
        <nav className={this.baseClass} aria-label="Navigasi halaman">
          <button
            className={`${this.baseClass}__btn ${this.baseClass}__btn--prev`}
            disabled={currentPage === 1}
            onClick={() => this.handlePageChange(currentPage - 1)}
            aria-label="Halaman sebelumnya"
            aria-disabled={currentPage === 1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Sebelumnya</span>
          </button>

          <div className={`${this.baseClass}__pages`} role="list">
            {start > 1 && (
              <>
                <button
                  className={`${this.baseClass}__page`}
                  onClick={() => this.handlePageChange(1)}
                  aria-label="Halaman 1"
                  role="listitem"
                >
                  1
                </button>
                {start > 2 && (
                  <span className={`${this.baseClass}__ellipsis`} aria-hidden="true">
                    …
                  </span>
                )}
              </>
            )}
            {pages.map((p) => (
              <button
                key={p}
                className={`${this.baseClass}__page ${currentPage === p ? "is-active" : ""}`}
                onClick={() => this.handlePageChange(p)}
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
                  <span className={`${this.baseClass}__ellipsis`} aria-hidden="true">
                    …
                  </span>
                )}
                <button
                  className={`${this.baseClass}__page`}
                  onClick={() => this.handlePageChange(totalPages)}
                  aria-label={`Halaman ${totalPages}`}
                  role="listitem"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            className={`${this.baseClass}__btn ${this.baseClass}__btn--next`}
            disabled={currentPage === totalPages}
            onClick={() => this.handlePageChange(currentPage + 1)}
            aria-label="Halaman berikutnya"
            aria-disabled={currentPage === totalPages}
          >
            <span>Berikutnya</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </nav>
      </div>
    );
  }
}

export default CatalogPagination;
