/**
 * Favorites Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import "../styles/FavoritesPage.css";
import type { FavoriteItem } from "../utils/favorites";
import EmptyState from "../components/EmptyState";
import FavoriteCard from "../components/common/FavoriteCard";
import BackLink from "../components/common/BackLink";

const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

interface FavoritesPageViewProps {
  favorites: FavoriteItem[];
  isLoading: boolean;
  formatDate: (timestamp: number) => string;
  onRemove: (bouquetId: string) => void;
  onQuickOrder: (favorite: FavoriteItem) => void;
  onAddToCart: (favorite: FavoriteItem) => void;
}

/**
 * Favorites Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const FavoritesPageView: React.FC<FavoritesPageViewProps> = ({
  favorites,
  isLoading,
  formatDate,
  onRemove,
  onQuickOrder,
  onAddToCart,
}) => {
  if (isLoading) {
    return (
      <section className="favPage favPage--loading">
        <div className="favContainer">
          <div className="favLoading">
            <div className="favSpinner"></div>
            <p>Memuat favorit Anda...</p>
          </div>
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="favPage">
        <div className="favContainer">
          <EmptyState
            title="Belum Ada Favorit"
            description="Simpan bouquet favorit Anda untuk akses cepat nanti."
            actionLabel="Jelajahi Katalog"
            actionPath="/collection"
            icon={
              <div style={{ fontSize: "4rem" }}>❤️</div>
            }
            className="favEmpty"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="favPage" aria-labelledby="fav-title">
      <div className="favContainer">
        <div className="favHeader">
          <h1 id="fav-title" className="favHeader__title">
            Favorit Saya
          </h1>
          <p className="favHeader__subtitle">
            {favorites.length} {favorites.length === 1 ? "bouquet" : "bouquets"} tersimpan
          </p>
        </div>

        <div className="favGrid">
          {favorites.map((favorite) => (
            <FavoriteCard
              key={favorite.bouquetId}
              bouquetId={favorite.bouquetId}
              bouquetName={favorite.bouquetName}
              bouquetPrice={favorite.bouquetPrice}
              bouquetImage={favorite.bouquetImage}
              addedAt={favorite.addedAt}
              fallbackImage={FALLBACK_IMAGE}
              formatDate={formatDate}
              onQuickOrder={() => onQuickOrder(favorite)}
              onAddToCart={() => onAddToCart(favorite)}
              onRemove={() => onRemove(favorite.bouquetId)}
            />
          ))}
        </div>

        <div className="favFooter">
          <BackLink to="/collection" className="favFooter__link">
            ← Kembali ke Katalog
          </BackLink>
        </div>
      </div>
    </section>
  );
};

export default FavoritesPageView;
