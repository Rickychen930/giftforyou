/**
 * Logo Component
 * Reusable logo component with luxury styling
 * Following SOLID, DRY principles
 */

import React from "react";
import { Link } from "react-router-dom";
import { BRAND_INFO } from "../../constants/app-constants";
import "../../styles/Header.css";

interface LogoProps {
  logoSrc?: string;
  onLogoClick?: () => void;
  className?: string;
}

/**
 * Logo Component
 * Displays brand logo with elegant styling
 */
export const Logo: React.FC<LogoProps> = ({
  logoSrc = BRAND_INFO.logoPath,
  onLogoClick,
  className = "",
}) => {
  return (
    <Link
      to="/"
      onClick={onLogoClick}
      className={`brand ${className}`}
      aria-label={`${BRAND_INFO.name} Beranda`}
    >
      <div className="logo-wrapper">
        <img
          src={logoSrc}
          alt={BRAND_INFO.name}
          className="logo"
          loading="eager"
          onError={(e) => {
            // Fallback if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
      <div className="brand-text">
        <span className="brand-name">{BRAND_INFO.name}</span>
        <span className="brand-tagline">{BRAND_INFO.tagline}</span>
      </div>
    </Link>
  );
};

export default Logo;

