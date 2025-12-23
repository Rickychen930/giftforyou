import React from "react";
import { Link } from "react-router-dom";
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
  const statusClass =
    status === "ready" ? "bouquet-status ready" : "bouquet-status preorder";

  const formatPrice = formatIDR;

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_BASE}${image}`
    : FALLBACK_IMAGE;

  const detailHref = `/bouquet/${_id}`;

  const metaParts = [
    status ? (status === "ready" ? "Siap" : "Preorder") : "",
    size ? `Ukuran ${size}` : "",
    type ? `Tipe ${type}` : "",
    collectionName ? `Koleksi ${collectionName}` : "",
  ].filter(Boolean);

  return (
    <article className="bouquet-card" aria-label={`Bouquet ${name}`}>
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
        {size && <span className="bouquet-badge bouquet-size">{size}</span>}
        {type && <span className="bouquet-badge bouquet-type">{type}</span>}
        <span className={`bouquet-badge ${statusClass}`}>
          {status === "ready" ? "Siap" : "Preorder"}
        </span>
      </Link>

      <div className="bouquet-info">
        <h4 className="bouquet-title">
          <Link to={detailHref} aria-label={`Lihat detail ${name}`}>
            {name}
          </Link>
        </h4>

        {metaParts.length > 0 && (
          <p className="bouquet-meta" aria-label="Ringkasan bouquet">
            {metaParts.join(" • ")}
          </p>
        )}
        {description && <p className="bouquet-description">{description}</p>}
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
