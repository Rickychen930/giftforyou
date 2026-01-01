/**
 * Header View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import "../styles/Header.css";

// Reusable Header Components
import HeaderBrand from "../components/header/HeaderBrand";
import HeaderNavigation, { NavItem } from "../components/header/HeaderNavigation";
import HeaderSearch from "../components/header/HeaderSearch";
import HeaderActions from "../components/header/HeaderActions";

interface HeaderViewProps {
  navLinks: NavItem[];
  logoSrc?: string;
  mobileOpen: boolean;
  searchOpen: boolean;
  collectionsOpen: boolean;
  collectionsAnimate: boolean;
  scrolled: boolean;
  collectionNames: string[];
  typeNames: string[];
  searchButtonRef: React.RefObject<HTMLButtonElement>;
  hamburgerButtonRef: React.RefObject<HTMLButtonElement>;
  collectionsItemRef: React.RefObject<HTMLLIElement>;
  onToggleMobile: () => void;
  onCloseMobile: (opts?: { returnFocus?: boolean }) => void;
  onToggleSearch: () => void;
  onCloseSearch: (opts?: { returnFocus?: boolean }) => void;
  onCollectionsToggle: () => void;
  onCollectionsOpen: () => void;
  onCollectionsClose: () => void;
  onNavigate: () => void;
}

/**
 * Header View Component
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class HeaderView extends Component<HeaderViewProps> {
  private prevBodyOverflow: string = "";

  /**
   * Handle body scroll lock when mobile menu or search is open
   */
  private handleBodyScrollLock(): void {
    const { mobileOpen, searchOpen } = this.props;
    if (!mobileOpen && !searchOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      return;
    }
    this.prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  }

  /**
   * Cleanup body scroll lock
   */
  private cleanupBodyScrollLock(): void {
    document.body.style.overflow = this.prevBodyOverflow;
    document.body.style.position = "";
    document.body.style.width = "";
  }

  /**
   * Handle click outside collections dropdown
   */
  private handleCollectionsClickOutside = (e: MouseEvent | TouchEvent): void => {
    const { collectionsOpen, mobileOpen, collectionsItemRef, onCollectionsClose } = this.props;
    if (!collectionsOpen || mobileOpen) return;
    const root = collectionsItemRef.current;
    if (!root) return;
    const target = e.target as Node;
    if (root.contains(target)) return;
    setTimeout(() => {
      onCollectionsClose();
    }, 100);
  };

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyboardShortcuts = (e: KeyboardEvent): void => {
    const { searchOpen, mobileOpen, onToggleSearch, onCloseSearch, onCloseMobile } = this.props;
    if (e.key === "Escape") {
      if (searchOpen) {
        onCloseSearch({ returnFocus: true });
      }
      if (mobileOpen) {
        onCloseMobile({ returnFocus: true });
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      if (!searchOpen) {
        onToggleSearch();
      }
    }
  };

  /**
   * Setup event listeners on mount
   */
  componentDidMount(): void {
    const { collectionsOpen, mobileOpen } = this.props;
    this.handleBodyScrollLock();
    window.addEventListener("keydown", this.handleKeyboardShortcuts);
    
    // Setup collections click outside listener if needed
    if (collectionsOpen && !mobileOpen) {
      document.addEventListener("mousedown", this.handleCollectionsClickOutside);
      document.addEventListener("touchstart", this.handleCollectionsClickOutside, { passive: true });
    }
  }

  /**
   * Update effects when props change
   */
  componentDidUpdate(prevProps: HeaderViewProps): void {
    const { mobileOpen, searchOpen, collectionsOpen } = this.props;

    // Handle body scroll lock
    if (prevProps.mobileOpen !== mobileOpen || prevProps.searchOpen !== searchOpen) {
      this.handleBodyScrollLock();
    }

    // Handle collections click outside
    if (prevProps.collectionsOpen !== collectionsOpen || prevProps.mobileOpen !== mobileOpen) {
      // Remove old listeners
      if (prevProps.collectionsOpen && !prevProps.mobileOpen) {
        document.removeEventListener("mousedown", this.handleCollectionsClickOutside);
        document.removeEventListener("touchstart", this.handleCollectionsClickOutside);
      }
      
      // Add new listeners if needed
      if (collectionsOpen && !mobileOpen) {
        document.addEventListener("mousedown", this.handleCollectionsClickOutside);
        document.addEventListener("touchstart", this.handleCollectionsClickOutside, { passive: true });
      }
    }
  }

  /**
   * Cleanup event listeners on unmount
   */
  componentWillUnmount(): void {
    this.cleanupBodyScrollLock();
    window.removeEventListener("keydown", this.handleKeyboardShortcuts);
    document.removeEventListener("mousedown", this.handleCollectionsClickOutside);
    document.removeEventListener("touchstart", this.handleCollectionsClickOutside);
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
      navLinks,
      logoSrc,
      mobileOpen,
      searchOpen,
      collectionsOpen,
      collectionsAnimate,
      scrolled,
      collectionNames,
      typeNames,
      searchButtonRef,
      hamburgerButtonRef,
      collectionsItemRef,
      onToggleMobile,
      onCloseMobile,
      onToggleSearch,
      onCloseSearch,
      onCollectionsToggle,
      onCollectionsOpen,
      onCollectionsClose,
      onNavigate,
    } = this.props;

    const collectionSuggestions =
      collectionNames.length > 0 ? collectionNames : [];

    return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      {mobileOpen && (
        <div
          className="header__mobile-backdrop"
          onClick={() => onCloseMobile({ returnFocus: true })}
          aria-hidden="true"
        />
      )}
      <div className="header__container">
        {/* Logo & Brand */}
        <div className="header__left">
          <HeaderBrand logoSrc={logoSrc} onNavigate={onNavigate} />
        </div>

        {/* Center Navigation */}
        <div className="header__center">
          <HeaderNavigation
            navLinks={navLinks}
            isMobile={mobileOpen}
            collectionsOpen={collectionsOpen}
            onCollectionsToggle={onCollectionsToggle}
            onCollectionsOpen={onCollectionsOpen}
            onCollectionsClose={onCollectionsClose}
            collectionsAnimate={collectionsAnimate}
            collectionNames={collectionNames}
            typeNames={typeNames}
            onNavigate={onNavigate}
            collectionsItemRef={collectionsItemRef}
          />
        </div>

        {/* Right Actions */}
        <div className="header__right">
          <HeaderActions
            onSearchToggle={onToggleSearch}
            searchOpen={searchOpen}
            searchButtonRef={searchButtonRef}
            hamburgerButtonRef={hamburgerButtonRef}
            mobileOpen={mobileOpen}
            onMobileToggle={onToggleMobile}
          />
        </div>
      </div>

      {/* Search Overlay */}
      <HeaderSearch
        isOpen={searchOpen}
        onClose={onCloseSearch}
        searchButtonRef={searchButtonRef}
        collectionSuggestions={collectionSuggestions}
      />
    </header>
    );
  }
}

export default HeaderView;
