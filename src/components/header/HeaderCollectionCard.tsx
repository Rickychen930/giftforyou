/**
 * Header Collection Card Component
 * Reusable card component for displaying collection items in mega menu
 * OOP-based class component following SOLID principles
 * Luxury, elegant, and responsive design
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderCollectionCard.css";

export interface HeaderCollectionCardProps {
  name: string;
  icon?: string;
  description?: string;
  href: string;
  onClick?: () => void;
  featured?: boolean;
}

interface HeaderCollectionCardState {
  isHovered: boolean;
}

/**
 * Header Collection Card Component
 * Displays a single collection as an elegant card
 * Follows Single Responsibility Principle: only handles card rendering
 */
export class HeaderCollectionCard extends Component<HeaderCollectionCardProps, HeaderCollectionCardState> {
  constructor(props: HeaderCollectionCardProps) {
    super(props);
    this.state = {
      isHovered: false,
    };
  }

  private handleMouseEnter = (): void => {
    this.setState({ isHovered: true });
  };

  private handleMouseLeave = (): void => {
    this.setState({ isHovered: false });
  };

  private handleClick = (): void => {
    this.props.onClick?.();
  };

  render(): React.ReactNode {
    const { name, icon = "🌸", description, href, featured = false } = this.props;
    const { isHovered } = this.state;

    return (
      <Link
        to={href}
        className={`header-collection-card ${featured ? "header-collection-card--featured" : ""} ${isHovered ? "is-hovered" : ""}`}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        role="menuitem"
        aria-label={`Browse ${name} collection`}
      >
        <div className="header-collection-card__icon-wrapper">
          <span className="header-collection-card__icon" aria-hidden="true">
            {icon}
          </span>
        </div>
        <div className="header-collection-card__content">
          <h4 className="header-collection-card__title">{name}</h4>
          {description && (
            <p className="header-collection-card__description">{description}</p>
          )}
        </div>
        <div className="header-collection-card__arrow" aria-hidden="true">
          →
        </div>
      </Link>
    );
  }
}

export default HeaderCollectionCard;

