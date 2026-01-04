import React, { useMemo, memo } from "react";
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
  style?: React.CSSProperties;
}

// Re-export BouquetCardProps for backward compatibility
export type { BouquetCardProps };

// Constants
const PREVIEW_BOUQUET_LIMIT = 6;

// Empty state component - memoized
const EmptyCollectionState: React.FC<{ browseHref: string; collectionName: string }> = memo(
  ({ browseHref, collectionName }) => (
    <div className="collectionCard__empty" role="status" aria-live="polite">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="collectionCard__emptyIcon"
        aria-hidden="true"
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
          aria-label={`Lihat koleksi ${collectionName}`}
          title="Lihat koleksi"
        >
          Lihat koleksi
        </Link>
      </div>
    </div>
  )
);

EmptyCollectionState.displayName = "EmptyCollectionState";

const CollectionContainer: React.FC<CollectionContainerProps> = ({
  id,
  name,
  description,
  bouquets,
  index = 0,
  style,
}) => {
  // Memoize validated bouquets
  const validBouquets = useMemo(() => {
    return Array.isArray(bouquets) ? bouquets : [];
  }, [bouquets]);

  // Memoize preview bouquets
  const previewBouquets = useMemo(() => {
    return validBouquets.slice(0, PREVIEW_BOUQUET_LIMIT);
  }, [validBouquets]);

  // Memoize browse href
  const browseHref = useMemo(() => {
    return `/collection?name=${encodeURIComponent(name)}`;
  }, [name]);

  // Memoize animation delay style
  const animationDelayStyle = useMemo(() => {
    return { animationDelay: `${index * 0.1}s` };
  }, [index]);

  const hasMoreBouquets = validBouquets.length > previewBouquets.length;
  const isEmpty = validBouquets.length === 0;

  // Merge styles
  const mergedStyle = useMemo(() => {
    return { ...animationDelayStyle, ...style };
  }, [animationDelayStyle, style]);

  return (
    <section
      className="collectionCard"
      aria-label={`Koleksi ${name}`}
      style={mergedStyle}
    >
      <header className="collectionCard__header">
        <div className="collectionCard__heading">
          <div className="collectionCard__titleRow">
            <h2 className="collectionCard__title">{name}</h2>
            {!isEmpty && (
              <span
                className="collectionCard__count"
                aria-label={`${validBouquets.length} produk`}
              >
                {validBouquets.length}
              </span>
            )}
          </div>
          {description && (
            <p className="collectionCard__description">{description}</p>
          )}
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

      {isEmpty ? (
        <EmptyCollectionState browseHref={browseHref} collectionName={name} />
      ) : (
        <div className="collectionCard__previewWrap">
          <div
            className="collectionCard__previewGrid"
            role="list"
            aria-label={`Bouquet di koleksi ${name}`}
          >
            {previewBouquets.map((b) => (
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
                customPenanda={b.customPenanda ?? []}
                isNewEdition={b.isNewEdition}
                isFeatured={b.isFeatured}
              />
            ))}
          </div>

          {hasMoreBouquets && (
            <div className="collectionCard__footer">
              <Link
                to={browseHref}
                className="collectionCard__ctaBtn"
                aria-label={`Lihat semua bouquet di koleksi ${name} (${validBouquets.length} total)`}
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

// Memoize component to prevent unnecessary re-renders
export default memo(CollectionContainer);

// Backward compatibility: export as CollectionCard
export { CollectionContainer as CollectionCard };
