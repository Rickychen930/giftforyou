import React from "react";
import { Link } from "react-router-dom";
import "../styles/CollectionCardComponent.css";
import BouquetCard from "./bouquet-card-component";
import type { BouquetCardProps } from "./bouquet-card-component";

export interface CollectionContainerProps {
  id: string;
  name: string;
  description: string;
  bouquets: BouquetCardProps[];
  index?: number;
}

// Re-export BouquetCardProps for backward compatibility
export type { BouquetCardProps };

const CollectionContainer: React.FC<CollectionContainerProps> = ({
  id,
  name,
  description,
  bouquets,
  index = 0,
}) => {
  // Validate bouquets array
  const validBouquets = Array.isArray(bouquets) ? bouquets : [];
  const previewBouquets = validBouquets.slice(0, 6);
  const browseHref = `/collection?name=${encodeURIComponent(name)}`;

  const renderBouquetCard = (b: BouquetCardProps, cardIndex: number) => {
    return (
      <BouquetCard
        key={b._id}
        _id={b._id}
        name={b.name}
        description={b.description}
        price={b.price}
        type={b.type}
        size={b.size}
        image={b.image}
        status={b.status}
        collectionName={b.collectionName}
        customPenanda={[]}
        isNewEdition={b.isNewEdition}
        isFeatured={b.isFeatured}
      />
    );
  };

  return (
    <section
      className="collectionCard"
      aria-label={`Koleksi ${name}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <header className="collectionCard__header">
        <div className="collectionCard__heading">
          <div className="collectionCard__titleRow">
            <h2 className="collectionCard__title">{name}</h2>
            {validBouquets && validBouquets.length > 0 && (
              <span
                className="collectionCard__count"
                aria-label={`${validBouquets.length} produk`}
              >
                {validBouquets.length}
              </span>
            )}
          </div>
          <p className="collectionCard__description">{description}</p>
        </div>

        <div className="collectionCard__headerActions">
          <Link
            to={browseHref}
            className="collectionCard__ctaBtn collectionCard__ctaBtn--small"
            aria-label={`Lihat koleksi ${name}`}
            title="Lihat koleksi"
          >
            Lihat koleksi
          </Link>
        </div>
      </header>

      {!validBouquets || validBouquets.length === 0 ? (
        <div className="collectionCard__empty" role="status" aria-live="polite">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="collectionCard__emptyIcon"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="collectionCard__emptyTitle">Lihat koleksi ini</p>
          <p className="collectionCard__emptyText">
            Lihat semua bouquet di koleksi ini.
          </p>

          <div className="collectionCard__emptyActions">
            <Link
              to={browseHref}
              className="collectionCard__ctaBtn"
              aria-label={`Lihat koleksi ${name}`}
              title="Lihat koleksi"
            >
              Lihat koleksi
            </Link>
          </div>
        </div>
      ) : (
        <div className="collectionCard__previewWrap">
          <div
            className="collectionCard__previewGrid"
            role="list"
            aria-label={`Bouquet di koleksi ${name}`}
          >
            {previewBouquets.map((b, idx) => renderBouquetCard(b, idx))}
          </div>

          {validBouquets.length > previewBouquets.length && (
            <div className="collectionCard__footer">
              <Link
                to={browseHref}
                className="collectionCard__ctaBtn"
                aria-label={`Lihat semua bouquet di koleksi ${name}`}
                title="Lihat semua"
              >
                Lihat semua ({validBouquets.length})
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default CollectionContainer;

// Backward compatibility: export as CollectionCard
export { CollectionContainer as CollectionCard };
