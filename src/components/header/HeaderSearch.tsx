/**
 * Header Search Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject, FormEvent } from "react";
import { withRouter, type WithRouterProps } from "../../utils/withRouter";
import "../../styles/header/HeaderSearch.css";
import { SearchIcon, CloseIcon } from "../icons/UIIcons";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";

export interface HeaderSearchProps {
  isOpen: boolean;
  onClose: (opts?: { returnFocus?: boolean }) => void;
  searchButtonRef?: React.RefObject<HTMLButtonElement>;
  collectionSuggestions?: string[];
}

interface HeaderSearchState {
  query: string;
}

/**
 * Header Search Component
 * Class-based component for header search modal
 */
class HeaderSearch extends Component<HeaderSearchProps & WithRouterProps, HeaderSearchState> {
  private baseClass: string = "header-search";
  private searchRef: RefObject<HTMLInputElement>;
  private searchModalRef: RefObject<HTMLDivElement>;

  constructor(props: HeaderSearchProps & WithRouterProps) {
    super(props);
    this.state = {
      query: "",
    };
    this.searchRef = React.createRef();
    this.searchModalRef = React.createRef();
  }

  componentDidMount(): void {
    if (this.props.isOpen && this.searchRef.current) {
      this.searchRef.current.focus();
    }
  }

  componentDidUpdate(prevProps: HeaderSearchProps): void {
    if (this.props.isOpen && !prevProps.isOpen && this.searchRef.current) {
      this.searchRef.current.focus();
    }

    if (this.props.isOpen) {
      this.setupFocusTrap();
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener("keydown", this.handleFocusTrap);
  }

  private setupFocusTrap = (): void => {
    window.addEventListener("keydown", this.handleFocusTrap);
  };

  private handleFocusTrap = (e: KeyboardEvent): void => {
    if (e.key !== "Tab" || !this.props.isOpen) return;

    const root = this.searchModalRef.current;
    if (!root) return;

    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (!active || active === last || !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  private handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.setState({ query: e.target.value });
  };

  private handleSearch = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const term = (
      e.currentTarget.elements.namedItem("q") as HTMLInputElement
    )?.value?.trim();

    if (term) {
      this.props.navigate(`/search?q=${encodeURIComponent(term)}`, { replace: false });
    } else {
      this.props.navigate("/search", { replace: false });
    }

    this.setState({ query: "" });
    this.props.onClose();
    setTimeout(() => this.props.searchButtonRef?.current?.focus(), 100);
  };

  private handleSuggestionClick = (suggestion: string): void => {
    this.setState({ query: suggestion });
    setTimeout(() => {
      if (this.searchRef.current) {
        this.searchRef.current.focus();
        this.searchRef.current.setSelectionRange(
          this.searchRef.current.value.length,
          this.searchRef.current.value.length
        );
      }
    }, 0);
  };

  private handleOverlayClick = (): void => {
    this.props.onClose({ returnFocus: true });
  };

  private handleClose = (): void => {
    this.props.onClose({ returnFocus: true });
  };

  render(): React.ReactNode {
    const { isOpen, collectionSuggestions = Array.from(COLLECTION_SUGGESTIONS) } = this.props;
    const { query } = this.state;

    if (!isOpen) return null;

    return (
      <div
        className={`${this.baseClass}__overlay`}
        onClick={this.handleOverlayClick}
      >
        <div
          className={`${this.baseClass}__modal`}
          onClick={(e) => e.stopPropagation()}
          ref={this.searchModalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian"
          id="search-modal"
        >
          <button
            className={`${this.baseClass}__close`}
            onClick={this.handleClose}
            type="button"
            aria-label="Tutup pencarian"
          >
            <CloseIcon />
          </button>
          <form onSubmit={this.handleSearch} className={`${this.baseClass}__form`}>
            <div className={`${this.baseClass}__input-wrapper`}>
              <SearchIcon className={`${this.baseClass}__icon`} width={24} height={24} />
              <input
                ref={this.searchRef}
                name="q"
                list="search-suggestions"
                value={query}
                onChange={this.handleQueryChange}
                className={`${this.baseClass}__input`}
                placeholder="Cari bouquet, koleksi, momen..."
                aria-label="Cari"
              />
              <datalist id="search-suggestions">
                {collectionSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <button type="submit" className={`${this.baseClass}__submit`}>
              Cari
            </button>
          </form>
          <div className={`${this.baseClass}__suggestions`}>
            <p className={`${this.baseClass}__suggestions-title`}>Pencarian Populer</p>
            <div className={`${this.baseClass}__suggestions-tags`}>
              {collectionSuggestions.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${this.baseClass}__suggestion-tag`}
                  onClick={() => this.handleSuggestionClick(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(HeaderSearch);
