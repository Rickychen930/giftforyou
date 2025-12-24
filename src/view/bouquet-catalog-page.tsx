import React, { Component } from "react";
import "../styles/BouquetCatalogPage.css";

import type { Bouquet } from "../models/domain/bouquet";
import FilterPanel from "../components/filter-panel-component";
import BouquetCard from "../components/bouquet-card-component";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";

type Range = [number, number];

interface Props {
  bouquets: Bouquet[];
  allTypes: string[];
  allSizes: string[];
  allCollections: string[];

  collectionNameFilter: string;
  searchQuery: string;

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

  onClearSearchQuery: () => void;
  onClearCollectionNameFilter: () => void;

  loading?: boolean;
  error?: string | null;
}

class BouquetCatalogView extends Component<Props> {
  private resultsRef = React.createRef<HTMLElement>();
  private mobileFiltersRef = React.createRef<HTMLDetailsElement>();

  private closeMobileFiltersIfNeeded = () => {
    if (typeof window === "undefined") return;
    const detailsEl = this.mobileFiltersRef.current;
    if (!detailsEl) return;

    // Only auto-close on mobile drawer behavior.
    const isMobile = window.matchMedia("(max-width: 860px)").matches;
    if (isMobile) detailsEl.open = false;
  };

  private prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

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
      const behavior: ScrollBehavior = this.prefersReducedMotion() ? "auto" : "smooth";
      const el = this.resultsRef.current;
      if (el) {
        el.scrollIntoView({ behavior, block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior });
      }
    }
  }

  private applySeo(): void {
    const selectedTypes = this.props.selectedTypes ?? [];
    const selectedSizes = this.props.selectedSizes ?? [];
    const selectedCollections = this.props.selectedCollections ?? [];
    const searchQuery = (this.props.searchQuery ?? "").trim();
    const collectionNameFilter = (this.props.collectionNameFilter ?? "").trim();
    const sortBy = this.props.sortBy ?? "";
    const priceRange = this.props.priceRange;

    const filters: string[] = [];
    if (selectedTypes.length) filters.push(selectedTypes.join(", "));
    if (selectedSizes.length) filters.push(selectedSizes.join(", "));
    if (selectedCollections.length) filters.push(selectedCollections.join(", "));
    if (!selectedCollections.length && collectionNameFilter) filters.push(collectionNameFilter);
    if (searchQuery) filters.push(`"${searchQuery}"`);
    if (sortBy) filters.push(sortBy);
    if (priceRange?.length === 2) {
      const DEFAULT_PRICE: Range = [0, 1_000_000];
      if (priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1]) {
        filters.push(`${formatIDR(priceRange[0])} – ${formatIDR(priceRange[1])}`);
      }
    }

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

    const searchQuery = (this.props.searchQuery ?? "").trim();
    const collectionNameFilter = (this.props.collectionNameFilter ?? "").trim();

    const hasActiveFilters =
      (selectedTypes?.length ?? 0) > 0 ||
      (selectedSizes?.length ?? 0) > 0 ||
      (selectedCollections?.length ?? 0) > 0 ||
      Boolean(collectionNameFilter) ||
      Boolean(searchQuery) ||
      Boolean(sortBy) ||
      priceRange[0] !== DEFAULT_PRICE[0] ||
      priceRange[1] !== DEFAULT_PRICE[1];

    const sortLabel = (() => {
      switch (sortBy) {
        case "price-asc":
          return "Harga: Termurah";
        case "price-desc":
          return "Harga: Termahal";
        case "name-asc":
          return "Nama: A–Z";
        case "name-desc":
          return "Nama: Z–A";
        default:
          return "";
      }
    })();

    type Chip = {
      key: string;
      label: string;
      onRemove: () => void;
      ariaLabel: string;
    };

    const chips: Chip[] = [];

    if (searchQuery) {
      chips.push({
        key: `q:${searchQuery}`,
        label: `Pencarian: “${searchQuery}”`,
        onRemove: this.props.onClearSearchQuery,
        ariaLabel: `Hapus pencarian ${searchQuery}`,
      });
    }

    if (collectionNameFilter && (selectedCollections?.length ?? 0) === 0) {
      chips.push({
        key: `collectionName:${collectionNameFilter}`,
        label: `Koleksi: ${collectionNameFilter}`,
        onRemove: this.props.onClearCollectionNameFilter,
        ariaLabel: `Hapus filter koleksi ${collectionNameFilter}`,
      });
    }

    (selectedCollections ?? []).forEach((v) => {
      chips.push({
        key: `collection:${v}`,
        label: `Koleksi: ${v}`,
        onRemove: () => this.props.onToggleFilter("selectedCollections", v),
        ariaLabel: `Hapus filter koleksi ${v}`,
      });
    });

    (selectedTypes ?? []).forEach((v) => {
      chips.push({
        key: `type:${v}`,
        label: `Tipe: ${v}`,
        onRemove: () => this.props.onToggleFilter("selectedTypes", v),
        ariaLabel: `Hapus filter tipe ${v}`,
      });
    });

    (selectedSizes ?? []).forEach((v) => {
      chips.push({
        key: `size:${v}`,
        label: `Ukuran: ${v}`,
        onRemove: () => this.props.onToggleFilter("selectedSizes", v),
        ariaLabel: `Hapus filter ukuran ${v}`,
      });
    });

    if (priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1]) {
      chips.push({
        key: `price:${priceRange[0]}-${priceRange[1]}`,
        label: `Harga: ${formatIDR(priceRange[0])} – ${formatIDR(priceRange[1])}`,
        onRemove: () => this.props.onPriceChange(DEFAULT_PRICE),
        ariaLabel: "Hapus filter harga",
      });
    }

    if (sortLabel) {
      chips.push({
        key: `sort:${sortBy}`,
        label: `Urutkan: ${sortLabel}`,
        onRemove: () => this.props.onSortChange(""),
        ariaLabel: "Hapus urutan",
      });
    }

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

          {chips.length > 0 && (
            <div className="catalogActiveFilters" aria-label="Filter aktif">
              {chips.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  className="catalogChip"
                  onClick={c.onRemove}
                  disabled={Boolean(loading)}
                  aria-label={c.ariaLabel}
                  title={c.ariaLabel}
                >
                  <span className="catalogChip__label">{c.label}</span>
                  <span className="catalogChip__x" aria-hidden="true">
                    ×
                  </span>
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="catalogLayout">
          <div className="catalogFilters catalogFilters--top" aria-label="Filter">
            <details className="catalogFilters__mobile" ref={this.mobileFiltersRef}>
              <summary className="catalogFilters__summary">Filter & Urutkan</summary>

              <div className="catalogFilters__body">
                <FilterPanel
                  embedded
                  hideHeader
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
                  onToggleFilter={(key, value) => {
                    this.props.onToggleFilter(key, value);
                    this.closeMobileFiltersIfNeeded();
                  }}
                  onClearFilter={(key) => {
                    this.props.onClearFilter(key);
                    this.closeMobileFiltersIfNeeded();
                  }}
                  onSortChange={(value) => {
                    this.props.onSortChange(value);
                    this.closeMobileFiltersIfNeeded();
                  }}
                />
              </div>
            </details>

            <div className="catalogFilters__desktop">
              <div className="catalogFilters__panel">
                <FilterPanel
                  embedded
                  hideHeader
                  variant="topbar"
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
            </div>
          </div>

          <main className="catalogResults" aria-label="Hasil bouquet" ref={this.resultsRef}>
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

                {chips.length > 0 && (
                  <div className="catalogEmpty__filters" aria-label="Filter aktif">
                    <p className="catalogEmpty__filtersHint">
                      Filter aktif saat ini:
                    </p>
                    <div className="catalogActiveFilters catalogActiveFilters--empty">
                      {chips.map((c) => (
                        <button
                          key={c.key}
                          type="button"
                          className="catalogChip"
                          onClick={c.onRemove}
                          disabled={Boolean(loading)}
                          aria-label={c.ariaLabel}
                          title={c.ariaLabel}
                        >
                          <span className="catalogChip__label">{c.label}</span>
                          <span className="catalogChip__x" aria-hidden="true">
                            ×
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="catalogEmpty__actions">
                  {chips.length > 0 && (
                    <button
                      type="button"
                      className="catalogEmpty__btn catalogEmpty__btn--secondary"
                      onClick={chips[chips.length - 1].onRemove}
                      disabled={loading}
                    >
                      Hapus filter terakhir
                    </button>
                  )}

                  <button
                    type="button"
                    className="catalogEmpty__btn"
                    onClick={this.props.onClearAll}
                    disabled={loading}
                  >
                    Atur ulang filter
                  </button>
                </div>
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
