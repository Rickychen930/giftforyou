/**
 * Section Component
 * Reusable section wrapper with consistent spacing
 * Luxury, DRY, Efficient, Responsive
 * Uses design-system.css variables
 */

import React, { Component } from "react";
import "../../styles/layout/Section.css";

export type SectionVariant = "default" | "gradient" | "glass" | "dark";
export type SectionPadding = "none" | "sm" | "md" | "lg" | "xl";

export interface SectionProps {
  variant?: SectionVariant;
  padding?: SectionPadding;
  className?: string;
  children: React.ReactNode;
  id?: string;
  as?: keyof JSX.IntrinsicElements;
}

/**
 * Section Component
 * Consistent section spacing dengan background variants
 */
class Section extends Component<SectionProps> {
  private baseClass: string = "section";

  private getClasses(): string {
    const { variant = "default", padding = "md", className = "" } = this.props;
    
    const variantClass = `${this.baseClass}--${variant}`;
    const paddingClass = `${this.baseClass}--padding-${padding}`;
    
    return `${this.baseClass} ${variantClass} ${paddingClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { as: Component = "section", children, id } = this.props;
    const classes = this.getClasses();

    return (
      <Component id={id} className={classes}>
        {children}
      </Component>
    );
  }
}

export default Section;

