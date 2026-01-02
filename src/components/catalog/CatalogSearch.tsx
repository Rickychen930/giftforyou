/**
 * Catalog Search Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, FormEvent } from "react";
import "../../styles/catalog/CatalogSearch.css";
import { SearchIcon } from "../icons/UIIcons";
import { CloseIcon } from "../icons/UIIcons";

export interface CatalogSearchProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  disabled?: boolean;
}

interface CatalogSearchState {
  query: string;
}

/**
 * Catalog Search Component
 * Class-based component for catalog search
 */
class CatalogSearch extends Component<CatalogSearchProps, CatalogSearchState> {
  private baseClass: string = "catalog-search";
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(props: CatalogSearchProps) {
    super(props);
    this.state = {
      query: props.value || "",
    };
  }

  componentDidUpdate(prevProps: CatalogSearchProps): void {
    if (this.props.value !== prevProps.value) {
      this.setState({ query: this.props.value || "" });
    }
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newQuery = e.target.value;
    this.setState({ query: newQuery });
    
    // Real-time search with debounce for better UX
    if (this.props.onSearch) {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        if (this.props.onSearch) {
          this.props.onSearch(newQuery.trim());
        }
      }, 300); // 300ms debounce
    }
  };

  componentWillUnmount(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = (formData.get("q") as string)?.trim() || "";

    if (this.props.onSearch) {
      this.props.onSearch(searchQuery);
    } else {
      // Fallback: update URL directly
      const params = new URLSearchParams(window.location.search);
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      window.location.search = params.toString() ? `?${params.toString()}` : "";
    }
  };

  private handleClear = (): void => {
    this.setState({ query: "" });
    if (this.props.onClear) {
      this.props.onClear();
    }
  };

  render(): React.ReactNode {
    const { placeholder = "Cari bouquet, koleksi, momen...", disabled = false } = this.props;
    const { query } = this.state;

    return (
      <div className={this.baseClass}>
        <form className={`${this.baseClass}__form`} onSubmit={this.handleSubmit}>
          <div className={`${this.baseClass}__wrapper`}>
            <SearchIcon className={`${this.baseClass}__icon`} width={20} height={20} />
            <input
              type="search"
              name="q"
              className={`${this.baseClass}__input`}
              placeholder={placeholder}
              value={query}
              onChange={this.handleInputChange}
              aria-label="Cari bouquet"
              disabled={disabled}
            />
            {query && (
              <button
                type="button"
                className={`${this.baseClass}__clear`}
                onClick={this.handleClear}
                aria-label="Hapus pencarian"
                disabled={disabled}
              >
                <CloseIcon width={16} height={16} />
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }
}

export default CatalogSearch;
