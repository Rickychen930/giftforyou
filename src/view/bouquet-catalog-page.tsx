import React, { Component } from "react";
import "../styles/BouquetCatalogPage.css";

import type { Bouquet } from "../models/domain/bouquet";
import FilterPanel from "../components/filter-panel-component";
import BouquetCard from "../components/bouquet-card-component";
import { setSeo } from "../utils/seo";

type Range = [number, number];

interface Props {
  bouquets: Bouquet[];
  allTypes: string[];
  allSizes: string[];

  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: string;

  currentPage: number;
  itemsPerPage: number;

  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes") => void;
  onClearAll: () => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;

  loading?: boolean;
  error?: string | null;
}

class BouquetCatalogView extends Component<Props> {
  componentDidMount(): void {
    this.applySeo();
  }

  componentDidUpdate(prevProps: Props): void {
    if (
      prevProps.selectedTypes !== this.props.selectedTypes ||
      prevProps.selectedSizes !== this.props.selectedSizes ||
      prevProps.priceRange !== this.props.priceRange ||
      prevProps.sortBy !== this.props.sortBy
    ) {
      this.applySeo();
    }
  }

  private applySeo(): void {
    const selectedTypes = this.props.selectedTypes ?? [];
    const selectedSizes = this.props.selectedSizes ?? [];

    const filters: string[] = [];
    if (selectedTypes.length) filters.push(selectedTypes.join(", "));
    if (selectedSizes.length) filters.push(selectedSizes.join(", "));

    const suffix = filters.length ? ` (${filters.join(" • ")})` : "";
    setSeo({
      title: `Bouquet Catalog${suffix} | Giftforyou.idn`,
      description:
        "Browse bouquets by type, size, and price — then order instantly via WhatsApp.",
      path: "/collection",
    });
  }

  private renderPagination(totalItems: number): React.ReactNode {
    const { currentPage, itemsPerPage, onPageChange } = this.props;

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <div className="catalogPagination" aria-label="Pagination">
        <button
          className="catalogPagination__btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            className={`catalogPagination__page ${
              currentPage === p ? "is-active" : ""
            }`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="catalogPagination__btn"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    );
  }

  render(): React.ReactNode {
    const {
      bouquets,
      currentPage,
      itemsPerPage,
      loading,
      error,
      allTypes,
      allSizes,
      priceRange,
      selectedTypes,
      selectedSizes,
      sortBy,
    } = this.props;

    if (loading) {
      return (
        <section className="catalogPage">
          <div className="catalogHeader">
            <h1 className="catalogTitle">Bouquet Catalog</h1>
            <p className="catalogSubtitle">Loading bouquets…</p>
          </div>
          <div className="catalogState" aria-live="polite">
            Loading…
          </div>
        </section>
      );
    }

    if (error) {
      return (
        <section className="catalogPage">
          <div className="catalogHeader">
            <h1 className="catalogTitle">Bouquet Catalog</h1>
            <p className="catalogSubtitle">
              Browse our latest bouquets and collections.
            </p>
          </div>
          <div className="catalogState catalogState--error" role="alert">
            {error}
          </div>
        </section>
      );
    }

    const total = bouquets.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pageItems = bouquets.slice(startIndex, startIndex + itemsPerPage);

    const DEFAULT_PRICE: Range = [0, 1_000_000];
    const hasActiveFilters =
      (selectedTypes?.length ?? 0) > 0 ||
      (selectedSizes?.length ?? 0) > 0 ||
      Boolean(sortBy) ||
      priceRange[0] !== DEFAULT_PRICE[0] ||
      priceRange[1] !== DEFAULT_PRICE[1];

    return (
      <section className="catalogPage" aria-labelledby="catalog-title">
        <header className="catalogHeader">
          <h1 id="catalog-title" className="catalogTitle">
            Bouquet Catalog
          </h1>
          <p className="catalogSubtitle">
            Filter by price, type, and size — then order instantly via WhatsApp.
          </p>

          <div className="catalogSummary">
            <span className="catalogSummary__count">{total} results</span>
            <button
              className="catalogSummary__clear"
              onClick={this.props.onClearAll}
              disabled={!hasActiveFilters}
            >
              Clear all filters
            </button>
          </div>
        </header>

        <div className="catalogLayout">
          <aside className="catalogFilters" aria-label="Filters">
            <details className="catalogFilters__mobile">
              <summary className="catalogFilters__summary">
                Filters & Sort
              </summary>

              <FilterPanel
                priceRange={priceRange}
                selectedTypes={selectedTypes}
                selectedSizes={selectedSizes}
                allSizes={allSizes}
                allTypes={allTypes}
                sortBy={sortBy}
                onPriceChange={this.props.onPriceChange}
                onToggleFilter={this.props.onToggleFilter}
                onClearFilter={this.props.onClearFilter}
                onSortChange={this.props.onSortChange}
              />
            </details>

            <div className="catalogFilters__desktop">
              <FilterPanel
                priceRange={priceRange}
                selectedTypes={selectedTypes}
                selectedSizes={selectedSizes}
                allSizes={allSizes}
                allTypes={allTypes}
                sortBy={sortBy}
                onPriceChange={this.props.onPriceChange}
                onToggleFilter={this.props.onToggleFilter}
                onClearFilter={this.props.onClearFilter}
                onSortChange={this.props.onSortChange}
              />
            </div>
          </aside>

          <main className="catalogResults" aria-label="Bouquet results">
            {pageItems.length > 0 ? (
              <div className="catalogGrid">
                {pageItems.map((b) => (
                  <BouquetCard
                    key={b._id}
                    _id={String(b._id)}
                    name={b.name}
                    description={b.description}
                    price={b.price}
                    type={b.type}
                    size={b.size}
                    image={b.image}
                    status={b.status}
                    collectionName={b.collectionName}
                  />
                ))}
              </div>
            ) : (
              <div className="catalogEmpty">
                <h3>No results found</h3>
                <p>Try removing some filters or expand the price range.</p>
                <button
                  className="catalogEmpty__btn"
                  onClick={this.props.onClearAll}
                >
                  Reset filters
                </button>
              </div>
            )}

            {this.renderPagination(total)}
          </main>
        </div>
      </section>
    );
  }
}

export default BouquetCatalogView;
