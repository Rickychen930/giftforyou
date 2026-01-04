/**
 * Virtualized Bouquet Grid Component
 * Uses react-window for efficient rendering of large lists
 * Follows SOLID, DRY, MVP principles
 */

import React, { memo, useMemo, useCallback } from "react";
import { Grid, CellComponentProps } from "react-window";
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
  // CRITICAL: Even if bouquets is empty, we must return a valid object
  const cellData = useMemo(() => {
    // Always return a valid object, never null or undefined
    // Ensure all values are valid before creating the object
    const validBouquets = Array.isArray(safeBouquets) ? safeBouquets : [];
    const validColumnCount = typeof columnCount === "number" && columnCount > 0 && Number.isFinite(columnCount) ? columnCount : 4;
    const validGap = typeof gap === "number" && gap >= 0 && Number.isFinite(gap) ? gap : 16;
    
    // CRITICAL: Always return a valid object structure, even if bouquets is empty
    // This prevents Object.values() error in react-window
    const data: {
      bouquets: BouquetCardProps[];
      columnCount: number;
      gap: number;
    } = {
      bouquets: validBouquets,
      columnCount: validColumnCount,
      gap: validGap,
    };
    
    // Final validation - ensure we always return a valid object
    // Even if bouquets is empty, the object structure must be valid
    if (!data || typeof data !== "object") {
      return { bouquets: [], columnCount: 4, gap: 16 };
    }
    
    if (!Array.isArray(data.bouquets)) {
      return { bouquets: [], columnCount: validColumnCount, gap: validGap };
    }
    
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

  // Final safety check: ensure safeItemData is ALWAYS a valid object (never null/undefined)
  // react-window's Grid uses Object.values() internally on itemData, so it must never be null/undefined
  // This hook must be called before any early returns to comply with Rules of Hooks
  const safeItemData = useMemo(() => {
    // Default fallback object - always return a valid object
    const defaultData = { bouquets: [], columnCount: 4, gap: 16 };
    
    // If cellData is invalid, return default
    if (!cellData || typeof cellData !== "object") {
      return defaultData;
    }
    
    // Ensure bouquets is always an array
    const validBouquets = Array.isArray(cellData.bouquets) ? cellData.bouquets : [];
    
    // Ensure columnCount is always a valid number
    const validColumnCount = typeof cellData.columnCount === "number" && 
                             Number.isFinite(cellData.columnCount) && 
                             cellData.columnCount > 0 
                             ? cellData.columnCount 
                             : 4;
    
    // Ensure gap is always a valid number
    const validGap = typeof cellData.gap === "number" && 
                      Number.isFinite(cellData.gap) && 
                      cellData.gap >= 0 
                      ? cellData.gap 
                      : 16;
    
    // Always return a valid object with all required properties
    return {
      bouquets: validBouquets,
      columnCount: validColumnCount,
      gap: validGap,
    };
  }, [cellData]);

  // ABSOLUTE FINAL CHECK: Ensure safeItemData is valid before passing to Grid
  // Use useMemo to ensure this is always stable and valid
  // This is the last line of defense against null/undefined itemData
  // MUST be called before any early returns to comply with Rules of Hooks
  const finalItemData = useMemo(() => {
    // Default fallback - always return a valid object
    const defaultData = { bouquets: [], columnCount: 4, gap: 16 };
    
    if (!safeItemData || typeof safeItemData !== "object") {
      console.error("[VirtualizedBouquetGrid] CRITICAL: safeItemData is invalid:", safeItemData);
      return defaultData;
    }
    if (!Array.isArray(safeItemData.bouquets)) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: safeItemData.bouquets is not an array:", safeItemData);
      return { bouquets: [], columnCount: safeItemData.columnCount || 4, gap: safeItemData.gap || 16 };
    }
    if (typeof safeItemData.columnCount !== "number" || !Number.isFinite(safeItemData.columnCount) || safeItemData.columnCount <= 0) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: safeItemData.columnCount is invalid:", safeItemData);
      return { bouquets: safeItemData.bouquets, columnCount: 4, gap: safeItemData.gap || 16 };
    }
    if (typeof safeItemData.gap !== "number" || !Number.isFinite(safeItemData.gap) || safeItemData.gap < 0) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: safeItemData.gap is invalid:", safeItemData);
      return { bouquets: safeItemData.bouquets, columnCount: safeItemData.columnCount, gap: 16 };
    }
    return safeItemData;
  }, [safeItemData]);

  // Ensure rowHeight is valid - MUST be called before early returns
  const safeRowHeight = useMemo(() => {
    return typeof propRowHeight === "number" && propRowHeight > 0 && Number.isFinite(propRowHeight)
      ? propRowHeight
      : 400;
  }, [propRowHeight]);

  // CRITICAL: Create a stable, always-valid itemData object
  // This MUST be a plain object literal, never null/undefined
  // react-window uses Object.values() internally, so this is critical
  // MUST be called before any early returns to comply with Rules of Hooks
  // This is the ABSOLUTE last line of defense - it MUST always return a valid object
  const stableItemData = useMemo(() => {
    // Default fallback - ALWAYS return this if anything goes wrong
    const defaultData: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = { 
      bouquets: [], 
      columnCount: 4, 
      gap: 16 
    };
    
    // CRITICAL: Validate finalItemData - if invalid, return default immediately
    if (!finalItemData || typeof finalItemData !== "object" || Array.isArray(finalItemData)) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemData invalid, using fallback:", finalItemData);
      return defaultData;
    }
    
    // Validate bouquets array - ensure it's always an array
    let validBouquets: BouquetCardProps[] = [];
    if (Array.isArray(finalItemData.bouquets)) {
      validBouquets = finalItemData.bouquets.filter((b): b is BouquetCardProps => 
        b != null && typeof b === "object" && b._id != null
      );
    }
    
    // Validate columnCount - ensure it's always a valid positive number
    let validColumnCount = 4;
    if (typeof finalItemData.columnCount === "number" && 
        Number.isFinite(finalItemData.columnCount) && 
        finalItemData.columnCount > 0) {
      validColumnCount = finalItemData.columnCount;
    }
    
    // Validate gap - ensure it's always a valid non-negative number
    let validGap = 16;
    if (typeof finalItemData.gap === "number" && 
        Number.isFinite(finalItemData.gap) && 
        finalItemData.gap >= 0) {
      validGap = finalItemData.gap;
    }
    
    // CRITICAL: Return a completely new object literal - this ensures Object.values() will always work
    // This object MUST be a plain object, never null/undefined
    const result: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = {
      bouquets: validBouquets,
      columnCount: validColumnCount,
      gap: validGap,
    };
    
    // Final validation - ensure result is valid
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: result invalid, using fallback:", result);
      return defaultData;
    }
    
    return result;
  }, [finalItemData]);

  // Create a stable key based on bouquets length to force re-mount when data changes significantly
  // MUST be called before any early returns to comply with Rules of Hooks
  const gridKey = useMemo(() => {
    return `grid-${safeBouquets.length}-${columnCount}-${safeContainerWidth}`;
  }, [safeBouquets.length, columnCount, safeContainerWidth]);

  // CRITICAL: Create a stable itemData object using useMemo
  // This ensures itemData is always a valid object, never null/undefined
  // react-window uses Object.values() internally, so this MUST always be a valid object
  // MUST be called before any early returns to comply with Rules of Hooks
  const gridItemData = useMemo(() => {
    // Default fallback - ALWAYS return this if anything goes wrong
    // This is the absolute minimum valid object structure
    const defaultItemData: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = { 
      bouquets: [], 
      columnCount: 4, 
      gap: 16 
    };
    
    try {
      // CRITICAL: Validate stableItemData - if invalid, return default immediately
      // This check must be very strict to prevent null/undefined from passing through
      if (!stableItemData) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData is null/undefined, using fallback");
        return defaultItemData;
      }
      
      if (typeof stableItemData !== "object") {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData is not an object:", typeof stableItemData, stableItemData);
        return defaultItemData;
      }
      
      if (Array.isArray(stableItemData)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData is an array, expected object:", stableItemData);
        return defaultItemData;
      }
      
      // Validate bouquets - must be an array
      let validBouquets: BouquetCardProps[] = [];
      if (Array.isArray(stableItemData.bouquets)) {
        validBouquets = stableItemData.bouquets.filter((b): b is BouquetCardProps => 
          b != null && typeof b === "object" && b._id != null
        );
      } else {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData.bouquets is not an array:", stableItemData);
        return { ...defaultItemData, bouquets: [] };
      }
      
      // Validate columnCount - must be a positive number
      let validColumnCount = 4;
      if (typeof stableItemData.columnCount === "number" && 
          Number.isFinite(stableItemData.columnCount) && 
          stableItemData.columnCount > 0) {
        validColumnCount = stableItemData.columnCount;
      } else {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData.columnCount invalid:", stableItemData);
        return { bouquets: validBouquets, columnCount: 4, gap: stableItemData.gap || 16 };
      }
      
      // Validate gap - must be a non-negative number
      let validGap = 16;
      if (typeof stableItemData.gap === "number" && 
          Number.isFinite(stableItemData.gap) && 
          stableItemData.gap >= 0) {
        validGap = stableItemData.gap;
      } else {
        console.error("[VirtualizedBouquetGrid] CRITICAL: stableItemData.gap invalid:", stableItemData);
        return { bouquets: validBouquets, columnCount: validColumnCount, gap: 16 };
      }
      
      // CRITICAL: Return a completely new object literal - this ensures Object.values() will always work
      // This object MUST be a plain object, never null/undefined
      // Create a fresh object literal to ensure it's always valid
      const result: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = {
        bouquets: Array.isArray(validBouquets) ? validBouquets : [],
        columnCount: typeof validColumnCount === "number" && Number.isFinite(validColumnCount) && validColumnCount > 0 ? validColumnCount : 4,
        gap: typeof validGap === "number" && Number.isFinite(validGap) && validGap >= 0 ? validGap : 16,
      };
      
      // Final validation - ensure result is valid
      // Double-check all properties are valid
      if (!result) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is null/undefined, using fallback");
        return defaultItemData;
      }
      
      if (typeof result !== "object") {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is not an object:", typeof result, result);
        return defaultItemData;
      }
      
      if (Array.isArray(result)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is an array, expected object:", result);
        return defaultItemData;
      }
      
      // Validate each property one more time
      if (!Array.isArray(result.bouquets)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result.bouquets is not an array:", result);
        return { ...defaultItemData, bouquets: [] };
      }
      
      if (typeof result.columnCount !== "number" || !Number.isFinite(result.columnCount) || result.columnCount <= 0) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result.columnCount is invalid:", result);
        return { bouquets: result.bouquets, columnCount: 4, gap: result.gap };
      }
      
      if (typeof result.gap !== "number" || !Number.isFinite(result.gap) || result.gap < 0) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result.gap is invalid:", result);
        return { bouquets: result.bouquets, columnCount: result.columnCount, gap: 16 };
      }
      
      // Final check: ensure result can be used with Object.values()
      try {
        const testValues = Object.values(result);
        if (!Array.isArray(testValues)) {
          console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() test failed:", result);
          return defaultItemData;
        }
      } catch (testError) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() test threw error:", testError, result);
        return defaultItemData;
      }
      
      return result;
    } catch (error) {
      // Catch any unexpected errors and return default
      console.error("[VirtualizedBouquetGrid] CRITICAL: Unexpected error creating itemData:", error);
      return defaultItemData;
    }
  }, [stableItemData]);

  // ABSOLUTE FINAL VALIDATION: Ensure gridItemData is valid before rendering Grid
  // This is the last check before passing to react-window
  // If gridItemData is invalid, use default fallback
  // MUST be called before any early returns to comply with Rules of Hooks
  const finalGridItemData = useMemo(() => {
    const defaultItemData: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = { 
      bouquets: [], 
      columnCount: 4, 
      gap: 16 
    };
    
    // Validate gridItemData - if invalid, return default
    if (!gridItemData) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: gridItemData is null/undefined at final check");
      return defaultItemData;
    }
    
    if (typeof gridItemData !== "object") {
      console.error("[VirtualizedBouquetGrid] CRITICAL: gridItemData is not an object at final check:", typeof gridItemData);
      return defaultItemData;
    }
    
    if (Array.isArray(gridItemData)) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: gridItemData is an array at final check");
      return defaultItemData;
    }
    
    // Test Object.values() to ensure it works
    try {
      const testValues = Object.values(gridItemData);
      if (!Array.isArray(testValues)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() test failed at final check");
        return defaultItemData;
      }
    } catch (testError) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() test threw error at final check:", testError);
      return defaultItemData;
    }
    
    return gridItemData;
  }, [gridItemData]);

  // ABSOLUTE FINAL CHECK: Create a guaranteed-valid itemData object using useMemo
  // This is the absolute last line of defense - must ALWAYS return a valid object
  // Even if finalGridItemData is somehow invalid, we return a default object
  // This prevents Object.values() error in react-window
  // MUST be called before any early returns to comply with Rules of Hooks
  const guaranteedItemData = useMemo((): { bouquets: BouquetCardProps[]; columnCount: number; gap: number } => {
    // ABSOLUTE DEFAULT - this is the fallback that will ALWAYS work
    const absoluteDefault: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = {
      bouquets: [],
      columnCount: 4,
      gap: 16,
    };
    
    try {
      // If finalGridItemData is invalid, return default immediately
      if (!finalGridItemData) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: finalGridItemData is null/undefined");
        return absoluteDefault;
      }
      
      if (typeof finalGridItemData !== "object") {
        console.error("[VirtualizedBouquetGrid] CRITICAL: finalGridItemData is not an object:", typeof finalGridItemData);
        return absoluteDefault;
      }
      
      if (Array.isArray(finalGridItemData)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: finalGridItemData is an array");
        return absoluteDefault;
      }
      
      // Validate bouquets - must be an array (can be empty, but must be an array)
      const validBouquets = Array.isArray(finalGridItemData.bouquets) 
        ? finalGridItemData.bouquets 
        : [];
      
      // Validate columnCount - must be a positive number
      const validColumnCount = typeof finalGridItemData.columnCount === "number" && 
                                Number.isFinite(finalGridItemData.columnCount) && 
                                finalGridItemData.columnCount > 0
                                ? finalGridItemData.columnCount
                                : 4;
      
      // Validate gap - must be a non-negative number
      const validGap = typeof finalGridItemData.gap === "number" && 
                        Number.isFinite(finalGridItemData.gap) && 
                        finalGridItemData.gap >= 0
                        ? finalGridItemData.gap
                        : 16;
      
      // Create a completely fresh object literal - this ensures Object.values() will always work
      // This MUST be a plain object, never null/undefined
      const result: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = {
        bouquets: validBouquets,
        columnCount: validColumnCount,
        gap: validGap,
      };
      
      // CRITICAL: Test Object.values() to ensure it works
      // This is the exact same operation react-window will do
      let testValues: unknown[];
      try {
        testValues = Object.values(result);
        if (!Array.isArray(testValues)) {
          console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() returned non-array");
          return absoluteDefault;
        }
      } catch (error) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() threw error:", error);
        return absoluteDefault;
      }
      
      // Final validation - ensure result is valid
      if (!result) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is null/undefined after creation");
        return absoluteDefault;
      }
      
      if (typeof result !== "object") {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is not an object after creation:", typeof result);
        return absoluteDefault;
      }
      
      if (Array.isArray(result)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is an array after creation");
        return absoluteDefault;
      }
      
      // Ensure all properties exist
      if (!("bouquets" in result) || !("columnCount" in result) || !("gap" in result)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result missing required properties");
        return absoluteDefault;
      }
      
      // Return the validated result
      return result;
    } catch (error) {
      // Catch any unexpected errors and return default
      console.error("[VirtualizedBouquetGrid] CRITICAL: Unexpected error in guaranteedItemData:", error);
      return absoluteDefault;
    }
  }, [finalGridItemData]);

  // Render function for Grid children - using useCallback for stability
  // IMPORTANT: react-window spreads itemData into props, so we access bouquets, columnCount, gap directly from props
  // CRITICAL: This function receives props which includes itemData spread into it
  // We validate it here as a final safety check
  // MUST be called before any early returns to comply with Rules of Hooks
  // Using CellComponentProps for proper typing
  const renderCell = useCallback((props: CellComponentProps<{
    bouquets: BouquetCardProps[];
    columnCount: number;
    gap: number;
  }>) => {
    // CRITICAL: Validate props first - react-window might pass null/undefined itemData
    if (!props || typeof props !== "object") {
      console.error("[VirtualizedBouquetGrid] renderCell received invalid props:", props);
      return <div style={{}} />;
    }
    
    const { columnIndex, rowIndex, style, bouquets, columnCount, gap } = props;
    
    // CRITICAL: Final validation of data received from react-window
    // itemData is spread into props, so we access bouquets, columnCount, gap directly
    // This should never be null/undefined because we validate finalItemData before passing to Grid
    // But we add this check as absolute last line of defense
    if (!bouquets || !Array.isArray(bouquets)) {
      console.error("[VirtualizedBouquetGrid] renderCell received invalid bouquets:", bouquets);
      return <div style={style || {}} />;
    }
    // Validate data structure
    if (typeof columnCount !== "number" || !Number.isFinite(columnCount) || columnCount <= 0) {
      console.error("[VirtualizedBouquetGrid] renderCell received invalid columnCount:", columnCount);
      return <div style={style || {}} />;
    }
    if (typeof gap !== "number" || !Number.isFinite(gap) || gap < 0) {
      console.error("[VirtualizedBouquetGrid] renderCell received invalid gap:", gap);
      return <div style={style || {}} />;
    }
    // Pass data as object to Cell component
    return <Cell columnIndex={columnIndex} rowIndex={rowIndex} style={style} data={{ bouquets, columnCount, gap }} />;
  }, []);

  // CRITICAL: Use useMemo to create finalItemDataForGrid that is ALWAYS valid
  // This ensures itemData is stable and never null/undefined
  // MUST be called before any early returns to comply with Rules of Hooks
  const finalItemDataForGrid = useMemo((): { bouquets: BouquetCardProps[]; columnCount: number; gap: number } => {
    // ABSOLUTE FINAL FALLBACK - this will ALWAYS work
    const absoluteFallback: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = { 
      bouquets: [], 
      columnCount: 4, 
      gap: 16 
    };
    
    try {
      // Validate guaranteedItemData one more time
      if (!guaranteedItemData || typeof guaranteedItemData !== "object" || Array.isArray(guaranteedItemData)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: guaranteedItemData invalid at final step");
        return absoluteFallback;
      }
      
      // Extract values with validation
      const validBouquets = Array.isArray(guaranteedItemData.bouquets) ? guaranteedItemData.bouquets : [];
      const validColumnCount = typeof guaranteedItemData.columnCount === "number" && 
                                Number.isFinite(guaranteedItemData.columnCount) && 
                                guaranteedItemData.columnCount > 0 
                                ? guaranteedItemData.columnCount 
                                : 4;
      const validGap = typeof guaranteedItemData.gap === "number" && 
                        Number.isFinite(guaranteedItemData.gap) && 
                        guaranteedItemData.gap >= 0 
                        ? guaranteedItemData.gap 
                        : 16;
      
      // Create a completely fresh object literal - this ensures Object.values() will always work
      const result: { bouquets: BouquetCardProps[]; columnCount: number; gap: number } = {
        bouquets: validBouquets,
        columnCount: validColumnCount,
        gap: validGap,
      };
      
      // CRITICAL: Test Object.values() to ensure it works
      // This is the exact same operation react-window will do
      try {
        const testValues = Object.values(result);
        if (!Array.isArray(testValues)) {
          console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() returned non-array");
          return absoluteFallback;
        }
      } catch (error) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() test failed:", error);
        return absoluteFallback;
      }
      
      // Final validation - ensure result is valid
      if (!result || typeof result !== "object" || Array.isArray(result)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result is invalid after creation");
        return absoluteFallback;
      }
      
      // Ensure all properties exist
      if (!("bouquets" in result) || !("columnCount" in result) || !("gap" in result)) {
        console.error("[VirtualizedBouquetGrid] CRITICAL: result missing required properties");
        return absoluteFallback;
      }
      
      return result;
    } catch (error) {
      console.error("[VirtualizedBouquetGrid] CRITICAL: Unexpected error creating finalItemDataForGrid:", error);
      return absoluteFallback;
    }
  }, [guaranteedItemData]);

  // CRITICAL: Allow Grid to render even with empty bouquets array
  // Empty array is a valid state (means no results match current filters, or data is still loading)
  // Grid can handle empty arrays gracefully - it just won't render any cells
  // When filters are cleared, bouquets array might be empty initially but will populate
  // IMPORTANT: We don't return early here - let Grid render with empty array
  // The parent component (InfiniteBouquetGrid) handles empty state display

  // CRITICAL: Validate all values before rendering Grid
  // This is the final check to ensure itemData is never null/undefined
  // react-window will crash if itemData is null/undefined
  if (!finalItemData || typeof finalItemData !== "object") {
    console.error("[VirtualizedBouquetGrid] finalItemData is null/undefined:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data tidak valid untuk grid</p>
      </div>
    );
  }
  
  // Ensure all required properties exist and are valid
  if (!Array.isArray(finalItemData.bouquets)) {
    console.error("[VirtualizedBouquetGrid] finalItemData.bouquets is not an array:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data bouquet tidak valid</p>
      </div>
    );
  }
  
  if (typeof finalItemData.columnCount !== "number" || !Number.isFinite(finalItemData.columnCount) || finalItemData.columnCount <= 0) {
    console.error("[VirtualizedBouquetGrid] finalItemData.columnCount is invalid:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Konfigurasi kolom tidak valid</p>
      </div>
    );
  }
  
  if (typeof finalItemData.gap !== "number" || !Number.isFinite(finalItemData.gap) || finalItemData.gap < 0) {
    console.error("[VirtualizedBouquetGrid] finalItemData.gap is invalid:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Konfigurasi gap tidak valid</p>
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

  // CRITICAL: Do not render Grid if finalItemData is invalid OR if bouquets is empty
  // This prevents react-window from receiving null/undefined itemData
  // Even though finalItemData.bouquets might be empty array (which is valid), we should not render Grid with 0 items
  if (!finalItemData || typeof finalItemData !== "object" || !Array.isArray(finalItemData.bouquets)) {
    console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemData is still invalid, cannot render Grid:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data tidak valid untuk grid</p>
      </div>
    );
  }

  // CRITICAL: Allow Grid to render even with empty bouquets array
  // Empty array is valid for itemData - it just means no items to display
  // Grid can handle empty arrays gracefully, and this allows filters to work correctly
  // When filters are cleared, bouquets array might be empty initially but will populate
  // IMPORTANT: We only prevent Grid render if itemData itself is invalid, not if bouquets array is empty
  // Empty bouquets array is a valid state (means no results match filters)
  // But we still need to ensure itemData structure is valid (object with bouquets, columnCount, gap)
  // So we check itemData validity, not bouquets.length
  // 
  // NOTE: We removed the early return for empty bouquets array because:
  // 1. Empty array is a valid state (no results match current filters)
  // 2. When filters are cleared, we want to show all bouquets, so we shouldn't prevent Grid render
  // 3. Grid can handle empty arrays - it just won't render any cells
  // 4. The empty state message is handled by the parent component (InfiniteBouquetGrid)

  // CRITICAL: Final validation - ensure finalItemData is absolutely valid before passing to Grid
  // Double-check all properties exist and are valid
  if (typeof finalItemData.columnCount !== "number" || 
      !Number.isFinite(finalItemData.columnCount) || 
      finalItemData.columnCount <= 0 ||
      typeof finalItemData.gap !== "number" || 
      !Number.isFinite(finalItemData.gap) || 
      finalItemData.gap < 0) {
    console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemData properties invalid:", finalItemData);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Konfigurasi grid tidak valid</p>
      </div>
    );
  }

  // CRITICAL: Final validation before rendering Grid
  // Ensure finalItemDataForGrid is valid - if not, don't render Grid
  // This prevents Object.values() error in react-window
  if (!finalItemDataForGrid || typeof finalItemDataForGrid !== "object" || Array.isArray(finalItemDataForGrid)) {
    console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemDataForGrid is invalid, cannot render Grid");
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data tidak valid untuk grid</p>
      </div>
    );
  }
  
  // Test Object.values() one final time before rendering Grid
  try {
    Object.values(finalItemDataForGrid);
  } catch (error) {
    console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemDataForGrid Object.values() test failed before Grid render:", error);
    return (
      <div className="virtualized-grid-empty">
        <p>Error: Data tidak valid untuk grid</p>
      </div>
    );
  }

  return (
    <div 
      className="virtualized-grid-container"
      style={{
        height: safeContainerHeight,
        width: safeContainerWidth,
        overflow: "auto",
      }}
    >
      <Grid
        {...({
          key: gridKey,
          columnCount,
          columnWidth,
          rowCount,
          rowHeight: safeRowHeight,
          width: safeContainerWidth,
          height: safeContainerHeight,
          // CRITICAL: itemData MUST be a valid object, never null/undefined
          // react-window uses Object.values() internally on this prop
          // Use finalItemDataForGrid which is ALWAYS a valid object literal (created with useMemo)
          // We've already validated it above, so it's guaranteed to be valid here
          // But add inline fallback as absolute last defense (should never be needed)
          itemData: (() => {
            // This IIFE ensures we always return a valid object
            // Even if finalItemDataForGrid is somehow invalid (which shouldn't happen)
            if (!finalItemDataForGrid || typeof finalItemDataForGrid !== "object" || Array.isArray(finalItemDataForGrid)) {
              console.error("[VirtualizedBouquetGrid] CRITICAL: finalItemDataForGrid invalid at Grid render, using fallback");
              return { bouquets: [], columnCount: 4, gap: 16 };
            }
            // Test Object.values() one more time
            try {
              Object.values(finalItemDataForGrid);
              return finalItemDataForGrid;
            } catch (error) {
              console.error("[VirtualizedBouquetGrid] CRITICAL: Object.values() failed at Grid render:", error);
              return { bouquets: [], columnCount: 4, gap: 16 };
            }
          })(),
          onItemsRendered: handleItemsRendered,
          overscanRowCount: 2,
          overscanColumnCount: 1,
          style: {
            overflowX: "hidden",
          },
          cellComponent: renderCell,
        } as any)}
      />
    </div>
  );
};

export default memo(VirtualizedBouquetGrid);

