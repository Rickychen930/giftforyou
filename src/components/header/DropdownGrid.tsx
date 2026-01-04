/**
 * Dropdown Grid Component
 * Grid layout with horizontal scroll support for many items
 * Following SOLID, DRY, OOP principles
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";

export interface DropdownGridItem {
  label: string;
  value: string;
  icon?: string;
  href: string;
}

interface DropdownGridProps {
  items: DropdownGridItem[];
  onItemClick?: () => void;
  maxColumns?: number;
  enableHorizontalScroll?: boolean;
  scrollThreshold?: number;
  maxRows?: number; // Maximum rows before switching to horizontal scroll (alternative to threshold)
  className?: string;
}

/**
 * Dropdown Grid Component
 * Handles grid layout with optional horizontal scroll for many items
 * Single Responsibility: Layout and scrolling logic
 */
export const DropdownGrid: React.FC<DropdownGridProps> = ({
  items,
  onItemClick,
  maxColumns = 3,
  enableHorizontalScroll = true,
  scrollThreshold, // Enable horizontal scroll when items >= threshold
  maxRows = 2, // Maximum rows before switching to horizontal scroll (alternative approach)
  className = "",
}) => {
  // Calculate threshold based on maxRows if scrollThreshold not provided
  const effectiveThreshold = scrollThreshold ?? maxColumns * maxRows;
  
  // Determine if horizontal scroll should be enabled
  // Use horizontal scroll when items >= threshold to prevent content from being cut off
  // Lower threshold (3-4 items) makes it more intuitive that there are more items
  const useHorizontalScroll = useMemo(() => {
    return enableHorizontalScroll && items.length >= effectiveThreshold;
  }, [enableHorizontalScroll, items.length, effectiveThreshold]);

  // Memoize grid classes
  const gridClasses = useMemo(() => {
    const baseClasses = ["dropdown-grid"];
    if (useHorizontalScroll) {
      baseClasses.push("dropdown-grid--horizontal-scroll");
    } else {
      baseClasses.push(`dropdown-grid--cols-${maxColumns}`);
    }
    if (className) {
      baseClasses.push(className);
    }
    return baseClasses.join(" ");
  }, [useHorizontalScroll, maxColumns, className]);

  if (items.length === 0) {
    return null;
  }

  return (
    <ul className={gridClasses}>
      {items.map((item) => (
        <li key={item.value}>
          <Link
            to={item.href}
            onClick={onItemClick}
            className="dropdown-link"
            role="menuitem"
          >
            {item.icon && <span className="dropdown-icon">{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default DropdownGrid;

