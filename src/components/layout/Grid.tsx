/**
 * Grid Component
 * Reusable responsive grid layout
 * Luxury, DRY, Efficient, Responsive
 * Uses design-system.css variables
 */

import React, { Component } from "react";
import "../../styles/layout/Grid.css";

export type GridGap = "none" | "xs" | "sm" | "md" | "lg" | "xl";
export type GridMinColumnWidth = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface GridProps {
  gap?: GridGap;
  minColumnWidth?: GridMinColumnWidth;
  columns?: number; // Fixed number of columns (overrides minColumnWidth)
  className?: string;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  ariaLabel?: string;
}

/**
 * Grid Component
 * Responsive grid dengan auto-fit columns dan consistent gap spacing
 */
class Grid extends Component<GridProps> {
  private baseClass: string = "grid";

  private getClasses(): string {
    const { gap = "md", minColumnWidth = "sm", columns, className = "" } = this.props;
    
    const gapClass = gap !== "none" ? `${this.baseClass}--gap-${gap}` : "";
    const minWidthClass = !columns ? `${this.baseClass}--min-${minColumnWidth}` : "";
    const columnsClass = columns ? `${this.baseClass}--cols-${columns}` : "";
    
    return `${this.baseClass} ${gapClass} ${minWidthClass} ${columnsClass} ${className}`.trim();
  }

  private getStyle(): React.CSSProperties {
    const { columns } = this.props;
    if (columns) {
      return {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      };
    }
    return {};
  }

  render(): React.ReactNode {
    const { as: Component = "div", children, ariaLabel } = this.props;
    const classes = this.getClasses();
    const style = this.getStyle();

    return (
      <Component
        className={classes}
        style={style}
        role={ariaLabel ? "list" : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </Component>
    );
  }
}

export default Grid;

