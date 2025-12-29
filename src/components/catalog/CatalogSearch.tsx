import React, { useState, FormEvent } from "react";
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

const CatalogSearch: React.FC<CatalogSearchProps> = ({
  value = "",
  placeholder = "Cari bouquet, koleksi, momen...",
  onSearch,
  onClear,
  disabled = false,
}) => {
  const [query, setQuery] = useState(value);

  React.useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = (formData.get("q") as string)?.trim() || "";
    if (onSearch) {
      onSearch(searchQuery);
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

  const handleClear = () => {
    setQuery("");
    onClear?.();
  };

  return (
    <div className="catalog-search">
      <form className="catalog-search__form" onSubmit={handleSubmit}>
        <div className="catalog-search__wrapper">
          <SearchIcon className="catalog-search__icon" width={20} height={20} />
          <input
            type="search"
            name="q"
            className="catalog-search__input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Cari bouquet"
            disabled={disabled}
          />
          {query && (
            <button
              type="button"
              className="catalog-search__clear"
              onClick={handleClear}
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
};

export default CatalogSearch;

