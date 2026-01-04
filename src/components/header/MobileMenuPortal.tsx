/**
 * Mobile Menu Portal Component
 * Uses React Portal to render mobile menu outside container boundaries
 * Following SOLID, DRY principles
 */

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { ChevronDownIcon } from "../icons/UIIcons";
import type { NavItem } from "../../models/header-model";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";
import "../../styles/Header.css";

interface MobileMenuPortalProps {
  isOpen: boolean;
  navLinks: NavItem[];
  collectionsOpen: boolean;
  collectionsAnimate: boolean;
  collectionNames: string[];
  typeNames: string[];
  onCollectionsClick: (e: React.MouseEvent, isMobile: boolean) => void;
  onNavLinkClick: () => void;
  collectionsItemRef: React.RefObject<HTMLLIElement>;
}

/**
 * Mobile Menu Portal Component
 * Renders mobile menu using React Portal to escape container overflow
 */
export const MobileMenuPortal: React.FC<MobileMenuPortalProps> = ({
  isOpen,
  navLinks,
  collectionsOpen,
  collectionsAnimate,
  collectionNames,
  typeNames,
  onCollectionsClick,
  onNavLinkClick,
  collectionsItemRef,
}) => {
  const menuRef = useRef<HTMLUListElement>(null);

  // Memoize suggestions with fallback
  const collectionSuggestions = React.useMemo(
    () => (collectionNames.length > 0 ? collectionNames : Array.from(COLLECTION_SUGGESTIONS)),
    [collectionNames]
  );

  const typeSuggestions = React.useMemo(
    () => (typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"]),
    [typeNames]
  );

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = Array.from(
      menu.querySelectorAll<HTMLElement>(
        'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      if (el.hasAttribute("disabled")) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      const style = window.getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const activeElement = document.activeElement as HTMLElement | null;
      if (!activeElement) return;

      if (e.shiftKey) {
        if (activeElement === firstElement || !menu.contains(activeElement)) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (activeElement === lastElement || !menu.contains(activeElement)) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    firstElement.focus();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const menuContent = (
    <ul
      ref={menuRef}
      className="nav-links nav-links--mobile-portal"
      id="primary-navigation-mobile"
      role="menu"
      aria-label="Mobile navigation menu"
    >
      {navLinks.map((item) => {
        const normalizedPath = item.path.replace(/\/$/, "");
        const isCollections = normalizedPath === "/collection" || normalizedPath === "/collections";

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
            role="none"
          >
            <NavLink
              to={item.path}
              onClick={(e) => {
                if (isCollections) {
                  e.preventDefault();
                  onCollectionsClick(e, true);
                } else {
                  onNavLinkClick();
                }
              }}
              onKeyDown={(e) => {
                if (isCollections && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onCollectionsClick(e as any, true);
                }
              }}
              className={({ isActive }) =>
                `nav-link ${isActive ? "is-active" : ""}`
              }
              aria-haspopup={isCollections ? "true" : undefined}
              aria-expanded={isCollections ? collectionsOpen : undefined}
              aria-controls={isCollections ? "collections-dropdown-mobile" : undefined}
              role="menuitem"
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

            {/* Mobile dropdown content */}
            {isCollections && collectionsOpen && (
              <div
                className="dropdown dropdown--mobile"
                id="collections-dropdown-mobile"
                aria-label="Menu koleksi"
                role="menu"
              >
                <div className="dropdown-content">
                  {/* Types Section */}
                  {typeSuggestions.length > 0 && (
                    <>
                      <div className="dropdown-header">
                        <h3>Berdasarkan Tipe</h3>
                        <p>Filter cepat untuk katalog</p>
                      </div>
                      <ul className="dropdown-grid">
                        {typeSuggestions.map((t) => (
                          <li key={t}>
                            <NavLink
                              to={`/collection?type=${encodeURIComponent(t)}`}
                              onClick={onNavLinkClick}
                              className="dropdown-link"
                              role="menuitem"
                            >
                              <span className="dropdown-icon">🏷️</span>
                              <span>{t}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* Collections Section */}
                  {collectionSuggestions.length > 0 && (
                    <>
                      <div className="dropdown-header">
                        <h3>Koleksi Kami</h3>
                        <p>Dirangkai dengan sepenuh hati</p>
                      </div>
                      <ul className="dropdown-grid">
                        {collectionSuggestions.map((c) => (
                          <li key={c}>
                            <NavLink
                              to={`/collection?name=${encodeURIComponent(c)}`}
                              onClick={onNavLinkClick}
                              className="dropdown-link"
                              role="menuitem"
                            >
                              <span className="dropdown-icon">🌸</span>
                              <span>{c}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  // Render to document.body using portal
  return createPortal(menuContent, document.body);
};

export default MobileMenuPortal;

