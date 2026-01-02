/**
 * Catalog Grid Component (OOP)
 * Class-based component following SOLID principles
 * Enhanced with Grid component for consistent responsive layout
 */

import React, { Component } from "react";
import "../../styles/catalog/CatalogGrid.css";
import Grid from "../layout/Grid";
import BouquetCard from "../cards/BouquetCard";
import type { Bouquet } from "../../models/domain/bouquet";

export interface CatalogGridProps {
  bouquets: Bouquet[];
  ariaLabel?: string;
  className?: string;
}

interface CatalogGridState {
  // No state needed, but keeping for consistency
}

/**
 * Catalog Grid Component
 * Class-based component for displaying bouquets in a grid
 * Uses Grid component for consistent responsive layout
 */
class CatalogGrid extends Component<CatalogGridProps, CatalogGridState> {
  private baseClass: string = "catalog-grid";

  render(): React.ReactNode {
    const { bouquets, ariaLabel, className = "" } = this.props;

    if (bouquets.length === 0) return null;

    return (
      <Grid
        minColumnWidth="sm"
        gap="lg"
        className={`${this.baseClass} ${className}`}
        ariaLabel={ariaLabel || `Menampilkan ${bouquets.length} bouquet`}
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
      </Grid>
    );
  }
}

export default CatalogGrid;
