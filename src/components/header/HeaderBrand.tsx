import React from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderBrand.css";
import { BRAND_INFO } from "../../constants/app-constants";

export interface HeaderBrandProps {
  logoSrc?: string;
  onNavigate?: () => void;
}

const HeaderBrand: React.FC<HeaderBrandProps> = ({
  logoSrc = BRAND_INFO.logoPath,
  onNavigate,
}) => {
  return (
    <Link
      to="/"
      onClick={onNavigate}
      className="header-brand"
      aria-label={`${BRAND_INFO.name} Beranda`}
    >
      <div className="header-brand__logo-wrapper">
        <img
          src={logoSrc}
          alt={BRAND_INFO.name}
          className="header-brand__logo"
          loading="eager"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }}
        />
      </div>
      <div className="header-brand__text">
        <span className="header-brand__name">{BRAND_INFO.name}</span>
        <span className="header-brand__tagline">{BRAND_INFO.tagline}</span>
      </div>
    </Link>
  );
};

export default HeaderBrand;

