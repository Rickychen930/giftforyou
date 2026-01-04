/**
 * Dropdown Portal Component
 * Uses React Portal to render dropdown outside container boundaries
 * Following SOLID, DRY, OOP principles
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";
import { DropdownSection } from "./DropdownSection";
import { DropdownGrid } from "./DropdownGrid";
import type { DropdownGridItem } from "./DropdownGrid";
import "../../styles/Header.css";

interface DropdownPortalProps {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLLIElement>;
  collectionNames: string[];
  typeNames: string[];
  onClose: () => void;
  onNavLinkClick: () => void;
  mobileOpen: boolean;
}

/**
 * Dropdown Portal Component
 * Renders dropdown using React Portal to escape container overflow
 */
export const DropdownPortal: React.FC<DropdownPortalProps> = ({
  isOpen,
  triggerRef,
  collectionNames,
  typeNames,
  onClose,
  onNavLinkClick,
  mobileOpen,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  // Memoize suggestions with fallback
  const collectionSuggestions = useMemo(
    () => (collectionNames.length > 0 ? collectionNames : Array.from(COLLECTION_SUGGESTIONS)),
    [collectionNames]
  );

  const typeSuggestions = useMemo(
    () => (typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"]),
    [typeNames]
  );

  // Transform data for DropdownGrid component (DRY - data transformation)
  const typeItems: DropdownGridItem[] = useMemo(
    () =>
      typeSuggestions.map((type) => ({
        label: type,
        value: type,
        icon: "🏷️",
        href: `/collection?type=${encodeURIComponent(type)}`,
      })),
    [typeSuggestions]
  );

  const collectionItems: DropdownGridItem[] = useMemo(
    () =>
      collectionSuggestions.map((collection) => ({
        label: collection,
        value: collection,
        icon: "🌸",
        href: `/collection?name=${encodeURIComponent(collection)}`,
      })),
    [collectionSuggestions]
  );

  // Calculate dropdown position based on trigger element
  const updatePosition = useRef(() => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Use fixed width for calculation (dropdown width)
    const dropdownWidth = 520;
    // Use max-height for better positioning calculation (90vh)
    const maxDropdownHeight = Math.min(window.innerHeight * 0.90, 700);
    const dropdownHeight = maxDropdownHeight; // Use max height for positioning

    // Calculate horizontal position (center below trigger)
    let left = triggerRect.left + triggerRect.width / 2 - dropdownWidth / 2;
    
    // Ensure dropdown doesn't go off screen
    const padding = 16;
    if (left < padding) {
      left = padding;
    } else if (left + dropdownWidth > viewportWidth - padding) {
      left = viewportWidth - dropdownWidth - padding;
    }

    // Calculate vertical position (below trigger with gap)
    const top = triggerRect.bottom + 20;

    // Check if dropdown would go off bottom of screen
    if (top + dropdownHeight > viewportHeight - padding) {
      // Position above trigger instead
      const topAbove = triggerRect.top - dropdownHeight - 20;
      if (topAbove >= padding) {
        setPosition({ top: topAbove, left });
      } else {
        // If can't fit above, position at bottom of viewport
        setPosition({ top: viewportHeight - dropdownHeight - padding, left });
      }
    } else {
      setPosition({ top, left });
    }
  });

  // Update position when dropdown opens or window resizes
  useEffect(() => {
    if (!isOpen || mobileOpen) {
      setPosition(null);
      return;
    }

    // Calculate position immediately
    updatePosition.current();

    // Wait for dropdown to render before recalculating with actual dimensions
    const calculatePosition = () => {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Double RAF to ensure layout is complete
        requestAnimationFrame(() => {
          if (dropdownRef.current) {
            updatePosition.current();
          }
        });
      });
    };

    // Initial calculation with actual dimensions
    const timeoutId = setTimeout(calculatePosition, 0);

    // Update position on scroll and resize
    const handleUpdate = () => {
      requestAnimationFrame(() => {
        updatePosition.current();
      });
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, mobileOpen, triggerRef, collectionSuggestions.length, typeSuggestions.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen || mobileOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    };

    // Use capture phase to catch clicks before they bubble
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [isOpen, mobileOpen, onClose, triggerRef]);

  // Don't render portal if mobile menu is open (use inline dropdown instead)
  if (mobileOpen || !isOpen) return null;

  // Don't render until position is calculated
  if (!position) return null;

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className="dropdown dropdown--portal"
      id="collections-dropdown"
      aria-label="Menu koleksi"
      role="menu"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="dropdown-content">
        {/* Types Section - Using reusable components (DRY, SOLID) */}
        {typeItems.length > 0 && (
          <DropdownSection
            title="Berdasarkan Tipe"
            description="Filter cepat untuk katalog"
          >
            <DropdownGrid
              items={typeItems}
              onItemClick={onNavLinkClick}
              maxColumns={3}
              enableHorizontalScroll={true}
              scrollThreshold={3}
            />
          </DropdownSection>
        )}

        {/* Collections Section - Using reusable components (DRY, SOLID) */}
        {collectionItems.length > 0 && (
          <DropdownSection
            title="Koleksi Kami"
            description="Dirangkai dengan sepenuh hati"
          >
            <DropdownGrid
              items={collectionItems}
              onItemClick={onNavLinkClick}
              maxColumns={3}
              enableHorizontalScroll={true}
              scrollThreshold={3}
            />
          </DropdownSection>
        )}
      </div>
    </div>
  );

  // Render to document.body using portal
  return createPortal(dropdownContent, document.body);
};

export default DropdownPortal;

