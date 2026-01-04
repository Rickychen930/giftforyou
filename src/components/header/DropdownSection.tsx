/**
 * Dropdown Section Component
 * Reusable section component for dropdown menu
 * Following SOLID, DRY, OOP principles
 */

import React from "react";
import "../../styles/Header.css";

interface DropdownSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Dropdown Section Component
 * Encapsulates section header and content (Single Responsibility Principle)
 */
export const DropdownSection: React.FC<DropdownSectionProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`dropdown-section ${className}`}>
      <div className="dropdown-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
};

export default DropdownSection;

