/**
 * Home Page Controller
 * OOP-based controller for managing homepage state and data fetching
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import type { Collection } from "../models/domain/collection";
import type { HeroSliderContent } from "../components/hero/HeroSlider";
import {
  type HomePageData,
  INITIAL_HOME_PAGE_DATA,
  DEFAULT_HOME_PAGE_SEO,
} from "../models/home-page-model";
import { getCollections } from "../services/collection.service";
import { API_BASE } from "../config/api";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import HomePageView from "../view/home-page";

interface HomePageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

interface HomePageControllerState extends BaseControllerState {
  data: HomePageData;
}

/**
 * Home Page Controller Class
 * Manages all business logic, data fetching, and state for the homepage
 * Extends BaseController to avoid code duplication
 */
export class HomePageController extends BaseController<
  HomePageControllerProps,
  HomePageControllerState
> {
  constructor(props: HomePageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_HOME_PAGE_SEO,
    };

    super(props, seoConfig, {
      enableFadeIn: true,
      enableRevealOnScroll: true,
      enableLazyLoadImages: true,
    });

    this.state = {
      ...this.state,
      data: { ...INITIAL_HOME_PAGE_DATA },
    };
  }

  /**
   * Fetch hero slider content from API
   */
  private async fetchHeroContent(): Promise<HeroSliderContent | null> {
    if (!this.abortController) return null;

    try {
      const response = await this.safeFetch(`${API_BASE}/api/hero-slider/home`);
      if (!response || !response.ok) return null;

      const text = await response.text();
      const data = this.safeJsonParse<HeroSliderContent | null>(text, null);

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
    this.setLoading(true);
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
        loading: false,
      });
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }

      this.setError(err, "Failed to load homepage data");
      this.setState((prevState) => ({
        data: {
          ...prevState.data,
          loadState: "error",
          errorMessage: this.handleError(err, "Failed to load homepage data"),
        },
      }));
    }
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles SEO and luxury enhancements initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    this.loadData();
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
