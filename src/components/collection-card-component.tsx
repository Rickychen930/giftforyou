import React from "react";
// import { Link } from "react-router-dom";
import "../styles/CollectionCardComponent.css";

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

export interface CollectionCardProps {
  id: string;
  name: string;
  description: string;
  bouquets: BouquetCardProps[]; // ✅ plain props, bukan IBouquet Document
}

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  description,
  bouquets,
}) => {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  const renderBouquetCard = (b: BouquetCardProps) => {
    const waMessage = encodeURIComponent(
      `Halo, saya ingin order bouquet "${b.name}" dengan harga ${formatPrice(
        b.price
      )} ukuran ${b.size}`
    );
    const waLink = `https://wa.me/6285161428911?text=${waMessage}`;

    const imageUrl = b.image
      ? b.image.startsWith("http")
        ? b.image
        : `${API_BASE}${b.image}`
      : FALLBACK_IMAGE;

    return (
      <div key={b._id} className="bouquet-card">
        <img
          src={imageUrl}
          alt={b.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />

        <div className="bouquet-name">{b.name}</div>
        <div className="bouquet-price">{formatPrice(b.price)}</div>
        {b.size && <div className="bouquet-size">Ukuran: {b.size}</div>}

        <div className="bouquet-actions">
          {/* <Link to={`/bouquet/${b._id}`} className="bouquet-button">
            See Detail
          </Link> */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bouquet-trolley"
          >
            🛒
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="collection-card">
      <div className="collection-header">
        <h2 className="collection-title">{name}</h2>
        <p className="collection-description">{description}</p>
      </div>

      {!bouquets || bouquets.length === 0 ? (
        <p className="bouquet-empty">
          🌸 No bouquets available in this collection.
        </p>
      ) : (
        <div className="bouquet-scroll">
          {bouquets.map(renderBouquetCard)}

          {/* ✅ "See More" card at the end */}
          {/* <div className="bouquet-card see-more-card">
            <Link to={`/collection/${id}`} className="see-more-link">
              See More →
            </Link>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default CollectionCard;
