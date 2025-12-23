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
  allCollections: string[];

  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  sortBy: string;

  currentPage: number;
  itemsPerPage: number;

  onPriceChange: (range: Range) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes" | "selectedCollections") => void;
  onClearAll: () => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;

  loading?: boolean;
  error?: string | null;
}

class BouquetCatalogView extends Component<Props> {
  private resultsRef = React.createRef<HTMLElement>();

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

    const shouldScrollToResults =
      prevProps.currentPage !== this.props.currentPage ||
      prevProps.selectedTypes !== this.props.selectedTypes ||
      prevProps.selectedSizes !== this.props.selectedSizes ||
      prevProps.priceRange !== this.props.priceRange ||
      prevProps.sortBy !== this.props.sortBy;

    if (shouldScrollToResults) {
      const el = this.resultsRef.current;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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
      title: `Katalog Bouquet${suffix} | Giftforyou.idn`,
      description:
        "Cari bouquet berdasarkan tipe, ukuran, dan harga — lalu pesan cepat lewat WhatsApp.",
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
      <div className="catalogPagination" aria-label="Navigasi halaman">
        <button
          className="catalogPagination__btn"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Sebelumnya
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
          Berikutnya
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
      allCollections,
      priceRange,
      selectedTypes,
      selectedSizes,
      selectedCollections,
      sortBy,
    } = this.props;

    if (error) {
      return (
        <section className="catalogPage">
          <div className="catalogHeader">
            <h1 className="catalogTitle">Katalog Bouquet</h1>
            <p className="catalogSubtitle">
              Jelajahi bouquet dan koleksi terbaru kami.
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

  const skeletonCount = Math.max(6, Math.min(itemsPerPage || 0, 12));

    const DEFAULT_PRICE: Range = [0, 1_000_000];
    const hasActiveFilters =
      (selectedTypes?.length ?? 0) > 0 ||
      (selectedSizes?.length ?? 0) > 0 ||
      (selectedCollections?.length ?? 0) > 0 ||
      Boolean(sortBy) ||
      priceRange[0] !== DEFAULT_PRICE[0] ||
      priceRange[1] !== DEFAULT_PRICE[1];

    return (
      <section className="catalogPage" aria-labelledby="catalog-title">
        <header className="catalogHeader">
          <h1 id="catalog-title" className="catalogTitle">
            Katalog Bouquet
          </h1>
          <p className="catalogSubtitle">
            {loading
              ? "Memuat bouquet…"
              : "Saring berdasarkan harga, tipe, dan ukuran — lalu pesan cepat lewat WhatsApp."}
          </p>

          <div className="catalogSummary">
            <span className="catalogSummary__count">
              {loading ? "Memuat…" : `${total} hasil`}
            </span>
            <button
              className="catalogSummary__clear"
              onClick={this.props.onClearAll}
              disabled={loading || !hasActiveFilters}
            >
              Hapus semua filter
            </button>
          </div>
        </header>

        <div className="catalogLayout">
          <aside className="catalogFilters" aria-label="Filter">
            <details className="catalogFilters__mobile">
              <summary className="catalogFilters__summary">
                Filter & Urutkan
              </summary>

              <FilterPanel
                priceRange={priceRange}
                selectedTypes={selectedTypes}
                selectedSizes={selectedSizes}
                selectedCollections={selectedCollections}
                allSizes={allSizes}
                allTypes={allTypes}
                allCollections={allCollections}
                sortBy={sortBy}
                disabled={Boolean(loading)}
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
                selectedCollections={selectedCollections}
                allSizes={allSizes}
                allTypes={allTypes}
                allCollections={allCollections}
                sortBy={sortBy}
                disabled={Boolean(loading)}
                onPriceChange={this.props.onPriceChange}
                onToggleFilter={this.props.onToggleFilter}
                onClearFilter={this.props.onClearFilter}
                onSortChange={this.props.onSortChange}
              />
            </div>
          </aside>

          <main
            className="catalogResults"
            aria-label="Hasil bouquet"
            ref={this.resultsRef}
          >
            {loading ? (
              <>
                <div className="catalogState" aria-live="polite">
                  Memuat bouquet…
                </div>
                <div className="catalogGrid catalogGrid--skeleton" aria-hidden="true">
                  {Array.from({ length: skeletonCount }).map((_, idx) => (
                    <div key={idx} className="catalogSkeletonCard">
                      <div className="catalogSkeletonCard__media" />
                      <div className="catalogSkeletonCard__body">
                        <div className="catalogSkeletonLine is-title" />
                        <div className="catalogSkeletonLine" />
                        <div className="catalogSkeletonLine is-short" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : pageItems.length > 0 ? (
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
                <h3>Tidak ada hasil</h3>
                <p>Coba hapus beberapa filter atau perluas rentang harga.</p>
                <button
                  className="catalogEmpty__btn"
                  onClick={this.props.onClearAll}
                  disabled={loading}
                >
                  Atur ulang filter
                </button>
              </div>
            )}

            {!loading && this.renderPagination(total)}
          </main>
        </div>
      </section>
    );
  }
}

export default BouquetCatalogView;
