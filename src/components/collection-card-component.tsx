import React from "react";
import "../styles/CollectionCardComponent.css";

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
  bouquets: BouquetCardProps[];
}

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";
const FALLBACK_IMAGE = "/images/placeholder-bouquet.jpg";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);

const buildImageUrl = (image?: string) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return `${API_BASE}${image}`;
};

const CollectionCard: React.FC<CollectionCardProps> = ({
  id,
  name,
  description,
  bouquets,
}) => {
  const renderBouquetCard = (b: BouquetCardProps) => {
    const waMessage = encodeURIComponent(
      `Halo, saya ingin order bouquet "${b.name}" (${formatPrice(b.price)})${
        b.size ? ` ukuran ${b.size}` : ""
      }.`
    );
    const waLink = `https://wa.me/6285161428911?text=${waMessage}`;

    const imageUrl = buildImageUrl(b.image);
    const statusLabel = b.status === "ready" ? "Ready" : "Preorder";

    return (
      <article key={b._id} className="bouquetCard" role="listitem">
        <div className="bouquetCard__media">
          <img
            src={imageUrl}
            alt={b.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <span
            className={`bouquetCard__badge ${
              b.status === "ready" ? "is-ready" : "is-preorder"
            }`}
            aria-label={`Status: ${statusLabel}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="bouquetCard__body">
          <h3 className="bouquetCard__name">{b.name}</h3>

          <p className="bouquetCard__price">
            {formatPrice(b.price)}
            {/* <span className="bouquetCard__priceNote">from</span> */}
          </p>

          {(b.size || b.type) && (
            <div className="bouquetCard__meta" aria-label="Bouquet details">
              {b.size && (
                <span className="bouquetCard__chip">Size: {b.size}</span>
              )}
              {b.type && (
                <span className="bouquetCard__chip">Type: {b.type}</span>
              )}
            </div>
          )}

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bouquetCard__btn"
            aria-label={`Order ${b.name} via WhatsApp`}
            title="Order via WhatsApp"
          >
            Order via WhatsApp
          </a>
        </div>
      </article>
    );
  };

  return (
    <section className="collectionCard" aria-label={`Collection ${name}`}>
      <header className="collectionCard__header">
        <div className="collectionCard__heading">
          <h2 className="collectionCard__title">{name}</h2>
          <p className="collectionCard__description">{description}</p>
        </div>

        {/* Optional future link */}
        {/* <a className="collectionCard__seeAll" href={`/collection/${id}`}>See all</a> */}
      </header>

      {!bouquets || bouquets.length === 0 ? (
        <div className="collectionCard__empty" role="status" aria-live="polite">
          <p className="collectionCard__emptyTitle">No bouquets yet</p>
          <p className="collectionCard__emptyText">
            New items will appear here when the collection is updated.
          </p>
        </div>
      ) : (
        <div className="collectionCard__scrollWrap">
          <div
            className="collectionCard__scroll"
            role="list"
            aria-label={`${name} bouquets`}
          >
            {bouquets.map(renderBouquetCard)}
          </div>
        </div>
      )}
    </section>
  );
};

export default CollectionCard;
