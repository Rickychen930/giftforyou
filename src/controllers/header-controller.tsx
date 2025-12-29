/**
 * Header Controller
 * OOP-based controller for managing header state and data fetching
 */

import React, { Component } from "react";
import { useLocation, type Location } from "react-router-dom";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import {
  type HeaderState,
  INITIAL_HEADER_STATE,
} from "../models/header-model";
import HeaderView from "../view/header";
import type { NavItem } from "../components/header/HeaderNavigation";

interface HeaderControllerProps {
  location: Location;
  navLinks: NavItem[];
  logoSrc?: string;
}

/**
 * Header Controller Class
 * Manages all business logic, data fetching, and state for the header
 */
export class HeaderController extends Component<
  HeaderControllerProps,
  HeaderState
> {
  private abortController: AbortController | null = null;
  private scrollHandler: (() => void) | null = null;
  private collectionsCloseTimer: number | null = null;
  private collectionsAnimateTimer: number | null = null;
  private searchButtonRef: React.RefObject<HTMLButtonElement>;
  private hamburgerButtonRef: React.RefObject<HTMLButtonElement>;
  private collectionsItemRef: React.RefObject<HTMLLIElement>;

  constructor(props: HeaderControllerProps) {
    super(props);
    this.state = { ...INITIAL_HEADER_STATE };
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
      const [collections, bouquets] = await Promise.all([
        getCollections(this.abortController.signal),
        fetch(`${API_BASE}/api/bouquets`, { signal: this.abortController.signal })
          .then(async (r) => {
            if (!r.ok) return [];
            const j = await r.json().catch(() => []);
            return Array.isArray(j) ? j : [];
          })
          .catch(() => []),
      ]);

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
  private scheduleCollectionsClose = (delayMs = 180): void => {
    this.cancelCollectionsClose();
    this.collectionsCloseTimer = window.setTimeout(() => {
      this.setState({ collectionsOpen: false });
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
  };

  /**
   * Handle collections close
   */
  handleCollectionsClose = (): void => {
    if (this.state.mobileOpen) return;
    this.scheduleCollectionsClose(180);
  };

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
   */
  componentDidMount(): void {
    this.abortController = new AbortController();
    this.setupScrollHandler();
    this.loadNavigationData();
  }

  /**
   * Component lifecycle: Update
   */
  componentDidUpdate(prevProps: HeaderControllerProps): void {
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
    }
  }

  /**
   * Component lifecycle: Unmount
   */
  componentWillUnmount(): void {
    this.abortController?.abort();
    this.cleanupScrollHandler();
    this.cancelCollectionsClose();
    this.cancelCollectionsAnimate();
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

