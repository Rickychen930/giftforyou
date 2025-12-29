// src/view/header.tsx - Refactored Header with Reusable Components
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import "../styles/Header.css";

// Reusable Header Components
import HeaderBrand from "../components/header/HeaderBrand";
import HeaderNavigation, { NavItem } from "../components/header/HeaderNavigation";
import HeaderSearch from "../components/header/HeaderSearch";
import HeaderActions from "../components/header/HeaderActions";

interface HeaderProps {
  navLinks: NavItem[];
  logoSrc?: string;
}

const Header: React.FC<HeaderProps> = ({ navLinks, logoSrc }) => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collectionsAnimate, setCollectionsAnimate] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [collectionNames, setCollectionNames] = useState<string[]>([]);
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement | null>(null);
  const collectionsItemRef = useRef<HTMLLIElement | null>(null);
  const collectionsCloseTimerRef = useRef<number | null>(null);
  const collectionsAnimateTimerRef = useRef<number | null>(null);

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
      }
      return next;
    });
  }, []);

  useEffect(() => {
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
    if (!mobileOpen && !searchOpen) {
      document.body.style.overflow = "";
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      if (e.key === "Escape") {
        if (searchOpen) {
          closeSearch({ returnFocus: true });
        }
        if (mobileOpen) {
          closeMobile({ returnFocus: true });
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        const target = e.target as HTMLElement;
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

  const handleCollectionsToggle = () => {
    if (!collectionsOpen) {
      setCollectionsOpen(true);
      pulseCollectionsAnimate(220);
    } else {
      setCollectionsOpen(false);
    }
  };

  const handleCollectionsOpen = () => {
    cancelCollectionsClose();
    setCollectionsOpen(true);
  };

  const handleCollectionsClose = () => {
    if (mobileOpen) return;
    scheduleCollectionsClose(180);
  };

  const handleNavigate = () => {
    closeMobile();
    closeSearch();
    setCollectionsOpen(false);
  };

  const collectionSuggestions =
    collectionNames.length > 0
      ? collectionNames
      : [];

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      {mobileOpen && (
        <div
          className="header__mobile-backdrop"
          onClick={() => closeMobile({ returnFocus: true })}
          aria-hidden="true"
        />
      )}
      <div className="header__container">
        {/* Logo & Brand */}
        <div className="header__left">
          <HeaderBrand logoSrc={logoSrc} onNavigate={handleNavigate} />
        </div>

        {/* Center Navigation */}
        <div className="header__center">
          <HeaderNavigation
            navLinks={navLinks}
            isMobile={mobileOpen}
            collectionsOpen={collectionsOpen}
            onCollectionsToggle={handleCollectionsToggle}
            onCollectionsOpen={handleCollectionsOpen}
            onCollectionsClose={handleCollectionsClose}
            collectionsAnimate={collectionsAnimate}
            collectionNames={collectionNames}
            typeNames={typeNames}
            onNavigate={handleNavigate}
            collectionsItemRef={collectionsItemRef}
          />
        </div>

        {/* Right Actions */}
        <div className="header__right">
          <HeaderActions
            onSearchToggle={toggleSearch}
            searchOpen={searchOpen}
            searchButtonRef={searchButtonRef}
            hamburgerButtonRef={hamburgerButtonRef}
            mobileOpen={mobileOpen}
            onMobileToggle={onToggleMobile}
          />
        </div>
      </div>

      {/* Search Overlay */}
      <HeaderSearch
        isOpen={searchOpen}
        onClose={closeSearch}
        searchButtonRef={searchButtonRef}
        collectionSuggestions={collectionSuggestions}
      />
    </header>
  );
};

export default Header;
