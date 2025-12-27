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
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <article
      className="bouquet-card fade-in hover-lift"
      style={{ opacity: 1, visibility: 'visible' }}
      aria-label={`Bouquet ${name}, harga ${formatPrice(price)}`}
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <Link
        to={detailHref}
        className="bouquet-image-wrapper"
        aria-label={`Lihat detail bouquet ${name}`}
      >
        {!imageLoaded && (
          <div className="bouquet-image-skeleton" aria-hidden="true">
            <div className="bouquet-image-skeleton__shimmer"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`Bouquet ${name}${description ? ` - ${description}` : ""}`}
          className={`bouquet-image ${imageLoaded ? "is-loaded" : ""} ${imageError ? "is-error" : ""}`}
          loading="lazy"
          decoding="async"
          width="400"
          height="533"
          style={{ aspectRatio: "3 / 4" }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="bouquet-image-overlay">
          {/* Top Left - Featured/New Badges */}
          <div className="bouquet-badge-top-left">
            {isFeatured && (
              <span className="bouquet-badge bouquet-badge--featured" aria-label="Bouquet featured">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                Featured
              </span>
            )}
            {isNewEdition && !isFeatured && (
              <span className="bouquet-badge bouquet-badge--new" aria-label="Bouquet baru">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Baru
              </span>
            )}
          </div>

          {/* Top Right - Status Badge */}
          <span className={`bouquet-status-badge ${status === "ready" ? "is-ready" : "is-preorder"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {status === "ready" ? (
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
            {status === "ready" ? "Siap" : "Preorder"}
          </span>

          {/* Bottom Right - Price Badge */}
          <div className="bouquet-price-badge">
            <span className="bouquet-price-badge__label">Mulai dari</span>
            <span className="bouquet-price-badge__amount">{formatPrice(price)}</span>
          </div>
        </div>
        {isHovered && (
          <div className="bouquet-image-hover-overlay" aria-hidden="true">
            <div className="bouquet-image-hover-content">
              <span className="bouquet-hover-text">Klik untuk detail</span>
            </div>
          </div>
        )}
      </Link>

      <div className="bouquet-info">
        {/* Simplified: Only Name, Tags, and Price */}
        <h4 className="bouquet-title">
          <Link to={detailHref} aria-label={`Lihat detail bouquet ${formatBouquetName(name)}`}>
            {formatBouquetName(name)}
          </Link>
        </h4>

        {/* Tags - Compact display */}
        {(tags.length > 0 || customPenanda.length > 0) && (
          <div className="bouquet-tags" aria-label="Kategori bouquet">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="bouquet-tag" title={t}>
                {formatTag(t)}
              </span>
            ))}
            {customPenanda.slice(0, Math.max(0, 2 - tags.length)).map((p, idx) => (
              <span key={`penanda-${idx}-${p}`} className="bouquet-tag bouquet-tag--penanda" title={p}>
                {formatTag(p)}
              </span>
            ))}
            {(tags.length + customPenanda.length) > 2 && (
              <span className="bouquet-tag bouquet-tag--more" title={[...tags, ...customPenanda].slice(2).join(", ")}>
                +{(tags.length + customPenanda.length) - 2}
              </span>
            )}
          </div>
        )}

        {/* Price - Prominent display */}
        <div className="bouquet-price-wrapper">
          <p className="bouquet-price" aria-label={`Harga ${formatPrice(price)}`}>
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </article>
  );
};

export default BouquetCard;
