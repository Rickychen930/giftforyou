/**
 * Home Sections Controllers
 * OOP-based controllers for individual homepage sections
 */

import React, { Component } from "react";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import HeroCollectionSlider from "../components/sections/hero-collection-slider";
import OurCollectionSection from "../components/sections/our-collection-section";
import StoreLocationSection from "../components/sections/store-location-section";
import { storeData } from "../models/store-model";
import { aboutUsContent } from "../models/about-us-model";
import AboutUsSection from "../components/sections/about-us-section";

// ============================================================================
// Hero Section Controller
// ============================================================================

interface HeroControllerProps {
  content?: HeroSliderContent;
  loading?: boolean;
}

interface HeroControllerState {
  heroContent: HeroSliderContent | null;
  isLoading: boolean;
}

/**
 * Hero Section Controller
 * Manages hero slider data fetching and state
 */
export class HeroController extends Component<HeroControllerProps, HeroControllerState> {
  private abortController: AbortController | null = null;

  constructor(props: HeroControllerProps) {
    super(props);
    this.state = {
      heroContent: props.content || null,
      isLoading: props.loading || false,
    };
  }

  /**
   * Fetch hero content from API
   */
  private async fetchHeroContent(): Promise<void> {
    if (!this.abortController) return;

    try {
      this.setState({ isLoading: true });

      const response = await fetch(
        `${API_BASE}/api/hero-slider/home`,
        { signal: this.abortController.signal }
      );

      if (!response.ok) {
        this.setState({ heroContent: null, isLoading: false });
        return;
      }

      const data = await response.json();

      // Validate data structure
      const hasSlides =
        data &&
        typeof data === "object" &&
        Array.isArray((data as any).slides) &&
        (data as any).slides.length > 0;

      this.setState({
        heroContent: hasSlides ? (data as HeroSliderContent) : null,
        isLoading: false,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      console.error("Failed to fetch hero slider:", err);
      this.setState({ heroContent: null, isLoading: false });
    }
  }

  componentDidMount(): void {
    // Only fetch if content is not provided via props
    if (!this.props.content) {
      this.abortController = new AbortController();
      this.fetchHeroContent();
    }
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
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

interface OurCollectionControllerState {
  collections: Collection[];
  loading: boolean;
  errorMessage: string;
}

/**
 * Our Collection Section Controller
 * Manages collections data fetching and state
 */
export class OurCollectionController extends Component<
  {},
  OurCollectionControllerState
> {
  private abortController: AbortController | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      collections: [],
      loading: true,
      errorMessage: "",
    };
  }

  /**
   * Load collections data
   */
  private async loadCollections(): Promise<void> {
    if (!this.abortController) return;

    try {
      this.setState({ loading: true, errorMessage: "" });

      const data = await getCollections(this.abortController.signal);

      this.setState({
        collections: data,
        loading: false,
        errorMessage: "",
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      this.setState({
        loading: false,
        errorMessage,
      });
    }
  }

  componentDidMount(): void {
    this.abortController = new AbortController();
    this.loadCollections();
  }

  componentWillUnmount(): void {
    this.abortController?.abort();
  }

  render(): React.ReactNode {
    const { collections, loading, errorMessage } = this.state;

    return (
      <OurCollectionSection
        items={collections}
        loading={loading}
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
export class StoreLocationController extends Component {
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
export class AboutUsController extends Component {
  render(): React.ReactNode {
    return <AboutUsSection content={aboutUsContent} />;
  }
}

