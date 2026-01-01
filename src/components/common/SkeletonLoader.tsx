/**
 * Skeleton Loader Component (OOP)
 * Class-based component following SOLID principles
 * Unified skeleton component for all loading states
 */

import React, { Component } from "react";
import "../../styles/SkeletonLoader.css";

interface SkeletonLoaderProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  lines?: number;
  animated?: boolean;
}

interface SkeletonLoaderState {
  // No state needed, but keeping for consistency
}

/**
 * Skeleton Loader Component
 * Class-based component for loading skeletons
 * Unified component replacing all skeleton variants
 */
class SkeletonLoader extends Component<SkeletonLoaderProps, SkeletonLoaderState> {
  private baseClass: string = "skeletonLoader";

  private getStyle(): React.CSSProperties {
    const { width, height, borderRadius, variant = "rectangular" } = this.props;

    return {
      width: width || (variant === "circular" ? "40px" : "100%"),
      height: height || (variant === "circular" ? "40px" : variant === "text" ? "1rem" : "200px"),
      borderRadius: borderRadius || (variant === "circular" ? "50%" : variant === "text" ? "4px" : "12px"),
    };
  }

  private getClasses(): string {
    const { variant = "rectangular", animated = true, className = "" } = this.props;
    const animatedClass = animated ? `${this.baseClass}--animated` : "";
    const variantClass = variant === "text" ? `${this.baseClass}--text` : variant === "card" ? `${this.baseClass}--card` : "";
    return `${this.baseClass} ${variantClass} ${animatedClass} ${className}`.trim();
  }

  private renderTextLines(): React.ReactNode {
    const { lines = 1, animated = true } = this.props;
    const style = this.getStyle();

    return (
      <div className={this.getClasses()}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${this.baseClass}__line ${animated ? `${this.baseClass}--animated` : ""}`}
            style={{
              ...style,
              width: index === lines - 1 ? "80%" : "100%",
              marginBottom: index < lines - 1 ? "0.5rem" : "0",
            }}
          />
        ))}
      </div>
    );
  }

  private renderCard(): React.ReactNode {
    const { animated = true } = this.props;

    return (
      <div className={this.getClasses()}>
        <div className={`${this.baseClass}__header ${animated ? `${this.baseClass}--animated` : ""}`} style={{ borderRadius: "12px 12px 0 0" }} />
        <div className={`${this.baseClass}__content ${animated ? `${this.baseClass}--animated` : ""}`}>
          <div className={`${this.baseClass}__line ${animated ? `${this.baseClass}--animated` : ""}`} style={{ width: "100%", height: "1rem", marginBottom: "0.75rem" }} />
          <div className={`${this.baseClass}__line ${animated ? `${this.baseClass}--animated` : ""}`} style={{ width: "80%", height: "1rem", marginBottom: "0.5rem" }} />
          <div className={`${this.baseClass}__line ${animated ? `${this.baseClass}--animated` : ""}`} style={{ width: "60%", height: "1rem" }} />
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { variant = "rectangular", lines = 1 } = this.props;

    if (variant === "text" && lines > 1) {
      return this.renderTextLines();
    }

    if (variant === "card") {
      return this.renderCard();
    }

    return (
      <div
        className={this.getClasses()}
        style={this.getStyle()}
        aria-label="Loading..."
        role="status"
      />
    );
  }
}

export default SkeletonLoader;

