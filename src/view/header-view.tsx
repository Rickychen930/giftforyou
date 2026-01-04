/**
 * Header View Component
 * Luxury, Elegant, Clean UI/UX
 * Following SOLID, MVP, OOP, DRY principles
 * Fully responsive and optimized for all devices
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeaderController } from "../controllers/header-controller";
import type { HeaderProps, HeaderState } from "../models/header-model";
import { getAccessToken } from "../utils/auth-utils";
import {
  Logo,
  Navigation,
  SearchButton,
  SearchModal,
  CartButton,
  MobileMenuButton,
} from "../components/header";
import "../styles/Header.css";

/**
 * Header View Component
 * Main header component using MVC pattern
 */
const HeaderView: React.FC<HeaderProps> = ({ navLinks, logoSrc }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Controller instance (created once, persists across re-renders)
  const controllerRef = useRef<HeaderController | null>(null);
  const controller = useMemo(() => {
    if (!controllerRef.current) {
      controllerRef.current = new HeaderController();
    }
    return controllerRef.current;
  }, []);

  // State from controller
  const [state, setState] = useState<HeaderState>(controller.getState());

  // Refs
  const searchRef = useRef<HTMLInputElement>(null);
  const searchModalRef = useRef<HTMLDivElement>(null);
  const collectionsItemRef = useRef<HTMLLIElement>(null);

  // Setup controller callback (only once)
  useEffect(() => {
    controller.setStateUpdateCallback(setState);
    controller.initialize();

    return () => {
      // Controller handles its own cleanup
      controller.setStateUpdateCallback(() => {});
    };
  }, [controller]);

  // Close menus on route change
  useEffect(() => {
    controller.closeMobile();
    controller.closeSearch();
    controller.handleCollectionsBlur(collectionsItemRef);
  }, [location.pathname, location.search, controller]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (state.searchOpen) {
          controller.closeSearch();
        }
        if (state.mobileOpen) {
          controller.closeMobile();
        }
        return;
      }

      // Ctrl/Cmd + K opens search
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
        if (!state.searchOpen) {
          controller.toggleSearch();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.searchOpen, state.mobileOpen, controller]);

  // Focus trap for search modal
  useEffect(() => {
    if (!state.searchOpen) return;

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
  }, [state.searchOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!state.mobileOpen && !state.searchOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
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
  }, [state.mobileOpen, state.searchOpen]);

  // Click outside collections dropdown
  // Enhanced: Better event handling with passive listeners
  useEffect(() => {
    if (!state.collectionsOpen || state.mobileOpen) return;
    
    let timeoutId: number | null = null;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const root = collectionsItemRef.current;
      if (!root) return;
      const target = e.target as Node;
      if (root.contains(target)) return;
      
      // Clear previous timeout
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      
      // Small delay to allow click events to fire first
      timeoutId = window.setTimeout(() => {
        controller.updateStatePublic({ collectionsOpen: false });
        timeoutId = null;
      }, 100);
    };
    
    document.addEventListener("mousedown", onPointerDown, { passive: true });
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [state.collectionsOpen, state.mobileOpen, controller]);

  // Handlers
  const handleSearch = useCallback((term: string) => {
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate("/search");
    }
  }, [navigate]);

  const handleLogoClick = useCallback(() => {
    controller.closeMobile();
  }, [controller]);

  const handleNavLinkClick = useCallback(() => {
    controller.closeMobile();
    controller.updateStatePublic({ collectionsOpen: false });
  }, [controller]);

  const handleCollectionsClick = useCallback((e: React.MouseEvent, isMobile: boolean) => {
    controller.handleCollectionsClick(e, isMobile);
  }, [controller]);

  // Memoized values - check authentication status
  const isAuthenticated = useMemo(() => !!getAccessToken(), []);

  return (
    <header className={`header ${state.scrolled ? "header--scrolled" : ""}`}>
      {/* Mobile Menu Backdrop */}
      {state.mobileOpen && (
        <div
          className="mobileMenuBackdrop"
          onClick={() => controller.closeMobile()}
          onTouchStart={() => controller.closeMobile()}
          aria-hidden="false"
        />
      )}

      {/* Main Navigation */}
      <div className="nav-container">
        {/* Logo & Brand */}
        <div className="nav-left">
          <Logo logoSrc={logoSrc} onLogoClick={handleLogoClick} />
        </div>

        {/* Center Navigation */}
        <Navigation
          navLinks={navLinks}
          mobileOpen={state.mobileOpen}
          collectionsOpen={state.collectionsOpen}
          collectionsAnimate={state.collectionsAnimate}
          collectionNames={state.collectionNames}
          typeNames={state.typeNames}
          onCollectionsMouseEnter={controller.handleCollectionsMouseEnter}
          onCollectionsMouseLeave={controller.handleCollectionsMouseLeave}
          onCollectionsFocus={controller.handleCollectionsFocus}
          onCollectionsBlur={() => controller.handleCollectionsBlur(collectionsItemRef)}
          onCollectionsClick={handleCollectionsClick}
          onNavLinkClick={handleNavLinkClick}
          collectionsItemRef={collectionsItemRef}
        />

        {/* Right Actions */}
        <div className="nav-right">
          <SearchButton
            onClick={controller.toggleSearch}
            isOpen={state.searchOpen}
          />

          {isAuthenticated && (
            <CartButton cartCount={state.cartCount} />
          )}

          <MobileMenuButton
            onClick={controller.toggleMobile}
            isOpen={state.mobileOpen}
          />
        </div>
      </div>

      {/* Search Overlay */}
      <SearchModal
        isOpen={state.searchOpen}
        query={state.query}
        collectionNames={state.collectionNames}
        onClose={controller.closeSearch}
        onQueryChange={controller.setQuery}
        onSearch={handleSearch}
        searchRef={searchRef}
        searchModalRef={searchModalRef}
      />
    </header>
  );
};

export default HeaderView;

