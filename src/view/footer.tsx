/**
 * Footer View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import "../styles/Footer.css";
import { BRAND_INFO, QUICK_LINKS } from "../constants/app-constants";
import FooterBrand from "../components/footer/FooterBrand";
import FooterLinks from "../components/footer/FooterLinks";
import FooterContact from "../components/footer/FooterContact";
import FooterSocial from "../components/footer/FooterSocial";
import FooterNewsletter from "../components/footer/FooterNewsletter";
import BackToTopButton from "../components/footer/BackToTopButton";

/**
 * Footer View Component
 * Pure presentation class component
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class Footer extends Component {
  /**
   * Get current year
   */
  private getCurrentYear(): number {
    return new Date().getFullYear();
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const year = this.getCurrentYear();

    const quickLinks = QUICK_LINKS.map((link) => ({
      label: link.label,
      href: link.href,
      external: false,
    }));

    return (
      <footer className="footer" aria-label="Footer website">
        <div className="footer__container">
          {/* Main Content - 3 Columns */}
          <div className="footer__main">
            {/* Brand & About */}
            <div className="footer__section footer__section--brand">
              <FooterBrand />
            </div>

            {/* Quick Links */}
            <div className="footer__section">
              <FooterLinks links={quickLinks} title="Tautan Cepat" />
            </div>

            {/* Contact Info */}
            <div className="footer__section">
              <FooterContact />
            </div>
          </div>

          {/* Social & Newsletter Bar */}
          <div className="footer__secondary">
            <FooterSocial />
            <FooterNewsletter />
          </div>

          {/* Bottom Bar */}
          <div className="footer__bottom">
            <p className="footer__copyright">
              © {year} {BRAND_INFO.fullName}. Semua hak dilindungi.
            </p>
          </div>
        </div>

        {/* Back to Top Button */}
        <BackToTopButton />
      </footer>
    );
  }
}

export default Footer;
