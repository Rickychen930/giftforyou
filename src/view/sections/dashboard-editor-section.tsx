import React, { Component } from "react";
import { IBouquet } from "../../models/bouquet-model-real";
import FilterPanel from "../../components/filter-panel-component";
import "../../styles/DashboardEditorSection.css";
import BouquetEditor from "../../components/bouquet-card-edit-component";

type Range = [number, number];

interface Props {
  bouquets: IBouquet[];
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean>;
}

interface State {
  search: string;
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
}

class BouquetManager {
  private bouquets: IBouquet[];

  constructor(bouquets: IBouquet[]) {
    this.bouquets = bouquets;
  }

  filter(
    search: string,
    priceRange: Range,
    selectedTypes: string[],
    selectedSizes: string[]
  ): IBouquet[] {
    const [min, max] = priceRange;
    return this.bouquets.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = b.price >= min && b.price <= max;
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(b.type ?? "");
      const matchesSize =
        selectedSizes.length === 0 || selectedSizes.includes(b.size ?? "");
      return matchesSearch && matchesPrice && matchesType && matchesSize;
    });
  }

  sort(bouquets: IBouquet[], sortBy: string): IBouquet[] {
    return [...bouquets].sort((a, b) => {
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

  paginate(
    bouquets: IBouquet[],
    currentPage: number,
    itemsPerPage: number
  ): IBouquet[] {
    const start = (currentPage - 1) * itemsPerPage;
    return bouquets.slice(start, start + itemsPerPage);
  }
}

class BouquetEditorSection extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      search: "",
      priceRange: [0, 1000000],
      selectedTypes: [],
      selectedSizes: [],
      sortBy: "",
      currentPage: 1,
      itemsPerPage: 4,
    };
  }

  handleSaveWithPopup = async (formData: FormData) => {
    try {
      const success = await this.props.onSave(formData);
      if (success) {
        alert("✅ Bouquet berhasil disimpan!");
      } else {
        alert("❌ Gagal menyimpan bouquet.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Terjadi error saat menyimpan bouquet.");
    }
  };

  renderPagination(totalItems: number): React.ReactNode {
    const totalPages = Math.ceil(totalItems / this.state.itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => this.setState({ currentPage: i + 1 })}
            className={this.state.currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  }

  render(): React.ReactNode {
    // const { bouquets, collections } = this.props;
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

    const manager = new BouquetManager(bouquets);

    const allSizes = Array.from(
      new Set(bouquets.map((b) => b.size).filter((s): s is string => !!s))
    );
    const allCollections = Array.from(
      new Set(
        bouquets.map((b) => b.collectionName).filter((c): c is string => !!c)
      )
    );

    const filtered = manager.filter(
      search,
      priceRange,
      selectedTypes,
      selectedSizes
    );
    const sorted = manager.sort(filtered, sortBy);
    const paginated = manager.paginate(sorted, currentPage, itemsPerPage);

    return (
      <div className="editor-list-wrapper">
        <div className="editor-controls">
          <FilterPanel
            priceRange={this.state.priceRange}
            selectedTypes={this.state.selectedTypes}
            selectedSizes={this.state.selectedSizes}
            sortBy={this.state.sortBy}
            allSizes={allSizes}
            onPriceChange={(range) =>
              this.setState({ priceRange: range, currentPage: 1 })
            }
            onToggleFilter={(key, value) =>
              this.setState((prev) => ({
                ...prev,
                [key]: prev[key].includes(value)
                  ? prev[key].filter((v) => v !== value)
                  : [...prev[key], value],
                currentPage: 1,
              }))
            }
            onClearFilter={(key) =>
              this.setState((prev) => ({ ...prev, [key]: [], currentPage: 1 }))
            }
            onSortChange={(value) =>
              this.setState({ sortBy: value, currentPage: 1 })
            }
          />
        </div>
        <input
          type="text"
          placeholder="Search by name..."
          value={this.state.search}
          onChange={(e) =>
            this.setState({ search: e.target.value, currentPage: 1 })
          }
          className="search-bar"
        />

        <div className="editor-header">
          <p>
            Showing {paginated.length} of {sorted.length} bouquets
          </p>
        </div>

        <div className="bouquet-list">
          {paginated.map((bouquet) => (
            <div key={String(bouquet._id)} className="bouquet-editor-wrapper">
              <BouquetEditor
                bouquet={bouquet}
                collections={allCollections}
                onSave={this.handleSaveWithPopup}
              />
            </div>
          ))}
        </div>

        {this.renderPagination(sorted.length)}
      </div>
    );
  }
}

export default BouquetEditorSection;
