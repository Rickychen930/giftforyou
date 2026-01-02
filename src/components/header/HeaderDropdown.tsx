/**
 * Header Dropdown Component (OOP)
 * Wrapper component that uses the new HeaderMegaMenu
 * Maintains backward compatibility while using elegant mega menu
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/header/HeaderDropdown.css";
import HeaderMegaMenu, { type CollectionItem } from "./HeaderMegaMenu";

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
 * Wrapper that transforms collection names into CollectionItem format
 * and uses HeaderMegaMenu for elegant display
 */
class HeaderDropdown extends Component<HeaderDropdownProps, HeaderDropdownState> {
  private baseClass: string = "header-dropdown";

  /**
   * Transform collection names into CollectionItem format
   * Marks first few as featured for better visual hierarchy
   */
  private getCollectionItems(): CollectionItem[] {
    const { collectionNames = [] } = this.props;
    
    // Collection icons mapping for better visual appeal
    const iconMap: Record<string, string> = {
      "Best Sellers": "⭐",
      "Wedding Collection": "💍",
      "Sympathy Flowers": "🕊️",
      "New Edition": "✨",
      "Featured": "🌟",
      "Special Occasions": "🎉",
    };

    return collectionNames.map((name, index) => ({
      name,
      icon: iconMap[name] || "🌸",
      description: this.getCollectionDescription(name),
      featured: index < 3, // First 3 are featured
    }));
  }

  /**
   * Get description for collection based on name
   */
  private getCollectionDescription(name: string): string {
    const descriptions: Record<string, string> = {
      "Best Sellers": "Pilihan terlaris",
      "Wedding Collection": "Untuk hari bahagia",
      "Sympathy Flowers": "Ungkapan duka cita",
      "New Edition": "Koleksi terbaru",
      "Featured": "Pilihan unggulan",
      "Special Occasions": "Untuk momen spesial",
    };
    return descriptions[name] || "";
  }

  render(): React.ReactNode {
    const { typeNames, onNavigate, onClose } = this.props;
    const collections = this.getCollectionItems();

    return (
      <div className={this.baseClass} id="collections-dropdown" aria-label="Menu koleksi">
        <HeaderMegaMenu
          collections={collections}
          typeNames={typeNames}
          onNavigate={onNavigate}
          onClose={onClose}
          maxCollections={6}
        />
      </div>
    );
  }
}

export default HeaderDropdown;
