/**
 * Success Icon Component
 * Luxury animated success checkmark icon
 */

import React from "react";
import "../../styles/SuccessIcon.css";

interface SuccessIconProps {
  size?: number;
  className?: string;
}

/**
 * Success Icon Component
 * Luxury animated success checkmark
 */
const SuccessIcon: React.FC<SuccessIconProps> = ({
  size = 80,
  className = "",
}) => {
  return (
    <div className={`successIcon ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="successIcon__circle"/>
        <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="successIcon__check"/>
      </svg>
    </div>
  );
};

export default SuccessIcon;

