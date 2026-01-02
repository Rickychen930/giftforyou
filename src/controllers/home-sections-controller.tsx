/**
 * Home Sections Controllers
 * OOP-based controllers for individual homepage sections
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import HeroCollectionSlider from "../view/sections/HeroCollectionSlider";
import OurCollectionSection from "../view/sections/OurCollectionSection";
import StoreLocationSection from "../view/sections/StoreLocationSection";
import { aboutUsContent } from "../models/about-us-model";
import AboutUsSection from "../view/sections/AboutUsSection";
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";

// ============================================================================
// Hero Section Controller
// ============================================================================

interface HeroControllerProps extends BaseControllerProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

interface HeroControllerState extends BaseControllerState {
  heroContent: HeroSliderContent | null;
  isLoading: boolean;
}

/**
 * Hero Section Controller
 * Manages hero slider data fetching and state
 * Extends BaseController to avoid code duplication
 */
export class HeroController extends BaseController<HeroControllerProps, HeroControllerState> {
  constructor(props: HeroControllerProps) {
    super(props);
    this.state = {
      ...this.state,
      heroContent: props.content || null,
      isLoading: props.loading || false,
    };
  }

  /**
   * Fetch hero content from API
   */
  private async fetchHeroContent(): Promise<void> {
    try {
      this.setLoading(true);

      const response = await this.safeFetch(
        `${API_BASE}/api/hero-slider/home`
      );

      if (!response || !response.ok) {
        this.setState({ heroContent: null });
        this.setLoading(false);
        return;
      }

      const text = await response.text();
      const data = this.safeJsonParse<HeroSliderContent | null>(text, null);

      // Validate data structure
      const hasSlides =
        data &&
        typeof data === "object" &&
        Array.isArray((data as any).slides) &&
        (data as any).slides.length > 0;

      this.setState({
        heroContent: hasSlides ? (data as HeroSliderContent) : null,
      });
      this.setLoading(false);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      this.setError(err, "Failed to fetch hero slider");
      this.setState({ heroContent: null });
      this.setLoading(false);
    }
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    // Only fetch if content is not provided via props
    if (!this.props.content) {
      this.fetchHeroContent();
    }
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
  }

  render(): React.ReactNode {
    return (
      <HeroCollectionSlider
        content={this.state.heroContent ?? undefined}
        loading={this.state.isLoading}
      />
    );
  }
}

// ============================================================================
// Collections Section Controller
// ============================================================================

interface OurCollectionControllerState extends BaseControllerState {
  collections: Collection[];
  errorMessage: string;
}

/**
 * Our Collection Section Controller
 * Manages collections data fetching and state
 * Extends BaseController to avoid code duplication
 */
export class OurCollectionController extends BaseController<
  BaseControllerProps,
  OurCollectionControllerState
> {
  constructor(props: BaseControllerProps) {
    super(props);
    this.state = {
      ...this.state,
      collections: [],
      errorMessage: "",
    };
  }

  /**
   * Load collections data
   */
  private async loadCollections(): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);

      const data = await getCollections(this.abortController?.signal);

      this.setState({
        collections: data,
        errorMessage: "",
      });
      this.setLoading(false);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      this.setError(err, errorMessage);
      this.setState({
        errorMessage,
      });
      this.setLoading(false);
    }
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.loadCollections();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
  }

  render(): React.ReactNode {
    const { collections, errorMessage } = this.state;

    return (
      <OurCollectionSection
        items={collections}
        loading={this.state.loading || false}
        errorMessage={errorMessage}
      />
    );
  }
}

// ============================================================================
// Store Location Section Controller
// ============================================================================

/**
 * Store Location Section Controller
 * Simple controller that passes static data to view
 */
export class StoreLocationController extends BaseController<BaseControllerProps, BaseControllerState> {
  render(): React.ReactNode {
    return <StoreLocationSection />;
  }
}

// ============================================================================
// About Us Section Controller
// ============================================================================

/**
 * About Us Section Controller
 * Simple controller that passes static data to view
 */
export class AboutUsController extends BaseController<BaseControllerProps, BaseControllerState> {
  render(): React.ReactNode {
    return <AboutUsSection content={aboutUsContent} />;
  }
}

