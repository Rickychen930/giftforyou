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
import { apiCache } from "../utils/api-cache";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import HomePageView from "../view/home-page";

const HERO_CACHE_KEY = "hero-content";
const HERO_CACHE_TTL = 10 * 60 * 1000; // 10 minutes (hero content changes less frequently)

// Request deduplication for hero content
let pendingHeroRequest: Promise<HeroSliderContent | null> | null = null;

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
   * Fetch hero slider content from API with caching and request deduplication
   */
  private async fetchHeroContent(): Promise<HeroSliderContent | null> {
    if (!this.abortController) return null;

    // Check cache first
    const cached = apiCache.get<HeroSliderContent>(HERO_CACHE_KEY);
    if (cached) {
      return cached;
    }

    // If there's a pending request, return it instead of making a new one
    if (pendingHeroRequest) {
      return pendingHeroRequest;
    }

    // Create the request promise
    pendingHeroRequest = (async () => {
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

        const result = hasSlides ? (data as HeroSliderContent) : null;

        // Cache the result if valid
        if (result) {
          apiCache.set(HERO_CACHE_KEY, result, HERO_CACHE_TTL);
        }

        return result;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return null;
        }
        console.error("Failed to fetch hero content:", err);
        return null;
      } finally {
        // Clear pending request after completion
        pendingHeroRequest = null;
      }
    })();

    return pendingHeroRequest;
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
   * Load all homepage data with progressive loading
   * Hero content loads first (above the fold), then collections
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
      // Progressive loading: Hero first (above the fold), then collections
      // This improves perceived performance
      const heroContent = await this.fetchHeroContent();
      
      // Update state with hero content immediately
      this.setState((prevState) => ({
        data: {
          ...prevState.data,
          heroContent,
          loadState: heroContent ? "loading" : "success", // Keep loading if hero loaded, wait for collections
        },
      }));

      // Load collections in background (below the fold)
      // Use requestIdleCallback for better performance if available
      const loadCollections = async () => {
        try {
          const collections = await this.fetchCollections();
          this.setState((prevState) => ({
            data: {
              ...prevState.data,
              collections,
              loadState: "success",
              errorMessage: "",
            },
            loading: false,
          }));
        } catch (err: unknown) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return;
          }
          // Collections error doesn't block the page
          console.warn("Failed to load collections:", err);
          this.setState((prevState) => ({
            data: {
              ...prevState.data,
              collections: [],
              loadState: prevState.data.heroContent ? "success" : "error",
              errorMessage: prevState.data.heroContent ? "" : this.handleError(err, "Failed to load homepage data"),
            },
            loading: false,
          }));
        }
      };

      // Load collections immediately after hero (small delay for better UX)
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => {
          void loadCollections();
        }, { timeout: 100 });
      } else {
        // Fallback: small delay to let hero render first
        setTimeout(() => {
          void loadCollections();
        }, 50);
      }

      // If hero failed, still try to load collections
      if (!heroContent) {
        await loadCollections();
      }
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
        loading: false,
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
