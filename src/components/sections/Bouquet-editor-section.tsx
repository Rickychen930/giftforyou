import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import FilterPanel from "../filter-panel-component";
import "../../styles/BouquetEditor.css";
import BouquetEditor from "../bouquet-card-edit-component";
import { getBouquetSizeFilterOptions } from "../../constants/bouquet-constants";

type Range = [number, number];
type SortBy = "" | "price-asc" | "price-desc" | "name-asc" | "name-desc";

interface Props {
  bouquets: Bouquet[];
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean>;
}

interface State {
  search: string;
  priceRange: Range;
  selectedTypes: string[];
  selectedSizes: string[];
  selectedCollections: string[];
  sortBy: SortBy;
  currentPage: number;
  itemsPerPage: number;
}

const DEFAULT_PRICE: Range = [0, 1_000_000];

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0;

const uniq = (arr: string[]) => Array.from(new Set(arr));

function filterBouquets(
  bouquets: Bouquet[],
  search: string,
  priceRange: Range,
  selectedTypes: string[],
  selectedSizes: string[],
  selectedCollections: string[]
): Bouquet[] {
  const [min, max] = priceRange;
  const q = search.trim().toLowerCase();

  return bouquets.filter((b) => {
    const name = (b.name ?? "").toLowerCase();
    const typeValue = (b.type ?? "").trim();
    const sizeValue = (b.size ?? "").trim();
    const collectionValue = (b.collectionName ?? "").trim();

    const matchSearch = q.length === 0 || name.includes(q);
    const matchPrice = b.price >= min && b.price <= max;
    const matchType =
      selectedTypes.length === 0 || selectedTypes.includes(typeValue);
    const matchSize =
      selectedSizes.length === 0 || selectedSizes.includes(sizeValue);
    const matchCollection =
      selectedCollections.length === 0 ||
      selectedCollections.includes(collectionValue);

    return matchSearch && matchPrice && matchType && matchSize && matchCollection;
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

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

export default class BouquetEditorSection extends Component<Props, State> {
  state: State = {
    search: "",
    priceRange: DEFAULT_PRICE,
    selectedTypes: [],
    selectedSizes: [],
    selectedCollections: [],
    sortBy: "",
    currentPage: 1,
    itemsPerPage: 9,
  };

  private handleSaveWithPopup = async (
    formData: FormData
  ): Promise<boolean> => {
    const ok = await this.props.onSave(formData);
    alert(ok ? "✅ Berhasil disimpan!" : "❌ Gagal menyimpan bouquet.");
    return ok;
  };

  private setSearch = (search: string) =>
    this.setState({ search, currentPage: 1 });
  private setSortBy = (sortBy: SortBy) =>
    this.setState({ sortBy, currentPage: 1 });
  private setPriceRange = (priceRange: Range) =>
    this.setState({ priceRange, currentPage: 1 });

  // ✅ Strongly typed handlers (no computed keys, no Partial<>)
  private toggleType = (value: string) => {
    this.setState((prev) => ({
      selectedTypes: toggleInList(prev.selectedTypes, value),
      currentPage: 1,
    }));
  };

  private toggleSize = (value: string) => {
    this.setState((prev) => ({
      selectedSizes: toggleInList(prev.selectedSizes, value),
      currentPage: 1,
    }));
  };

  private toggleCollection = (value: string) => {
    this.setState((prev) => ({
      selectedCollections: toggleInList(prev.selectedCollections, value),
      currentPage: 1,
    }));
  };

  private clearTypes = () =>
    this.setState({ selectedTypes: [], currentPage: 1 });
  private clearSizes = () =>
    this.setState({ selectedSizes: [], currentPage: 1 });
  private clearCollections = () =>
    this.setState({ selectedCollections: [], currentPage: 1 });

  private resetAll = () => {
    this.setState({
      search: "",
      priceRange: DEFAULT_PRICE,
      selectedTypes: [],
      selectedSizes: [],
      selectedCollections: [],
      sortBy: "",
      currentPage: 1,
    });
  };

  private renderPagination(totalItems: number): React.ReactNode {
    const { itemsPerPage, currentPage } = this.state;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, start + 6);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <nav className="editorPagination" aria-label="Paginasi">
        <button
          type="button"
          className="editorPagination__btn"
          disabled={currentPage === 1}
          onClick={() => this.setState({ currentPage: currentPage - 1 })}
        >
          Sebelumnya
        </button>

        {pages.map((p) => (
          <button
            type="button"
            key={p}
            className={`editorPagination__page ${
              currentPage === p ? "is-active" : ""
            }`}
            onClick={() => this.setState({ currentPage: p })}
            aria-current={currentPage === p ? "page" : undefined} // ✅ correct
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="editorPagination__btn"
          disabled={currentPage === totalPages}
          onClick={() => this.setState({ currentPage: currentPage + 1 })}
        >
          Berikutnya
        </button>
      </nav>
    );
  }

  render(): React.ReactNode {
    const bouquets = this.props.bouquets ?? [];
    const {
      search,
      priceRange,
      selectedTypes,
      selectedSizes,
      selectedCollections,
      sortBy,
      currentPage,
      itemsPerPage,
    } = this.state;

    const allTypes = uniq(
      bouquets.map((b) => b.type).filter(isNonEmptyString)
    ).sort();
    const allSizes = getBouquetSizeFilterOptions(bouquets.map((b) => b.size));

    const collections =
      this.props.collections?.length > 0
        ? this.props.collections
        : uniq(
            bouquets.map((b) => b.collectionName).filter(isNonEmptyString)
          ).sort();

    const filtered = filterBouquets(
      bouquets,
      search,
      priceRange,
      selectedTypes,
      selectedSizes,
      selectedCollections
    );
    const sorted = sortBouquets(filtered, sortBy);
    const paginated = paginate(sorted, currentPage, itemsPerPage);

    const isDefaultFilters =
      search.trim() === "" &&
      sortBy === "" &&
      selectedTypes.length === 0 &&
      selectedSizes.length === 0 &&
      selectedCollections.length === 0 &&
      priceRange[0] === DEFAULT_PRICE[0] &&
      priceRange[1] === DEFAULT_PRICE[1];

    return (
      <section className="editorSection" aria-label="Bagian editor bouquet">
        <header className="editorHeader">
          <div className="editorHeader__text">
            <h2 className="editorTitle">Edit Bouquet</h2>
            <p className="editorSubtitle">
              Cari, filter, dan edit bouquet. Tersimpan ke database.
            </p>
          </div>

          <div className="editorHeader__actions">
            <button
              type="button"
              className="editorClearAll"
              onClick={this.resetAll}
              disabled={isDefaultFilters}
              title="Reset filter"
            >
              Reset
            </button>
          </div>
        </header>

        <div className="editorTools">
          <div className="editorSearchWrap">
            <input
              type="text"
              className="editorSearch"
              placeholder="Cari bouquet…"
              value={search}
              onChange={(e) => this.setSearch(e.target.value)}
            />
            {search.trim() && (
              <button
                type="button"
                className="editorSearchClear"
                onClick={() => this.setSearch("")}
              >
                Hapus
              </button>
            )}
          </div>

          <div className="editorStats" aria-label="Ringkasan hasil">
            <span className="editorStats__pill">
              Menampilkan <b>{paginated.length}</b> / <b>{sorted.length}</b>
            </span>
            <span className="editorStats__pill">
              Total: <b>{bouquets.length}</b>
            </span>
          </div>
        </div>

        <div className="editorLayout">
          <div className="editorFiltersTop" aria-label="Filter">
            <details className="editorFiltersMobile">
              <summary className="editorFiltersSummary">Filter & Urutkan</summary>

              <div className="editorFiltersBody">
                <FilterPanel
                  embedded
                  hideHeader
                  priceRange={priceRange}
                  selectedTypes={selectedTypes}
                  selectedSizes={selectedSizes}
                  selectedCollections={selectedCollections}
                  sortBy={sortBy}
                  allTypes={allTypes}
                  allSizes={allSizes}
                  allCollections={collections}
                  onPriceChange={this.setPriceRange}
                  onToggleFilter={(key, value) =>
                    key === "selectedTypes"
                      ? this.toggleType(value)
                      : key === "selectedCollections"
                        ? this.toggleCollection(value)
                        : this.toggleSize(value)
                  }
                  onClearFilter={(key) =>
                    key === "selectedTypes"
                      ? this.clearTypes()
                      : key === "selectedCollections"
                        ? this.clearCollections()
                        : this.clearSizes()
                  }
                  onSortChange={(v) => this.setSortBy(v as SortBy)}
                />
              </div>
            </details>

            <div className="editorFiltersDesktop">
              <div className="editorFiltersPanel">
                <FilterPanel
                  embedded
                  hideHeader
                  variant="topbar"
                  priceRange={priceRange}
                  selectedTypes={selectedTypes}
                  selectedSizes={selectedSizes}
                  selectedCollections={selectedCollections}
                  sortBy={sortBy}
                  allTypes={allTypes}
                  allSizes={allSizes}
                  allCollections={collections}
                  onPriceChange={this.setPriceRange}
                  onToggleFilter={(key, value) =>
                    key === "selectedTypes"
                      ? this.toggleType(value)
                      : key === "selectedCollections"
                        ? this.toggleCollection(value)
                        : this.toggleSize(value)
                  }
                  onClearFilter={(key) =>
                    key === "selectedTypes"
                      ? this.clearTypes()
                      : key === "selectedCollections"
                        ? this.clearCollections()
                        : this.clearSizes()
                  }
                  onSortChange={(v) => this.setSortBy(v as SortBy)}
                />
              </div>
            </div>
          </div>

          <div className="editorGridWrap">
            {paginated.length === 0 ? (
              <div className="editorEmpty" role="status">
                <h3>Tidak ada hasil</h3>
                <p>Coba ubah filter atau kata kunci pencarian.</p>
                <button
                  type="button"
                  className="editorEmpty__btn"
                  onClick={this.resetAll}
                >
                  Reset filter
                </button>
              </div>
            ) : (
              <div className="editorGrid" aria-label="Grid editor bouquet">
                {paginated.map((bouquet) => (
                  <BouquetEditor
                    key={bouquet._id}
                    bouquet={bouquet}
                    collections={collections}
                    onSave={this.handleSaveWithPopup}
                  />
                ))}
              </div>
            )}

            {this.renderPagination(sorted.length)}
          </div>
        </div>
      </section>
    );
  }
}
