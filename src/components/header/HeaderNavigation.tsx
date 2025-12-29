import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/header/HeaderNavigation.css";
import { ChevronDownIcon } from "../icons/UIIcons";
import HeaderDropdown from "./HeaderDropdown";

export interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

export interface HeaderNavigationProps {
  navLinks: NavItem[];
  isMobile?: boolean;
  collectionsOpen?: boolean;
  onCollectionsToggle?: () => void;
  onCollectionsOpen?: () => void;
  onCollectionsClose?: () => void;
  collectionsAnimate?: boolean;
  collectionNames?: string[];
  typeNames?: string[];
  onNavigate?: () => void;
  collectionsItemRef?: React.RefObject<HTMLLIElement>;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  navLinks,
  isMobile = false,
  collectionsOpen = false,
  onCollectionsToggle,
  onCollectionsOpen,
  onCollectionsClose,
  collectionsAnimate = false,
  collectionNames = [],
  typeNames = [],
  onNavigate,
  collectionsItemRef,
}) => {
  return (
    <nav className="header-navigation" role="navigation" aria-label="Primary">
      <ul
        className={`header-navigation__links ${isMobile ? "header-navigation__links--mobile" : ""}`}
        id="primary-navigation"
      >
        {navLinks.map((item) => {
          const isCollections = item.path === "/collection";

          return (
            <li
              key={item.path}
              ref={isCollections ? collectionsItemRef : undefined}
              className={`header-navigation__item ${
                isCollections ? "header-navigation__item--dropdown" : ""
              } ${isCollections && collectionsOpen ? "is-open" : ""} ${
                isCollections && collectionsAnimate ? "is-animate" : ""
              }`}
              onMouseEnter={() => {
                if (!isCollections || isMobile) return;
                onCollectionsOpen?.();
              }}
              onMouseLeave={() => {
                if (!isCollections || isMobile) return;
                onCollectionsClose?.();
              }}
              onFocusCapture={() => {
                if (!isCollections) return;
                onCollectionsOpen?.();
              }}
              onBlurCapture={() => {
                if (!isCollections) return;
                window.setTimeout(() => {
                  const root = document.activeElement;
                  if (!root || !root.closest(".header-navigation__item--dropdown")) {
                    onCollectionsClose?.();
                  }
                }, 0);
              }}
            >
              <NavLink
                to={item.path}
                onClick={(e) => {
                  if (isCollections) {
                    if (!isMobile) {
                      onCollectionsClose?.();
                    } else {
                      if (!collectionsOpen) {
                        e.preventDefault();
                        onCollectionsToggle?.();
                        return;
                      }
                      onCollectionsClose?.();
                    }
                  } else {
                    onCollectionsClose?.();
                  }
                  onNavigate?.();
                }}
                onKeyDown={(e) => {
                  if (isCollections && !isMobile && (e.key === "Enter" || e.key === " ")) {
                    onCollectionsClose?.();
                  }
                }}
                className={({ isActive }) =>
                  `header-navigation__link ${isActive ? "is-active" : ""}`
                }
                aria-haspopup={isCollections ? "true" : undefined}
                aria-expanded={isCollections ? collectionsOpen : undefined}
                aria-controls={isCollections ? "collections-dropdown" : undefined}
              >
                {item.label}
                {isCollections && (
                  <ChevronDownIcon
                    className="header-navigation__dropdown-arrow"
                    width={12}
                    height={12}
                  />
                )}
              </NavLink>

              {isCollections && (!isMobile || collectionsOpen) && (
                <HeaderDropdown
                  collectionNames={collectionNames}
                  typeNames={typeNames}
                  onNavigate={onNavigate}
                  onClose={onCollectionsClose}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default HeaderNavigation;

