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
  onSearchChange?: (query: string) => void;

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
      title: `Katalog Bouquet Cirebon${suffix} | Giftforyou.idn - Florist Terbaik di Jawa Barat`,
      description:
        `Katalog lengkap bouquet di Cirebon, Jawa Barat. Tersedia berbagai pilihan bouquet bunga segar, gift box, stand acrylic, dan artificial bouquet. Filter berdasarkan tipe, ukuran, dan harga. Pesan mudah via WhatsApp dengan pengiriman cepat ke seluruh Cirebon.`,
      keywords:
        "katalog bouquet cirebon, bouquet cirebon murah, gift box cirebon, stand acrylic cirebon, florist cirebon online, toko bunga cirebon, artificial bouquet cirebon, hadiah cirebon, kado cirebon, florist jawa barat",
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

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="catalogPagination-wrapper">
        <div className="catalogPagination__info" aria-live="polite">
          Menampilkan <strong>{startItem}</strong>–<strong>{endItem}</strong> dari <strong>{totalItems}</strong> bouquet
        </div>
        <nav className="catalogPagination" aria-label="Navigasi halaman">
          <button
            className="catalogPagination__btn catalogPagination__btn--prev"
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

          <div className="catalogPagination__pages" role="list">
            {start > 1 && (
              <>
                <button
                  className="catalogPagination__page"
                  onClick={() => onPageChange(1)}
                  aria-label="Halaman 1"
                  role="listitem"
                >
                  1
                </button>
                {start > 2 && (
                  <span className="catalogPagination__ellipsis" aria-hidden="true">
                    …
                  </span>
                )}
              </>
            )}
            {pages.map((p) => (
              <button
                key={p}
                className={`catalogPagination__page ${
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
                  <span className="catalogPagination__ellipsis" aria-hidden="true">
                    …
                  </span>
                )}
                <button
                  className="catalogPagination__page"
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
            className="catalogPagination__btn catalogPagination__btn--next"
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
          <div className="catalogHeader__content">
            <h1 id="catalog-title" className="catalogTitle">
              Katalog Bouquet
            </h1>
            <p className="catalogSubtitle">
              {loading
                ? "Memuat bouquet…"
                : "Temukan bouquet impian Anda dari koleksi terpilih kami"}
            </p>
          </div>

          <div className="catalogSummary">
            <div className="catalogSearch">
              <form
                className="catalogSearch__form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = (formData.get("q") as string)?.trim() || "";
                  if (this.props.onSearchChange) {
                    this.props.onSearchChange(query);
                  } else {
                    // Fallback: update URL directly
                    const params = new URLSearchParams(window.location.search);
                    if (query) {
                      params.set("q", query);
                    } else {
                      params.delete("q");
                    }
                    window.location.search = params.toString() ? `?${params.toString()}` : "";
                  }
                }}
              >
                <div className="catalogSearch__wrapper">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="catalogSearch__icon" aria-hidden="true">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="search"
                    name="q"
                    className="catalogSearch__input"
                    placeholder="Cari bouquet, koleksi, momen..."
                    defaultValue={searchQuery}
                    aria-label="Cari bouquet"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="catalogSearch__clear"
                      onClick={() => {
                        this.props.onClearSearchQuery();
                      }}
                      aria-label="Hapus pencarian"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>
            {hasActiveFilters && !loading && (
              <div className="catalogSummary__actions">
                <button
                  className="catalogSummary__clear"
                  onClick={this.props.onClearAll}
                  aria-label="Hapus semua filter dan reset pencarian"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Reset Filter</span>
                </button>
              </div>
            )}
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
                <div className="catalogState catalogState--loading" aria-live="polite" aria-busy="true">
                  <div className="catalogState__content">
                    <div className="becSpinner" style={{ width: "24px", height: "24px", borderWidth: "3px" }}></div>
                    <div className="catalogState__text">
                      <strong>Memuat bouquet…</strong>
                      <span>Mohon tunggu sebentar</span>
                    </div>
                  </div>
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
              <div className="catalogGrid" role="list" aria-label={`Menampilkan ${pageItems.length} dari ${total} bouquet`}>
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
              <div className="catalogEmpty" role="status" aria-live="polite">
                <div className="catalogEmpty__icon" aria-hidden="true">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                  </svg>
                </div>
                <h3 className="catalogEmpty__title">Tidak ada bouquet ditemukan</h3>
                <p className="catalogEmpty__description">
                  {hasActiveFilters
                    ? "Tidak ada bouquet yang sesuai dengan filter Anda. Coba sesuaikan filter atau hapus beberapa filter untuk melihat lebih banyak hasil."
                    : "Belum ada bouquet tersedia saat ini. Silakan kembali lagi nanti."}
                </p>

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
