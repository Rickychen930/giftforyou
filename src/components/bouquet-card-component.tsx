import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BouquetCardComponent.css";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
import { formatIDR } from "../utils/money";
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

  const tags = [collectionName, type, size].filter(Boolean) as string[];

  return (
    <article
      className="bouquet-card fade-in hover-lift"
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
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className="bouquet-image-overlay">
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
        {(tags.length > 0 || customPenanda.length > 0) && (
          <div className="bouquet-tags" aria-label="Kategori bouquet">
            {tags.slice(0, 2).map((t) => (
              <span key={t} className="bouquet-tag" title={t}>
                {t}
              </span>
            ))}
            {customPenanda.slice(0, Math.max(0, 2 - tags.length)).map((p, idx) => (
              <span key={`penanda-${idx}-${p}`} className="bouquet-tag bouquet-tag--penanda" title={p}>
                {p}
              </span>
            ))}
            {(tags.length + customPenanda.length) > 2 && (
              <span className="bouquet-tag bouquet-tag--more" title={[...tags, ...customPenanda].slice(2).join(", ")}>
                +{(tags.length + customPenanda.length) - 2}
              </span>
            )}
          </div>
        )}

        <h4 className="bouquet-title">
          <Link to={detailHref} aria-label={`Lihat detail bouquet ${name}`}>
            {name}
          </Link>
        </h4>

        {description && (
          <p className="bouquet-description" title={description}>
            {description}
          </p>
        )}

        <div className="bouquet-footer">
          <div className="bouquet-price-wrapper">
            <p className="bouquet-price" aria-label={`Harga ${formatPrice(price)}`}>
              {formatPrice(price)}
            </p>
            {status === "ready" && (
              <span className="bouquet-price-hint" aria-label="Bouquet siap dikirim">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Siap kirim
              </span>
            )}
          </div>
          <Link 
            to={detailHref} 
            className="bouquet-button"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Lihat detail lengkap bouquet ${name}`}
          >
            <span>Lihat Detail</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BouquetCard;
