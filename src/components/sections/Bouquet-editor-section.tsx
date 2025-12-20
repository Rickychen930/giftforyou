import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import FilterPanel from "../filter-panel-component";
import "../../styles/DashboardEditorSection.css";
import BouquetEditor from "../bouquet-card-edit-component";

type Range = [number, number];
type SortBy = "" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface Props {
  bouquets: Bouquet[];
  collections: string[]; // provided from backend metrics (recommended)
  onSave: (formData: FormData) => Promise<boolean>;
}

interface State {
  search: string;
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: SortBy;
  currentPage: number;
  itemsPerPage: number;
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

function filterBouquets(
  bouquets: Bouquet[],
  search: string,
  priceRange: Range,
  selectedTypes: string[],
  selectedSizes: string[]
): Bouquet[] {
  const [min, max] = priceRange;
  const q = search.trim().toLowerCase();

  return bouquets.filter((b) => {
    const matchSearch = q.length === 0 || b.name.toLowerCase().includes(q);
    const matchPrice = b.price >= min && b.price <= max;

    // ✅ FIX: ensure we pass "string" to includes()
    const typeValue = b.type ?? "";
    const sizeValue = b.size ?? "";

    const matchType =
      selectedTypes.length === 0 || selectedTypes.includes(typeValue);
    const matchSize =
      selectedSizes.length === 0 || selectedSizes.includes(sizeValue);

    return matchSearch && matchPrice && matchType && matchSize;
  });
}

function sortBouquets(list: Bouquet[], sortBy: SortBy): Bouquet[] {
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

function paginate(list: Bouquet[], page: number, perPage: number): Bouquet[] {
  const start = (page - 1) * perPage;
  return list.slice(start, start + perPage);
}

class BouquetEditorSection extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      search: "",
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 6,
    };
  }

  private handleSaveWithPopup = async (
    formData: FormData
  ): Promise<boolean> => {
    const ok = await this.props.onSave(formData);
    alert(ok ? "✅ Saved successfully!" : "❌ Failed to save bouquet.");
    return ok;
  };

  private setSearch = (value: string) => {
    this.setState({ search: value, currentPage: 1 });
  };

  private setSortBy = (value: SortBy) => {
    this.setState({ sortBy: value, currentPage: 1 });
  };

  private setPriceRange = (range: Range) => {
    this.setState({ priceRange: range, currentPage: 1 });
  };

  private toggleType = (value: string) => {
    this.setState((prev) => {
      const selectedTypes = prev.selectedTypes.includes(value)
        ? prev.selectedTypes.filter((v) => v !== value)
        : [...prev.selectedTypes, value];
      return { selectedTypes, currentPage: 1 };
    });
  };

  private toggleSize = (value: string) => {
    this.setState((prev) => {
      const selectedSizes = prev.selectedSizes.includes(value)
        ? prev.selectedSizes.filter((v) => v !== value)
        : [...prev.selectedSizes, value];
      return { selectedSizes, currentPage: 1 };
    });
  };

  private clearTypes = () =>
    this.setState({ selectedTypes: [], currentPage: 1 });
  private clearSizes = () =>
    this.setState({ selectedSizes: [], currentPage: 1 });

  private clearAll = () => {
    this.setState({
      search: "",
      priceRange: [0, 1_000_000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
    });
  };

  private renderPagination(totalItems: number): React.ReactNode {
    const { itemsPerPage, currentPage } = this.state;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="editorPagination">
        <button
          type="button"
          className="editorPagination__btn"
          disabled={currentPage === 1}
          onClick={() => this.setState({ currentPage: currentPage - 1 })}
        >
          Prev
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const page = i + 1;
          return (
            <button
              type="button"
              key={page}
              className={`editorPagination__page ${
                currentPage === page ? "is-active" : ""
              }`}
              onClick={() => this.setState({ currentPage: page })}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          className="editorPagination__btn"
          disabled={currentPage === totalPages}
          onClick={() => this.setState({ currentPage: currentPage + 1 })}
        >
          Next
        </button>
      </div>
    );
  }

  render(): React.ReactNode {
    const { bouquets } = this.props;
    const {
      search,
      priceRange,
      selectedTypes,
      selectedSizes,
      sortBy,
      currentPage,
      itemsPerPage,
    } = this.state;

    const allTypes: string[] = Array.from(
      new Set(bouquets.map((b) => b.type).filter(isNonEmptyString))
    );
    const allSizes: string[] = Array.from(
      new Set(bouquets.map((b) => b.size).filter(isNonEmptyString))
    );

    // prefer backend collections list; fallback to derived
    const collections: string[] =
      this.props.collections?.length > 0
        ? this.props.collections
        : Array.from(
            new Set(
              bouquets.map((b) => b.collectionName).filter(isNonEmptyString)
            )
          );

    const filtered = filterBouquets(
      bouquets,
      search,
      priceRange,
      selectedTypes,
      selectedSizes
    );
    const sorted = sortBouquets(filtered, sortBy);
    const paginated = paginate(sorted, currentPage, itemsPerPage);

    return (
      <section className="editorSection">
        <header className="editorHeader">
          <div>
            <h2 className="editorTitle">Edit Bouquets</h2>
            <p className="editorSubtitle">
              Search, filter, and edit bouquets. Changes are saved to the store
              database.
            </p>
          </div>

          <button
            type="button"
            className="editorClearAll"
            onClick={this.clearAll}
          >
            Clear All
          </button>
        </header>

        <div className="editorTopBar">
          <input
            type="text"
            className="editorSearch"
            placeholder="Search by bouquet name..."
            value={search}
            onChange={(e) => this.setSearch(e.target.value)}
          />

          <div className="editorCount">
            Showing <b>{paginated.length}</b> of <b>{sorted.length}</b>
          </div>
        </div>

        <div className="editorLayout">
          <aside className="editorFilters">
            <FilterPanel
              priceRange={priceRange}
              selectedTypes={selectedTypes}
              selectedSizes={selectedSizes}
              sortBy={sortBy}
              allTypes={allTypes}
              allSizes={allSizes}
              onPriceChange={this.setPriceRange}
              onToggleFilter={(key, value) =>
                key === "selectedTypes"
                  ? this.toggleType(value)
                  : this.toggleSize(value)
              }
              onClearFilter={(key) =>
                key === "selectedTypes" ? this.clearTypes() : this.clearSizes()
              }
              onSortChange={(v) => this.setSortBy(v as SortBy)}
            />
          </aside>

          <div className="editorGrid">
            {paginated.map((bouquet) => (
              <BouquetEditor
                key={bouquet._id}
                bouquet={bouquet}
                collections={collections}
                onSave={this.handleSaveWithPopup}
              />
            ))}
          </div>
        </div>

        {this.renderPagination(sorted.length)}
      </section>
    );
  }
}

export default BouquetEditorSection;
