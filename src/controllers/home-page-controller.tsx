/**
 * Home Page Controller
 * OOP-based controller for managing homepage state and data fetching
 */

import React, { Component } from "react";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import {
  type HomePageData,
  INITIAL_HOME_PAGE_DATA,
  DEFAULT_HOME_PAGE_SEO,
} from "../models/home-page-model";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import { setSeo } from "../utils/seo";
import { observeFadeIn, revealOnScroll, lazyLoadImages } from "../utils/luxury-enhancements";
import HomePageView from "../view/home-page";

interface HomePageControllerProps {
  // Add any props if needed in the future
}

interface HomePageControllerState {
  data: HomePageData;
}

/**
 * Home Page Controller Class
 * Manages all business logic, data fetching, and state for the homepage
 */
export class HomePageController extends Component<
  HomePageControllerProps,
  HomePageControllerState
> {
  private abortController: AbortController | null = null;
  private fadeObserver: IntersectionObserver | null = null;
  private revealObserver: IntersectionObserver | null = null;
  private imageObserver: IntersectionObserver | null = null;

  constructor(props: HomePageControllerProps) {
    super(props);
    this.state = {
      data: { ...INITIAL_HOME_PAGE_DATA },
    };
  }

  /**
   * Initialize SEO
   */
  private initializeSeo(): void {
    setSeo(DEFAULT_HOME_PAGE_SEO);
  }

  /**
   * Fetch hero slider content from API
   */
  private async fetchHeroContent(): Promise<HeroSliderContent | null> {
    if (!this.abortController) return null;

    try {
      const response = await fetch(
        `${API_BASE}/api/hero-slider/home`,
        { signal: this.abortController.signal }
      );

      if (!response.ok) return null;

      const data = await response.json();

      // Validate data structure
      const hasSlides =
        data &&
        typeof data === "object" &&
        Array.isArray((data as any).slides) &&
        (data as any).slides.length > 0;

      return hasSlides ? (data as HeroSliderContent) : null;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return null;
      }
      console.error("Failed to fetch hero content:", err);
      return null;
    }
  }

  /**
   * Fetch collections data
   */
  private async fetchCollections(): Promise<Collection[]> {
    if (!this.abortController) return [];

    try {
      return await getCollections(this.abortController.signal);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return [];
      }
      throw err;
    }
  }

  /**
   * Load all homepage data
   */
  private async loadData(): Promise<void> {
    this.setState((prevState) => ({
      data: {
        ...prevState.data,
        loadState: "loading",
        errorMessage: "",
      },
    }));

    try {
      // Fetch hero content and collections in parallel
      const [heroContent, collections] = await Promise.all([
        this.fetchHeroContent(),
        this.fetchCollections(),
      ]);

      this.setState({
        data: {
          collections,
          heroContent,
          loadState: "success",
          errorMessage: "",
        },
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      this.setState((prevState) => ({
        data: {
          ...prevState.data,
          loadState: "error",
          errorMessage,
        },
      }));
    }
  }

  /**
   * Initialize luxury enhancements (animations, lazy loading)
   */
  private initializeLuxuryEnhancements(): void {
    this.fadeObserver = observeFadeIn(".fade-in");
    this.revealObserver = revealOnScroll();
    this.imageObserver = lazyLoadImages();
  }

  /**
   * Cleanup luxury enhancements
   */
  private cleanupLuxuryEnhancements(): void {
    this.fadeObserver?.disconnect();
    this.revealObserver?.disconnect();
    this.imageObserver?.disconnect();
    this.fadeObserver = null;
    this.revealObserver = null;
    this.imageObserver = null;
  }

  /**
   * Component lifecycle: Mount
   */
  componentDidMount(): void {
    this.abortController = new AbortController();
    this.initializeSeo();
    this.loadData();
    this.initializeLuxuryEnhancements();
  }

  /**
   * Component lifecycle: Update
   */
  componentDidUpdate(
    _prevProps: HomePageControllerProps,
    prevState: HomePageControllerState
  ): void {
    // Re-initialize luxury enhancements when data changes
    if (
      prevState.data.loadState !== this.state.data.loadState ||
      prevState.data.collections.length !== this.state.data.collections.length
    ) {
      // Cleanup old observers
      this.cleanupLuxuryEnhancements();
      // Re-initialize with new data
      setTimeout(() => {
        this.initializeLuxuryEnhancements();
      }, 100);
    }
  }

  /**
   * Component lifecycle: Unmount
   */
  componentWillUnmount(): void {
    this.abortController?.abort();
    this.cleanupLuxuryEnhancements();
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const { data } = this.state;

    return (
      <HomePageView
        collections={data.collections}
        heroContent={data.heroContent}
        loading={data.loadState === "loading"}
        errorMessage={data.loadState === "error" ? data.errorMessage : ""}
      />
    );
  }
}

export default HomePageController;
