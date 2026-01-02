/**
 * Header Mega Menu Component
 * Elegant mega menu for collections navigation
 * OOP-based class component following SOLID principles
 * Luxury, elegant, clean UI/UX, and fully responsive
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderMegaMenu.css";
import HeaderCollectionCard from "./HeaderCollectionCard";

export interface CollectionItem {
  name: string;
  icon?: string;
  description?: string;
  featured?: boolean;
}

export interface HeaderMegaMenuProps {
  collections: CollectionItem[];
  typeNames?: string[];
  onNavigate?: () => void;
  onClose?: () => void;
  maxCollections?: number;
}

interface HeaderMegaMenuState {
  // No state needed, but keeping for consistency
}

/**
 * Header Mega Menu Component
 * Displays an elegant mega menu with featured collections and quick filters
 * Follows Single Responsibility Principle: only handles menu rendering
 */
export class HeaderMegaMenu extends Component<HeaderMegaMenuProps, HeaderMegaMenuState> {
  private baseClass: string = "header-mega-menu";

  private getFeaturedCollections(): CollectionItem[] {
    const { collections = [], maxCollections = 6 } = this.props;
    return collections
      .filter((c) => c.featured)
      .slice(0, maxCollections)
      .concat(
        collections
          .filter((c) => !c.featured)
          .slice(0, Math.max(0, maxCollections - collections.filter((c) => c.featured).length))
      )
      .slice(0, maxCollections);
  }

  private getQuickTypes(): string[] {
    const { typeNames = [] } = this.props;
    // Show only top 4 types for clean UI
    return typeNames.slice(0, 4);
  }

  private handleLinkClick = (): void => {
    const { onNavigate, onClose } = this.props;
    onNavigate?.();
    onClose?.();
  };

  private renderCollectionCard(collection: CollectionItem, index: number): React.ReactNode {
    return (
      <HeaderCollectionCard
        key={`${collection.name}-${index}`}
        name={collection.name}
        icon={collection.icon}
        description={collection.description}
        href={`/collection?name=${encodeURIComponent(collection.name)}`}
        onClick={this.handleLinkClick}
        featured={collection.featured}
      />
    );
  }

  private renderQuickType(type: string): React.ReactNode {
    return (
      <Link
        key={type}
        to={`/collection?type=${encodeURIComponent(type)}`}
        onClick={this.handleLinkClick}
        className={`${this.baseClass}__quick-link`}
        role="menuitem"
      >
        <span className={`${this.baseClass}__quick-link-text`}>{type}</span>
      </Link>
    );
  }

  render(): React.ReactNode {
    const featuredCollections = this.getFeaturedCollections();
    const quickTypes = this.getQuickTypes();
    const hasCollections = featuredCollections.length > 0;
    const hasQuickTypes = quickTypes.length > 0;

    return (
      <div
        className={this.baseClass}
        id="collections-mega-menu"
        aria-label="Collections menu"
        role="menu"
      >
        {/* Featured Collections Section */}
        {hasCollections && (
          <div className={`${this.baseClass}__section`}>
            <div className={`${this.baseClass}__section-header`}>
              <h3 className={`${this.baseClass}__section-title`}>Koleksi Unggulan</h3>
              <p className={`${this.baseClass}__section-subtitle`}>
                Pilihan terbaik untuk setiap momen spesial
              </p>
            </div>
            <div className={`${this.baseClass}__collections-grid`}>
              {featuredCollections.map((collection, index) =>
                this.renderCollectionCard(collection, index)
              )}
            </div>
            {featuredCollections.length >= 6 && (
              <div className={`${this.baseClass}__footer`}>
                <Link
                  to="/collection"
                  onClick={this.handleLinkClick}
                  className={`${this.baseClass}__view-all`}
                >
                  Lihat Semua Koleksi
                  <span className={`${this.baseClass}__view-all-arrow`}>→</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Filters Section */}
        {hasQuickTypes && (
          <div className={`${this.baseClass}__section ${this.baseClass}__section--quick`}>
            <div className={`${this.baseClass}__section-header`}>
              <h3 className={`${this.baseClass}__section-title`}>Filter Cepat</h3>
            </div>
            <div className={`${this.baseClass}__quick-filters`}>
              {quickTypes.map((type) => this.renderQuickType(type))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasCollections && !hasQuickTypes && (
          <div className={`${this.baseClass}__empty`}>
            <p className={`${this.baseClass}__empty-text`}>
              Koleksi sedang dimuat...
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default HeaderMegaMenu;

