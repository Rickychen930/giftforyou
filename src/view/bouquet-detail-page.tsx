import React, { Component } from "react";
import "../styles/BouquetDetailPage.css";
import { IBouquet } from "../models/bouquet-model-real";
import FilterPanel from "../components/filter-panel-component";
import BouquetCard from "../components/bouquet-card-component";

interface Props {
  bouquets: IBouquet[];
  priceRange: [number, number];
  selectedTypes: string[];
  selectedSizes: string[];
  sortBy: string;
  currentPage: number;
  itemsPerPage: number;
  onPriceChange: (range: [number, number]) => void;
  onToggleFilter: (
    key: "selectedTypes" | "selectedSizes",
    value: string
  ) => void;
  onClearFilter: (key: "selectedTypes" | "selectedSizes") => void;
  onSortChange: (value: string) => void;
  onPageChange: (page: number) => void;

  loading?: boolean;
  error?: string | null;
}

class BouquetDetailView extends Component<Props> {
  renderPagination(): React.ReactNode {
    const totalPages = Math.ceil(
      this.props.bouquets.length / this.props.itemsPerPage
    );
    if (totalPages <= 1) return null;

    return (
      <div className="pagination">
        <button
          disabled={this.props.currentPage === 1}
          onClick={() => this.props.onPageChange(this.props.currentPage - 1)}
        >
          ‹ Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => this.props.onPageChange(i + 1)}
            className={this.props.currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={this.props.currentPage === totalPages}
          onClick={() => this.props.onPageChange(this.props.currentPage + 1)}
        >
          Next ›
        </button>
      </div>
    );
  }

  render(): React.ReactNode {
    const { bouquets, currentPage, itemsPerPage, loading, error } = this.props;

    if (loading) {
      return (
        <section className="bouquet-detail-page">
          <p className="loading">Loading bouquets…</p>
        </section>
      );
    }

    if (error) {
      return (
        <section className="bouquet-detail-page">
          <p className="error">{error}</p>
        </section>
      );
    }

    const start = (currentPage - 1) * itemsPerPage;
    const paginated = bouquets.slice(start, start + itemsPerPage);

    const allSizes: string[] = Array.from(
      new Set(bouquets.map((b) => b.size).filter((s): s is string => !!s))
    );

    return (
      <section className="bouquet-detail-page">
        <div className="bouquet-layout">
          <aside className="filter-panel-wrapper">
            <FilterPanel
              priceRange={this.props.priceRange}
              selectedTypes={this.props.selectedTypes}
              selectedSizes={this.props.selectedSizes}
              sortBy={this.props.sortBy}
              allSizes={allSizes}
              onPriceChange={this.props.onPriceChange}
              onToggleFilter={this.props.onToggleFilter}
              onClearFilter={this.props.onClearFilter}
              onSortChange={this.props.onSortChange}
            />
          </aside>
          <div className="bouquet-results">
            {paginated.length > 0 ? (
              paginated.map((b) => {
                const plain = {
                  _id: String(b._id),
                  name: b.name,
                  description: b.description,
                  price: b.price,
                  type: b.type,
                  size: b.size,
                  image: b.image,
                  status: b.status,
                  collectionName: b.collectionName,
                };
                return <BouquetCard key={plain._id} {...plain} />;
              })
            ) : (
              <p className="no-results">No bouquets found 🌸</p>
            )}
            {this.renderPagination()}
          </div>
        </div>
      </section>
    );
  }
}

export default BouquetDetailView;
