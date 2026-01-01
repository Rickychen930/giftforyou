/**
 * Base Icon Component (OOP)
 * Reusable SVG icon wrapper component
 * Follows SOLID principles
 */

import React, { Component } from "react";

export interface IconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  ariaHidden?: boolean;
  children: React.ReactNode; // SVG path content
  viewBox?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
}

interface IconState {
  // No state needed
}

/**
 * Base Icon Component
 * Wraps SVG with consistent props and accessibility
 */
class Icon extends Component<IconProps, IconState> {
  private static defaultProps: Partial<IconProps> = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    ariaHidden: true,
  };

  private getClasses(): string {
    const { className = "" } = this.props;
    return className.trim();
  }

  private getStyles(): React.CSSProperties {
    return this.props.style || {};
  }

  render(): React.ReactNode {
    const {
      width = Icon.defaultProps.width,
      height = Icon.defaultProps.height,
      viewBox = Icon.defaultProps.viewBox,
      fill = Icon.defaultProps.fill,
      stroke = Icon.defaultProps.stroke,
      strokeWidth = Icon.defaultProps.strokeWidth,
      ariaLabel,
      ariaHidden = Icon.defaultProps.ariaHidden,
      children,
    } = this.props;

    return (
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        className={this.getClasses()}
        style={this.getStyles()}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden}
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </svg>
    );
  }
}

export default Icon;

