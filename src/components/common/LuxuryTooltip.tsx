/**
 * Luxury Tooltip Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component, RefObject } from "react";
import "../../styles/LuxuryTooltip.css";

interface LuxuryTooltipProps {
  content: string | React.ReactNode;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
}

interface LuxuryTooltipState {
  isVisible: boolean;
  tooltipPosition: { top: number; left: number };
}

/**
 * Luxury Tooltip Component
 * Class-based component for tooltips
 */
class LuxuryTooltip extends Component<LuxuryTooltipProps, LuxuryTooltipState> {
  private baseClass: string = "luxuryTooltip";
  private triggerRef: RefObject<HTMLDivElement>;
  private tooltipRef: RefObject<HTMLDivElement>;
  private timeoutId: number | null;

  constructor(props: LuxuryTooltipProps) {
    super(props);
    this.state = {
      isVisible: false,
      tooltipPosition: { top: 0, left: 0 },
    };
    this.triggerRef = React.createRef();
    this.tooltipRef = React.createRef();
    this.timeoutId = null;
  }

  componentDidUpdate(prevProps: LuxuryTooltipProps, prevState: LuxuryTooltipState): void {
    if (this.state.isVisible && !prevState.isVisible) {
      this.updatePosition();
      window.addEventListener("scroll", this.updatePosition, true);
      window.addEventListener("resize", this.updatePosition);
    } else if (!this.state.isVisible && prevState.isVisible) {
      window.removeEventListener("scroll", this.updatePosition, true);
      window.removeEventListener("resize", this.updatePosition);
    }
  }

  componentWillUnmount(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    window.removeEventListener("scroll", this.updatePosition, true);
    window.removeEventListener("resize", this.updatePosition);
  }

  private updatePosition = (): void => {
    if (!this.triggerRef.current || !this.tooltipRef.current) return;

    const { position = "top" } = this.props;
    const triggerRect = this.triggerRef.current.getBoundingClientRect();
    const tooltipRect = this.tooltipRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = triggerRect.top + scrollY - tooltipRect.height - 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case "bottom":
        top = triggerRect.bottom + scrollY + 8;
        left = triggerRect.left + scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case "left":
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left + scrollX - tooltipRect.width - 8;
        break;
      case "right":
        top = triggerRect.top + scrollY + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + scrollX + 8;
        break;
    }

    // Keep tooltip within viewport
    const padding = 16;
    if (top < scrollY + padding) top = scrollY + padding;
    if (left < scrollX + padding) left = scrollX + padding;
    if (left + tooltipRect.width > scrollX + window.innerWidth - padding) {
      left = scrollX + window.innerWidth - tooltipRect.width - padding;
    }

    this.setState({ tooltipPosition: { top, left } });
  };

  private handleMouseEnter = (): void => {
    const { delay = 200 } = this.props;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = window.setTimeout(() => {
      this.setState({ isVisible: true });
      setTimeout(this.updatePosition, 10);
    }, delay);
  };

  private handleMouseLeave = (): void => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.setState({ isVisible: false });
  };

  render(): React.ReactNode {
    const { content, children, position = "top", className = "" } = this.props;
    const { isVisible, tooltipPosition } = this.state;

    return (
      <div
        ref={this.triggerRef}
        className={`${this.baseClass}__trigger`}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onFocus={this.handleMouseEnter}
        onBlur={this.handleMouseLeave}
      >
        {children}
        {isVisible && (
          <div
            ref={this.tooltipRef}
            className={`${this.baseClass} ${this.baseClass}--${position} ${className}`.trim()}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
            role="tooltip"
          >
            <div className={`${this.baseClass}__content`}>{content}</div>
            <div className={`${this.baseClass}__arrow ${this.baseClass}__arrow--${position}`} />
          </div>
        )}
      </div>
    );
  }
}

export default LuxuryTooltip;

