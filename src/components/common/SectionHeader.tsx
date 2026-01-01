/**
 * Section Header Component (OOP)
 * Class-based component following SOLID principles
 * Reusable header component for sections with title, subtitle, stats, and actions
 */

import React, { Component } from "react";
import "../../styles/SectionHeader.css";
import { ArrowLeftIcon } from "../icons";

export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string; // Optional eyebrow/kicker text above title
  stats?: React.ReactNode;
  actions?: React.ReactNode;
  backButton?: {
    onClick: () => void;
    label?: string;
  };
  className?: string;
  titleId?: string; // Optional ID for the title element (for aria-labelledby)
}

interface SectionHeaderState {
  // No state needed, but keeping for consistency
}

/**
 * Section Header Component
 * Class-based component for section headers
 */
class SectionHeader extends Component<SectionHeaderProps, SectionHeaderState> {
  private baseClass: string = "sectionHeader";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { title, subtitle, eyebrow, stats, actions, backButton, titleId } = this.props;

    return (
      <header className={this.getClasses()}>
        {backButton && (
          <div className={`${this.baseClass}__back`}>
            <button
              type="button"
              className={`${this.baseClass}__backBtn`}
              onClick={backButton.onClick}
              aria-label={backButton.label || "Kembali"}
            >
              <ArrowLeftIcon width={20} height={20} />
              {backButton.label || "Kembali"}
            </button>
          </div>
        )}
        <div className={`${this.baseClass}__content`}>
          <div className={`${this.baseClass}__text`}>
            {eyebrow && <p className={`${this.baseClass}__eyebrow`}>{eyebrow}</p>}
            <h2 id={titleId} className={`${this.baseClass}__title`}>{title}</h2>
            {subtitle && <p className={`${this.baseClass}__subtitle`}>{subtitle}</p>}
            {stats && <div className={`${this.baseClass}__stats`}>{stats}</div>}
          </div>
          {actions && <div className={`${this.baseClass}__actions`}>{actions}</div>}
        </div>
      </header>
    );
  }
}

export default SectionHeader;

