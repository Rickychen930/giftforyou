/**
 * Header Brand Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderBrand.css";
import { BRAND_INFO } from "../../constants/app-constants";

export interface HeaderBrandProps {
  logoSrc?: string;
  onNavigate?: () => void;
}

interface HeaderBrandState {
  logoError: boolean;
}

/**
 * Header Brand Component
 * Class-based component for header brand/logo
 */
class HeaderBrand extends Component<HeaderBrandProps, HeaderBrandState> {
  private baseClass: string = "header-brand";

  constructor(props: HeaderBrandProps) {
    super(props);
    this.state = {
      logoError: false,
    };
  }

  private handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement;
    target.style.display = "none";
    this.setState({ logoError: true });
  };

  private getLogoSrc(): string {
    const { logoSrc = BRAND_INFO.logoPath } = this.props;
    return logoSrc;
  }

  render(): React.ReactNode {
    const { onNavigate } = this.props;

    return (
      <Link
        to="/"
        onClick={onNavigate}
        className={this.baseClass}
        aria-label={`${BRAND_INFO.name} Beranda`}
      >
        <div className={`${this.baseClass}__logo-wrapper`}>
          <img
            src={this.getLogoSrc()}
            alt={BRAND_INFO.name}
            className={`${this.baseClass}__logo`}
            loading="eager"
            onError={this.handleImageError}
          />
        </div>
        <div className={`${this.baseClass}__text`}>
          <span className={`${this.baseClass}__name`}>{BRAND_INFO.name}</span>
          <span className={`${this.baseClass}__tagline`}>{BRAND_INFO.tagline}</span>
        </div>
      </Link>
    );
  }
}

export default HeaderBrand;
