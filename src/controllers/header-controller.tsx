/**
 * Header Controller
 * Manages header state and business logic
 * Following SOLID, OOP, MVP principles
 */

import React from "react";
import type { HeaderState } from "../models/header-model";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import { getCartCount } from "../utils/cart";
import { getAccessToken } from "../utils/auth-utils";
import { DEFAULT_HEADER_STATE } from "../models/header-model";

/**
 * Header Controller Class
 * Handles all business logic for header component
 * Pure class without React component inheritance
 */
export class HeaderController {
  private state: HeaderState;
  private collectionsCloseTimerRef: number | null = null;
  private collectionsAnimateTimerRef: number | null = null;
  private scrollHandler: (() => void) | null = null;
  private cartUpdateHandler: (() => void) | null = null;
  private abortController: AbortController | null = null;
  private stateUpdateCallback: ((state: HeaderState) => void) | null = null;

  constructor() {
    this.state = { ...DEFAULT_HEADER_STATE };
  }

  // Set state update callback (called by view component)
  public setStateUpdateCallback(callback: (state: HeaderState) => void): void {
    this.stateUpdateCallback = callback;
  }

  // Internal state update method
  private updateState(updates: Partial<HeaderState>): void {
    this.state = { ...this.state, ...updates };
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback(this.state);
    }
  }

  // Initialize controller
  public initialize(): void {
    this.setupScrollListener();
    this.setupCartListener();
    this.loadCollectionsAndTypes();
  }

  // Performance: Throttled scroll handler
  private setupScrollListener = (): void => {
    let ticking = false;
    this.scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateState({ scrolled: window.scrollY > 20 });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  };

  // Setup cart count listener
  private setupCartListener = (): void => {
    const updateCartCount = () => {
      const isAuthenticated = !!getAccessToken();
      this.updateState({
        cartCount: isAuthenticated ? getCartCount() : 0,
      });
    };

    updateCartCount();
    this.cartUpdateHandler = updateCartCount;
    window.addEventListener("cartUpdated", this.cartUpdateHandler);
  };

  // Load collections and types from API
  // Enhanced: Better error handling and timeout protection
  private loadCollectionsAndTypes = async (): Promise<void> => {
    // Cancel previous request if exists
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();
    const ac = this.abortController;

    try {
      // Add timeout to prevent hanging requests
      const timeoutId = setTimeout(() => {
        if (!ac.signal.aborted) {
          ac.abort();
        }
      }, 10000); // 10 second timeout

      const [collections, bouquets] = await Promise.all([
        getCollections(ac.signal).catch(() => []),
        fetch(`${API_BASE}/api/bouquets`, { signal: ac.signal })
          .then(async (r) => {
            if (!r.ok) return [];
            const j = await r.json().catch(() => []);
            return Array.isArray(j) ? j : [];
          })
          .catch(() => []),
      ]);

      clearTimeout(timeoutId);

      if (ac.signal.aborted) return;

      // Enhanced: Safe extraction with validation
      const names = Array.from(
        new Set(
          (Array.isArray(collections) ? collections : [])
            .map((c) => {
              if (typeof c === "object" && c !== null && "name" in c) {
                return typeof c.name === "string" ? c.name.trim() : "";
              }
              return "";
            })
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      const types = Array.from(
        new Set(
          (Array.isArray(bouquets) ? bouquets : [])
            .map((b: any) => {
              if (typeof b === "object" && b !== null && "type" in b) {
                return typeof b.type === "string" ? b.type.trim() : "";
              }
              return "";
            })
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      this.updateState({ collectionNames: names, typeNames: types });
    } catch (e) {
      if (!ac.signal.aborted) {
        // Enhanced: Fallback to empty arrays on error
        this.updateState({ collectionNames: [], typeNames: [] });
      }
    }
  };

  // Timer management for collections dropdown
  private cancelCollectionsClose = (): void => {
    if (this.collectionsCloseTimerRef !== null) {
      window.clearTimeout(this.collectionsCloseTimerRef);
      this.collectionsCloseTimerRef = null;
    }
  };

  private cancelCollectionsAnimate = (): void => {
    if (this.collectionsAnimateTimerRef !== null) {
      window.clearTimeout(this.collectionsAnimateTimerRef);
      this.collectionsAnimateTimerRef = null;
    }
  };

  private pulseCollectionsAnimate = (ms = 260): void => {
    this.cancelCollectionsAnimate();
    this.updateState({ collectionsAnimate: true });
    this.collectionsAnimateTimerRef = window.setTimeout(() => {
      this.updateState({ collectionsAnimate: false });
      this.collectionsAnimateTimerRef = null;
    }, ms);
  };

  private scheduleCollectionsClose = (delayMs = 180): void => {
    this.cancelCollectionsClose();
    this.collectionsCloseTimerRef = window.setTimeout(() => {
      this.updateState({ collectionsOpen: false });
      this.collectionsCloseTimerRef = null;
    }, delayMs);
  };

  // Mobile menu handlers
  public closeMobile = (): void => {
    this.updateState({ mobileOpen: false, collectionsOpen: false });
  };

  public toggleMobile = (): void => {
    this.updateState({ mobileOpen: !this.state.mobileOpen });
  };

  // Search handlers
  public closeSearch = (): void => {
    this.updateState({ searchOpen: false });
  };

  public toggleSearch = (): void => {
    const next = !this.state.searchOpen;
    if (next) {
      this.closeMobile();
    }
    this.updateState({ searchOpen: next });
  };

  // Collections dropdown handlers
  public handleCollectionsMouseEnter = (): void => {
    if (this.state.mobileOpen) return;
    this.cancelCollectionsClose();
    this.updateState({ collectionsOpen: true });
  };

  public handleCollectionsMouseLeave = (): void => {
    if (this.state.mobileOpen) return;
    this.scheduleCollectionsClose(180);
  };

  public handleCollectionsFocus = (): void => {
    this.cancelCollectionsClose();
    this.updateState({ collectionsOpen: true });
  };

  public handleCollectionsBlur = (collectionsItemRef: React.RefObject<HTMLLIElement>): void => {
    this.cancelCollectionsClose();
    window.setTimeout(() => {
      const root = collectionsItemRef.current;
      if (!root) return;
      if (!root.contains(document.activeElement)) {
        this.updateState({ collectionsOpen: false });
      }
    }, 0);
  };

  public handleCollectionsClick = (e: React.MouseEvent, isMobile: boolean): void => {
    if (isMobile) {
      // Mobile: toggle dropdown, don't close mobile menu
      if (!this.state.collectionsOpen) {
        e.preventDefault();
        this.updateState({ collectionsOpen: true });
        this.pulseCollectionsAnimate(220);
      } else {
        e.preventDefault();
        this.updateState({ collectionsOpen: false });
      }
    } else {
      // Desktop: close dropdown
      this.updateState({ collectionsOpen: false });
    }
    // Don't close mobile menu when toggling collections dropdown
  };

  // Search form handler
  public handleSearch = (e: React.FormEvent<HTMLFormElement>): string => {
    e.preventDefault();
    const term = (
      e.currentTarget.elements.namedItem("q") as HTMLInputElement
    )?.value?.trim() || "";

    this.updateState({ query: "" });
    this.closeSearch();
    this.closeMobile();

    return term;
  };

  // Update query
  public setQuery = (query: string): void => {
    this.updateState({ query });
  };

  // Cleanup
  private cleanup = (): void => {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
    }
    if (this.cartUpdateHandler) {
      window.removeEventListener("cartUpdated", this.cartUpdateHandler);
    }
    this.cancelCollectionsClose();
    this.cancelCollectionsAnimate();
    if (this.abortController) {
      this.abortController.abort();
    }
  };

  // Getters
  public getState(): HeaderState {
    return { ...this.state };
  }

  // Public update state (for external updates like click outside)
  public updateStatePublic(updates: Partial<HeaderState>): void {
    this.updateState(updates);
  }
}

