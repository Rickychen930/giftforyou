/**
 * Footer Brand Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/footer/FooterBrand.css";
import { BRAND_INFO } from "../../constants/app-constants";

interface FooterBrandState {
  // No state needed, but keeping for consistency
}

/**
 * Footer Brand Component
 * Class-based component for footer brand/logo
 */
class FooterBrand extends Component<{}, FooterBrandState> {
  private baseClass: string = "footer-brand";

  render(): React.ReactNode {
    return (
      <div className={this.baseClass}>
        <div className={`${this.baseClass}__header`}>
          <img
            src={BRAND_INFO.logoPath}
            alt={`${BRAND_INFO.fullName} logo`}
            className={`${this.baseClass}__logo`}
            loading="lazy"
          />
          <div className={`${this.baseClass}__text`}>
            <div className={`${this.baseClass}__name`}>{BRAND_INFO.fullName}</div>
            <div className={`${this.baseClass}__tagline`}>{BRAND_INFO.tagline}</div>
          </div>
        </div>
        <p className={`${this.baseClass}__description`}>{BRAND_INFO.description}</p>
      </div>
    );
  }
}

export default FooterBrand;
