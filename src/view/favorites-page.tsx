/**
 * Favorites Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link } from "react-router-dom";
import "../styles/FavoritesPage.css";
import { formatIDR } from "../utils/money";
import { buildImageUrl } from "../utils/image-utils";
import type { FavoriteItem } from "../utils/favorites";
import LuxuryButton from "../components/LuxuryButton";

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
          <div className="favEmpty">
            <div className="favEmpty__icon">❤️</div>
            <h1 className="favEmpty__title">Belum Ada Favorit</h1>
            <p className="favEmpty__text">
              Simpan bouquet favorit Anda untuk akses cepat nanti.
            </p>
            <Link to="/collection" className="favEmpty__link btn-luxury">
              Jelajahi Katalog
            </Link>
          </div>
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
          {favorites.map((favorite) => {
            const imageUrl = favorite.bouquetImage
              ? buildImageUrl(favorite.bouquetImage)
              : FALLBACK_IMAGE;

            return (
              <div key={favorite.bouquetId} className="favCard reveal-on-scroll">
                <Link
                  to={`/bouquet/${favorite.bouquetId}`}
                  className="favCard__link"
                >
                  <div className="favCard__imageWrapper">
                    <img
                      src={imageUrl}
                      alt={favorite.bouquetName}
                      className="favCard__image"
                      loading="lazy"
                    />
                    <div className="favCard__overlay">
                      <span className="favCard__view">Lihat Detail</span>
                    </div>
                  </div>
                </Link>

                <div className="favCard__content">
                  <h3 className="favCard__title">{favorite.bouquetName}</h3>
                  <p className="favCard__price">{formatIDR(favorite.bouquetPrice)}</p>
                  <p className="favCard__date">
                    Ditambahkan {formatDate(favorite.addedAt)}
                  </p>
                </div>

                <div className="favCard__actions">
                  <LuxuryButton
                    variant="primary"
                    onClick={() => onQuickOrder(favorite)}
                    className="favCard__btn favCard__btn--primary"
                    size="sm"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "0.5rem" }}>
                      <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Quick Order
                  </LuxuryButton>
                  <div className="favCard__actionGroup">
                    <button
                      type="button"
                      onClick={() => onAddToCart(favorite)}
                      className="favCard__btn favCard__btn--cart"
                      aria-label={`Tambahkan ${favorite.bouquetName} ke keranjang`}
                      title="Tambahkan ke keranjang"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <Link
                      to={`/bouquet/${favorite.bouquetId}`}
                      className="favCard__btn favCard__btn--view"
                      aria-label={`Lihat detail ${favorite.bouquetName}`}
                      title="Lihat detail"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        onRemove(favorite.bouquetId);
                      }}
                      className="favCard__btn favCard__btn--remove"
                      aria-label={`Hapus ${favorite.bouquetName} dari favorit`}
                      title="Hapus dari favorit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="favFooter">
          <Link to="/collection" className="favFooter__link">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FavoritesPageView;
