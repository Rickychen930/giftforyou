// src/view/bouquet-catalog-page.tsx - Refactored with Reusable Components
import React, { Component } from "react";
import "../styles/BouquetCatalogPage.css";

import type { Bouquet } from "../models/domain/bouquet";
import { setSeo } from "../utils/seo";
import { formatIDR } from "../utils/money";
import { observeFadeIn, revealOnScroll, staggerFadeIn } from "../utils/luxury-enhancements";

// Reusable Catalog Components
import CatalogHeader from "../components/catalog/CatalogHeader";
import CatalogSearch from "../components/catalog/CatalogSearch";
import CatalogFilters from "../components/catalog/CatalogFilters";
import CatalogGrid from "../components/catalog/CatalogGrid";
import CatalogPagination from "../components/catalog/CatalogPagination";
import CatalogEmpty from "../components/catalog/CatalogEmpty";
import CatalogSkeleton from "../components/catalog/CatalogSkeleton";
import CatalogActiveFilters, { FilterChip } from "../components/catalog/CatalogActiveFilters";

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

  private prefersReducedMotion(): boolean {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  componentDidMount(): void {
    this.applySeo();
    
    setTimeout(() => {
      const fadeElements = document.querySelectorAll(".fade-in");
      fadeElements.forEach((el) => {
        el.classList.add("fade-in-visible");
      });

      const revealElements = document.querySelectorAll(".reveal-on-scroll");
      revealElements.forEach((el) => {
        el.classList.add("revealed");
      });

      observeFadeIn(".fade-in");
      revealOnScroll();
      
      const cards = document.querySelectorAll(".bouquet-card");
      if (cards.length > 0) {
        staggerFadeIn(cards as NodeListOf<HTMLElement>, 50, 400);
      }
    }, 50);
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

  private buildFilterChips(): FilterChip[] {
    const {
      searchQuery,
      collectionNameFilter,
      selectedCollections,
      selectedTypes,
      selectedSizes,
      priceRange,
      sortBy,
      onClearSearchQuery,
      onClearCollectionNameFilter,
      onToggleFilter,
      onPriceChange,
      onSortChange,
    } = this.props;

    const DEFAULT_PRICE: Range = [0, 1_000_000];
    const chips: FilterChip[] = [];
    const searchQueryTrimmed = (searchQuery ?? "").trim();
    const collectionNameFilterTrimmed = (collectionNameFilter ?? "").trim();

    if (searchQueryTrimmed) {
      chips.push({
        key: `q:${searchQueryTrimmed}`,
        label: `Pencarian: "${searchQueryTrimmed}"`,
        onRemove: onClearSearchQuery,
        ariaLabel: `Hapus pencarian ${searchQueryTrimmed}`,
      });
    }

    if (collectionNameFilterTrimmed && (selectedCollections?.length ?? 0) === 0) {
      chips.push({
        key: `collectionName:${collectionNameFilterTrimmed}`,
        label: `Koleksi: ${collectionNameFilterTrimmed}`,
        onRemove: onClearCollectionNameFilter,
        ariaLabel: `Hapus filter koleksi ${collectionNameFilterTrimmed}`,
      });
    }

    (selectedCollections ?? []).forEach((v) => {
      chips.push({
        key: `collection:${v}`,
        label: `Koleksi: ${v}`,
        onRemove: () => onToggleFilter("selectedCollections", v),
        ariaLabel: `Hapus filter koleksi ${v}`,
      });
    });

    (selectedTypes ?? []).forEach((v) => {
      chips.push({
        key: `type:${v}`,
        label: `Tipe: ${v}`,
        onRemove: () => onToggleFilter("selectedTypes", v),
        ariaLabel: `Hapus filter tipe ${v}`,
      });
    });

    (selectedSizes ?? []).forEach((v) => {
      chips.push({
        key: `size:${v}`,
        label: `Ukuran: ${v}`,
        onRemove: () => onToggleFilter("selectedSizes", v),
        ariaLabel: `Hapus filter ukuran ${v}`,
      });
    });

    if (priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1]) {
      chips.push({
        key: `price:${priceRange[0]}-${priceRange[1]}`,
        label: `Harga: ${formatIDR(priceRange[0])} – ${formatIDR(priceRange[1])}`,
        onRemove: () => onPriceChange(DEFAULT_PRICE),
        ariaLabel: "Hapus filter harga",
      });
    }

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

    if (sortLabel) {
      chips.push({
        key: `sort:${sortBy}`,
        label: `Urutkan: ${sortLabel}`,
        onRemove: () => onSortChange(""),
        ariaLabel: "Hapus urutan",
      });
    }

    return chips;
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
      searchQuery,
      collectionNameFilter,
      onPriceChange,
      onToggleFilter,
      onClearFilter,
      onClearAll,
      onSortChange,
      onPageChange,
      onClearSearchQuery,
      onSearchChange,
    } = this.props;

    if (error) {
      return (
        <section className="catalog-page">
          <CatalogHeader title="Katalog Bouquet" subtitle="Jelajahi bouquet dan koleksi terbaru kami." />
          <div className="catalog-page__error" role="alert">
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
      Boolean(collectionNameFilter) ||
      Boolean(searchQuery) ||
      Boolean(sortBy) ||
      priceRange[0] !== DEFAULT_PRICE[0] ||
      priceRange[1] !== DEFAULT_PRICE[1];

    const chips = this.buildFilterChips();
    const minPrice = bouquets.length > 0 ? Math.min(...bouquets.map((b) => b.price)) : undefined;

    return (
      <section className="catalog-page" aria-labelledby="catalog-title">
        <CatalogHeader
          totalItems={total}
          minPrice={minPrice}
          loading={loading}
        />

        <div className="catalog-page__summary">
          <CatalogSearch
            value={searchQuery}
            onSearch={onSearchChange}
            onClear={onClearSearchQuery}
            disabled={loading}
          />
          {hasActiveFilters && !loading && (
            <div className="catalog-page__summary-actions">
              <button
                className="catalog-page__clear-btn"
                onClick={onClearAll}
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
          <CatalogActiveFilters chips={chips} loading={loading} />
        )}

        <div className="catalog-page__layout">
          <CatalogFilters
            priceRange={priceRange}
            selectedTypes={selectedTypes}
            selectedSizes={selectedSizes}
            selectedCollections={selectedCollections}
            allTypes={allTypes}
            allSizes={allSizes}
            allCollections={allCollections}
            sortBy={sortBy}
            disabled={loading}
            onPriceChange={onPriceChange}
            onToggleFilter={onToggleFilter}
            onClearFilter={onClearFilter}
            onSortChange={onSortChange}
          />

          <main className="catalog-page__results" aria-label="Hasil bouquet" ref={this.resultsRef}>
            {loading ? (
              <CatalogSkeleton count={skeletonCount} showLoadingState />
            ) : pageItems.length > 0 ? (
              <>
                <CatalogGrid
                  bouquets={pageItems}
                  ariaLabel={`Menampilkan ${pageItems.length} dari ${total} bouquet`}
                />
                <CatalogPagination
                  currentPage={currentPage}
                  totalItems={total}
                  itemsPerPage={itemsPerPage}
                  onPageChange={onPageChange}
                />
              </>
            ) : (
              <CatalogEmpty
                hasActiveFilters={hasActiveFilters}
                chips={chips}
                onClearAll={onClearAll}
                onRemoveLastFilter={chips.length > 0 ? chips[chips.length - 1].onRemove : undefined}
                loading={loading}
              />
            )}
          </main>
        </div>
      </section>
    );
  }
}

export default BouquetCatalogView;
