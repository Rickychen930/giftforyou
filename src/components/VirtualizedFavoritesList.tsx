/**
 * Virtualized Favorites List Component with React Window
 * Luxury, Elegant, High-Performance Favorites List
 * Implements virtualization and optimal rendering
 * Follows SOLID, DRY, MVP, OOP principles
 */

import React, { memo, useMemo, useCallback, useEffect, useState } from "react";
import { Grid, useGridRef } from "react-window";
import { Link } from "react-router-dom";
import { formatIDR } from "../utils/money";
import { getFavorites, removeFromFavorites, type FavoriteItem } from "../utils/favorites";
import { API_BASE } from "../config/api";
import { toast } from "../utils/toast";
import "../styles/VirtualizedFavoritesList.css";

interface VirtualizedFavoritesListProps {
  limit?: number;
  showRemoveButton?: boolean;
  columnCount?: number;
  itemHeight?: number;
  containerHeight?: number;
}

/**
 * Favorite Card Cell Component - Memoized for performance
 */


/**
 * Main Virtualized Favorites List Component
 */
const VirtualizedFavoritesList: React.FC<VirtualizedFavoritesListProps> = ({
  limit,
  showRemoveButton = true,
  columnCount: propColumnCount,
  itemHeight = 320,
  containerHeight = 600,
}) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const gridRef = useGridRef();
  const [containerWidth, setContainerWidth] = useState(1200);

  // Load favorites
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

    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [loadFavorites]);

  // Handle remove
  const handleRemove = useCallback(
    (bouquetId: string, bouquetName: string) => {
      try {
        if (!bouquetId || typeof bouquetId !== "string" || bouquetId.trim() === "") {
          toast.error("ID bouquet tidak valid");
          return;
        }
        
        removeFromFavorites(bouquetId);
        toast.success("Dihapus dari favorit");
        loadFavorites();
        // Dispatch event for other components
        try {
          window.dispatchEvent(new Event("favoritesUpdated"));
        } catch (eventError) {
          console.warn("Failed to dispatch favoritesUpdated event:", eventError);
        }
      } catch (error) {
        console.error("Failed to remove favorite:", error);
        toast.error("Gagal menghapus dari favorit. Silakan coba lagi.");
      }
    },
    [loadFavorites]
  );

  // Calculate column count based on container width with validation
  const columnCount = useMemo(() => {
    if (propColumnCount && Number.isFinite(propColumnCount) && propColumnCount > 0) {
      return Math.max(1, Math.min(propColumnCount, 6)); // Min 1, Max 6
    }
    if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 1;
    if (containerWidth >= 1200) return 4;
    if (containerWidth >= 768) return 3;
    if (containerWidth >= 480) return 2;
    return 1;
  }, [containerWidth, propColumnCount]);

  // Calculate column width with validation
  const columnWidth = useMemo(() => {
    if (!Number.isFinite(containerWidth) || containerWidth <= 0) return 300;
    if (!Number.isFinite(columnCount) || columnCount <= 0) return 300;
    try {
      const gap = 24;
      const calculatedWidth = (containerWidth - gap * (columnCount + 1)) / columnCount;
      if (!Number.isFinite(calculatedWidth) || calculatedWidth <= 0) return 300;
      return Math.max(200, Math.min(calculatedWidth, 500)); // Min 200, Max 500
    } catch {
      return 300;
    }
  }, [containerWidth, columnCount]);

  // Calculate row count with validation
  const rowCount = useMemo(() => {
    if (!Array.isArray(favorites) || favorites.length === 0) return 0;
    if (!Number.isFinite(columnCount) || columnCount <= 0) return 0;
    const count = Math.ceil(favorites.length / columnCount);
    return Number.isFinite(count) && count > 0 ? count : 0;
  }, [favorites, columnCount]);

  // Calculate container height dynamically
  const calculatedHeight = useMemo(() => {
    if (typeof window === "undefined") return containerHeight;
    try {
      const windowHeight = window.innerHeight;
      const headerHeight = 200;
      const padding = 100;
      const calculated = windowHeight - headerHeight - padding;
      return Math.max(400, Math.min(calculated, containerHeight));
    } catch {
      return containerHeight;
    }
  }, [containerHeight]);

  // Handle container width changes
  useEffect(() => {
    const updateWidth = () => {
      const element = document.querySelector(".virtualizedFavoritesList");
      if (element) {
        setContainerWidth(element.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Memoized item data for react-window
  const itemData = useMemo(() => ({
    favorites,
    columnCount,
    onRemove: handleRemove,
    showRemoveButton,
  }), [favorites, columnCount, handleRemove, showRemoveButton]);

  // Cell component with proper typing
  const CellComponent = useCallback(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const { favorites, columnCount, onRemove, showRemoveButton } = itemData;
    
    // Edge case: validate arrays and indices
    if (!Array.isArray(favorites) || !Number.isFinite(columnIndex) || !Number.isFinite(rowIndex) || !Number.isFinite(columnCount) || columnCount <= 0) {
      return <div style={style} />;
    }
    
    const index = rowIndex * columnCount + columnIndex;
    
    // Edge case: index bounds checking
    if (index < 0 || index >= favorites.length) {
      return <div style={style} />;
    }
    
    const favorite = favorites[index];

    // Validate favorite data
    if (!favorite || typeof favorite !== "object" || !favorite.bouquetId) {
      return <div style={style} />;
    }

    const bouquetId = String(favorite.bouquetId);
    const bouquetName = typeof favorite.bouquetName === "string" ? favorite.bouquetName : "Bouquet";
    const bouquetPrice = typeof favorite.bouquetPrice === "number" && Number.isFinite(favorite.bouquetPrice)
      ? favorite.bouquetPrice
      : 0;
    const bouquetImage = favorite.bouquetImage;

    const getImageUrl = (image?: string) => {
      if (!image || typeof image !== "string" || image.trim() === "") {
        return "/images/placeholder-bouquet.jpg";
      }
      try {
        if (image.startsWith("http://") || image.startsWith("https://")) {
          return image;
        }
        if (image.startsWith("/")) {
          return `${API_BASE}${image}`;
        }
        return `${API_BASE}/${image}`;
      } catch {
        return "/images/placeholder-bouquet.jpg";
      }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        if (window.confirm(`Hapus "${bouquetName}" dari favorit?`)) {
          onRemove(bouquetId, bouquetName);
        }
      } catch (error) {
        console.error("Error in handleRemoveClick:", error);
      }
    };

    return (
      <div style={style} className="virtualizedFavoritesList__cell">
        <div className="virtualizedFavoritesList__card">
          <Link
            to={`/bouquet/${bouquetId}`}
            className="virtualizedFavoritesList__cardLink"
          >
            <div className="virtualizedFavoritesList__imageWrapper">
              <img
                src={getImageUrl(bouquetImage)}
                alt={bouquetName}
                className="virtualizedFavoritesList__image"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/placeholder-bouquet.jpg";
                }}
              />
              <div className="virtualizedFavoritesList__overlay">
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
            <div className="virtualizedFavoritesList__content">
              <h3 className="virtualizedFavoritesList__title" title={bouquetName}>
                {bouquetName}
              </h3>
              <p className="virtualizedFavoritesList__price">{formatIDR(bouquetPrice)}</p>
            </div>
          </Link>
          {showRemoveButton && (
            <button
              type="button"
              onClick={handleRemoveClick}
              className="virtualizedFavoritesList__removeBtn"
              aria-label={`Hapus ${bouquetName} dari favorit`}
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
      </div>
    );
  }, [itemData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="virtualizedFavoritesList virtualizedFavoritesList--loading">
        <div className="virtualizedFavoritesList__spinner" aria-label="Loading favorites">
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

  // Empty state
  if (favorites.length === 0) {
    return (
      <div className="virtualizedFavoritesList virtualizedFavoritesList--empty">
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
        <Link to="/collection" className="virtualizedFavoritesList__cta btn-luxury">
          Jelajahi Katalog
        </Link>
      </div>
    );
  }

  // Use virtualization for 8+ items, regular grid for fewer
  const shouldVirtualize = favorites.length > 8;

  return (
    <div className="virtualizedFavoritesList">
      {shouldVirtualize ? (
        <div className="virtualizedFavoritesList__virtualized" style={{ height: calculatedHeight }}>
          <Grid
            {...({
              gridRef: gridRef,
              columnCount: columnCount,
              columnWidth: columnWidth,
              height: calculatedHeight,
              rowCount: Math.max(0, rowCount),
              rowHeight: itemHeight,
              width: containerWidth,
              itemData: itemData,
              overscanRowCount: 2,
              overscanColumnCount: 1,
              className: "virtualizedFavoritesList__grid",
              cellComponent: CellComponent,
            } as any)}
          />
        </div>
      ) : (
        <div className="virtualizedFavoritesList__regularGrid">
          {favorites.map((favorite, idx) => {
            // Additional validation for regular grid
            if (!favorite || typeof favorite !== "object" || !favorite.bouquetId) {
              return null;
            }
            
            const bouquetId = String(favorite.bouquetId);
            const bouquetName = typeof favorite.bouquetName === "string" ? favorite.bouquetName : "Bouquet";
            const bouquetPrice = typeof favorite.bouquetPrice === "number" && Number.isFinite(favorite.bouquetPrice)
              ? favorite.bouquetPrice
              : 0;
            const bouquetImage = favorite.bouquetImage;
            
            const getImageUrl = (image?: string) => {
              if (!image || typeof image !== "string" || image.trim() === "") {
                return "/images/placeholder-bouquet.jpg";
              }
              try {
                if (image.startsWith("http://") || image.startsWith("https://")) {
                  return image;
                }
                if (image.startsWith("/")) {
                  return `${API_BASE}${image}`;
                }
                return `${API_BASE}/${image}`;
              } catch {
                return "/images/placeholder-bouquet.jpg";
              }
            };

            return (
              <div key={`${bouquetId}-${idx}`} className="virtualizedFavoritesList__card">
                <Link
                  to={`/bouquet/${bouquetId}`}
                  className="virtualizedFavoritesList__cardLink"
                >
                  <div className="virtualizedFavoritesList__imageWrapper">
                    <img
                      src={getImageUrl(bouquetImage)}
                      alt={bouquetName}
                      className="virtualizedFavoritesList__image"
                      loading="lazy"
                      onError={(e) => {
                        try {
                          (e.target as HTMLImageElement).src = "/images/placeholder-bouquet.jpg";
                        } catch {
                          // Silently fail
                        }
                      }}
                    />
                    <div className="virtualizedFavoritesList__overlay">
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
                  <div className="virtualizedFavoritesList__content">
                    <h3 className="virtualizedFavoritesList__title">{bouquetName}</h3>
                    <p className="virtualizedFavoritesList__price">{formatIDR(bouquetPrice)}</p>
                  </div>
                </Link>
                {showRemoveButton && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm(`Hapus "${bouquetName}" dari favorit?`)) {
                        handleRemove(bouquetId, bouquetName);
                      }
                    }}
                    className="virtualizedFavoritesList__removeBtn"
                    aria-label={`Hapus ${bouquetName} dari favorit`}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default memo(VirtualizedFavoritesList);

