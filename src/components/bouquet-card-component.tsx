import React from "react";
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
}) => {
  const navigate = useNavigate();
  const formatPrice = formatIDR;

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_BASE}${image}`
    : FALLBACK_IMAGE;

  const detailHref = `/bouquet/${_id}`;

  const handleCardNavigate = () => {
    navigate(detailHref);
  };

  const handleCardClick: React.MouseEventHandler<HTMLElement> = (e) => {
    if (e.defaultPrevented) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Don't hijack clicks on interactive elements.
    if (target.closest("a,button,[role='button'],input,select,textarea,label")) {
      return;
    }

    handleCardNavigate();
  };

  const handleCardKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
    if (e.defaultPrevented) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardNavigate();
    }
  };

  const tags = [collectionName, type, size].filter(Boolean) as string[];

  return (
    <article
      className="bouquet-card"
      aria-label={`Buka detail bouquet ${name}`}
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
    >
      <Link
        to={detailHref}
        className="bouquet-image-wrapper"
        aria-label={`Buka detail ${name}`}
      >
        <img
          src={imageUrl}
          alt={`Bouquet: ${name}`}
          className="bouquet-image"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </Link>

      <div className="bouquet-info">
        <div className="bouquet-kicker" aria-label="Informasi singkat">
          <span className={`bouquet-kicker__status ${status === "ready" ? "is-ready" : "is-preorder"}`}>
            {status === "ready" ? "Ready" : "Preorder"}
          </span>
          {tags.length > 0 && (
            <div className="bouquet-tags" aria-label="Tag bouquet">
              {tags.slice(0, 3).map((t) => (
                <span key={t} className="bouquet-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <h4 className="bouquet-title">
          <Link to={detailHref} aria-label={`Lihat detail ${name}`}>
            {name}
          </Link>
        </h4>
        {/* Intentionally hidden in grid for a cleaner luxury layout */}
        <div className="bouquet-footer">
          <p className="bouquet-price">{formatPrice(price)}</p>
          <Link to={detailHref} className="bouquet-button">
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BouquetCard;
