/**
 * Professional Search Input Component with Debouncing
 * Prevents excessive re-renders and provides better UX
 * Follows SOLID, DRY, MVP principles
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "../hooks/useDebounce";
import "../styles/CatalogSearchInput.css";

interface CatalogSearchInputProps {
  value: string;
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  minLength?: number;
  showSuggestions?: boolean;
  suggestions?: string[];
  disabled?: boolean;
  className?: string;
}

const CatalogSearchInput: React.FC<CatalogSearchInputProps> = ({
  value,
  placeholder = "Cari bouquet, koleksi, momen...",
  onSearch,
  onClear,
  debounceMs = 400,
  minLength = 2,
  showSuggestions = false,
  suggestions = [],
  disabled = false,
  className = "",
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(localValue, debounceMs);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger search when debounced value changes
  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed.length >= minLength || trimmed.length === 0) {
      onSearch(trimmed);
    }
  }, [debouncedValue, onSearch, minLength]);

  // Filter suggestions based on input
  const filteredSuggestions = React.useMemo(() => {
    if (!showSuggestions || localValue.trim().length < minLength) return [];
    const query = localValue.toLowerCase();
    return suggestions
      .filter((s) => s.toLowerCase().includes(query))
      .slice(0, 5);
  }, [suggestions, localValue, minLength, showSuggestions]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setShowSuggestionsList(newValue.trim().length >= minLength);
  }, [minLength]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    setShowSuggestionsList(false);
    inputRef.current?.focus();
    if (onClear) {
      onClear();
    } else {
      onSearch("");
    }
  }, [onClear, onSearch]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setLocalValue(suggestion);
    setShowSuggestionsList(false);
    onSearch(suggestion);
    inputRef.current?.blur();
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowSuggestionsList(false);
      inputRef.current?.blur();
    }
  }, []);

  const hasValue = localValue.trim().length > 0;
  const showClearButton = hasValue && !disabled;

  return (
    <div className={`catalogSearchInput ${className}`}>
      <div className="catalogSearchInput__wrapper">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          className="catalogSearchInput__icon"
          aria-hidden="true"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="catalogSearchInput__input"
          placeholder={placeholder}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredSuggestions.length > 0) {
              setShowSuggestionsList(true);
            }
          }}
          onBlur={() => {
            // Delay to allow suggestion click
            setTimeout(() => setShowSuggestionsList(false), 200);
          }}
          disabled={disabled}
          aria-label="Cari bouquet"
          aria-autocomplete="list"
          aria-controls={showSuggestionsList ? "search-suggestions" : undefined}
        />
        {showClearButton && (
          <button
            type="button"
            className="catalogSearchInput__clear"
            onClick={handleClear}
            aria-label="Hapus pencarian"
            tabIndex={0}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        {hasValue && localValue.trim().length < minLength && (
          <div className="catalogSearchInput__hint" aria-live="polite">
            Ketik minimal {minLength} karakter
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestionsList && filteredSuggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="catalogSearchInput__suggestions"
          role="listbox"
          aria-label="Saran pencarian"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              type="button"
              className="catalogSearchInput__suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
              role="option"
              aria-selected={false}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="catalogSearchInput__suggestionIcon"
                aria-hidden="true"
              >
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="catalogSearchInput__suggestionText">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogSearchInput;

