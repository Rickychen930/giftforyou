/**
 * Header Dropdown Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderDropdown.css";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";

export interface HeaderDropdownProps {
  collectionNames?: string[];
  typeNames?: string[];
  onNavigate?: () => void;
  onClose?: () => void;
}

interface HeaderDropdownState {
  // No state needed, but keeping for consistency
}

/**
 * Header Dropdown Component
 * Class-based component for header collections dropdown menu
 */
class HeaderDropdown extends Component<HeaderDropdownProps, HeaderDropdownState> {
  private baseClass: string = "header-dropdown";

  private getCollectionSuggestions(): string[] {
    const { collectionNames = [] } = this.props;
    return collectionNames.length > 0
      ? collectionNames
      : Array.from(COLLECTION_SUGGESTIONS);
  }

  private getTypeSuggestions(): string[] {
    const { typeNames = [] } = this.props;
    return typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"];
  }

  private handleLinkClick = (): void => {
    const { onNavigate, onClose } = this.props;
    onNavigate?.();
    onClose?.();
  };

  private renderTypeLink(type: string): React.ReactNode {
    return (
      <li key={type}>
        <Link
          to={`/collection?type=${encodeURIComponent(type)}`}
          onClick={this.handleLinkClick}
          className={`${this.baseClass}__link`}
          role="menuitem"
        >
          <span className={`${this.baseClass}__icon`}>🏷️</span>
          <span>{type}</span>
        </Link>
      </li>
    );
  }

  private renderCollectionLink(collection: string): React.ReactNode {
    return (
      <li key={collection}>
        <Link
          to={`/collection?name=${encodeURIComponent(collection)}`}
          onClick={this.handleLinkClick}
          className={`${this.baseClass}__link`}
          role="menuitem"
        >
          <span className={`${this.baseClass}__icon`}>🌸</span>
          <span>{collection}</span>
        </Link>
      </li>
    );
  }

  render(): React.ReactNode {
    const typeSuggestions = this.getTypeSuggestions();
    const collectionSuggestions = this.getCollectionSuggestions();

    return (
      <div
        className={this.baseClass}
        id="collections-dropdown"
        aria-label="Menu koleksi"
        role="menu"
      >
        <div className={`${this.baseClass}__header`}>
          <h3>Koleksi Kami</h3>
          <p>Dirangkai dengan sepenuh hati</p>
        </div>

        <div className={`${this.baseClass}__header`} style={{ marginTop: "0.75rem" }}>
          <h3>Berdasarkan Tipe</h3>
          <p>Filter cepat untuk katalog</p>
        </div>
        <ul className={`${this.baseClass}__grid`}>
          {typeSuggestions.map((type) => this.renderTypeLink(type))}
        </ul>

        <ul className={`${this.baseClass}__grid`}>
          {collectionSuggestions.map((collection) => this.renderCollectionLink(collection))}
        </ul>
      </div>
    );
  }
}

export default HeaderDropdown;
