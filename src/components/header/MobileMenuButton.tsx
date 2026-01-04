/**
 * Mobile Menu Button Component
 * Reusable hamburger menu button
 * Following SOLID, DRY principles
 */

import React from "react";
import "../../styles/Header.css";

interface MobileMenuButtonProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

/**
 * Mobile Menu Button Component
 * Displays hamburger menu icon
 */
export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  onClick,
  isOpen,
  className = "",
}) => {
  return (
    <button
      className={`hamburger ${isOpen ? "is-open" : ""} ${className}`}
      onClick={onClick}
      type="button"
      aria-label="Buka/tutup menu"
      aria-expanded={isOpen}
      aria-controls="primary-navigation"
    >
      <span />
      <span />
      <span />
    </button>
  );
};

export default MobileMenuButton;

