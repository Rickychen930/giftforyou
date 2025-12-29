/**
 * Header View
 * Pure presentation component - no business logic
 */

import React, { useEffect } from "react";
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
 * Pure presentation - receives all data and handlers via props
 */
const HeaderView: React.FC<HeaderViewProps> = ({
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
}) => {
  // Handle body scroll lock when mobile menu or search is open
  useEffect(() => {
    if (!mobileOpen && !searchOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileOpen, searchOpen]);

  // Handle click outside collections dropdown
  useEffect(() => {
    if (!collectionsOpen || mobileOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = collectionsItemRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (root.contains(target)) return;
      setTimeout(() => {
        onCollectionsClose();
      }, 100);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [collectionsOpen, mobileOpen, collectionsItemRef, onCollectionsClose]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, mobileOpen, onToggleSearch, onCloseSearch, onCloseMobile]);

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
};

export default HeaderView;
