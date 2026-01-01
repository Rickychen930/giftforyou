/**
 * Back Link Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/BackLink.css";

interface BackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

interface BackLinkState {
  // No state needed, but keeping for consistency
}

/**
 * Back Link Component
 * Class-based component for back navigation links
 */
class BackLink extends Component<BackLinkProps, BackLinkState> {
  private baseClass: string = "backLink";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private renderIcon(): React.ReactNode {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }

  render(): React.ReactNode {
    const { to, children } = this.props;

    return (
      <Link to={to} className={this.getClasses()}>
        {this.renderIcon()}
        <span>{children}</span>
      </Link>
    );
  }
}

export default BackLink;
