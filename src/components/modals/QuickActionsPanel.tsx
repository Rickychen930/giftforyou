/**
 * Quick Actions Panel Component (OOP)
 * Class-based component extending BaseModal
 */

import React, { Component } from "react";
import { BaseModal, BaseModalProps, BaseModalState } from "../base/BaseModal";
import "../../styles/QuickActionsPanel.css";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  shortcut?: string;
}

interface QuickActionsPanelProps extends Omit<BaseModalProps, "title" | "children"> {
  actions: QuickAction[];
}

interface QuickActionsPanelState extends BaseModalState {
  // No additional state needed
}

/**
 * Quick Actions Panel Component
 * Class-based component extending BaseModal
 */
class QuickActionsPanel extends BaseModal<QuickActionsPanelProps, QuickActionsPanelState> {
  protected baseClass: string = "quickActionsPanel";

  private handleActionClick = (action: QuickAction): void => {
    action.onClick();
    this.handleClose();
  };

  protected renderHeader(): React.ReactNode {
    return (
      <div className={`${this.baseClass}__header`}>
        <h3 className={`${this.baseClass}__title`}>Quick Actions</h3>
        <button
          type="button"
          className={`${this.baseClass}__close`}
          onClick={this.handleClose}
          aria-label="Tutup Quick Actions"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  }

  protected renderBody(): React.ReactNode {
    const { actions } = this.props;

    return (
      <div className={`${this.baseClass}__content`}>
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            className={`${this.baseClass}__action ${this.baseClass}__action--${action.variant || "secondary"}`}
            onClick={() => this.handleActionClick(action)}
          >
            <span className={`${this.baseClass}__actionIcon`}>{action.icon}</span>
            <span className={`${this.baseClass}__actionLabel`}>{action.label}</span>
            {action.shortcut && (
              <span className={`${this.baseClass}__actionShortcut`}>{action.shortcut}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  protected renderFooter(): React.ReactNode {
    return null; // No footer needed
  }

  render(): React.ReactNode {
    const { isOpen } = this.props;
    const { isVisible } = this.state;

    if (!isOpen && !isVisible) return null;

    return (
      <>
        <div
          className="quickActionsOverlay"
          onClick={this.handleOverlayClick}
          aria-hidden="true"
        />
        <div className={this.baseClass}>
          {this.renderHeader()}
          {this.renderBody()}
          {this.renderFooter()}
        </div>
      </>
    );
  }
}

export default QuickActionsPanel;

