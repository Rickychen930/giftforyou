/**
 * Icon Button Component
 * Luxury and responsive icon-only button
 */

import React from "react";
import "../../styles/IconButton.css";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon: React.ReactNode;
  ariaLabel: string;
  tooltip?: string;
}

/**
 * Icon Button Component
 * Luxury styled icon-only button for actions
 */
const IconButton: React.FC<IconButtonProps> = ({
  variant = "default",
  size = "md",
  icon,
  ariaLabel,
  tooltip,
  className = "",
  ...props
}) => {
  const baseClass = "iconBtn";
  const variantClass = `iconBtn--${variant}`;
  const sizeClass = `iconBtn--${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      {...props}
    >
      <span className="iconBtn__icon">{icon}</span>
    </button>
  );
};

export default IconButton;

