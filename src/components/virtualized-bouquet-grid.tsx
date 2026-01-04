/**
 * Virtualized Bouquet Grid Component
 * Uses react-window for efficient rendering of large lists
 * Follows SOLID, DRY, MVP principles
 */

import React, { memo, useMemo, useCallback, createElement } from "react";
import { Grid } from "react-window";
import BouquetCard from "./bouquet-card-component";
import type { BouquetCardProps } from "./bouquet-card-component";
import "../styles/VirtualizedBouquetGrid.css";

interface VirtualizedBouquetGridProps {
  bouquets: BouquetCardProps[];
  containerWidth: number;
  containerHeight?: number;
  columnCount?: number;
  rowHeight?: number;
  gap?: number;
  onItemsRendered?: (startIndex: number, stopIndex: number) => void;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    bouquets: BouquetCardProps[];
    columnCount: number;
    gap: number;
  };
}

const Cell: React.FC<CellProps> = memo(({ columnIndex, rowIndex, style, data }) => {
  const { bouquets, columnCount, gap } = data;
  const index = rowIndex * columnCount + columnIndex;
  const bouquet = bouquets[index];

  if (!bouquet) {
    return <div style={style} />;
  }

  return (
    <div
      style={{
        ...style,
        padding: `${gap / 2}px`,
        boxSizing: "border-box",
      }}
    >
      <BouquetCard
        _id={bouquet._id}
        name={bouquet.name}
        description={bouquet.description}
        price={bouquet.price}
        type={bouquet.type}
        size={bouquet.size}
        image={bouquet.image}
        status={bouquet.status}
        collectionName={bouquet.collectionName}
        customPenanda={bouquet.customPenanda}
        isNewEdition={bouquet.isNewEdition}
        isFeatured={bouquet.isFeatured}
      />
    </div>
  );
});

Cell.displayName = "Cell";

const VirtualizedBouquetGrid: React.FC<VirtualizedBouquetGridProps> = ({
  bouquets,
  containerWidth,
  containerHeight = 800,
  columnCount: propColumnCount,
  rowHeight: propRowHeight = 400,
  gap = 16,
  onItemsRendered,
}) => {
  // Calculate column count based on container width
  const columnCount = useMemo(() => {
    if (propColumnCount) return propColumnCount;
    
    // Responsive column count
    if (containerWidth >= 1200) return 4;
    if (containerWidth >= 768) return 3;
    if (containerWidth >= 480) return 2;
    return 1;
  }, [containerWidth, propColumnCount]);

  // Calculate column width
  const columnWidth = useMemo(() => {
    return (containerWidth - gap * (columnCount + 1)) / columnCount;
  }, [containerWidth, columnCount, gap]);

  // Calculate row count
  const rowCount = useMemo(() => {
    return Math.ceil(bouquets.length / columnCount);
  }, [bouquets.length, columnCount]);

  // Memoize cell data
  const cellData = useMemo(
    () => ({
      bouquets,
      columnCount,
      gap,
    }),
    [bouquets, columnCount, gap]
  );

  // Handle items rendered callback
  const handleItemsRendered = useCallback(
    ({
      visibleRowStartIndex,
      visibleRowStopIndex,
      visibleColumnStartIndex,
      visibleColumnStopIndex,
    }: {
      visibleRowStartIndex: number;
      visibleRowStopIndex: number;
      visibleColumnStartIndex: number;
      visibleColumnStopIndex: number;
    }) => {
      if (onItemsRendered) {
        const startIndex = visibleRowStartIndex * columnCount + visibleColumnStartIndex;
        const stopIndex = visibleRowStopIndex * columnCount + visibleColumnStopIndex;
        onItemsRendered(startIndex, Math.min(stopIndex, bouquets.length - 1));
      }
    },
    [onItemsRendered, columnCount, bouquets.length]
  );

  if (bouquets.length === 0) {
    return (
      <div className="virtualized-grid-empty">
        <p>Tidak ada bouquet ditemukan</p>
      </div>
    );
  }

  // Render function for Grid children - using memoized component
  const GridCell = memo(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    return <Cell columnIndex={columnIndex} rowIndex={rowIndex} style={style} data={cellData} />;
  });

  GridCell.displayName = "GridCell";

  return (
    <div 
      className="virtualized-grid-container"
      style={{
        height: containerHeight,
        width: containerWidth,
        overflow: "auto",
      }}
    >
      {createElement(
        Grid as any,
        {
          columnCount,
          columnWidth,
          rowCount,
          rowHeight: propRowHeight,
          width: containerWidth,
          height: containerHeight,
          itemData: cellData,
          onItemsRendered: handleItemsRendered,
          overscanRowCount: 2,
          overscanColumnCount: 1,
          style: {
            overflowX: "hidden",
          },
        },
        GridCell as any
      )}
    </div>
  );
};

export default memo(VirtualizedBouquetGrid);

