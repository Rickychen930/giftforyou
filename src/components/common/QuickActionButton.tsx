/**
 * Quick Action Button Component
 * Luxury and responsive quick action button for dashboard
 */

import React from "react";
import "../../styles/QuickActionButton.css";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "primary";
  className?: string;
  ariaLabel?: string;
  title?: string;
}

/**
 * Quick Action Button Component
 * Luxury styled quick action button
 */
const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  variant = "default",
  className = "",
  ariaLabel,
  title,
}) => {
  return (
    <button
      type="button"
      className={`quickActionBtn quickActionBtn--${variant} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
      title={title || label}
    >
      <div className="quickActionBtn__icon">{icon}</div>
      <span className="quickActionBtn__label">{label}</span>
    </button>
  );
};

export default QuickActionButton;

