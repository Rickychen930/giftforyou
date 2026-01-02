/**
 * Header View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 * Luxury, elegant, responsive, and reusable
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
 */
class HeaderView extends Component<HeaderViewProps> {
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
      <header 
        className={`header ${scrolled ? "header--scrolled" : ""}`}
        role="banner"
        aria-label="Main navigation"
      >
        <Backdrop
          isOpen={mobileOpen}
          onClick={() => onCloseMobile({ returnFocus: true })}
          className="header__mobile-backdrop"
          zIndex={1400}
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
