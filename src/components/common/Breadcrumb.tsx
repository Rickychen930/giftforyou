/**
 * Breadcrumb Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/common/Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

interface BreadcrumbState {
  // No state needed, but keeping for consistency
}

/**
 * Breadcrumb Component
 * Class-based component for breadcrumb navigation
 */
class Breadcrumb extends Component<BreadcrumbProps, BreadcrumbState> {
  private baseClass: string = "breadcrumb";

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private renderItem(item: BreadcrumbItem, index: number, isLast: boolean): React.ReactNode {
    const isCurrent = item.isCurrent || isLast;

    return (
      <React.Fragment key={`${item.path || item.label}-${index}`}>
        {isCurrent ? (
          <span className={`${this.baseClass}__current`} aria-current="page">
            {item.label}
          </span>
        ) : item.path ? (
          <Link to={item.path} className={`${this.baseClass}__link`}>
            {item.label}
          </Link>
        ) : (
          <span className={`${this.baseClass}__text`}>{item.label}</span>
        )}
        {!isLast && (
          <span className={`${this.baseClass}__separator`} aria-hidden="true">
            /
          </span>
        )}
      </React.Fragment>
    );
  }

  render(): React.ReactNode {
    const { items } = this.props;

    if (items.length === 0) return null;

    return (
      <nav className={this.getClasses()} aria-label="Breadcrumb">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return this.renderItem(item, index, isLast);
        })}
      </nav>
    );
  }
}

export default Breadcrumb;
