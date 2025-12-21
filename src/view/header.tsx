// src/view/header.tsx - Premium Header for Luxury Bouquet Store
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.css";

type NavItem = {
  label: string;
  path: string;
  icon?: string;
};

interface HeaderProps {
  navLinks: NavItem[];
  logoSrc?: string;
  cartCount?: number;
}

const COLLECTION_SUGGESTIONS = [
  "Orchid Collection",
  "Premium Roses",
  "Exotic Lilies",
  "Seasonal Specials",
  "Birthday Bouquets",
  "Anniversary Gifts",
  "Best Sellers",
  "New Arrivals",
];

const Header: React.FC<HeaderProps> = ({
  navLinks,
  logoSrc = "/images/logo.png",
  cartCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const onToggleMobile = () => setMobileOpen((s) => !s);
  const closeMobile = () => setMobileOpen(false);

  const handleSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const term = (
      e.currentTarget.elements.namedItem("q") as HTMLInputElement
    )?.value?.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate("/search");
    }
    setQuery("");
    setSearchOpen(false);
    closeMobile();
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (!searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      {/* Elegant Top Bar */}
      <div className="header-top-bar">
        <div className="header-top-content">
          <div className="header-contact">
            <span className="contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              info@giftforyou.com
            </span>
            <span className="contact-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              +1 (555) 123-4567
            </span>
          </div>
          <div className="header-social">
            <a href="#" className="social-link" aria-label="Instagram">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="Facebook">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="#" className="social-link" aria-label="WhatsApp">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-container">
        {/* Logo & Brand */}
        <div className="nav-left">
          <Link
            to="/"
            onClick={closeMobile}
            className="brand"
            aria-label="Giftforyou Homepage"
          >
            <div className="logo-wrapper">
              <img src={logoSrc} alt="Giftforyou" className="logo" />
            </div>
            <div className="brand-text">
              <span className="brand-name">Giftforyou</span>
              <span className="brand-tagline">Luxury Floral Boutique</span>
            </div>
          </Link>
        </div>

        {/* Center Navigation */}
        <nav className="nav-center" role="navigation" aria-label="Primary">
          <ul
            className={`nav-links ${mobileOpen ? "open" : ""}`}
            id="primary-navigation"
          >
            {navLinks.map((item) => {
              const isCollections =
                item.path === "/collection" ||
                item.label.toLowerCase().includes("collection");

              return (
                <li
                  key={item.path}
                  className={`nav-item ${
                    isCollections ? "nav-item--dropdown" : ""
                  }`}
                >
                  <NavLink
                    to={item.path}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "is-active" : ""}`
                    }
                  >
                    {item.label}
                    {isCollections && (
                      <svg
                        className="dropdown-arrow"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </NavLink>

                  {isCollections && (
                    <div className="dropdown">
                      <div className="dropdown-header">
                        <h3>Our Collections</h3>
                        <p>Handcrafted with love</p>
                      </div>
                      <ul className="dropdown-grid">
                        {COLLECTION_SUGGESTIONS.map((c) => (
                          <li key={c}>
                            <Link
                              to={`/collection?filter=${encodeURIComponent(c)}`}
                              onClick={closeMobile}
                              className="dropdown-link"
                            >
                              <span className="dropdown-icon">🌸</span>
                              <span>{c}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right Actions */}
        <div className="nav-right">
          {/* Search */}
          <button
            className="icon-btn search-btn"
            onClick={toggleSearch}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M21 21l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="icon-btn cart-btn"
            aria-label={`View cart${
              cartCount > 0 ? ` (${cartCount} items)` : ""
            }`}
            onClick={closeMobile}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6h15l-1.5 9h-12L6 6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            onClick={onToggleMobile}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="search-close"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M21 21l-4.35-4.35"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  ref={searchRef}
                  name="q"
                  list="search-suggestions"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="search-input"
                  placeholder="Search for bouquets, collections, occasions..."
                  aria-label="Search"
                />
                <datalist id="search-suggestions">
                  {COLLECTION_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <button type="submit" className="search-submit">
                Search
              </button>
            </form>
            <div className="search-suggestions">
              <p className="suggestions-title">Popular Searches</p>
              <div className="suggestions-tags">
                {COLLECTION_SUGGESTIONS.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="suggestion-tag"
                    onClick={() => {
                      setQuery(s);
                      searchRef.current?.focus();
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
