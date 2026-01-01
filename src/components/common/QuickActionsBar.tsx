/**
 * Quick Actions Bar Component (OOP)
 * Class-based component following SOLID principles
 * Reusable component for quick action buttons (WhatsApp, Phone, etc.)
 */

import React, { Component } from "react";
import "../../styles/QuickActionsBar.css";

export interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "whatsapp" | "call" | "orders" | "default";
  type?: "link" | "button";
}

interface QuickActionsBarProps {
  actions: QuickAction[];
  className?: string;
}

interface QuickActionsBarState {
  // No state needed, but keeping for consistency
}

/**
 * Quick Actions Bar Component
 * Class-based component for quick action buttons
 */
class QuickActionsBar extends Component<QuickActionsBarProps, QuickActionsBarState> {
  private baseClass: string = "quickActionsBar";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private renderAction(action: QuickAction, index: number): React.ReactNode {
    const { variant = "default", type = "link", href, onClick, label, icon } = action;
    const actionClass = `${this.baseClass}__action ${this.baseClass}__action--${variant}`;

    const content = (
      <>
        <span className={`${this.baseClass}__actionIcon`} aria-hidden="true">
          {icon}
        </span>
        <span className={`${this.baseClass}__actionLabel`}>{label}</span>
      </>
    );

    if (type === "button") {
      return (
        <button
          key={index}
          type="button"
          className={actionClass}
          onClick={onClick}
        >
          {content}
        </button>
      );
    }

    return (
      <a
        key={index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={actionClass}
      >
        {content}
      </a>
    );
  }

  render(): React.ReactNode {
    const { actions } = this.props;

    if (actions.length === 0) return null;

    return (
      <div className={this.getClasses()} role="toolbar" aria-label="Quick actions">
        {actions.map((action, index) => this.renderAction(action, index))}
      </div>
    );
  }
}

export default QuickActionsBar;

