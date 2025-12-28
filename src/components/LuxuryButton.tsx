import React from "react";
import "../styles/LuxuryButton.css";

interface LuxuryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

const LuxuryButton: React.FC<LuxuryButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClass = "luxuryBtn";
  const variantClass = `luxuryBtn--${variant}`;
  const sizeClass = `luxuryBtn--${size}`;
  const loadingClass = isLoading ? "luxuryBtn--loading" : "";
  const disabledClass = disabled || isLoading ? "luxuryBtn--disabled" : "";

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${loadingClass} ${disabledClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="luxuryBtn__spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>
      )}
      {!isLoading && icon && iconPosition === "left" && (
        <span className="luxuryBtn__icon luxuryBtn__icon--left">{icon}</span>
      )}
      <span className="luxuryBtn__content">{children}</span>
      {!isLoading && icon && iconPosition === "right" && (
        <span className="luxuryBtn__icon luxuryBtn__icon--right">{icon}</span>
      )}
    </button>
  );
};

export default LuxuryButton;

