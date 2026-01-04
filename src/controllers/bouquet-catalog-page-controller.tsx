import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import BouquetCatalogView from "../view/bouquet-catalog-page";

import { API_BASE } from "../config/api";
import { getBouquetSizeFilterOptions } from "../constants/bouquet-constants";
import { trackSearch } from "../services/analytics.service";
import { normalizeBouquets } from "../utils/bouquet-normalizer";
import { isNonEmptyString } from "../utils/validation";

type Range = [number, number];

type NavigateFn = (to: any, options?: any) => void;

interface State {
  bouquets: Bouquet[];

  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  sortBy: string;

  currentPage: number;
  itemsPerPage: number;

  collectionNameFilter: string;
  searchQuery: string;

  loading: boolean;
  error: string | null;
}

class BouquetCatalogController extends Component<
  { locationSearch?: string; navigate?: NavigateFn },
  State
> {
  private abortController: AbortController | null = null;
  private memoizedFilterOptions: {
    allTypes: string[];
    allSizes: string[];
    allCollections: string[];
    bouquetsHash: string;
  } | null = null;

  // Memoize filtered and sorted bouquets to prevent unnecessary re-renders
  private memoizedBouquets: {
    filtered: Bouquet[];
    sorted: Bouquet[];
    hash: string;
  } | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      selectedCollections: [],
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 9,
      collectionNameFilter: "",
      searchQuery: "",
      loading: true,
      error: null,
    };
  }

  componentDidMount(): void {
    this.applyLocationSearch(this.props.locationSearch);
    this.loadBouquets();
  }

  componentDidUpdate(
    prevProps: Readonly<{ locationSearch?: string }>,
    prevState: Readonly<State>
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

    // Reset page if out of bounds after filtering
    // Only check if filters actually changed to prevent infinite loops
    const filtersChanged = 
      prevState.selectedTypes !== this.state.selectedTypes ||
      prevState.selectedSizes !== this.state.selectedSizes ||
      prevState.selectedCollections !== this.state.selectedCollections ||
      prevState.priceRange[0] !== this.state.priceRange[0] ||
      prevState.priceRange[1] !== this.state.priceRange[1] ||
      prevState.searchQuery !== this.state.searchQuery ||
      prevState.collectionNameFilter !== this.state.collectionNameFilter;
    
    if (filtersChanged) {
      const filtered = this.getFilteredBouquets();
      const totalFiltered = filtered.length;
      const itemsPerPage = typeof this.state.itemsPerPage === "number" && this.state.itemsPerPage > 0
        ? this.state.itemsPerPage
        : 9;
      const maxPage = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
      
      // Only update if currentPage is actually out of bounds AND different from 1
      // This prevents infinite loop if currentPage is already 1
      if (this.state.currentPage > maxPage && maxPage > 0 && this.state.currentPage !== 1) {
        this.setState({ currentPage: 1 });
      }
    }

    // Keep URL in sync with current filters/sort/page so the state is shareable.
    // Only runs when we have a navigate function (react-router v6).
    this.syncUrlFromState();
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
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
          priceRange: [0, 1_000_000],
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

    const DEFAULT_PRICE: Range = [0, 1_000_000];
    const min = Number.isFinite(minParsed) ? Math.max(0, minParsed) : DEFAULT_PRICE[0];
    const max = Number.isFinite(maxParsed) ? Math.max(min, maxParsed) : DEFAULT_PRICE[1];
    const priceRange: Range = [min, max];

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

    const DEFAULT_PRICE: Range = [0, 1_000_000];
    if (priceRange[0] !== DEFAULT_PRICE[0] || priceRange[1] !== DEFAULT_PRICE[1]) {
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

  private loadBouquets = async () => {
    // cancel previous request if any
    this.abortController?.abort();
    this.abortController = new AbortController();

    this.setState({ loading: true, error: null });

    try {
      const url = `${API_BASE}/api/bouquets`;

      const res = await fetch(url, {
        signal: this.abortController.signal,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch bouquets (${res.status}): ${text}`);
      }

      let data: unknown;
      try {
        const text = await res.text();
        data = text.trim() ? JSON.parse(text) : [];
      } catch (parseErr) {
        throw new Error(`Failed to parse response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }

      if (!Array.isArray(data)) {
        throw new Error("API returned unexpected format (expected an array).");
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

      this.setState({ bouquets, loading: false, error: null });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      this.setState({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load bouquets.",
      });
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
      priceRange: [0, 1_000_000],
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

  private handlePageChange = (page: number) => {
    this.setState({ currentPage: page });
  };

  private handlePriceRangeChange = (range: Range) => {
    // Validate price range - ensure min <= max
    if (!Array.isArray(range) || range.length !== 2) {
      return;
    }
    const [minRaw, maxRaw] = range;
    const min = Math.max(0, typeof minRaw === "number" && Number.isFinite(minRaw) ? minRaw : 0);
    const max = Math.max(min, typeof maxRaw === "number" && Number.isFinite(maxRaw) ? maxRaw : 1_000_000);
    this.setState({ priceRange: [min, max], currentPage: 1 });
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
    
    // Ensure bouquets is an array
    if (!Array.isArray(bouquets) || bouquets.length === 0) {
      return [];
    }
    
    // Validate and normalize price range
    const [minRaw, maxRaw] = Array.isArray(priceRange) && priceRange.length === 2
      ? priceRange
      : [0, 1_000_000];
    const min = Math.max(0, typeof minRaw === "number" && Number.isFinite(minRaw) ? minRaw : 0);
    const max = Math.max(min, typeof maxRaw === "number" && Number.isFinite(maxRaw) ? maxRaw : 1_000_000);

    const collectionNeedle = (collectionNameFilter ?? "").trim().toLowerCase();
    const queryNeedle = (searchQuery ?? "").trim().toLowerCase();

    // Ensure arrays are valid
    const safeSelectedTypes = Array.isArray(selectedTypes) ? selectedTypes : [];
    const safeSelectedSizes = Array.isArray(selectedSizes) ? selectedSizes : [];
    const safeSelectedCollections = Array.isArray(selectedCollections) ? selectedCollections : [];

    const selectedCollectionsNormalized = safeSelectedCollections
      .map((v) => (v ?? "").trim())
      .filter(Boolean);

    return bouquets.filter((b) => {
      // Validate bouquet object
      if (!b || typeof b !== "object") return false;
      
      // Price filter - handle missing or invalid prices
      const price = typeof b.price === "number" && Number.isFinite(b.price) ? b.price : 0;
      const priceOk = price >= min && price <= max;
      
      // Type filter
      const typeOk =
        safeSelectedTypes.length === 0 || safeSelectedTypes.includes(b.type ?? "");
      
      // Size filter
      const sizeOk =
        safeSelectedSizes.length === 0 || safeSelectedSizes.includes(b.size ?? "");

      // Collection filter
      const collectionName = (b.collectionName ?? "").trim();
      const collectionOk =
        selectedCollectionsNormalized.length > 0
          ? selectedCollectionsNormalized.includes(collectionName)
          : !collectionNeedle || collectionName.toLowerCase() === collectionNeedle;

      // Search query filter
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
          // Handle missing or invalid prices
          const priceA = typeof a.price === "number" && Number.isFinite(a.price) ? a.price : 0;
          const priceB = typeof b.price === "number" && Number.isFinite(b.price) ? b.price : 0;
          return priceA - priceB;
        case "price-desc":
          const priceADesc = typeof a.price === "number" && Number.isFinite(a.price) ? a.price : 0;
          const priceBDesc = typeof b.price === "number" && Number.isFinite(b.price) ? b.price : 0;
          return priceBDesc - priceADesc;
        case "name-asc":
          // Handle missing or null names
          const nameA = (a.name ?? "").trim();
          const nameB = (b.name ?? "").trim();
          return nameA.localeCompare(nameB);
        case "name-desc":
          const nameADesc = (a.name ?? "").trim();
          const nameBDesc = (b.name ?? "").trim();
          return nameBDesc.localeCompare(nameADesc);
        default:
          return 0;
      }
    });
  }

  render(): React.ReactNode {
    // Ensure bouquets is an array
    const safeBouquets = Array.isArray(this.state.bouquets) ? this.state.bouquets : [];
    
    // Create hash for current filter/sort state to detect changes
    const filterHash = JSON.stringify({
      selectedTypes: this.state.selectedTypes,
      selectedSizes: this.state.selectedSizes,
      selectedCollections: this.state.selectedCollections,
      priceRange: this.state.priceRange,
      searchQuery: this.state.searchQuery,
      collectionNameFilter: this.state.collectionNameFilter,
      sortBy: this.state.sortBy,
      bouquetsLength: safeBouquets.length,
    });
    
    // Only recalculate filtered/sorted bouquets if filters or bouquets changed
    let filtered: Bouquet[];
    let sorted: Bouquet[];
    
    if (!this.memoizedBouquets || this.memoizedBouquets.hash !== filterHash) {
      filtered = this.getFilteredBouquets();
      sorted = this.getSortedBouquets(filtered);
      this.memoizedBouquets = {
        filtered,
        sorted,
        hash: filterHash,
      };
    } else {
      // Use memoized values to prevent unnecessary re-renders
      filtered = this.memoizedBouquets.filtered;
      sorted = this.memoizedBouquets.sorted;
    }
    
    // Ensure currentPage is valid after filtering
    const totalFiltered = filtered.length;
    const itemsPerPage = typeof this.state.itemsPerPage === "number" && this.state.itemsPerPage > 0
      ? this.state.itemsPerPage
      : 9;
    const maxPage = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
    const safeCurrentPage = Math.min(Math.max(1, this.state.currentPage), maxPage);
    
    // Note: Page reset will be handled in componentDidUpdate to avoid setState during render

    // Memoize filter options to prevent unnecessary re-renders
    // Create a simple hash based on bouquets length and IDs to detect changes
    const bouquetsHash = safeBouquets.length > 0
      ? `${safeBouquets.length}-${safeBouquets.slice(0, 10).map(b => b?._id || "").join(",")}`
      : "0";
    
    // Only recalculate if bouquets actually changed
    if (!this.memoizedFilterOptions || this.memoizedFilterOptions.bouquetsHash !== bouquetsHash) {
      const allTypes: string[] = Array.isArray(safeBouquets) && safeBouquets.length > 0
        ? Array.from(
            new Set(safeBouquets.map((b) => b?.type).filter(isNonEmptyString))
          )
        : ["Orchid", "Mixed"]; // Default fallback

      const allSizes: string[] = Array.isArray(safeBouquets) && safeBouquets.length > 0
        ? getBouquetSizeFilterOptions(
            safeBouquets.map((b) => b?.size).filter((s): s is string => typeof s === "string")
          )
        : []; // Empty array is fine, filter panel handles it

      const allCollections: string[] = Array.isArray(safeBouquets) && safeBouquets.length > 0
        ? Array.from(
            new Set(
              safeBouquets
                .map((b) => b?.collectionName)
                .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
                .map((v) => v.trim())
                .filter(Boolean)
            )
          )
        : []; // Empty array is fine, filter panel handles it

      this.memoizedFilterOptions = {
        allTypes,
        allSizes,
        allCollections,
        bouquetsHash,
      };
    }

    const { allTypes, allSizes, allCollections } = this.memoizedFilterOptions;

    return (
      <BouquetCatalogView
        bouquets={sorted}
        allTypes={allTypes}
        allSizes={allSizes}
        allCollections={allCollections}
        collectionNameFilter={this.state.collectionNameFilter}
        searchQuery={this.state.searchQuery}
        priceRange={this.state.priceRange}
        selectedTypes={this.state.selectedTypes}
        selectedSizes={this.state.selectedSizes}
        selectedCollections={this.state.selectedCollections}
        sortBy={this.state.sortBy}
        currentPage={safeCurrentPage}
        itemsPerPage={itemsPerPage}
        onPriceChange={this.handlePriceRangeChange}
        onToggleFilter={this.toggleFilter}
        onClearFilter={this.clearFilter}
        onClearAll={this.clearAll}
        onSortChange={this.setSortBy}
        onClearSearchQuery={this.clearSearchQuery}
        onClearCollectionNameFilter={this.clearCollectionNameFilter}
        onSearchChange={this.setSearchQuery}
        onPageChange={this.handlePageChange}
        loading={this.state.loading}
        error={this.state.error}
      />
    );
  }
}

export default BouquetCatalogController;
