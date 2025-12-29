/**
 * Help Section Component
 * Luxury and responsive help/info section
 */

import React from "react";
import "../../styles/HelpSection.css";

interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Help Section Component
 * Luxury styled help/info section
 */
const HelpSection: React.FC<HelpSectionProps> = ({
  title,
  children,
  icon,
  className = "",
}) => {
  return (
    <div className={`helpSection ${className}`}>
      <h3 className="helpSection__title">
        {icon && <span className="helpSection__icon">{icon}</span>}
        {title}
      </h3>
      <p className="helpSection__text">{children}</p>
    </div>
  );
};

export default HelpSection;

