/**
 * Header Navigation Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
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

interface HeaderNavigationState {
  // No state needed, but keeping for consistency
}

/**
 * Header Navigation Component
 * Class-based component for header navigation menu
 */
class HeaderNavigation extends Component<HeaderNavigationProps, HeaderNavigationState> {
  private baseClass: string = "header-navigation";

  private handleMouseEnter = (isCollections: boolean): void => {
    const { isMobile = false, onCollectionsOpen } = this.props;
    if (!isCollections || isMobile) return;
    onCollectionsOpen?.();
  };

  private handleMouseLeave = (isCollections: boolean): void => {
    const { isMobile = false, onCollectionsClose } = this.props;
    if (!isCollections || isMobile) return;
    onCollectionsClose?.();
  };

  private handleFocusCapture = (isCollections: boolean): void => {
    const { onCollectionsOpen } = this.props;
    if (!isCollections) return;
    onCollectionsOpen?.();
  };

  private handleBlurCapture = (isCollections: boolean): void => {
    const { onCollectionsClose } = this.props;
    if (!isCollections) return;

    window.setTimeout(() => {
      const root = document.activeElement;
      if (!root || !root.closest(".header-navigation__item--dropdown")) {
        onCollectionsClose?.();
      }
    }, 0);
  };

  private handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, isCollections: boolean): void => {
    const {
      isMobile = false,
      collectionsOpen = false,
      onCollectionsToggle,
      onCollectionsClose,
      onNavigate,
    } = this.props;

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
  };

  private handleNavLinkKeyDown = (
    e: React.KeyboardEvent<HTMLAnchorElement>,
    isCollections: boolean
  ): void => {
    const { isMobile = false, onCollectionsClose } = this.props;
    if (isCollections && !isMobile && (e.key === "Enter" || e.key === " ")) {
      onCollectionsClose?.();
    }
  };

  private renderNavItem(item: NavItem): React.ReactNode {
    const {
      isMobile = false,
      collectionsOpen = false,
      collectionsAnimate = false,
      collectionNames = [],
      typeNames = [],
      onNavigate,
      onCollectionsClose,
      collectionsItemRef,
    } = this.props;

    const isCollections = item.path === "/collection";

    return (
      <li
        key={item.path}
        ref={isCollections ? collectionsItemRef : undefined}
        className={`${this.baseClass}__item ${
          isCollections ? `${this.baseClass}__item--dropdown` : ""
        } ${isCollections && collectionsOpen ? "is-open" : ""} ${
          isCollections && collectionsAnimate ? "is-animate" : ""
        }`}
        onMouseEnter={() => this.handleMouseEnter(isCollections)}
        onMouseLeave={() => this.handleMouseLeave(isCollections)}
        onFocusCapture={() => this.handleFocusCapture(isCollections)}
        onBlurCapture={() => this.handleBlurCapture(isCollections)}
      >
        <NavLink
          to={item.path}
          onClick={(e) => this.handleNavLinkClick(e, isCollections)}
          onKeyDown={(e) => this.handleNavLinkKeyDown(e, isCollections)}
          className={({ isActive }) =>
            `${this.baseClass}__link ${isActive ? "is-active" : ""}`
          }
          aria-haspopup={isCollections ? "true" : undefined}
          aria-expanded={isCollections ? collectionsOpen : undefined}
          aria-controls={isCollections ? "collections-dropdown" : undefined}
        >
          {item.label}
          {isCollections && (
            <ChevronDownIcon
              className={`${this.baseClass}__dropdown-arrow`}
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
  }

  render(): React.ReactNode {
    const { navLinks, isMobile = false } = this.props;

    return (
      <nav className={this.baseClass} role="navigation" aria-label="Primary">
        <ul
          className={`${this.baseClass}__links ${isMobile ? `${this.baseClass}__links--mobile` : ""}`}
          id="primary-navigation"
        >
          {navLinks.map((item) => this.renderNavItem(item))}
        </ul>
      </nav>
    );
  }
}

export default HeaderNavigation;
