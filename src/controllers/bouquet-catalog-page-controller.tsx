/**
 * Bouquet Catalog Page Controller
 * OOP-based controller for managing bouquet catalog page state and filtering
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import type { Bouquet } from "../models/domain/bouquet";
import BouquetCatalogView from "../view/bouquet-catalog-page";

import { API_BASE } from "../config/api";
import { getBouquetSizeFilterOptions } from "../constants/bouquet-constants";
import { trackSearch } from "../services/analytics.service";
import { normalizeBouquets } from "../utils/bouquet-normalizer";
import { isNonEmptyString } from "../utils/validation";
import { formatIDR } from "../utils/money";
import { setSeo } from "../utils/seo";
import type { FilterChip } from "../components/catalog/CatalogActiveFilters";
import {
  type BouquetCatalogPageState,
  type PriceRange,
  type NavigateFn,
  INITIAL_BOUQUET_CATALOG_PAGE_STATE,
  DEFAULT_PRICE_RANGE,
} from "../models/bouquet-catalog-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";

// Removed duplicate type definitions - now using types from model file

interface BouquetCatalogControllerProps extends BaseControllerProps {
  locationSearch?: string;
  navigate?: NavigateFn;
}

class BouquetCatalogController extends BaseController<
  BouquetCatalogControllerProps,
  BouquetCatalogPageState & BaseControllerState
> {
  constructor(props: BouquetCatalogControllerProps) {
    super(props);
    this.state = {
      ...this.state,
      ...INITIAL_BOUQUET_CATALOG_PAGE_STATE,
    };
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.applyLocationSearch(this.props.locationSearch);
    this.loadBouquets();
  }

  componentDidUpdate(
    prevProps: Readonly<{ locationSearch?: string }>,
    prevState: Readonly<BouquetCatalogPageState>
  ): void {
    if ((prevProps.locationSearch ?? "") !== (this.props.locationSearch ?? "")) {
      this.applyLocationSearch(this.props.locationSearch);
    }

    if (prevState.searchQuery !== this.state.searchQuery) {
      const term = (this.state.searchQuery ?? "").trim();
      if (term.length >= 2) {
        trackSearch(term, "/collection", this.props.locationSearch ?? "");
      }
    }

    // Apply SEO when filters change
    if (
      prevState.selectedTypes !== this.state.selectedTypes ||
      prevState.selectedSizes !== this.state.selectedSizes ||
      prevState.priceRange !== this.state.priceRange ||
      prevState.sortBy !== this.state.sortBy ||
      prevState.searchQuery !== this.state.searchQuery ||
      prevState.collectionNameFilter !== this.state.collectionNameFilter
    ) {
      this.applySeo();
    }

    // Keep URL in sync with current filters/sort/page so the state is shareable.
    // Only runs when we have a navigate function (react-router v6).
    this.syncUrlFromState();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
  }

  private applyLocationSearch = (locationSearch?: string) => {
    const search = (locationSearch ?? "").trim();
    if (!search) {
      // If user navigates to /collection with no query, clear URL-driven filters.
      if (
        this.state.collectionNameFilter ||
        this.state.searchQuery ||
        this.state.sortBy ||
        this.state.currentPage !== 1 ||
        this.state.priceRange[0] !== 0 ||
        this.state.priceRange[1] !== 1_000_000
      ) {
        this.setState({
          collectionNameFilter: "",
          searchQuery: "",
          sortBy: "",
          currentPage: 1,
          priceRange: DEFAULT_PRICE_RANGE,
        });
      }
      return;
    }

    const params = new URLSearchParams(
      search.startsWith("?") ? search : `?${search}`
    );

    const name = (params.get("name") ?? params.get("filter") ?? "").trim();
    const q = (params.get("q") ?? "").trim();
    const sort = (params.get("sort") ?? "").trim();

    const pageRaw = (params.get("page") ?? "").trim();
    const pageParsed = Number.parseInt(pageRaw, 10);
    const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

    const minRaw = (params.get("min") ?? params.get("minPrice") ?? "").trim();
    const maxRaw = (params.get("max") ?? params.get("maxPrice") ?? "").trim();
    const minParsed = Number.parseInt(minRaw, 10);
    const maxParsed = Number.parseInt(maxRaw, 10);

    const min = Number.isFinite(minParsed) ? Math.max(0, minParsed) : DEFAULT_PRICE_RANGE[0];
    const max = Number.isFinite(maxParsed) ? Math.max(min, maxParsed) : DEFAULT_PRICE_RANGE[1];
    const priceRange: PriceRange = [min, max];

    const splitCsv = (v: string) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const typeParams = params.getAll("type").flatMap(splitCsv);
    const sizeParams = params.getAll("size").flatMap(splitCsv);
    const collectionParams = params
      .getAll("collection")
      .concat(name ? [name] : [])
      .flatMap(splitCsv);

    const types = Array.from(new Set(typeParams));
    const sizes = Array.from(new Set(sizeParams));
    const collections = Array.from(new Set(collectionParams));

    const sameArray = (a: string[], b: string[]) =>
      a.length === b.length && a.every((v, i) => v === b[i]);

    const needsUpdate =
      name !== this.state.collectionNameFilter ||
      q !== this.state.searchQuery ||
      sort !== this.state.sortBy ||
      page !== this.state.currentPage ||
      priceRange[0] !== this.state.priceRange[0] ||
      priceRange[1] !== this.state.priceRange[1] ||
      !sameArray(types, this.state.selectedTypes) ||
      !sameArray(sizes, this.state.selectedSizes) ||
      !sameArray(collections, this.state.selectedCollections);

    if (needsUpdate) {
      this.setState({
        collectionNameFilter: name,
        searchQuery: q,
        sortBy: sort,
        currentPage: page,
        priceRange,
        selectedTypes: types,
        selectedSizes: sizes,
        selectedCollections: collections,
      });
    }
  };

  private buildSearchFromState(): string {
    const {
      selectedTypes,
      selectedSizes,
      selectedCollections,
      collectionNameFilter,
      searchQuery,
      sortBy,
      currentPage,
      priceRange,
    } = this.state;

    const params = new URLSearchParams();

    (selectedTypes ?? []).forEach((t) => {
      const v = (t ?? "").trim();
      if (v) params.append("type", v);
    });

    (selectedSizes ?? []).forEach((s) => {
      const v = (s ?? "").trim();
      if (v) params.append("size", v);
    });

    const collections = (selectedCollections ?? []).map((v) => v.trim()).filter(Boolean);
    collections.forEach((c) => params.append("collection", c));

    const name = (collectionNameFilter ?? "").trim();
    if (!collections.length && name) {
      params.set("name", name);
    }

    const q = (searchQuery ?? "").trim();
    if (q) params.set("q", q);

    const sort = (sortBy ?? "").trim();
    if (sort) params.set("sort", sort);

    if (priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) {
      params.set("min", String(priceRange[0]));
      params.set("max", String(priceRange[1]));
    }

    if (currentPage && currentPage !== 1) {
      params.set("page", String(currentPage));
    }

    const s = params.toString();
    return s ? `?${s}` : "";
  }

  private syncUrlFromState(): void {
    const navigate = this.props.navigate;
    if (typeof navigate !== "function") return;

    const desired = this.buildSearchFromState();
    const current = (this.props.locationSearch ?? "").trim();
    const currentNorm = current.startsWith("?") || current === "" ? current : `?${current}`;

    if (desired === currentNorm) return;

    navigate(
      {
        pathname: "/collection",
        search: desired,
      },
      { replace: true }
    );
  }

  // Using centralized normalizer from utils

  /**
   * Extract array from various API response formats
   * Handles: array, { data: [] }, { bouquets: [] }, { items: [] }, etc.
   */
  private extractArrayFromResponse(data: unknown): unknown[] {
    // If already an array, return it
    if (Array.isArray(data)) {
      return data;
    }

    // If it's an object, try to find array in common properties
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      
      // Try common property names
      const arrayProps = ["data", "bouquets", "items", "results", "content"];
      for (const prop of arrayProps) {
        if (Array.isArray(obj[prop])) {
          return obj[prop] as unknown[];
        }
      }

      // Try to find any array property
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          return obj[key] as unknown[];
        }
      }
    }

    // If nothing found, return empty array
    return [];
  }

  private loadBouquets = async () => {
    this.setLoading(true);
    this.setError(null);

    try {
      const url = `${API_BASE}/api/bouquets`;

      const res = await this.safeFetch(url);

      if (!res || !res.ok) {
        const text = res ? await res.text() : "";
        throw new Error(`Failed to fetch bouquets (${res?.status || "Unknown"}): ${text}`);
      }

      const text = await res.text();
      const parsed = this.safeJsonParse<unknown>(text, null);

      // Handle empty or null response
      if (parsed === null || parsed === undefined) {
        console.warn("[Catalog] API returned null or undefined response");
        this.setState({ bouquets: [] }, () => {
          this.setLoading(false);
          this.setError(null);
          this.applySeo();
        });
        return;
      }

      // Extract array from various response formats
      const data = this.extractArrayFromResponse(parsed);

      // Log warning if format was unexpected (for debugging)
      if (!Array.isArray(parsed) && data.length === 0 && parsed !== null) {
        console.warn("[Catalog] API returned unexpected format. Expected array or object with array property.", {
          type: typeof parsed,
          keys: typeof parsed === "object" && parsed !== null ? Object.keys(parsed) : [],
          sample: JSON.stringify(parsed).slice(0, 200),
        });
      }

      const bouquets = normalizeBouquets(data);

      // Log detailed info for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`[Catalog] Loaded ${bouquets.length} valid bouquets from ${data.length} total items`);
        if (bouquets.length === 0 && data.length > 0) {
          console.warn("[Catalog] All bouquets were filtered out. Sample data:", data.slice(0, 2));
        }
        if (bouquets.length > 0) {
          console.log("[Catalog] First bouquet sample:", {
            _id: bouquets[0]._id,
            name: bouquets[0].name,
            price: bouquets[0].price,
            image: bouquets[0].image ? "has image" : "no image",
          });
        }
      }

      // Log warning if no valid bouquets found
      if (bouquets.length === 0 && data.length > 0) {
        console.warn("[Catalog] All bouquets were filtered out during normalization. Check bouquet data structure.");
        // Show sample of raw data to help debug
        console.warn("[Catalog] Sample raw data:", JSON.stringify(data.slice(0, 1), null, 2));
      }

      this.setState({ bouquets }, () => {
        this.setLoading(false);
        this.setError(null);
        // Apply SEO after bouquets are loaded
        this.applySeo();
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      this.setError(err, "Failed to load bouquets.");
      this.setLoading(false);
    }
  };

  private toggleFilter = (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections",
    value: string
  ) => {
    if (key === "selectedTypes") {
      this.setState((prev) => {
        const selected = prev.selectedTypes.includes(value)
          ? prev.selectedTypes.filter((v) => v !== value)
          : [...prev.selectedTypes, value];

        return { selectedTypes: selected, currentPage: 1 };
      });
      return;
    }

    if (key === "selectedCollections") {
      this.setState((prev) => {
        const selected = prev.selectedCollections.includes(value)
          ? prev.selectedCollections.filter((v) => v !== value)
          : [...prev.selectedCollections, value];

        return {
          selectedCollections: selected,
          collectionNameFilter: "",
          currentPage: 1,
        };
      });
      return;
    }

    this.setState((prev) => {
      const selected = prev.selectedSizes.includes(value)
        ? prev.selectedSizes.filter((v) => v !== value)
        : [...prev.selectedSizes, value];

      return { selectedSizes: selected, currentPage: 1 };
    });
  };

  private clearFilter = (
    key: "selectedTypes" | "selectedSizes" | "selectedCollections"
  ) => {
    if (key === "selectedTypes") {
      this.setState({ selectedTypes: [], currentPage: 1 });
      return;
    }
    if (key === "selectedCollections") {
      this.setState({ selectedCollections: [], collectionNameFilter: "", currentPage: 1 });
      return;
    }
    this.setState({ selectedSizes: [], currentPage: 1 });
  };

  private clearAll = () => {
    this.setState({
      priceRange: DEFAULT_PRICE_RANGE,
      selectedTypes: [],
      selectedSizes: [],
      selectedCollections: [],
      sortBy: "",
      collectionNameFilter: "",
      searchQuery: "",
      currentPage: 1,
    });
  };

  private clearSearchQuery = () => {
    this.setState({ searchQuery: "", currentPage: 1 });
  };

  private setSearchQuery = (query: string) => {
    this.setState({ searchQuery: query.trim(), currentPage: 1 });
  };

  private clearCollectionNameFilter = () => {
    this.setState({ collectionNameFilter: "", currentPage: 1 });
  };

  private setSortBy = (value: string) => {
    this.setState({ sortBy: value, currentPage: 1 });
  };

  private handlePriceRangeChange = (range: PriceRange) => {
    this.setState({ priceRange: range, currentPage: 1 });
  };

  private getFilteredBouquets(): Bouquet[] {
    const {
      bouquets,
      priceRange,
      selectedTypes,
      selectedSizes,
      selectedCollections,
      collectionNameFilter,
      searchQuery,
    } = this.state;
    const [min, max] = priceRange;

    const collectionNeedle = collectionNameFilter.trim().toLowerCase();
    const queryNeedle = searchQuery.trim().toLowerCase();

    const selectedCollectionsNormalized = selectedCollections
      .map((v) => v.trim())
      .filter(Boolean);

    return bouquets.filter((b) => {
      const priceOk = b.price >= min && b.price <= max;
      const typeOk =
        selectedTypes.length === 0 || selectedTypes.includes(b.type ?? "");
      const sizeOk =
        selectedSizes.length === 0 || selectedSizes.includes(b.size ?? "");

      const collectionName = (b.collectionName ?? "").trim();
      const collectionOk =
        selectedCollectionsNormalized.length > 0
          ? selectedCollectionsNormalized.includes(collectionName)
          : !collectionNeedle || collectionName.toLowerCase() === collectionNeedle;

      const queryOk =
        !queryNeedle ||
        [
          b.name,
          b.description,
          b.type,
          b.size,
          b.collectionName,
        ]
          .filter(isNonEmptyString)
          .some((v) => v.toLowerCase().includes(queryNeedle));

      return priceOk && typeOk && sizeOk && collectionOk && queryOk;
    });
  }

  private getSortedBouquets(list: Bouquet[]): Bouquet[] {
    const { sortBy } = this.state;

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  /**
   * Apply SEO
   */
  private applySeo = (): void => {
    const { selectedTypes, selectedSizes, selectedCollections, searchQuery, collectionNameFilter, sortBy, priceRange } = this.state;

    const filters: string[] = [];
    if (selectedTypes.length) filters.push(selectedTypes.join(", "));
    if (selectedSizes.length) filters.push(selectedSizes.join(", "));
    if (selectedCollections.length) filters.push(selectedCollections.join(", "));
    if (!selectedCollections.length && collectionNameFilter) filters.push(collectionNameFilter);
    if (searchQuery) filters.push(`"${searchQuery}"`);
    if (sortBy) filters.push(sortBy);
    if (priceRange?.length === 2) {
      if (priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) {
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
  };

  /**
   * Build filter chips
   */
  private buildFilterChips = (): FilterChip[] => {
    const { searchQuery, collectionNameFilter, selectedCollections, selectedTypes, selectedSizes, priceRange, sortBy } = this.state;

    const chips: FilterChip[] = [];
    const searchQueryTrimmed = (searchQuery ?? "").trim();
    const collectionNameFilterTrimmed = (collectionNameFilter ?? "").trim();

    if (searchQueryTrimmed) {
      chips.push({
        key: `q:${searchQueryTrimmed}`,
        label: `Pencarian: "${searchQueryTrimmed}"`,
        onRemove: this.clearSearchQuery,
        ariaLabel: `Hapus pencarian ${searchQueryTrimmed}`,
      });
    }

    if (collectionNameFilterTrimmed && (selectedCollections?.length ?? 0) === 0) {
      chips.push({
        key: `collectionName:${collectionNameFilterTrimmed}`,
        label: `Koleksi: ${collectionNameFilterTrimmed}`,
        onRemove: this.clearCollectionNameFilter,
        ariaLabel: `Hapus filter koleksi ${collectionNameFilterTrimmed}`,
      });
    }

    (selectedCollections ?? []).forEach((v) => {
      chips.push({
        key: `collection:${v}`,
        label: `Koleksi: ${v}`,
        onRemove: () => this.toggleFilter("selectedCollections", v),
        ariaLabel: `Hapus filter koleksi ${v}`,
      });
    });

    (selectedTypes ?? []).forEach((v) => {
      chips.push({
        key: `type:${v}`,
        label: `Tipe: ${v}`,
        onRemove: () => this.toggleFilter("selectedTypes", v),
        ariaLabel: `Hapus filter tipe ${v}`,
      });
    });

    (selectedSizes ?? []).forEach((v) => {
      chips.push({
        key: `size:${v}`,
        label: `Ukuran: ${v}`,
        onRemove: () => this.toggleFilter("selectedSizes", v),
        ariaLabel: `Hapus filter ukuran ${v}`,
      });
    });

    if (priceRange[0] !== DEFAULT_PRICE_RANGE[0] || priceRange[1] !== DEFAULT_PRICE_RANGE[1]) {
      chips.push({
        key: `price:${priceRange[0]}-${priceRange[1]}`,
        label: `Harga: ${formatIDR(priceRange[0])} – ${formatIDR(priceRange[1])}`,
        onRemove: () => this.handlePriceRangeChange(DEFAULT_PRICE_RANGE),
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
        onRemove: () => this.setSortBy(""),
        ariaLabel: "Hapus urutan",
      });
    }

    return chips;
  };

  /**
   * Check if prefers reduced motion
   */
  private prefersReducedMotion = (): boolean => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  /**
   * Scroll to results
   */
  private scrollToResults = (resultsRef: React.RefObject<HTMLElement>): void => {
    const behavior: ScrollBehavior = this.prefersReducedMotion() ? "auto" : "smooth";
    const el = resultsRef.current;
    if (el) {
      el.scrollIntoView({ behavior, block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  };

  render(): React.ReactNode {
    const filtered = this.getFilteredBouquets();
    const sorted = this.getSortedBouquets(filtered);

    const allTypes: string[] = Array.from(
      new Set(this.state.bouquets.map((b) => b.type).filter(isNonEmptyString))
    );

    const allSizes: string[] = getBouquetSizeFilterOptions(
      this.state.bouquets.map((b) => b.size)
    );

    const allCollections: string[] = Array.from(
      new Set(
        this.state.bouquets
          .map((b) => b.collectionName)
          .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
          .map((v) => v.trim())
          .filter(Boolean)
      )
    );

    // Calculate derived values
    const total = sorted.length;
    const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
    const pageItems = sorted.slice(startIndex, startIndex + this.state.itemsPerPage);
    const hasActiveFilters =
      (this.state.selectedTypes?.length ?? 0) > 0 ||
      (this.state.selectedSizes?.length ?? 0) > 0 ||
      (this.state.selectedCollections?.length ?? 0) > 0 ||
      Boolean(this.state.collectionNameFilter) ||
      Boolean(this.state.searchQuery) ||
      Boolean(this.state.sortBy) ||
      this.state.priceRange[0] !== DEFAULT_PRICE_RANGE[0] ||
      this.state.priceRange[1] !== DEFAULT_PRICE_RANGE[1];
    const chips = this.buildFilterChips();
    const minPrice = sorted.length > 0 ? Math.min(...sorted.map((b) => b.price)) : undefined;

    return (
      <BouquetCatalogView
        bouquets={pageItems}
        total={total}
        allTypes={allTypes.length ? allTypes : ["Orchid", "Mixed"]}
        allSizes={allSizes}
        allCollections={allCollections}
        collectionNameFilter={this.state.collectionNameFilter}
        searchQuery={this.state.searchQuery}
        priceRange={this.state.priceRange}
        selectedTypes={this.state.selectedTypes}
        selectedSizes={this.state.selectedSizes}
        selectedCollections={this.state.selectedCollections}
        sortBy={this.state.sortBy}
        currentPage={this.state.currentPage}
        itemsPerPage={this.state.itemsPerPage}
        minPrice={minPrice}
        hasActiveFilters={hasActiveFilters}
        filterChips={chips}
        onPriceChange={this.handlePriceRangeChange}
        onToggleFilter={this.toggleFilter}
        onClearFilter={this.clearFilter}
        onClearAll={this.clearAll}
        onSortChange={this.setSortBy}
        onClearSearchQuery={this.clearSearchQuery}
        onClearCollectionNameFilter={this.clearCollectionNameFilter}
        onSearchChange={this.setSearchQuery}
        onPageChange={(page) => this.setState({ currentPage: page })}
        onItemsPerPageChange={(itemsPerPage) => this.setState({ itemsPerPage, currentPage: 1 })}
        onScrollToResults={this.scrollToResults}
        loading={this.state.loading}
        error={this.state.error}
      />
    );
  }
}

export default BouquetCatalogController;
