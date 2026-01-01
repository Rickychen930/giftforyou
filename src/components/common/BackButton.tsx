/**
 * Back Button Component (OOP)
 * Class-based component following SOLID principles
 * Reusable back button component that works with onClick (not Link)
 */

import React, { Component } from "react";
import "../../styles/BackButton.css";
import { ArrowLeftIcon } from "../icons";

interface BackButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

interface BackButtonState {
  // No state needed, but keeping for consistency
}

/**
 * Back Button Component
 * Class-based component for back navigation buttons
 */
class BackButton extends Component<BackButtonProps, BackButtonState> {
  private baseClass: string = "backButton";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { onClick, children } = this.props;

    return (
      <button type="button" onClick={onClick} className={this.getClasses()}>
        <ArrowLeftIcon width={20} height={20} />
        <span>{children}</span>
      </button>
    );
  }
}

export default BackButton;

