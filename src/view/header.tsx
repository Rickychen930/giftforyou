// src/view/header.tsx - Optimized Header for Luxury Bouquet Store
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { BRAND_INFO, COLLECTION_SUGGESTIONS } from "../constants/app-constants";
import { getCollections } from "../services/collection.service";
import {
  SearchIcon,
  CartIcon,
  CloseIcon,
  ChevronDownIcon,
} from "../components/icons/UIIcons";
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

const Header: React.FC<HeaderProps> = ({
  navLinks,
  logoSrc = BRAND_INFO.logoPath,
  cartCount = 0,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [collectionNames, setCollectionNames] = useState<string[]>([]);
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
    let cancelled = false;
    const ac = new AbortController();

    (async () => {
      try {
        const collections = await getCollections(ac.signal);
        if (cancelled) return;

        const names = Array.from(
          new Set(
            (collections ?? [])
              .map((c) => (typeof c?.name === "string" ? c.name.trim() : ""))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setCollectionNames(names);
      } catch (e) {
        // Non-blocking: header can fall back to static suggestions.
        if (cancelled) return;
        setCollectionNames([]);
      }
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
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

  const collectionSuggestions =
    collectionNames.length > 0
      ? collectionNames
      : Array.from(COLLECTION_SUGGESTIONS);

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      {/* Main Navigation */}
      <div className="nav-container">
        {/* Logo & Brand */}
        <div className="nav-left">
          <Link
            to="/"
            onClick={closeMobile}
            className="brand"
            aria-label={`${BRAND_INFO.name} Homepage`}
          >
            <div className="logo-wrapper">
              <img src={logoSrc} alt={BRAND_INFO.name} className="logo" />
            </div>
            <div className="brand-text">
              <span className="brand-name">{BRAND_INFO.name}</span>
              <span className="brand-tagline">{BRAND_INFO.tagline}</span>
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
                      <ChevronDownIcon
                        className="dropdown-arrow"
                        width={12}
                        height={12}
                      />
                    )}
                  </NavLink>

                  {isCollections && (
                    <div className="dropdown">
                      <div className="dropdown-header">
                        <h3>Our Collections</h3>
                        <p>Handcrafted with love</p>
                      </div>
                      <ul className="dropdown-grid">
                        {collectionSuggestions.map((c) => (
                          <li key={c}>
                            <Link
                              to={`/collection?name=${encodeURIComponent(c)}`}
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
            <SearchIcon />
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
            <CartIcon />
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
              <CloseIcon />
            </button>
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <SearchIcon className="search-icon" width={24} height={24} />
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
                  {collectionSuggestions.map((s) => (
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
                {collectionSuggestions.slice(0, 5).map((s) => (
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
