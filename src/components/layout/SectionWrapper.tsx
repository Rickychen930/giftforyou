/**
 * Section Wrapper Component (OOP)
 * Class-based component following SOLID principles
 * Reusable wrapper for homepage sections with consistent styling and error handling
 */

import React, { Component, Suspense } from "react";
import "../../styles/layout/SectionWrapper.css";
import Section from "./Section";
import ErrorBoundaryWithRetry from "../common/ErrorBoundaryWithRetry";
import SkeletonLoader from "../common/SkeletonLoader";

interface SectionWrapperProps {
  /**
   * Section variant (default, gradient, glass)
   */
  variant?: "default" | "gradient" | "glass";
  /**
   * Section padding (none, sm, md, lg)
   */
  padding?: "none" | "sm" | "md" | "lg";
  /**
   * Section ID for navigation
   */
  id: string;
  /**
   * Section title ID for aria-labelledby
   */
  titleId?: string;
  /**
   * Additional CSS class name
   */
  className?: string;
  /**
   * Section content (can be lazy loaded)
   */
  children: React.ReactNode;
  /**
   * Whether to lazy load the content
   */
  lazy?: boolean;
  /**
   * Error message for error boundary
   */
  errorMessage?: string;
  /**
   * Whether to show retry button
   */
  showRetry?: boolean;
  /**
   * Loading fallback component
   */
  loadingFallback?: React.ReactNode;
}

/**
 * Default loading fallback
 */
const DefaultSectionLoader: React.FC = () => (
  <div 
    className="section-wrapper-loader"
    role="status"
    aria-live="polite"
    aria-label="Memuat konten"
  >
    <SkeletonLoader variant="circular" width={48} height={48} />
    <SkeletonLoader variant="text" width="200px" height={16} />
  </div>
);

/**
 * Section Wrapper Component
 * Provides consistent structure, error handling, and lazy loading for sections
 * Follows Single Responsibility: only handles section wrapping logic
 */
class SectionWrapper extends Component<SectionWrapperProps> {
  private baseClass: string = "sectionWrapper";

  /**
   * Get loading fallback
   */
  private getLoadingFallback(): React.ReactNode {
    const { loadingFallback } = this.props;
    return loadingFallback || <DefaultSectionLoader />;
  }

  /**
   * Render section content
   */
  private renderContent(): React.ReactNode {
    const { children, lazy, errorMessage, showRetry = true } = this.props;

    if (lazy) {
      return (
        <ErrorBoundaryWithRetry
          errorMessage={errorMessage || "Gagal memuat konten. Silakan coba lagi."}
          showRetry={showRetry}
        >
          <Suspense fallback={this.getLoadingFallback()}>
            {children}
          </Suspense>
        </ErrorBoundaryWithRetry>
      );
    }

    return (
      <ErrorBoundaryWithRetry
        errorMessage={errorMessage || "Gagal memuat konten. Silakan coba lagi."}
        showRetry={showRetry}
      >
        {children}
      </ErrorBoundaryWithRetry>
    );
  }

  render(): React.ReactNode {
    const { variant = "default", padding = "lg", id, titleId, className } = this.props;

    return (
      <Section
        variant={variant}
        padding={padding}
        className={`${this.baseClass} ${className || ""}`.trim()}
        id={id}
        aria-labelledby={titleId}
      >
        {this.renderContent()}
      </Section>
    );
  }
}

export default SectionWrapper;

