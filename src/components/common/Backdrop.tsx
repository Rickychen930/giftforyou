/**
 * Reusable Backdrop Component
 * Luxury, elegant, and accessible backdrop for modals/overlays
 * Following DRY and SOLID principles
 */

import React from "react";
import "../../styles/common/Backdrop.css";

export interface BackdropProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
  zIndex?: number;
  blur?: boolean;
  "aria-label"?: string;
}

/**
 * Backdrop Component
 * Reusable backdrop for modals, mobile menus, etc.
 */
const Backdrop: React.FC<BackdropProps> = ({
  isOpen,
  onClick,
  className = "",
  zIndex,
  blur = true,
  "aria-label": ariaLabel = "Close overlay",
}) => {
  if (!isOpen) return null;

  const style: React.CSSProperties = zIndex ? { zIndex } : {};

  return (
    <div
      className={`backdrop ${blur ? "backdrop--blur" : ""} ${className}`}
      style={style}
      onClick={onClick}
      onTouchStart={onClick}
      aria-hidden="true"
      aria-label={ariaLabel}
      role="presentation"
    />
  );
};

export default Backdrop;

