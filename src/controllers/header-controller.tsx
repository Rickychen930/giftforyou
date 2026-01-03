/**
 * Header Controller
 * OOP-based controller for managing header state and data fetching
 * Follows SOLID principles: Single Responsibility, DRY, efficient state management
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { useLocation, type Location } from "react-router-dom";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import {
  type HeaderState,
  INITIAL_HEADER_STATE,
} from "../models/header-model";
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";
import HeaderView from "../view/header";
import type { NavItem } from "../components/header/HeaderNavigation";

interface HeaderControllerProps extends BaseControllerProps {
  location: Location;
  navLinks: NavItem[];
  logoSrc?: string;
}

/**
 * Header Controller Class
 * Manages all business logic, data fetching, and state for the header
 * Extends BaseController to avoid code duplication
 */
export class HeaderController extends BaseController<
  HeaderControllerProps,
  HeaderState & BaseControllerState
> {
  private scrollHandler: (() => void) | null = null;
  private collectionsCloseTimer: number | null = null;
  private collectionsAnimateTimer: number | null = null;
  private collectionsClickOutsideCleanup: (() => void) | null = null;
  private searchButtonRef: React.RefObject<HTMLButtonElement>;
  private hamburgerButtonRef: React.RefObject<HTMLButtonElement>;
  private collectionsItemRef: React.RefObject<HTMLLIElement>;

  constructor(props: HeaderControllerProps) {
    super(props); // No SEO config needed for header
    this.state = {
      ...this.state,
      ...INITIAL_HEADER_STATE,
    };
    this.searchButtonRef = React.createRef();
    this.hamburgerButtonRef = React.createRef();
    this.collectionsItemRef = React.createRef();
  }

  /**
   * Load collections and types for navigation
   */
  private async loadNavigationData(): Promise<void> {
    if (!this.abortController) return;

    try {
      const [collections, bouquetsResponse] = await Promise.all([
        getCollections(this.abortController.signal),
        this.safeFetch(`${API_BASE}/api/bouquets`),
      ]);

      let bouquets: any[] = [];
      if (bouquetsResponse && bouquetsResponse.ok) {
        const text = await bouquetsResponse.text();
        const data = this.safeJsonParse<any[]>(text, []);
        bouquets = Array.isArray(data) ? data : [];
      }

      const names = Array.from(
        new Set(
          (collections ?? [])
            .map((c) => (typeof c?.name === "string" ? c.name.trim() : ""))
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      const types = Array.from(
        new Set(
          (bouquets ?? [])
            .map((b: any) => (typeof b?.type === "string" ? b.type.trim() : ""))
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      this.setState({
        collectionNames: names,
        typeNames: types,
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      // Silently fail - header navigation data is not critical
      this.setState({
        collectionNames: [],
        typeNames: [],
      });
    }
  }

  /**
   * Setup scroll handler
   */
  private setupScrollHandler(): void {
    let ticking = false;
    this.scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.setState({ scrolled: window.scrollY > 20 });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  /**
   * Cleanup scroll handler
   */
  private cleanupScrollHandler(): void {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
  }

  /**
   * Cancel collections close timer
   */
  private cancelCollectionsClose(): void {
    if (this.collectionsCloseTimer) {
      window.clearTimeout(this.collectionsCloseTimer);
      this.collectionsCloseTimer = null;
    }
  }

  /**
   * Cancel collections animate timer
   */
  private cancelCollectionsAnimate(): void {
    if (this.collectionsAnimateTimer) {
      window.clearTimeout(this.collectionsAnimateTimer);
      this.collectionsAnimateTimer = null;
    }
  }

  /**
   * Pulse collections animate
   */
  private pulseCollectionsAnimate = (ms = 260): void => {
    this.cancelCollectionsAnimate();
    this.setState({ collectionsAnimate: true });
    this.collectionsAnimateTimer = window.setTimeout(() => {
      this.setState({ collectionsAnimate: false });
      this.collectionsAnimateTimer = null;
    }, ms);
  };

  /**
   * Schedule collections close
   */
  private scheduleCollectionsClose = (delayMs = 250): void => {
    this.cancelCollectionsClose();
    this.collectionsCloseTimer = window.setTimeout(() => {
      // Only close if still open and not in mobile mode
      if (this.state.collectionsOpen && !this.state.mobileOpen) {
        this.setState({ collectionsOpen: false });
      }
      this.collectionsCloseTimer = null;
    }, delayMs);
  };

  /**
   * Handle mobile toggle
   */
  handleToggleMobile = (): void => {
    this.setState((prev) => ({ mobileOpen: !prev.mobileOpen }));
  };

  /**
   * Handle close mobile
   */
  handleCloseMobile = (opts?: { returnFocus?: boolean }): void => {
    this.setState({ mobileOpen: false, collectionsOpen: false });
    if (opts?.returnFocus) {
      setTimeout(() => this.hamburgerButtonRef.current?.focus(), 0);
    }
  };

  /**
   * Handle close search
   */
  handleCloseSearch = (opts?: { returnFocus?: boolean }): void => {
    this.setState({ searchOpen: false });
    if (opts?.returnFocus) {
      setTimeout(() => this.searchButtonRef.current?.focus(), 0);
    }
  };

  /**
   * Handle toggle search
   */
  handleToggleSearch = (): void => {
    this.setState((prev) => {
      const next = !prev.searchOpen;
      if (next) {
        this.handleCloseMobile();
      }
      return { searchOpen: next };
    });
  };

  /**
   * Handle collections toggle
   */
  handleCollectionsToggle = (): void => {
    if (!this.state.collectionsOpen) {
      this.setState({ collectionsOpen: true });
      this.pulseCollectionsAnimate(220);
    } else {
      this.setState({ collectionsOpen: false });
    }
  };

  /**
   * Handle collections open
   */
  handleCollectionsOpen = (): void => {
    this.cancelCollectionsClose();
    this.setState({ collectionsOpen: true });
    // Cancel any pending close when explicitly opening
    if (this.collectionsCloseTimer) {
      this.cancelCollectionsClose();
    }
  };

  /**
   * Handle collections close
   */
  handleCollectionsClose = (): void => {
    if (this.state.mobileOpen) return;
    // Increase delay to prevent accidental closes when moving mouse
    this.scheduleCollectionsClose(250);
  };

  /**
   * Handle collections click outside
   */
  private handleCollectionsClickOutside = (event: MouseEvent | TouchEvent): void => {
    if (this.state.mobileOpen) return;
    
    // Check if click is on a link inside the dropdown - don't close immediately
    const target = event.target as HTMLElement;
    const isDropdownLink = target.closest(".header-dropdown") || 
                          target.closest(".header-mega-menu") ||
                          target.closest("a[href]");
    
    if (isDropdownLink) {
      // User clicked a link - close after a short delay to allow navigation
      this.scheduleCollectionsClose(100);
    } else {
      // Click outside - close normally
      this.handleCollectionsClose();
    }
  };

  /**
   * Setup collections click outside listener
   */
  private setupCollectionsClickOutside(): void {
    // Cleanup existing listener
    if (this.collectionsClickOutsideCleanup) {
      this.collectionsClickOutsideCleanup();
      this.collectionsClickOutsideCleanup = null;
    }

    // Setup new listener if collections is open and not mobile
    if (this.state.collectionsOpen && !this.state.mobileOpen && this.collectionsItemRef.current) {
      // Create a custom handler that checks both the nav item and dropdown
      const customHandler = (event: MouseEvent | TouchEvent): void => {
        const target = event.target as Node;
        const navItem = this.collectionsItemRef.current;
        const dropdown = document.querySelector(".header-dropdown") || 
                        document.querySelector("#collections-dropdown");
        
        // Check if click is inside nav item or dropdown
        const isInsideNavItem = navItem && navItem.contains(target);
        const isInsideDropdown = dropdown && dropdown.contains(target);
        
        if (!isInsideNavItem && !isInsideDropdown) {
          this.handleCollectionsClickOutside(event);
        }
      };
      
      // Setup listener manually to have more control
      const mousedownListener = (e: MouseEvent) => customHandler(e);
      const touchstartListener = (e: TouchEvent) => customHandler(e);
      
      document.addEventListener("mousedown", mousedownListener, true);
      document.addEventListener("touchstart", touchstartListener, { passive: true, capture: true });
      
      this.collectionsClickOutsideCleanup = () => {
        document.removeEventListener("mousedown", mousedownListener, true);
        document.removeEventListener("touchstart", touchstartListener, true);
      };
    }
  }

  /**
   * Cleanup collections click outside listener
   */
  private cleanupCollectionsClickOutside(): void {
    if (this.collectionsClickOutsideCleanup) {
      this.collectionsClickOutsideCleanup();
      this.collectionsClickOutsideCleanup = null;
    }
  }

  /**
   * Handle navigate
   */
  handleNavigate = (): void => {
    this.handleCloseMobile();
    this.handleCloseSearch();
    this.setState({ collectionsOpen: false });
  };

  /**
   * Component lifecycle: Mount
   * BaseController handles AbortController initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.setupScrollHandler();
    this.loadNavigationData();
  }

  /**
   * Component lifecycle: Update
   */
  componentDidUpdate(prevProps: HeaderControllerProps, prevState: HeaderState): void {
    // Close mobile menu and search when location changes
    if (
      prevProps.location.pathname !== this.props.location.pathname ||
      prevProps.location.search !== this.props.location.search
    ) {
      this.handleCloseMobile();
      this.handleCloseSearch();
      this.setState({ collectionsOpen: false });
      this.cancelCollectionsClose();
      this.cancelCollectionsAnimate();
      this.cleanupCollectionsClickOutside();
      return;
    }

    // Setup/cleanup collections click outside listener
    if (
      prevState.collectionsOpen !== this.state.collectionsOpen ||
      prevState.mobileOpen !== this.state.mobileOpen
    ) {
      this.setupCollectionsClickOutside();
    }
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles AbortController cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    this.cleanupScrollHandler();
    this.cancelCollectionsClose();
    this.cancelCollectionsAnimate();
    this.cleanupCollectionsClickOutside();
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <HeaderView
        navLinks={this.props.navLinks}
        logoSrc={this.props.logoSrc}
        mobileOpen={this.state.mobileOpen}
        searchOpen={this.state.searchOpen}
        collectionsOpen={this.state.collectionsOpen}
        collectionsAnimate={this.state.collectionsAnimate}
        scrolled={this.state.scrolled}
        collectionNames={this.state.collectionNames}
        typeNames={this.state.typeNames}
        searchButtonRef={this.searchButtonRef}
        hamburgerButtonRef={this.hamburgerButtonRef}
        collectionsItemRef={this.collectionsItemRef}
        onToggleMobile={this.handleToggleMobile}
        onCloseMobile={this.handleCloseMobile}
        onToggleSearch={this.handleToggleSearch}
        onCloseSearch={this.handleCloseSearch}
        onCollectionsToggle={this.handleCollectionsToggle}
        onCollectionsOpen={this.handleCollectionsOpen}
        onCollectionsClose={this.handleCollectionsClose}
        onNavigate={this.handleNavigate}
      />
    );
  }
}

/**
 * Wrapper component to use useLocation hook
 */
const HeaderControllerWrapper: React.FC<{ navLinks: NavItem[]; logoSrc?: string }> = ({ navLinks, logoSrc }) => {
  const location = useLocation();

  return <HeaderController location={location} navLinks={navLinks} logoSrc={logoSrc} />;
};

export default HeaderControllerWrapper;

