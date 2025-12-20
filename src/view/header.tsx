// src/components/Header.tsx
import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/Header.css";

interface NavItem {
  label: string;
  path: string;
  icon?: string;
}

interface HeaderProps {
  navLinks: NavItem[];
  logoSrc?: string;
}

interface HeaderState {
  isMobileMenuOpen: boolean;
}

class Header extends Component<HeaderProps, HeaderState> {
  state: HeaderState = { isMobileMenuOpen: false };

  toggleMobileMenu = () => {
    this.setState((prev) => ({ isMobileMenuOpen: !prev.isMobileMenuOpen }));
  };

  closeMobileMenu = () => {
    this.setState({ isMobileMenuOpen: false });
  };

  protected createNavLink(): React.ReactNode {
    return this.props.navLinks.map((item) => (
      <li key={item.path} className="nav-item">
        <NavLink
          to={item.path}
          onClick={this.closeMobileMenu}
          className={({ isActive }) =>
            isActive ? "nav-link is-active" : "nav-link"
          }
        >
          {item.icon && <i className={item.icon} aria-hidden="true" />}
          <span>{item.label}</span>
        </NavLink>
      </li>
    ));
  }

  render(): React.ReactNode {
    const { isMobileMenuOpen } = this.state;
    const { logoSrc = "/images/logo.png" } = this.props;

    return (
      <header className="header">
        <div className="header-top-border" />

        <nav className="nav-bar" aria-label="Main navigation">
          <div className="nav-left">
            <Link
              to="/"
              onClick={this.closeMobileMenu}
              aria-label="Go to homepage"
            >
              <img src={logoSrc} alt="Giftforyou.idn Logo" className="logo" />
            </Link>
          </div>

          <div className="nav-center">
            <div className="nav-title">Giftforyou.idn</div>
          </div>

          <button
            type="button"
            className="hamburger"
            onClick={this.toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
          >
            <span />
            <span />
            <span />
          </button>

          <div
            id="primary-navigation"
            className={`nav-right ${isMobileMenuOpen ? "mobile-active" : ""}`}
          >
            <ul className="nav-links">{this.createNavLink()}</ul>
          </div>
        </nav>
      </header>
    );
  }
}

export default Header;
