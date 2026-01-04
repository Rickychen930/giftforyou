/**
 * Navigation Component
 * Reusable navigation menu with dropdown support
 * Following SOLID, DRY, OOP principles
 */

import React, { useRef, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDownIcon } from "../icons/UIIcons";
import type { NavItem } from "../../models/header-model";
import { DropdownPortal } from "./DropdownPortal";
import { MobileMenuPortal } from "./MobileMenuPortal";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";
import "../../styles/Header.css";

interface NavigationProps {
  navLinks: NavItem[];
  mobileOpen: boolean;
  collectionsOpen: boolean;
  collectionsAnimate: boolean;
  collectionNames: string[];
  typeNames: string[];
  onCollectionsMouseEnter: () => void;
  onCollectionsMouseLeave: () => void;
  onCollectionsFocus: () => void;
  onCollectionsBlur: () => void;
  onCollectionsClick: (e: React.MouseEvent, isMobile: boolean) => void;
  onNavLinkClick: () => void;
  collectionsItemRef: React.RefObject<HTMLLIElement>;
}

/**
 * Navigation Component
 * Displays navigation menu with dropdown support
 */
export const Navigation: React.FC<NavigationProps> = ({
  navLinks,
  mobileOpen,
  collectionsOpen,
  collectionsAnimate,
  collectionNames,
  typeNames,
  onCollectionsMouseEnter,
  onCollectionsMouseLeave,
  onCollectionsFocus,
  onCollectionsBlur,
  onCollectionsClick,
  onNavLinkClick,
  collectionsItemRef,
}) => {
  const mobileMenuRef = useRef<HTMLUListElement | null>(null);

  // Memoize suggestions to prevent unnecessary recalculations
  const collectionSuggestions = useMemo(
    () => (collectionNames.length > 0 ? collectionNames : Array.from(COLLECTION_SUGGESTIONS)),
    [collectionNames]
  );

  const typeSuggestions = useMemo(
    () => (typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"]),
    [typeNames]
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="nav-center" role="navigation" aria-label="Primary">
        <ul
          className="nav-links"
          id="primary-navigation"
          ref={mobileMenuRef}
        >
          {navLinks.map((item) => {
            // Check if this is the collections item - normalize path for comparison
            const normalizedPath = item.path.replace(/\/$/, ""); // Remove trailing slash
            const isCollections = normalizedPath === "/collection" || normalizedPath === "/collections";

            // Build className - ensure nav-item--dropdown is always present for collections
            let liClassName = "nav-item";
            if (isCollections) {
              liClassName += " nav-item--dropdown";
              if (collectionsOpen) {
                liClassName += " is-open";
              }
              if (collectionsAnimate) {
                liClassName += " is-animate";
              }
            }

            return (
              <li
                key={item.path}
                className={liClassName}
                ref={isCollections ? collectionsItemRef : undefined}
                onMouseEnter={isCollections && !mobileOpen ? onCollectionsMouseEnter : undefined}
                onMouseLeave={isCollections && !mobileOpen ? onCollectionsMouseLeave : undefined}
                onFocusCapture={isCollections ? onCollectionsFocus : undefined}
                onBlurCapture={isCollections ? onCollectionsBlur : undefined}
              >
                <NavLink
                  to={item.path}
                  onClick={(e) => {
                    if (isCollections) {
                      onCollectionsClick(e, false);
                    } else {
                      onNavLinkClick();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (isCollections && !mobileOpen && (e.key === "Enter" || e.key === " ")) {
                      onCollectionsClick(e as any, false);
                    }
                  }}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "is-active" : ""}`
                  }
                  aria-haspopup={isCollections ? "true" : undefined}
                  aria-expanded={isCollections ? collectionsOpen : undefined}
                  aria-controls={isCollections ? "collections-dropdown" : undefined}
                >
                  {item.label}
                  {isCollections && (
                    <ChevronDownIcon
                      className="dropdown-arrow"
                      width={12}
                      height={12}
                    />
                  )}
                </NavLink>

                {/* Desktop: Use Portal for dropdown (outside container) */}
                {isCollections && !mobileOpen && (
                  <DropdownPortal
                    isOpen={collectionsOpen}
                    triggerRef={collectionsItemRef}
                    collectionNames={collectionSuggestions}
                    typeNames={typeSuggestions}
                    onClose={onNavLinkClick}
                    onNavLinkClick={onNavLinkClick}
                    mobileOpen={mobileOpen}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Navigation: Use Portal */}
      {mobileOpen && (
        <MobileMenuPortal
          isOpen={mobileOpen}
          navLinks={navLinks}
          collectionsOpen={collectionsOpen}
          collectionsAnimate={collectionsAnimate}
          collectionNames={collectionNames}
          typeNames={typeNames}
          onCollectionsClick={onCollectionsClick}
          onNavLinkClick={onNavLinkClick}
          collectionsItemRef={collectionsItemRef}
        />
      )}
    </>
  );
};

export default Navigation;

