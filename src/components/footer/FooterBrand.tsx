import React from "react";
import "../../styles/footer/FooterBrand.css";
import { BRAND_INFO } from "../../constants/app-constants";

const FooterBrand: React.FC = () => {
  return (
    <div className="footer-brand">
      <div className="footer-brand__header">
        <img
          src={BRAND_INFO.logoPath}
          alt={`${BRAND_INFO.fullName} logo`}
          className="footer-brand__logo"
          loading="lazy"
        />
        <div className="footer-brand__text">
          <div className="footer-brand__name">{BRAND_INFO.fullName}</div>
          <div className="footer-brand__tagline">{BRAND_INFO.tagline}</div>
        </div>
      </div>
      <p className="footer-brand__description">{BRAND_INFO.description}</p>
    </div>
  );
};

export default FooterBrand;

