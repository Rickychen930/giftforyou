import React, { Component } from "react";
import { IBouquet } from "../models/bouquet-model-real";
import BouquetDetailView from "../view/bouquet-detail-page";

type Range = [number, number];

interface State {
  bouquets: IBouquet[];
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
  loading: boolean;
  error: string | null;
}

class BouquetDetailController extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      bouquets: [],
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 6,
      loading: true,
      error: null,
    };
  }

  componentDidMount() {
    fetch("http://localhost:4000/api/bouquets")
      .then((res) => res.json())
      .then((data: IBouquet[]) => {
        this.setState({ bouquets: data, loading: false });
      })
      .catch((err) => {
        console.error("Failed to fetch bouquets", err);
        this.setState({ error: "Failed to load bouquets.", loading: false });
      });
  }

  toggleFilter = (key: "selectedTypes" | "selectedSizes", value: string) => {
    const current = this.state[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    if (key === "selectedSizes") {
      const validSizes = ["Small", "Medium", "Large"];
      this.setState({
        selectedSizes: updated.filter((s) => validSizes.includes(s)),
        currentPage: 1,
      });
    } else {
      this.setState({
        selectedTypes: updated,
        currentPage: 1,
      });
    }
  };

  setSortBy = (value: string) => {
    this.setState({ sortBy: value, currentPage: 1 });
  };

  handlePriceRangeChange = (range: Range) => {
    this.setState({ priceRange: range, currentPage: 1 });
  };

  clearFilter = (key: "selectedTypes" | "selectedSizes") => {
    this.setState((prevState) => ({
      ...prevState,
      [key]: [],
      currentPage: 1,
    }));
  };

  getFilteredBouquets(): IBouquet[] {
    const { bouquets, priceRange, selectedTypes, selectedSizes } = this.state;
    const [min, max] = priceRange;

    return bouquets.filter((b: IBouquet) => {
      const matchPrice = b.price >= min && b.price <= max;
      const matchType =
        selectedTypes.length === 0 || selectedTypes.includes(b.type ?? "");
      const matchSize =
        selectedSizes.length === 0 || selectedSizes.includes(b.size ?? "");

      return matchPrice && matchType && matchSize;
    });
  }

  getSortedBouquets(bouquets: IBouquet[]): IBouquet[] {
    const { sortBy } = this.state;
    return [...bouquets].sort((a: IBouquet, b: IBouquet) => {
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
    const { currentPage, itemsPerPage, loading, error } = this.state;
    const filtered = this.getFilteredBouquets();
    const sorted = this.getSortedBouquets(filtered);

    return (
      <BouquetDetailView
        bouquets={sorted}
        priceRange={this.state.priceRange}
        selectedTypes={this.state.selectedTypes}
        selectedSizes={this.state.selectedSizes}
        sortBy={this.state.sortBy}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPriceChange={this.handlePriceRangeChange}
        onToggleFilter={this.toggleFilter}
        onClearFilter={this.clearFilter}
        onSortChange={this.setSortBy}
        onPageChange={(page) => this.setState({ currentPage: page })}
        loading={loading}
        error={error}
      />
    );
  }
}

export default BouquetDetailController;
