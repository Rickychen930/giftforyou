/**
 * Help Section Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/HelpSection.css";

interface HelpSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

interface HelpSectionState {
  // No state needed, but keeping for consistency
}

/**
 * Help Section Component
 * Class-based component for help/info sections
 */
class HelpSection extends Component<HelpSectionProps, HelpSectionState> {
  private baseClass: string = "helpSection";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  render(): React.ReactNode {
    const { title, children, icon } = this.props;

    return (
      <div className={this.getClasses()}>
        <h3 className={`${this.baseClass}__title`}>
          {icon && <span className={`${this.baseClass}__icon`}>{icon}</span>}
          {title}
        </h3>
        <p className={`${this.baseClass}__text`}>{children}</p>
      </div>
    );
  }
}

export default HelpSection;
