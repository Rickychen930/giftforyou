import React from "react";
import { Link } from "react-router-dom";
import "../styles/BouquetCardComponent.css";

import { API_BASE } from "../config/api"; // adjust path depending on folder depth
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
}) => {
  const statusClass =
    status === "ready" ? "bouquet-status ready" : "bouquet-status preorder";

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${API_BASE}${image}`
    : FALLBACK_IMAGE;

  return (
    <div className="bouquet-card">
      <div className="bouquet-image-wrapper">
        <img
          src={imageUrl}
          alt={`Bouquet: ${name}`}
          className="bouquet-image"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        {size && <span className="bouquet-badge bouquet-size">{size}</span>}
        {type && <span className="bouquet-badge bouquet-type">{type}</span>}
        <span className={`bouquet-badge ${statusClass}`}>{status}</span>
      </div>

      <div className="bouquet-info">
        <h4 className="bouquet-title">{name}</h4>
        {description && <p className="bouquet-description">{description}</p>}
        <div className="bouquet-footer">
          <p className="bouquet-price">{formatPrice(price)}</p>
          <Link to={`/bouquet/${_id}`} className="bouquet-button">
            More Detail
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BouquetCard;
