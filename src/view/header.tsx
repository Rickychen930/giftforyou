/**
 * Header View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 * Luxury, elegant, responsive, and reusable
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles UI rendering
 * - Open/Closed: Extensible via props
 * - Liskov Substitution: Can be replaced with other header implementations
 * - Interface Segregation: Clean, focused props interface
 * - Dependency Inversion: Depends on abstractions (props), not concrete implementations
 * 
 * MVC Pattern:
 * - Model: HeaderState (in controller)
 * - View: This component (HeaderView)
 * - Controller: HeaderController
 */

import React, { Component } from "react";
import "../styles/Header.css";

// Reusable Header Components
import HeaderBrand from "../components/header/HeaderBrand";
import HeaderNavigation, { NavItem } from "../components/header/HeaderNavigation";
import HeaderSearch from "../components/header/HeaderSearch";
import HeaderActions from "../components/header/HeaderActions";
import Backdrop from "../components/common/Backdrop";

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
 * Logic extracted to controller and utilities (DRY principle)
 * Optimized with shouldComponentUpdate to prevent unnecessary re-renders
 */
class HeaderView extends Component<HeaderViewProps> {
  /**
   * Prevent unnecessary re-renders when props haven't changed
   * Optimizes performance by avoiding re-renders when data is the same
   */
  shouldComponentUpdate(nextProps: HeaderViewProps): boolean {
    const {
      navLinks,
      mobileOpen,
      searchOpen,
      collectionsOpen,
      collectionsAnimate,
      scrolled,
      collectionNames = [],
      typeNames = [],
    } = this.props;

    return (
      nextProps.mobileOpen !== mobileOpen ||
      nextProps.searchOpen !== searchOpen ||
      nextProps.collectionsOpen !== collectionsOpen ||
      nextProps.collectionsAnimate !== collectionsAnimate ||
      nextProps.scrolled !== scrolled ||
      nextProps.navLinks.length !== navLinks.length ||
      nextProps.navLinks !== navLinks ||
      (nextProps.collectionNames?.length ?? 0) !== collectionNames.length ||
      nextProps.collectionNames !== collectionNames ||
      (nextProps.typeNames?.length ?? 0) !== typeNames.length ||
      nextProps.typeNames !== typeNames
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   * All business logic handled by controller
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
      <>
        <header
          className={`header ${scrolled ? "header--scrolled" : ""} ${
            mobileOpen ? "header--mobile-open" : ""
          } ${searchOpen ? "header--search-open" : ""} ${
            collectionsOpen ? "header--collections-open" : ""
          }`}
          role="banner"
          aria-label="Main navigation"
        >
          {/* Mobile Menu Backdrop - Only show when mobile menu is open */}
          <Backdrop
            isOpen={mobileOpen}
            onClick={() => onCloseMobile({ returnFocus: true })}
            className="header__mobile-backdrop"
            zIndex={1018}
            aria-label="Close mobile menu"
          />

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
                onCloseMobile={onCloseMobile}
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
        </header>

        {/* Search Overlay - Rendered via Portal */}
        <HeaderSearch
          isOpen={searchOpen}
          onClose={onCloseSearch}
          searchButtonRef={searchButtonRef}
          collectionSuggestions={collectionSuggestions}
        />
      </>
    );
  }
}

export default HeaderView;
