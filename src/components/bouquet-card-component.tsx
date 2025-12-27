import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BouquetCardComponent.css";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
import { formatIDR } from "../utils/money";
import { formatBouquetName, formatBouquetType, formatBouquetSize, formatCollectionName, formatTag } from "../utils/text-formatter";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

// Plain props untuk komponen UI
export interface BouquetCardProps {
  _id: string;
  name: string;
  description?: string;
  price: number;
  type?: string;
  size?: string;
  image?: string;
  status: "ready" | "preorder";
  collectionName?: string;
  customPenanda?: string[];
  isNewEdition?: boolean;
  isFeatured?: boolean;
}

const BouquetCard: React.FC<BouquetCardProps> = ({
  _id,
  name,
  description,
  price,
  type,
  size,
  image,
  status,
  collectionName,
  customPenanda = [],
  isNewEdition = false,
  isFeatured = false,
}) => {
  const navigate = useNavigate();
  const formatPrice = formatIDR;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_BASE}${image}`
    : FALLBACK_IMAGE;

  const detailHref = `/bouquet/${_id}`;

  const handleCardNavigate = useCallback(() => {
    navigate(detailHref);
  }, [navigate, detailHref]);

  const handleCardClick: React.MouseEventHandler<HTMLElement> = useCallback((e) => {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Don't hijack clicks on interactive elements.
    if (target.closest("a,button,[role='button'],input,select,textarea,label")) {
      return;
    }

    handleCardNavigate();
  }, [handleCardNavigate]);

  const handleCardKeyDown: React.KeyboardEventHandler<HTMLElement> = useCallback((e) => {
    if (e.defaultPrevented) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardNavigate();
    }
  }, [handleCardNavigate]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Ensure image is visible even if load handler doesn't fire
  React.useEffect(() => {
    if (imageUrl && imageUrl !== FALLBACK_IMAGE) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
        setImageLoaded(true);
      };
      img.src = imageUrl;
    } else {
      setImageLoaded(true);
    }
  }, [imageUrl]);

  const tags = [
    formatCollectionName(collectionName),
    formatBouquetType(type),
    formatBouquetSize(size)
  ].filter(Boolean) as string[];

  const statusLabel = status === "ready" ? "Siap" : "Preorder";

  return (
    <article
      className="bouquetCard"
      role="listitem"
      aria-label={`Bouquet ${name}, harga ${formatPrice(price)}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      {/* Media Section - Smaller, more informative */}
      <div className="bouquetCard__media">
        <Link
          to={detailHref}
          className="bouquetCard__mediaLink"
          aria-label={`Lihat detail ${name}`}
        >
          {!imageLoaded && (
            <div className="bouquetCard__skeleton" aria-hidden="true">
              <div className="bouquetCard__skeletonShimmer"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={formatBouquetName(name)}
            className={`bouquetCard__image ${imageLoaded ? "is-loaded" : ""} ${imageError ? "is-error" : ""}`}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
          <div className="bouquetCard__overlay">
            {/* Top Left - Featured/New Badges */}
            {(isFeatured || isNewEdition) && (
              <div className="bouquetCard__badgeTopLeft">
                {isFeatured && (
                  <span className="bouquetCard__badge bouquetCard__badge--featured" aria-label="Bouquet featured">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                    Featured
                  </span>
                )}
                {isNewEdition && !isFeatured && (
                  <span className="bouquetCard__badge bouquetCard__badge--new" aria-label="Bouquet baru">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Baru
                  </span>
                )}
              </div>
            )}

            {/* Top Right - Status Badge */}
            <span
              className={`bouquetCard__badge bouquetCard__badge--status ${
                status === "ready" ? "is-ready" : "is-preorder"
              }`}
              aria-label={`Status: ${statusLabel}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {status === "ready" ? (
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                ) : (
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                )}
              </svg>
              {statusLabel}
            </span>
          </div>
        </Link>
      </div>

      {/* Body Section - Name, Price, Badge */}
      <div className="bouquetCard__body">
        {/* Name */}
        <h3 className="bouquetCard__name">
          <Link
            to={detailHref}
            className="bouquetCard__nameLink"
            aria-label={`Buka detail ${formatBouquetName(name)}`}
          >
            {formatBouquetName(name)}
          </Link>
        </h3>

        {/* Price */}
        <div className="bouquetCard__priceWrapper">
          <p className="bouquetCard__price" aria-label={`Harga ${formatPrice(price)}`}>
            {formatPrice(price)}
          </p>
        </div>

        {/* Badge/Tags */}
        {(tags.length > 0 || customPenanda.length > 0) && (
          <div className="bouquetCard__meta" aria-label="Bouquet details">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="bouquetCard__chip" title={t}>
                {formatTag(t)}
              </span>
            ))}
            {customPenanda.slice(0, Math.max(0, 2 - tags.length)).map((p, idx) => (
              <span key={`penanda-${idx}-${p}`} className="bouquetCard__chip" title={p}>
                {formatTag(p)}
              </span>
            ))}
            {(tags.length + customPenanda.length) > 2 && (
              <span className="bouquetCard__chip bouquetCard__chip--more" title={[...tags, ...customPenanda].slice(2).join(", ")}>
                +{(tags.length + customPenanda.length) - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BouquetCard;
