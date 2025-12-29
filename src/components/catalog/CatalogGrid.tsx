import React from "react";
import "../../styles/catalog/CatalogGrid.css";
import BouquetCard from "../bouquet-card-component";
import type { Bouquet } from "../../models/domain/bouquet";

export interface CatalogGridProps {
  bouquets: Bouquet[];
  ariaLabel?: string;
  className?: string;
}

const CatalogGrid: React.FC<CatalogGridProps> = ({
  bouquets,
  ariaLabel,
  className = "",
}) => {
  if (bouquets.length === 0) return null;

  return (
    <div
      className={`catalog-grid ${className}`}
      role="list"
      aria-label={ariaLabel || `Menampilkan ${bouquets.length} bouquet`}
    >
      {bouquets.map((b) => (
        <BouquetCard
          key={b._id}
          _id={String(b._id)}
          name={b.name}
          description={b.description}
          price={b.price}
          type={b.type}
          size={b.size}
          image={b.image}
          status={b.status}
          collectionName={b.collectionName}
          customPenanda={b.customPenanda}
          isNewEdition={b.isNewEdition}
          isFeatured={b.isFeatured}
        />
      ))}
    </div>
  );
};

export default CatalogGrid;

