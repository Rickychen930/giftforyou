/**
 * Contact Info Item Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/ContactInfoItem.css";

interface ContactInfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  className?: string;
}

interface ContactInfoItemState {
  // No state needed, but keeping for consistency
}

/**
 * Contact Info Item Component
 * Class-based component for contact information items
 */
class ContactInfoItem extends Component<ContactInfoItemProps, ContactInfoItemState> {
  private baseClass: string = "contactInfoItem";

  private getClasses(): string {
    const { href, className = "" } = this.props;
    const linkClass = href ? `${this.baseClass}--link` : "";
    return `${this.baseClass} ${linkClass} ${className}`.trim();
  }

  private renderContent(): React.ReactNode {
    const { icon, label, value } = this.props;

    return (
      <>
        <div className={`${this.baseClass}__icon`}>{icon}</div>
        <div className={`${this.baseClass}__content`}>
          <span className={`${this.baseClass}__label`}>{label}</span>
          <span className={`${this.baseClass}__value`}>{value}</span>
        </div>
      </>
    );
  }

  render(): React.ReactNode {
    const { href, label, value } = this.props;

    if (href) {
      return (
        <a
          href={href}
          className={this.getClasses()}
          aria-label={`${label} ${value}`}
        >
          {this.renderContent()}
        </a>
      );
    }

    return (
      <div className={this.getClasses()}>
        {this.renderContent()}
      </div>
    );
  }
}

export default ContactInfoItem;
