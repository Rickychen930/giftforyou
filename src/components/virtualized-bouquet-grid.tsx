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
  // Validate data prop to prevent errors
  if (!data || typeof data !== "object") {
    return <div style={style} />;
  }

  const { bouquets, columnCount, gap } = data;
  
  // Validate extracted values
  if (!Array.isArray(bouquets)) {
    return <div style={style} />;
  }

  if (typeof columnCount !== "number" || columnCount <= 0) {
    return <div style={style} />;
  }

  if (typeof gap !== "number" || gap < 0) {
    return <div style={style} />;
  }

  const index = rowIndex * columnCount + columnIndex;
  
  // Validate index
  if (!Number.isFinite(index) || index < 0 || index >= bouquets.length) {
    return <div style={style} />;
  }

  const bouquet = bouquets[index];

  if (!bouquet || typeof bouquet !== "object") {
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
  // Ensure bouquets is always an array to prevent undefined/null errors
  const safeBouquets = useMemo(() => {
    if (!bouquets) return [];
    if (!Array.isArray(bouquets)) return [];
    // Filter out any null/undefined items
    return bouquets.filter((b): b is BouquetCardProps => b != null && typeof b === "object" && b._id != null);
  }, [bouquets]);

  // Ensure containerWidth is valid (greater than 0)
  const safeContainerWidth = useMemo(() => {
    if (typeof containerWidth !== "number" || !Number.isFinite(containerWidth) || containerWidth <= 0) {
      return 1200;
    }
    return containerWidth;
  }, [containerWidth]);

  // Ensure containerHeight is valid
  const safeContainerHeight = useMemo(() => {
    if (typeof containerHeight !== "number" || !Number.isFinite(containerHeight) || containerHeight <= 0) {
      return 800;
    }
    return containerHeight;
  }, [containerHeight]);

  // Calculate column count based on container width
  const columnCount = useMemo(() => {
    if (propColumnCount) return propColumnCount;
    
    // Responsive column count
    if (safeContainerWidth >= 1200) return 4;
    if (safeContainerWidth >= 768) return 3;
    if (safeContainerWidth >= 480) return 2;
    return 1;
  }, [safeContainerWidth, propColumnCount]);

  // Calculate column width
  const columnWidth = useMemo(() => {
    const calculatedWidth = (safeContainerWidth - gap * (columnCount + 1)) / columnCount;
    return calculatedWidth > 0 ? calculatedWidth : 200; // Fallback to minimum width
  }, [safeContainerWidth, columnCount, gap]);

  // Calculate row count
  const rowCount = useMemo(() => {
    return Math.ceil(safeBouquets.length / columnCount);
  }, [safeBouquets.length, columnCount]);

  // Memoize cell data - ensure it's always a valid object (never null/undefined)
  // This is critical because react-window's Grid uses Object.values() on itemData
  const cellData = useMemo(() => {
    // Always return a valid object, never null or undefined
    // Ensure all values are valid before creating the object
    const validBouquets = Array.isArray(safeBouquets) ? safeBouquets : [];
    const validColumnCount = typeof columnCount === "number" && columnCount > 0 && Number.isFinite(columnCount) ? columnCount : 4;
    const validGap = typeof gap === "number" && gap >= 0 && Number.isFinite(gap) ? gap : 16;
    
    const data = {
      bouquets: validBouquets,
      columnCount: validColumnCount,
      gap: validGap,
    };
    
    // Triple-check that we're returning a valid object with all required properties
    if (!data || typeof data !== "object" || !data.bouquets || !Array.isArray(data.bouquets)) {
      return { bouquets: [], columnCount: 4, gap: 16 };
    }
    
    // Ensure all properties exist and are valid
    if (typeof data.columnCount !== "number" || !Number.isFinite(data.columnCount) || data.columnCount <= 0) {
      return { bouquets: validBouquets, columnCount: 4, gap: validGap };
    }
    if (typeof data.gap !== "number" || !Number.isFinite(data.gap) || data.gap < 0) {
      return { bouquets: validBouquets, columnCount: validColumnCount, gap: 16 };
    }
    
    return data;
  }, [safeBouquets, columnCount, gap]);

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
        onItemsRendered(startIndex, Math.min(stopIndex, safeBouquets.length - 1));
      }
    },
    [onItemsRendered, columnCount, safeBouquets.length]
  );

  // Final safety check: ensure cellData is always a valid object before rendering Grid
  // react-window's Grid uses Object.values() internally on itemData, so it must never be null/undefined
  // This hook must be called before any early returns to comply with Rules of Hooks
  const safeItemData = useMemo(() => {
    if (!cellData || typeof cellData !== "object") {
      return { bouquets: [], columnCount: 4, gap: 16 };
    }
    if (!Array.isArray(cellData.bouquets)) {
      return { bouquets: [], columnCount: cellData.columnCount || 4, gap: cellData.gap || 16 };
    }
    if (typeof cellData.columnCount !== "number" || !Number.isFinite(cellData.columnCount) || cellData.columnCount <= 0) {
      return { bouquets: cellData.bouquets, columnCount: 4, gap: cellData.gap || 16 };
    }
    if (typeof cellData.gap !== "number" || !Number.isFinite(cellData.gap) || cellData.gap < 0) {
      return { bouquets: cellData.bouquets, columnCount: cellData.columnCount, gap: 16 };
    }
    return cellData;
  }, [cellData]);

  // Early return for empty bouquets
  if (safeBouquets.length === 0) {
    return (
      <div className="virtualized-grid-empty">
        <p>Tidak ada bouquet ditemukan</p>
      </div>
    );
  }

  // Validate all required values before rendering Grid
  // This prevents react-window from receiving invalid props
  // Additional validation to ensure cellData is a proper object with all required properties
  if (!cellData || typeof cellData !== "object" || !("bouquets" in cellData) || !("columnCount" in cellData) || !("gap" in cellData)) {
    console.error("[VirtualizedBouquetGrid] Invalid cellData:", cellData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data tidak valid</p>
      </div>
    );
  }
  
  // Ensure cellData properties are valid
  if (!Array.isArray(cellData.bouquets) || typeof cellData.columnCount !== "number" || typeof cellData.gap !== "number") {
    console.error("[VirtualizedBouquetGrid] Invalid cellData properties:", cellData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Konfigurasi data tidak valid</p>
      </div>
    );
  }

  if (columnCount <= 0 || !Number.isFinite(columnCount)) {
    console.error("[VirtualizedBouquetGrid] Invalid columnCount:", columnCount);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Konfigurasi grid tidak valid</p>
      </div>
    );
  }

  if (columnWidth <= 0 || !Number.isFinite(columnWidth)) {
    console.error("[VirtualizedBouquetGrid] Invalid columnWidth:", columnWidth);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Lebar kolom tidak valid</p>
      </div>
    );
  }

  if (rowCount <= 0 || !Number.isFinite(rowCount)) {
    console.error("[VirtualizedBouquetGrid] Invalid rowCount:", rowCount);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Jumlah baris tidak valid</p>
      </div>
    );
  }

  // Ensure rowHeight is valid
  const safeRowHeight = typeof propRowHeight === "number" && propRowHeight > 0 && Number.isFinite(propRowHeight)
    ? propRowHeight
    : 400;

  // Render function for Grid children - using memoized component
  const GridCell = memo(({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    // Ensure data is always valid
    if (!cellData || typeof cellData !== "object") {
      return <div style={style} />;
    }
    return <Cell columnIndex={columnIndex} rowIndex={rowIndex} style={style} data={cellData} />;
  });

  GridCell.displayName = "GridCell";

  return (
    <div 
      className="virtualized-grid-container"
      style={{
        height: safeContainerHeight,
        width: safeContainerWidth,
        overflow: "auto",
      }}
    >
      {safeItemData && typeof safeItemData === "object" && Array.isArray(safeItemData.bouquets) && createElement(
        Grid as any,
        {
          columnCount,
          columnWidth,
          rowCount,
          rowHeight: safeRowHeight,
          width: safeContainerWidth,
          height: safeContainerHeight,
          itemData: safeItemData, // This must always be a valid object - never null/undefined
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

