// src/components/Header.tsx

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

interface NavItem {
  label: string;
  path: string;
}

interface HeaderProps {
  navLinks: NavItem[];
  logoSrc?: string;
}

interface HeaderState {
  isMobileMenuOpen: boolean;
}

class Header extends Component<HeaderProps, HeaderState> {
  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
    };
  }

  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen,
    }));
  };

  protected createNavLink(): React.ReactNode {
    return this.props.navLinks.map((item, index) => (
      <li key={index}>
        <Link
          to={item.path}
          onClick={() => this.setState({ isMobileMenuOpen: false })}
        >
          {item.label}
        </Link>
      </li>
    ));
  }

  public render(): React.ReactNode {
    const { isMobileMenuOpen } = this.state;
    const { logoSrc = "/images/logo.png" } = this.props;

    return (
      <header className="header">
        <div className="header-top-border"></div>
        <nav className="nav-bar">
          <div className="nav-left">
            <Link to="/">
              <img src={logoSrc} alt="Logo" className="logo" />
            </Link>
          </div>

          <div className="nav-center">
            <div className="nav-title">Giftforyou.idn</div>
          </div>

          <div className="hamburger" onClick={this.toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div
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
