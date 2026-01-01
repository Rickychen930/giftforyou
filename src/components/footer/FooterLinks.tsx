/**
 * Footer Links Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/footer/FooterLinks.css";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterLinksProps {
  links: FooterLink[];
  title?: string;
}

interface FooterLinksState {
  // No state needed, but keeping for consistency
}

/**
 * Footer Links Component
 * Class-based component for footer navigation links
 */
class FooterLinks extends Component<FooterLinksProps, FooterLinksState> {
  private baseClass: string = "footer-links";

  private renderLink(link: FooterLink): React.ReactNode {
    if (link.external) {
      return (
        <a
          key={link.href}
          href={link.href}
          className={`${this.baseClass}__link`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </a>
      );
    }

    return (
      <Link key={link.href} to={link.href} className={`${this.baseClass}__link`}>
        {link.label}
      </Link>
    );
  }

  render(): React.ReactNode {
    const { links, title } = this.props;

    return (
      <nav className={this.baseClass} aria-label={title || "Footer navigation"}>
        {title && <h3 className={`${this.baseClass}__title`}>{title}</h3>}
        <ul className={`${this.baseClass}__list`}>
          {links.map((link) => (
            <li key={link.href} className={`${this.baseClass}__item`}>
              {this.renderLink(link)}
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}

export default FooterLinks;
