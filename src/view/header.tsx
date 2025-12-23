// src/view/header.tsx - Optimized Header for Luxury Bouquet Store
import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { BRAND_INFO, COLLECTION_SUGGESTIONS } from "../constants/app-constants";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
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
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collectionsAnimate, setCollectionsAnimate] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [collectionNames, setCollectionNames] = useState<string[]>([]);
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement | null>(null);
  const collectionsItemRef = useRef<HTMLLIElement | null>(null);
  const collectionsCloseTimerRef = useRef<number | null>(null);
  const collectionsAnimateTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const cancelCollectionsClose = () => {
    if (collectionsCloseTimerRef.current) {
      window.clearTimeout(collectionsCloseTimerRef.current);
      collectionsCloseTimerRef.current = null;
    }
  };

  const cancelCollectionsAnimate = () => {
    if (collectionsAnimateTimerRef.current) {
      window.clearTimeout(collectionsAnimateTimerRef.current);
      collectionsAnimateTimerRef.current = null;
    }
  };

  const pulseCollectionsAnimate = (ms = 260) => {
    cancelCollectionsAnimate();
    setCollectionsAnimate(true);
    collectionsAnimateTimerRef.current = window.setTimeout(() => {
      setCollectionsAnimate(false);
      collectionsAnimateTimerRef.current = null;
    }, ms);
  };

  const scheduleCollectionsClose = (delayMs = 180) => {
    cancelCollectionsClose();
    collectionsCloseTimerRef.current = window.setTimeout(() => {
      setCollectionsOpen(false);
      collectionsCloseTimerRef.current = null;
    }, delayMs);
  };

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
        const [collections, bouquets] = await Promise.all([
          getCollections(ac.signal),
          fetch(`${API_BASE}/api/bouquets`, { signal: ac.signal })
            .then(async (r) => {
              if (!r.ok) return [];
              const j = await r.json().catch(() => []);
              return Array.isArray(j) ? j : [];
            })
            .catch(() => []),
        ]);
        if (cancelled) return;

        const names = Array.from(
          new Set(
            (collections ?? [])
              .map((c) => (typeof c?.name === "string" ? c.name.trim() : ""))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setCollectionNames(names);

        const types = Array.from(
          new Set(
            (bouquets ?? [])
              .map((b: any) => (typeof b?.type === "string" ? b.type.trim() : ""))
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        setTypeNames(types);
      } catch (e) {
        // Non-blocking: header can fall back to static suggestions.
        if (cancelled) return;
        setCollectionNames([]);
        setTypeNames([]);
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

  const closeMobile = (opts?: { returnFocus?: boolean }) => {
    setMobileOpen(false);
    if (opts?.returnFocus) {
      setTimeout(() => hamburgerButtonRef.current?.focus(), 0);
    }
  };

  const onToggleMobile = () => setMobileOpen((s) => !s);

  const closeSearch = (opts?: { returnFocus?: boolean }) => {
    setSearchOpen(false);
    if (opts?.returnFocus) {
      setTimeout(() => searchButtonRef.current?.focus(), 0);
    }
  };

  useEffect(() => {
    // Close mobile menu on route changes
    closeMobile();
    closeSearch();
    setCollectionsOpen(false);
    cancelCollectionsClose();
    cancelCollectionsAnimate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      cancelCollectionsClose();
      cancelCollectionsAnimate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!collectionsOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = collectionsItemRef.current;
      if (!root) return;
      if (root.contains(e.target as Node)) return;
      setCollectionsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [collectionsOpen]);

  useEffect(() => {
    // Lock body scroll when an overlay is open (mobile menu or search)
    if (!mobileOpen && !searchOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch({ returnFocus: true });
        closeMobile({ returnFocus: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = searchModalRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden"));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !root.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

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
    closeSearch();
    closeMobile();
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
    if (!searchOpen) {
      closeMobile();
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  };

  const collectionSuggestions =
    collectionNames.length > 0
      ? collectionNames
      : Array.from(COLLECTION_SUGGESTIONS);

  const typeSuggestions = typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"];

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      {mobileOpen && (
        <div
          className="mobileMenuBackdrop"
          onClick={() => closeMobile({ returnFocus: true })}
          aria-hidden="true"
        />
      )}
      {/* Main Navigation */}
      <div className="nav-container">
        {/* Logo & Brand */}
        <div className="nav-left">
          <Link
            to="/"
            onClick={() => closeMobile()}
            className="brand"
            aria-label={`${BRAND_INFO.name} Beranda`}
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
              const isCollections = item.path === "/collection";

              return (
                <li
                  key={item.path}
                  className={`nav-item ${
                    isCollections ? "nav-item--dropdown" : ""
                  } ${isCollections && collectionsOpen ? "is-open" : ""} ${
                    isCollections && collectionsAnimate ? "is-animate" : ""
                  }`}
                  ref={isCollections ? collectionsItemRef : undefined}
                  onMouseEnter={() => {
                    if (!isCollections) return;
                    if (mobileOpen) return;
                    cancelCollectionsClose();
                    setCollectionsOpen(true);
                  }}
                  onMouseLeave={() => {
                    if (!isCollections) return;
                    if (mobileOpen) return;
                    scheduleCollectionsClose(180);
                  }}
                  onFocusCapture={() => {
                    if (!isCollections) return;
                    cancelCollectionsClose();
                    setCollectionsOpen(true);
                  }}
                  onBlurCapture={() => {
                    if (!isCollections) return;
                    cancelCollectionsClose();
                    window.setTimeout(() => {
                      const root = collectionsItemRef.current;
                      if (!root) return;
                      if (!root.contains(document.activeElement)) {
                        setCollectionsOpen(false);
                      }
                    }, 0);
                  }}
                >
                  <NavLink
                    to={item.path}
                    onClick={(e) => {
                      if (isCollections) {
                        // Desktop/touch: first click opens dropdown, second click navigates.
                        if (!mobileOpen && !collectionsOpen) {
                          e.preventDefault();
                          setCollectionsOpen(true);
                          pulseCollectionsAnimate();
                          return;
                        }
                        setCollectionsOpen(false);
                      } else {
                        setCollectionsOpen(false);
                      }
                      closeMobile();
                    }}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "is-active" : ""}`
                    }
                    aria-haspopup={isCollections ? "true" : undefined}
                    aria-expanded={isCollections ? collectionsOpen : undefined}
                    aria-controls={isCollections ? "collections-dropdown" : undefined}
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
                    <div className="dropdown" id="collections-dropdown" aria-label="Menu koleksi">
                      <div className="dropdown-header">
                        <h3>Koleksi Kami</h3>
                        <p>Dirangkai dengan sepenuh hati</p>
                      </div>

                      <div className="dropdown-header" style={{ marginTop: "0.75rem" }}>
                        <h3>Berdasarkan Tipe</h3>
                        <p>Filter cepat untuk katalog</p>
                      </div>
                      <ul className="dropdown-grid">
                        {typeSuggestions.map((t) => (
                          <li key={t}>
                            <Link
                              to={`/collection?type=${encodeURIComponent(t)}`}
                              onClick={() => closeMobile()}
                              className="dropdown-link"
                            >
                              <span className="dropdown-icon">🏷️</span>
                              <span>{t}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <ul className="dropdown-grid">
                        {collectionSuggestions.map((c) => (
                          <li key={c}>
                            <Link
                              to={`/collection?name=${encodeURIComponent(c)}`}
                              onClick={() => closeMobile()}
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
            aria-label="Cari"
            ref={searchButtonRef}
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
            onClick={() => closeMobile()}
          >
            <CartIcon />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            onClick={onToggleMobile}
            aria-label="Buka/tutup menu"
            aria-expanded={mobileOpen}
            aria-controls="primary-navigation"
            ref={hamburgerButtonRef}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="search-overlay"
          onClick={() => closeSearch({ returnFocus: true })}
        >
          <div
            className="search-modal"
            onClick={(e) => e.stopPropagation()}
            ref={searchModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Pencarian"
          >
            <button
              className="search-close"
              onClick={() => closeSearch({ returnFocus: true })}
              aria-label="Tutup pencarian"
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
                  placeholder="Cari bouquet, koleksi, momen..."
                  aria-label="Cari"
                />
                <datalist id="search-suggestions">
                  {collectionSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <button type="submit" className="search-submit">
                Cari
              </button>
            </form>
            <div className="search-suggestions">
              <p className="suggestions-title">Pencarian Populer</p>
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
