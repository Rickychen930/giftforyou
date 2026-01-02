/**
 * Container Component
 * Reusable responsive container for page layouts
 * Luxury, DRY, Efficient, Responsive
 * Uses design-system.css variables
 */

import React, { Component } from "react";
import "../../styles/layout/Container.css";

export type ContainerVariant = "narrow" | "default" | "wide" | "full";
export type ContainerPadding = "none" | "sm" | "md" | "lg";

export interface ContainerProps {
  variant?: ContainerVariant;
  padding?: ContainerPadding;
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Container Component
 * Responsive container dengan max-width management dan consistent padding
 */
class Container extends Component<ContainerProps> {
  private baseClass: string = "container";

  private getClasses(): string {
    const { variant = "default", padding = "md", className = "" } = this.props;
    
    const variantClass = `${this.baseClass}--${variant}`;
    const paddingClass = `${this.baseClass}--padding-${padding}`;
    
    return `${this.baseClass} ${variantClass} ${paddingClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { as: Component = "div", children } = this.props;
    const classes = this.getClasses();

    return (
      <Component className={classes}>
        {children}
      </Component>
    );
  }
}

export default Container;

