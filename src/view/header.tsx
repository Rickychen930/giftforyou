// src/view/header.tsx - Optimized Header for Luxury Bouquet Store
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { BRAND_INFO, COLLECTION_SUGGESTIONS } from "../constants/app-constants";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import { getCartCount } from "../utils/cart";
import { getAccessToken } from "../utils/auth-utils";
import {
  SearchIcon,
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
}

const Header: React.FC<HeaderProps> = ({
  navLinks,
  logoSrc = BRAND_INFO.logoPath,
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
  const [cartCount, setCartCount] = useState<number>(0);
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
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const isAuthenticated = !!getAccessToken();
      if (isAuthenticated) {
        setCartCount(getCartCount());
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
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
    setCollectionsOpen(false);
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

  const toggleSearch = useCallback(() => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        closeMobile();
        // Focus after state update
        setTimeout(() => searchRef.current?.focus(), 100);
      }
      return next;
    });
  }, []);

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
    if (!collectionsOpen || mobileOpen) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = collectionsItemRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (root.contains(target)) return;
      // Small delay to allow click events to fire first
      setTimeout(() => {
        setCollectionsOpen(false);
      }, 100);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [collectionsOpen, mobileOpen]);

  useEffect(() => {
    // Lock body scroll when an overlay is open (mobile menu or search)
    if (!mobileOpen && !searchOpen) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Prevent scroll on iOS
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    return () => {
      document.body.style.overflow = prev;
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [mobileOpen, searchOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Escape key closes modals
      if (e.key === "Escape") {
        if (searchOpen) {
          closeSearch({ returnFocus: true });
        }
        if (mobileOpen) {
          closeMobile({ returnFocus: true });
        }
        return;
      }

      // Ctrl/Cmd + K opens search (common UX pattern)
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        const target = e.target as HTMLElement;
        // Don't trigger if user is typing in an input/textarea
        if (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }
        e.preventDefault();
        if (!searchOpen) {
          toggleSearch();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, mobileOpen, toggleSearch]);

  // Focus trap for search modal
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
      ).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        if (el.getAttribute("aria-hidden") === "true") return false;
        // Check visibility
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchOpen]);

  // Focus trap for mobile menu
  const mobileMenuRef = useRef<HTMLUListElement | null>(null);
  
  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = mobileMenuRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        if (el.getAttribute("aria-hidden") === "true") return false;
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

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
    // Return focus to search button after navigation
    setTimeout(() => searchButtonRef.current?.focus(), 100);
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
              <img 
                src={logoSrc} 
                alt={BRAND_INFO.name} 
                className="logo"
                loading="eager"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
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
            ref={mobileMenuRef}
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
                        // Desktop: hover opens, click navigates directly (better UX)
                        if (!mobileOpen) {
                          // On desktop, allow direct navigation - hover handles dropdown
                          setCollectionsOpen(false);
                        } else {
                          // Mobile: treat as an accordion toggle
                          if (!collectionsOpen) {
                            e.preventDefault();
                            setCollectionsOpen(true);
                            pulseCollectionsAnimate(220);
                            return;
                          }
                          // If already open, allow navigation to /collection
                          setCollectionsOpen(false);
                        }
                      } else {
                        setCollectionsOpen(false);
                      }
                      closeMobile();
                    }}
                    onKeyDown={(e) => {
                      // Allow Enter/Space to navigate on desktop, toggle on mobile
                      if (isCollections && !mobileOpen && (e.key === "Enter" || e.key === " ")) {
                        // On desktop, Enter/Space navigates directly
                        setCollectionsOpen(false);
                      }
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

                  {isCollections && (!mobileOpen || collectionsOpen) && (
                    <div 
                      className="dropdown" 
                      id="collections-dropdown" 
                      aria-label="Menu koleksi"
                      role="menu"
                    >
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
                              onClick={() => {
                                closeMobile();
                                setCollectionsOpen(false);
                              }}
                              className="dropdown-link"
                              role="menuitem"
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
                              onClick={() => {
                                closeMobile();
                                setCollectionsOpen(false);
                              }}
                              className="dropdown-link"
                              role="menuitem"
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
            type="button"
            aria-label="Cari (Ctrl+K atau Cmd+K)"
            aria-expanded={searchOpen}
            aria-controls={searchOpen ? "search-modal" : undefined}
            ref={searchButtonRef}
            title="Cari (Ctrl+K atau Cmd+K)"
          >
            <SearchIcon />
          </button>

          {/* Cart */}
          {getAccessToken() && (
            <Link
              to="/cart"
              className="icon-btn cart-btn"
              aria-label={`Keranjang (${cartCount} item)`}
              title="Keranjang Belanja"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge" aria-label={`${cartCount} item di keranjang`}>
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`hamburger ${mobileOpen ? "is-open" : ""}`}
            onClick={onToggleMobile}
            type="button"
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
            id="search-modal"
          >
            <button
              className="search-close"
              onClick={() => closeSearch({ returnFocus: true })}
              type="button"
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
                      // Small delay to ensure state update
                      setTimeout(() => {
                        searchRef.current?.focus();
                        searchRef.current?.setSelectionRange(
                          searchRef.current.value.length,
                          searchRef.current.value.length
                        );
                      }, 0);
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
