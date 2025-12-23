import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import BouquetCatalogView from "../view/bouquet-catalog-page";

import { API_BASE } from "../config/api";
import { getBouquetSizeFilterOptions } from "../constants/bouquet-constants";

type Range = [number, number];

interface State {
  bouquets: Bouquet[];

  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: string;

  currentPage: number;
  itemsPerPage: number;

  loading: boolean;
  error: string | null;
} // adjust path depending on folder depth

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

class BouquetCatalogController extends Component<{}, State> {
  private abortController: AbortController | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 9,
      loading: true,
      error: null,
    };
  }

  componentDidMount(): void {
    this.loadBouquets();
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
  }

  /** Must match your domain Bouquet type (including required fields) */
  private normalizeBouquet = (b: any): Bouquet => ({
    _id: String(b?._id ?? ""),
    name: isNonEmptyString(b?.name) ? b.name : "",
    description: isNonEmptyString(b?.description) ? b.description : "",

    price: Number(b?.price ?? 0),

    type: isNonEmptyString(b?.type) ? b.type : "",
    size: isNonEmptyString(b?.size) ? b.size : "",

    image: isNonEmptyString(b?.image) ? b.image : "",
    status: b?.status === "preorder" ? "preorder" : "ready",
    collectionName: isNonEmptyString(b?.collectionName) ? b.collectionName : "",

    occasions: Array.isArray(b?.occasions) ? b.occasions : [],
    flowers: Array.isArray(b?.flowers) ? b.flowers : [],
    isNewEdition: Boolean(b?.isNewEdition),
    isFeatured: Boolean(b?.isFeatured),

    // ✅ FIX: quantity must not be blank
    quantity: typeof b?.quantity === "number" ? b.quantity : 0,

    careInstructions: isNonEmptyString(b?.careInstructions)
      ? b.careInstructions
      : undefined,
    createdAt: isNonEmptyString(b?.createdAt) ? b.createdAt : undefined,
    updatedAt: isNonEmptyString(b?.updatedAt) ? b.updatedAt : undefined,
  });

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

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("API returned unexpected format (expected an array).");
      }

      const bouquets = data.map(this.normalizeBouquet);

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
    key: "selectedTypes" | "selectedSizes",
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

    this.setState((prev) => {
      const selected = prev.selectedSizes.includes(value)
        ? prev.selectedSizes.filter((v) => v !== value)
        : [...prev.selectedSizes, value];

      return { selectedSizes: selected, currentPage: 1 };
    });
  };

  private clearFilter = (key: "selectedTypes" | "selectedSizes") => {
    if (key === "selectedTypes") {
      this.setState({ selectedTypes: [], currentPage: 1 });
      return;
    }
    this.setState({ selectedSizes: [], currentPage: 1 });
  };

  private clearAll = () => {
    this.setState({
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
    });
  };

  private setSortBy = (value: string) => {
    this.setState({ sortBy: value, currentPage: 1 });
  };

  private handlePriceRangeChange = (range: Range) => {
    this.setState({ priceRange: range, currentPage: 1 });
  };

  private getFilteredBouquets(): Bouquet[] {
    const { bouquets, priceRange, selectedTypes, selectedSizes } = this.state;
    const [min, max] = priceRange;

    return bouquets.filter((b) => {
      const priceOk = b.price >= min && b.price <= max;
      const typeOk =
        selectedTypes.length === 0 || selectedTypes.includes(b.type ?? "");
      const sizeOk =
        selectedSizes.length === 0 || selectedSizes.includes(b.size ?? "");
      return priceOk && typeOk && sizeOk;
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

  render(): React.ReactNode {
    const filtered = this.getFilteredBouquets();
    const sorted = this.getSortedBouquets(filtered);

    const allTypes: string[] = Array.from(
      new Set(this.state.bouquets.map((b) => b.type).filter(isNonEmptyString))
    );

        const allSizes: string[] = getBouquetSizeFilterOptions(
          this.state.bouquets.map((b) => b.size)
        );

    return (
      <BouquetCatalogView
        bouquets={sorted}
        allTypes={allTypes.length ? allTypes : ["Orchid", "Mixed"]}
            allSizes={allSizes}
        priceRange={this.state.priceRange}
        selectedTypes={this.state.selectedTypes}
        selectedSizes={this.state.selectedSizes}
        sortBy={this.state.sortBy}
        currentPage={this.state.currentPage}
        itemsPerPage={this.state.itemsPerPage}
        onPriceChange={this.handlePriceRangeChange}
        onToggleFilter={this.toggleFilter}
        onClearFilter={this.clearFilter}
        onClearAll={this.clearAll}
        onSortChange={this.setSortBy}
        onPageChange={(page) => this.setState({ currentPage: page })}
        loading={this.state.loading}
        error={this.state.error}
      />
    );
  }
}

export default BouquetCatalogController;
