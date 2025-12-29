import React from "react";
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

const FooterLinks: React.FC<FooterLinksProps> = ({ links, title }) => {
  return (
    <nav className="footer-links" aria-label={title || "Footer navigation"}>
      {title && <h3 className="footer-links__title">{title}</h3>}
      <ul className="footer-links__list">
        {links.map((link) => (
          <li key={link.href} className="footer-links__item">
            {link.external ? (
              <a
                href={link.href}
                className="footer-links__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ) : (
              <Link to={link.href} className="footer-links__link">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default FooterLinks;

