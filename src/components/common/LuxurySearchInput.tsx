/**
 * Luxury Search Input Component (OOP)
 * Reusable search input component with luxury styling
 * Similar to catalog-search but can be used anywhere
 * Follows SOLID principles
 */

import React, { Component, FormEvent } from "react";
import "../../styles/common/LuxurySearchInput.css";

export interface LuxurySearchInputProps {
  value?: string;
  placeholder?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

interface LuxurySearchInputState {
  query: string;
  isFocused: boolean;
}

/**
 * Luxury Search Input Component
 * Reusable search input with luxury styling similar to catalog-search
 */
class LuxurySearchInput extends Component<LuxurySearchInputProps, LuxurySearchInputState> {
  private baseClass: string = "luxurySearchInput";
  private searchTimeout?: ReturnType<typeof setTimeout>;

  constructor(props: LuxurySearchInputProps) {
    super(props);
    this.state = {
      query: props.value || "",
      isFocused: false,
    };
  }

  componentDidUpdate(prevProps: LuxurySearchInputProps): void {
    if (this.props.value !== prevProps.value && this.props.value !== undefined) {
      this.setState({ query: this.props.value });
    }
  }

  componentWillUnmount(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newQuery = e.target.value;
    this.setState({ query: newQuery });
    
    // Call onSearchChange immediately for controlled components
    if (this.props.onSearchChange) {
      this.props.onSearchChange(newQuery);
    }
    
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

  private handleFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    this.setState({ isFocused: true });
  };

  private handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    this.setState({ isFocused: false });
  };

  private handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const { query } = this.state;
    const trimmedQuery = query.trim();

    if (this.props.onSearch) {
      this.props.onSearch(trimmedQuery);
    } else if (this.props.onSearchChange) {
      this.props.onSearchChange(trimmedQuery);
    }
  };

  private handleClear = (): void => {
    this.setState({ query: "" });
    if (this.props.onClear) {
      this.props.onClear();
    }
    if (this.props.onSearchChange) {
      this.props.onSearchChange("");
    }
    if (this.props.onSearch) {
      this.props.onSearch("");
    }
  };

  private renderSearchIcon(): React.ReactNode {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${this.baseClass}__icon`}
        aria-hidden="true"
      >
        <path
          d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  private renderClearButton(): React.ReactNode {
    const { query } = this.state;
    const { disabled } = this.props;

    if (!query) return null;

    return (
      <button
        type="button"
        className={`${this.baseClass}__clear`}
        onClick={this.handleClear}
        aria-label="Hapus pencarian"
        disabled={disabled}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }

  render(): React.ReactNode {
    const { 
      placeholder = "Cari...", 
      disabled = false,
      className = "",
      id,
      name = "q"
    } = this.props;
    const { query, isFocused } = this.state;
    const wrapperClasses = `${this.baseClass} ${isFocused ? `${this.baseClass}--focused` : ""} ${className}`.trim();

    return (
      <div className={wrapperClasses}>
        <form className={`${this.baseClass}__form`} onSubmit={this.handleSubmit}>
          <div className={`${this.baseClass}__wrapper`}>
            {this.renderSearchIcon()}
            <input
              type="search"
              name={name}
              id={id}
              className={`${this.baseClass}__input`}
              placeholder={placeholder}
              value={query}
              onChange={this.handleInputChange}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              aria-label={placeholder}
              disabled={disabled}
            />
            {this.renderClearButton()}
          </div>
        </form>
      </div>
    );
  }
}

export default LuxurySearchInput;

