/**
 * Header Search Component (OOP)
 * Class-based component following SOLID, CLEAN CODE principles
 * 
 * SOLID Principles:
 * - Single Responsibility: Handles search UI and interactions only
 * - Open/Closed: Extensible via props, closed for modification
 * - Liskov Substitution: Can be replaced with other search implementations
 * - Interface Segregation: Clean, focused props interface
 * - Dependency Inversion: Depends on abstractions (props), not concrete implementations
 * 
 * CLEAN CODE:
 * - Meaningful names
 * - Small, focused methods
 * - No duplication (DRY)
 * - Clear structure
 */

import React, { Component, RefObject, FormEvent } from "react";
import { withRouter, type WithRouterProps } from "../../utils/withRouter";
import "../../styles/header/HeaderSearch.css";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";

export interface HeaderSearchProps {
  isOpen: boolean;
  onClose: (opts?: { returnFocus?: boolean }) => void;
  searchButtonRef?: React.RefObject<HTMLButtonElement>;
  collectionSuggestions?: string[];
}

interface HeaderSearchState {
  query: string;
  isMobile: boolean;
}

/**
 * Header Search Component
 * Luxury, responsive search modal matching header design
 */
class HeaderSearch extends Component<HeaderSearchProps & WithRouterProps, HeaderSearchState> {
  private readonly baseClass: string = "header-search";
  private readonly inputRef: RefObject<HTMLInputElement>;
  private readonly modalRef: RefObject<HTMLDivElement>;
  private resizeHandler?: () => void;

  constructor(props: HeaderSearchProps & WithRouterProps) {
    super(props);
    this.state = {
      query: "",
      isMobile: this.isMobileDevice(),
    };
    this.inputRef = React.createRef();
    this.modalRef = React.createRef();
  }

  private isMobileDevice = (): boolean => {
    return window.innerWidth <= 768;
  };

  private handleResize = (): void => {
    this.setState({ isMobile: this.isMobileDevice() });
  };

  componentDidMount(): void {
    if (this.props.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }
    this.resizeHandler = this.handleResize;
    window.addEventListener("resize", this.handleResize);
  }

  componentDidUpdate(prevProps: HeaderSearchProps): void {
    if (this.props.isOpen && !prevProps.isOpen && this.inputRef.current) {
      this.inputRef.current.focus();
    }

    if (this.props.isOpen) {
      this.setupFocusTrap();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener("keydown", this.handleFocusTrap);
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
    }
    document.body.style.overflow = "";
  }

  private setupFocusTrap = (): void => {
    window.addEventListener("keydown", this.handleFocusTrap);
  };

  private handleFocusTrap = (e: KeyboardEvent): void => {
    if (e.key !== "Tab" || !this.props.isOpen) return;

    const modal = this.modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
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
      if (!active || active === first || !modal.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (!active || active === last || !modal.contains(active)) {
        e.preventDefault();
        first.focus();
      }
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
      if (this.inputRef.current) {
        this.inputRef.current.focus();
        this.inputRef.current.setSelectionRange(
          this.inputRef.current.value.length,
          this.inputRef.current.value.length
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

  private renderSearchInput(): React.ReactNode {
    const { collectionSuggestions = Array.from(COLLECTION_SUGGESTIONS) } = this.props;
    const { query } = this.state;

    return (
      <div className={`${this.baseClass}__input-wrapper`}>
        <input
          ref={this.inputRef}
          name="q"
          list="search-suggestions"
          value={query}
          onChange={this.handleQueryChange}
          className={`${this.baseClass}__input`}
          placeholder="Cari bouquet, koleksi, momen..."
          aria-label="Cari"
          autoComplete="off"
        />
        <datalist id="search-suggestions">
          {collectionSuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    );
  }

  private renderSuggestions(): React.ReactNode {
    const { collectionSuggestions = Array.from(COLLECTION_SUGGESTIONS) } = this.props;

    return (
      <div className={`${this.baseClass}__suggestions`}>
        <p className={`${this.baseClass}__suggestions-title`}>Pencarian Populer</p>
        <div className={`${this.baseClass}__suggestions-tags`}>
          {collectionSuggestions.slice(0, 6).map((s) => (
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
    );
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isMobile } = this.state;

    if (!isOpen) return null;

    const mobileClass = isMobile ? `${this.baseClass}__overlay--mobile` : "";
    const modalMobileClass = isMobile ? `${this.baseClass}__modal--mobile` : "";

    return (
      <div
        className={`${this.baseClass}__overlay ${mobileClass}`}
        onClick={this.handleOverlayClick}
      >
        <div
          className={`${this.baseClass}__modal ${modalMobileClass}`}
          onClick={(e) => e.stopPropagation()}
          ref={this.modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Pencarian"
          id="search-modal"
        >
          <form onSubmit={this.handleSearch} className={`${this.baseClass}__form`}>
            {this.renderSearchInput()}
            <button type="submit" className={`${this.baseClass}__submit`}>
              Cari
            </button>
          </form>
          {this.renderSuggestions()}
        </div>
      </div>
    );
  }
}

export default withRouter(HeaderSearch);

