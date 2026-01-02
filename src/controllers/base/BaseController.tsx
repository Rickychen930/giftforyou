/**
 * Base Controller Class
 * Provides common functionality for all page controllers
 * Follows SOLID principles: Single Responsibility, Open/Closed, Dependency Inversion
 * Implements DRY (Don't Repeat Yourself) principle
 */

import React, { Component } from "react";
import { setSeo, type SeoData } from "../../utils/seo";
import {
  observeFadeIn,
  revealOnScroll,
  lazyLoadImages,
} from "../../utils/luxury-enhancements";

/**
 * Base state interface that all controllers should extend
 */
export interface BaseControllerState {
  loading?: boolean;
  error?: string | null;
  errorMessage?: string;
}

/**
 * Base props interface
 */
export interface BaseControllerProps {
  // Can be extended by child controllers
}

/**
 * SEO configuration interface
 */
export interface SeoConfig {
  defaultSeo?: SeoData;
  dynamicSeo?: (state: any) => SeoData | null;
}

/**
 * Luxury enhancements configuration
 */
export interface LuxuryEnhancementsConfig {
  enableFadeIn?: boolean;
  enableRevealOnScroll?: boolean;
  enableLazyLoadImages?: boolean;
  fadeInSelector?: string;
}

/**
 * Base Controller Class
 * Provides reusable functionality for:
 * - AbortController management
 * - Error handling
 * - SEO management
 * - Luxury enhancements
 * - Lifecycle management
 */
export abstract class BaseController<
  P extends BaseControllerProps = BaseControllerProps,
  S extends BaseControllerState = BaseControllerState
