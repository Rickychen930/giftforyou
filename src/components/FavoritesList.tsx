/**
 * Favorites List Component
 * Displays user's favorite bouquets with luxury design
 * Supports infinite scroll and real-time updates
 */

import React, { memo, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { formatIDR } from "../utils/money";
import { getFavorites, removeFromFavorites, type FavoriteItem } from "../utils/favorites";
import { API_BASE } from "../config/api";
import { toast } from "../utils/toast";
import "../styles/FavoritesList.css";

interface FavoritesListProps {
  limit?: number;
  showRemoveButton?: boolean;
}

const FavoritesList: React.FC<FavoritesListProps> = ({
  limit,
  showRemoveButton = true,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    try {
      const allFavorites = getFavorites();
      const limitedFavorites = limit ? allFavorites.slice(0, limit) : allFavorites;
      setFavorites(limitedFavorites);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadFavorites();

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [loadFavorites]);

  const handleRemove = useCallback(
    (bouquetId: string, bouquetName: string) => {
      if (window.confirm(`Hapus "${bouquetName}" dari favorit?`)) {
        removeFromFavorites(bouquetId);
        toast.success("Dihapus dari favorit");
        loadFavorites();
      }
    },
    [loadFavorites]
  );

  const getImageUrl = useCallback((image?: string) => {
    if (!image) return "/images/placeholder-bouquet.jpg";
    return image.startsWith("http") ? image : `${API_BASE}${image}`;
  }, []);

  if (isLoading) {
    return (
      <div className="favoritesList favoritesList--loading">
        <div className="favoritesList__spinner" aria-label="Loading favorites">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-15.708;-31.416;-31.416"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </div>
        <p>Memuat favorit...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favoritesList favoritesList--empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
        <h3>Belum Ada Favorit</h3>
        <p>Mulai jelajahi koleksi bouquet kami dan simpan favorit Anda</p>
        <Link to="/collection" className="favoritesList__cta btn-luxury">
          Jelajahi Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="favoritesList">
      <div className="favoritesList__grid">
        {favorites.map((favorite) => (
          <div key={favorite.bouquetId} className="favoritesList__card">
            <Link
              to={`/bouquet/${favorite.bouquetId}`}
              className="favoritesList__cardLink"
            >
              <div className="favoritesList__imageWrapper">
                <img
                  src={getImageUrl(favorite.bouquetImage)}
                  alt={favorite.bouquetName}
                  className="favoritesList__image"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder-bouquet.jpg";
                  }}
                />
                <div className="favoritesList__overlay">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div className="favoritesList__content">
                <h3 className="favoritesList__title">{favorite.bouquetName}</h3>
                <p className="favoritesList__price">{formatIDR(favorite.bouquetPrice)}</p>
              </div>
            </Link>
            {showRemoveButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(favorite.bouquetId, favorite.bouquetName);
                }}
                className="favoritesList__removeBtn"
                aria-label={`Hapus ${favorite.bouquetName} dari favorit`}
                title="Hapus dari favorit"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(FavoritesList);

