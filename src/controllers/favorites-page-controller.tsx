/**
 * Favorites Page Controller
 * OOP-based controller for managing favorites page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { getFavorites, removeFromFavorites, type FavoriteItem } from "../utils/favorites";
import { addToCart } from "../utils/cart";
import { toast } from "../utils/toast";
import {
  type FavoritesPageState,
  INITIAL_FAVORITES_PAGE_STATE,
  DEFAULT_FAVORITES_PAGE_SEO,
} from "../models/favorites-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import FavoritesPageView from "../view/favorites-page";

interface FavoritesPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Favorites Page Controller Class
 * Manages all business logic, favorites operations, and state for the favorites page
 * Extends BaseController to avoid code duplication
 */
export class FavoritesPageController extends BaseController<
  FavoritesPageControllerProps,
  FavoritesPageState & BaseControllerState
> {
  private favoritesUpdateListener: (() => void) | null = null;

  constructor(props: FavoritesPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_FAVORITES_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_FAVORITES_PAGE_STATE,
    };
  }

  /**
   * Load favorites
   */
  private loadFavorites = (): void => {
    const favorites = getFavorites();
    this.setState({ favorites, isLoading: false });
  };

  /**
   * Handle remove from favorites
   */
  handleRemove = (bouquetId: string): void => {
    removeFromFavorites(bouquetId);
    this.loadFavorites();
    toast.info("Dihapus dari favorit");
  };

  /**
   * Handle quick order (add to cart and redirect)
   */
  handleQuickOrder = (favorite: FavoriteItem): void => {
    addToCart({
      bouquetId: favorite.bouquetId,
      bouquetName: favorite.bouquetName,
      bouquetPrice: favorite.bouquetPrice,
      quantity: 1,
      image: favorite.bouquetImage,
    });
    toast.success("Ditambahkan ke keranjang");
    setTimeout(() => {
      window.location.href = "/cart";
    }, 500);
  };

  /**
   * Handle add to cart
   */
  handleAddToCart = (favorite: FavoriteItem): void => {
    addToCart({
      bouquetId: favorite.bouquetId,
      bouquetName: favorite.bouquetName,
      bouquetPrice: favorite.bouquetPrice,
      quantity: 1,
      image: favorite.bouquetImage,
    });
    toast.success("Ditambahkan ke keranjang");
  };

  /**
   * Format date from timestamp
   */
  formatDate = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.loadFavorites();
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Listen for favorites updates
    this.favoritesUpdateListener = this.loadFavorites;
    window.addEventListener("favoritesUpdated", this.favoritesUpdateListener);
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.favoritesUpdateListener) {
      window.removeEventListener("favoritesUpdated", this.favoritesUpdateListener);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <FavoritesPageView
        favorites={this.state.favorites}
        isLoading={this.state.isLoading}
        formatDate={this.formatDate}
        onRemove={this.handleRemove}
        onQuickOrder={this.handleQuickOrder}
        onAddToCart={this.handleAddToCart}
      />
    );
  }
}

export default FavoritesPageController;

