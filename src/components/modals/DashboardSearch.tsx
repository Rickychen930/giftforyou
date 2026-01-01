/**
 * Dashboard Search Component (OOP)
 * Class-based component extending BaseModal
 */

import React, { Component, RefObject } from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/DashboardSearch.css";

interface SearchResult {
  id: string;
  type: "order" | "customer" | "bouquet" | "collection";
  title: string;
  subtitle?: string;
  onClick: () => void;
}

interface DashboardSearchProps extends Omit<BaseModalProps, "title" | "children"> {
  onResultClick: (result: SearchResult) => void;
}

interface DashboardSearchState extends BaseModalState {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  timeoutId: NodeJS.Timeout | null;
}

/**
 * Dashboard Search Component
 * Class-based component extending BaseModal
 */
class DashboardSearch extends BaseModal<DashboardSearchProps, DashboardSearchState> {
  protected baseClass: string = "dashboardSearch";
  private inputRef: RefObject<HTMLInputElement>;

  constructor(props: DashboardSearchProps) {
    super(props);
    this.state = {
      ...this.state,
      query: "",
      results: [],
      isLoading: false,
      timeoutId: null,
    };
    this.inputRef = React.createRef();
  }

  componentDidUpdate(prevProps: DashboardSearchProps): void {
    super.componentDidUpdate(prevProps);
    const prevQuery = (this as any).prevQuery || "";
    
    if (this.props.isOpen && !prevProps.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }

    if (this.state.query !== prevQuery) {
      (this as any).prevQuery = this.state.query;
      this.performSearch();
    }
  }

  componentDidMount(): void {
    super.componentDidMount();
    window.addEventListener("keydown", this.handleGlobalKeyDown);
  }

  componentWillUnmount(): void {
    super.componentWillUnmount();
    window.removeEventListener("keydown", this.handleGlobalKeyDown);
    if (this.state.timeoutId) {
      clearTimeout(this.state.timeoutId);
    }
  }

  private handleGlobalKeyDown = (e: KeyboardEvent): void => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      if (this.props.isOpen) {
        this.handleClose();
      }
    }
  };

  private handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ query: e.target.value });
  };

  private performSearch = (): void => {
    const { query } = this.state;

    if (!query.trim()) {
      this.setState({ results: [] });
      return;
    }

    this.setState({ isLoading: true });

    // Simulate search - replace with actual API calls
    const searchResults: SearchResult[] = [];
    // TODO: Implement actual search API calls

    const timeoutId = setTimeout(() => {
      this.setState({ results: searchResults, isLoading: false, timeoutId: null });
    }, 300);

    this.setState({ timeoutId });
  };

  private handleResultClick = (result: SearchResult): void => {
    this.props.onResultClick(result);
    this.handleClose();
  };

  private handleClearQuery = (): void => {
    this.setState({ query: "", results: [] });
  };

  private renderSearchIcon(): React.ReactNode {
    return (
      <svg
        className={`${this.baseClass}__icon`}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
    if (!query) return null;

    return (
      <button
        type="button"
        className={`${this.baseClass}__clear`}
        onClick={this.handleClearQuery}
        aria-label="Hapus pencarian"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  private renderResult(result: SearchResult): React.ReactNode {
    const getTypeIcon = (type: SearchResult["type"]): string => {
      switch (type) {
        case "order":
          return "📦";
        case "customer":
          return "👤";
        case "bouquet":
          return "🌸";
        case "collection":
          return "📚";
        default:
          return "📄";
      }
    };

    return (
      <button
        key={result.id}
        type="button"
        className={`${this.baseClass}__result`}
        onClick={() => this.handleResultClick(result)}
      >
        <span className={`${this.baseClass}__resultIcon ${this.baseClass}__resultIcon--${result.type}`}>
          {getTypeIcon(result.type)}
        </span>
        <div className={`${this.baseClass}__resultContent`}>
          <span className={`${this.baseClass}__resultTitle`}>{result.title}</span>
          {result.subtitle && (
            <span className={`${this.baseClass}__resultSubtitle`}>{result.subtitle}</span>
          )}
        </div>
      </button>
    );
  }

  protected renderHeader(): React.ReactNode {
    const { query } = this.state;

    return (
      <div className={`${this.baseClass}__header`}>
        <div className={`${this.baseClass}__inputWrapper`}>
          {this.renderSearchIcon()}
          <input
            ref={this.inputRef}
            type="text"
            className={`${this.baseClass}__input`}
            placeholder="Cari orders, customers, bouquets..."
            value={query}
            onChange={this.handleQueryChange}
            autoComplete="off"
          />
          {this.renderClearButton()}
        </div>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup pencarian"
        >
          ESC
        </button>
      </div>
    );
  }

  protected renderBody(): React.ReactNode {
    const { query, results, isLoading } = this.state;

    if (isLoading) {
      return (
        <div className={`${this.baseClass}__results`}>
          <div className={`${this.baseClass}__loading`}>
            <svg
              className={`${this.baseClass}__spinner`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                opacity="0.3"
              >
                <animate
                  attributeName="stroke-dasharray"
                  dur="2s"
                  values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-dashoffset"
                  dur="2s"
                  values="0;-15.708;-31.416;-31.416"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
            <span>Mencari...</span>
          </div>
        </div>
      );
    }

    if (results.length > 0) {
      return (
        <div className={`${this.baseClass}__results`}>
          <div className={`${this.baseClass}__resultsList`}>
            {results.map((result) => this.renderResult(result))}
          </div>
        </div>
      );
    }

    if (query) {
      return (
        <div className={`${this.baseClass}__results`}>
          <div className={`${this.baseClass}__empty`}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
              <path
                d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p>Tidak ada hasil untuk "{query}"</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`${this.baseClass}__results`}>
        <div className={`${this.baseClass}__empty`}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" opacity="0.3">
            <path
              d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Mulai mengetik untuk mencari...</p>
          <div className={`${this.baseClass}__hints`}>
            <span>💡 Tips: Gunakan Ctrl+K untuk membuka pencarian</span>
          </div>
        </div>
      </div>
    );
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer needed
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isVisible } = this.state;

    if (!isOpen && !isVisible) return null;

    return (
      <>
        <div
          className="dashboardSearchOverlay"
          onClick={this.handleOverlayClick}
          aria-hidden="true"
        />
        <div className={this.baseClass}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </>
    );
  }
}

export default DashboardSearch;

