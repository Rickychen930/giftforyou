/**
 * Search Modal Component
 * Reusable search modal with suggestions
 * Following SOLID, DRY principles
 */

import React, { useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SearchIcon, CloseIcon } from "../icons/UIIcons";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";
import "../../styles/Header.css";

interface SearchModalProps {
  isOpen: boolean;
  query: string;
  collectionNames: string[];
  onClose: () => void;
  onQueryChange: (query: string) => void;
  onSearch: (term: string) => void;
  searchRef: React.RefObject<HTMLInputElement>;
  searchModalRef: React.RefObject<HTMLDivElement>;
}

/**
 * Search Modal Component
 * Displays search overlay with input and suggestions
 */
export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  query,
  collectionNames,
  onClose,
  onQueryChange,
  onSearch,
  searchRef,
  searchModalRef,
}) => {
  const navigate = useNavigate();

  // Memoize suggestions to prevent unnecessary recalculations
  // IMPORTANT: Hooks must be called before any early returns
  const collectionSuggestions = useMemo(
    () => (collectionNames.length > 0 ? collectionNames : Array.from(COLLECTION_SUGGESTIONS)),
    [collectionNames]
  );

  const handleSearch = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("q") as HTMLInputElement;
    const term = input?.value?.trim() || "";
    
    // Enhanced: Validate and sanitize search term
    if (term.length > 0) {
      // Prevent XSS by encoding
      const sanitized = term.substring(0, 200); // Limit length
      navigate(`/search?q=${encodeURIComponent(sanitized)}`);
    } else {
      navigate("/search");
    }
    onSearch(term);
  }, [navigate, onSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    onQueryChange(suggestion);
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      if (searchRef.current) {
        searchRef.current.focus();
        searchRef.current.setSelectionRange(
          searchRef.current.value.length,
          searchRef.current.value.length
        );
      }
    });
  }, [onQueryChange, searchRef]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchRef]);

  if (!isOpen) return null;

  return (
    <div
      className="search-overlay"
      onClick={onClose}
      aria-hidden="true"
    >
      <div
        className="search-modal"
        onClick={(e) => e.stopPropagation()}
        ref={searchModalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian"
        id="search-modal"
      >
        <button
          className="search-close"
          onClick={onClose}
          type="button"
          aria-label="Tutup pencarian"
        >
          <CloseIcon />
        </button>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <SearchIcon className="search-icon" width={24} height={24} />
            <input
              ref={searchRef}
              id="search-modal-input"
              name="q"
              list="search-suggestions"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              className="search-input"
              placeholder="Cari bouquet, koleksi, momen..."
              aria-label="Cari"
            />
            <datalist id="search-suggestions">
              {collectionSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <button type="submit" className="search-submit">
            Cari
          </button>
        </form>
        <div className="search-suggestions">
          <p className="suggestions-title">Pencarian Populer</p>
          <div className="suggestions-tags">
            {collectionSuggestions.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion-tag"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

