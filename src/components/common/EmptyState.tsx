/**
 * Empty State Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/EmptyState.css";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  className?: string;
}

interface EmptyStateState {
  // No state needed, but keeping for consistency
}

/**
 * Empty State Component
 * Class-based component for empty states
 */
class EmptyState extends Component<EmptyStateProps, EmptyStateState> {
  private baseClass: string = "emptyState";

  private getDefaultIcon(): React.ReactNode {
    return (
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
        />
      </svg>
    );
  }

  private renderActionButton(): React.ReactNode {
    const { actionLabel = "Mulai", actionPath, onAction } = this.props;

    if (actionPath) {
      return (
        <Link to={actionPath} className={`${this.baseClass}__action btn-luxury`}>
          {actionLabel}
        </Link>
      );
    }

    if (onAction) {
      return (
        <button type="button" onClick={onAction} className={`${this.baseClass}__action btn-luxury`}>
          {actionLabel}
        </button>
      );
    }

    return null;
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { icon, title, description } = this.props;

    return (
      <div className={this.getClasses()}>
        <div className={`${this.baseClass}__icon`}>{icon || this.getDefaultIcon()}</div>
        <h3 className={`${this.baseClass}__title`}>{title}</h3>
        {description && <p className={`${this.baseClass}__description`}>{description}</p>}
        {this.renderActionButton()}
      </div>
    );
  }
}

export default EmptyState;