> extends Component<P, S> {
  protected abortController: AbortController | null = null;
  protected fadeObserver: IntersectionObserver | null = null;
  protected revealObserver: IntersectionObserver | null = null;
  protected imageObserver: IntersectionObserver | null = null;
  protected seoConfig: SeoConfig | null = null;
  protected luxuryConfig: LuxuryEnhancementsConfig;

  constructor(props: P, seoConfig?: SeoConfig, luxuryConfig?: LuxuryEnhancementsConfig) {
    super(props);
    this.seoConfig = seoConfig || null;
    this.luxuryConfig = {
      enableFadeIn: true,
      enableRevealOnScroll: true,
      enableLazyLoadImages: true,
      fadeInSelector: ".fade-in",
      ...luxuryConfig,
    };
  }

  /**
   * Initialize SEO
   * Can be overridden by child classes
   */
  protected initializeSeo(state?: S): void {
    if (!this.seoConfig) return;

    if (this.seoConfig.defaultSeo) {
      setSeo(this.seoConfig.defaultSeo);
    } else if (this.seoConfig.dynamicSeo && state) {
      const dynamicSeo = this.seoConfig.dynamicSeo(state);
      if (dynamicSeo) {
        setSeo(dynamicSeo);
      }
    }
  }

  /**
   * Update SEO dynamically
   */
  protected updateSeo(seoData: SeoData): void {
    setSeo(seoData);
  }

  /**
   * Initialize luxury enhancements
   * Centralized initialization with error handling
   */
  protected initializeLuxuryEnhancements(): void {
    try {
      // Cleanup existing observers first
      this.cleanupLuxuryEnhancements();

      // Initialize observers based on config
      if (this.luxuryConfig.enableFadeIn) {
        this.fadeObserver = observeFadeIn(this.luxuryConfig.fadeInSelector || ".fade-in");
      }

      if (this.luxuryConfig.enableRevealOnScroll) {
        this.revealObserver = revealOnScroll();
      }

      if (this.luxuryConfig.enableLazyLoadImages) {
        this.imageObserver = lazyLoadImages();
      }
    } catch (error) {
      console.warn("Failed to initialize luxury enhancements:", error);
      // Continue execution even if enhancements fail
    }
  }

  /**
   * Cleanup luxury enhancements
   * Prevents memory leaks
   */
  protected cleanupLuxuryEnhancements(): void {
    try {
      if (this.fadeObserver) {
        this.fadeObserver.disconnect();
        this.fadeObserver = null;
      }
      if (this.revealObserver) {
        this.revealObserver.disconnect();
        this.revealObserver = null;
      }
      if (this.imageObserver) {
        this.imageObserver.disconnect();
        this.imageObserver = null;
      }
    } catch (error) {
      console.warn("Error during luxury enhancements cleanup:", error);
    }
  }

  /**
   * Create new AbortController
   * Aborts previous one if exists
   */
  protected createAbortController(): AbortController {
    this.abortController?.abort();
    this.abortController = new AbortController();
    return this.abortController;
  }

  /**
   * Handle errors consistently
   * Can be overridden by child classes
   */
  protected handleError(error: unknown, defaultMessage: string = "An error occurred"): string {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "";
    }

    // Handle null or undefined errors
    if (error === null || error === undefined) {
      return "";
    }

    if (error instanceof Error) {
      const errorMessage = error.message || defaultMessage;
      // Only log errors that are not expected/graceful handling cases
      // Skip logging for common API format issues that are handled gracefully
      // Also skip logging for data validation errors that are handled gracefully
      const isGracefulError = 
        errorMessage.includes("API returned unexpected format") ||
        errorMessage.includes("Bouquet data is invalid") ||
        errorMessage.includes("missing _id or name") ||
        errorMessage.includes("Empty response body");
      
      if (errorMessage && !isGracefulError) {
        console.error(`[${this.constructor.name}] Error:`, errorMessage);
      } else if (errorMessage && process.env.NODE_ENV === "development") {
        // In development, log as warning for debugging
        console.warn(`[${this.constructor.name}] Handled gracefully:`, errorMessage);
      }
      return errorMessage;
    }

    // Handle string errors
    if (typeof error === "string") {
      if (error) {
        console.error(`[${this.constructor.name}] Error:`, error);
      }
      return error || defaultMessage;
    }

    // For other types, log only if not null/undefined
    if (error !== null && error !== undefined) {
      console.error(`[${this.constructor.name}] Unknown error:`, error);
    }
    return defaultMessage;
  }

  /**
   * Set error state
   */
  protected setError(error: unknown, defaultMessage: string = "An error occurred"): void {
    const errorMessage = this.handleError(error, defaultMessage);
    if (errorMessage && errorMessage.trim()) {
      this.setState((prevState) => ({
        ...prevState,
        error: errorMessage,
        errorMessage: errorMessage,
        loading: false,
      }));
    } else {
      // If no error message, just set loading to false
      this.setLoading(false);
    }
  }

  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.setState((prevState) => ({
      ...prevState,
      loading,
    }));
  }

  /**
   * Safe fetch wrapper with AbortController support
   */
  protected async safeFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<Response | null> {
    if (!this.abortController) {
      this.createAbortController();
    }

    if (!this.abortController) {
      return null;
    }

    try {
      const response = await fetch(url, {
        ...options,
        signal: this.abortController.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  }

  /**
   * Safe JSON parse with error handling
   */
  protected safeJsonParse<T>(text: string, fallback: T): T {
    try {
      if (!text.trim()) return fallback;
      return JSON.parse(text) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * Component lifecycle: Mount
   * Initialize common resources
   */
  componentDidMount(): void {
    this.createAbortController();
    this.initializeSeo(this.state);
    this.initializeLuxuryEnhancements();
  }

  /**
   * Component lifecycle: Update
   * Re-initialize luxury enhancements when data changes
   */
  componentDidUpdate(prevProps: P, prevState: S): void {
    // Re-initialize SEO if state changed significantly
    if (this.seoConfig?.dynamicSeo) {
      const prevSeo = this.seoConfig.dynamicSeo(prevState);
      const currentSeo = this.seoConfig.dynamicSeo(this.state);
      
      if (JSON.stringify(prevSeo) !== JSON.stringify(currentSeo)) {
        this.initializeSeo(this.state);
      }
    }

    // Re-initialize luxury enhancements when loading completes
    const wasLoading = prevState.loading;
    const isLoading = this.state.loading;
    
    if (wasLoading && !isLoading && !this.state.error) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        setTimeout(() => {
          this.initializeLuxuryEnhancements();
        }, 150);
      });
    }
  }

  /**
   * Component lifecycle: Unmount
   * Cleanup all resources
   */
  componentWillUnmount(): void {
    this.abortController?.abort();
    this.cleanupLuxuryEnhancements();
  }

  /**
   * Abstract render method
   * Must be implemented by child classes
   */
  abstract render(): React.ReactNode;
}

/**
 * Higher-order component to wrap controller with common functionality
 * Note: This is optional - prefer extending BaseController directly
 */
export function withBaseController<P extends BaseControllerProps, S extends BaseControllerState>(
  ControllerClass: new (props: P) => Component<P, S>,
  seoConfig?: SeoConfig,
  luxuryConfig?: LuxuryEnhancementsConfig
): new (props: P) => BaseController<P, S> {
  return class WrappedController extends BaseController<P, S> {
    private controllerInstance: Component<P, S>;

    constructor(props: P) {
      super(props, seoConfig, luxuryConfig);
      this.controllerInstance = new ControllerClass(props);
    }

    render(): React.ReactNode {
      return this.controllerInstance.render();
    }
  };
}

