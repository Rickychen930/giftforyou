/**
 * Breadcrumb Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import BreadcrumbComponent, { BreadcrumbItem } from "../common/Breadcrumb";

interface BreadcrumbProps {
  currentPage: string;
}

interface BreadcrumbState {
  // No state needed, but keeping for consistency
}

/**
 * Breadcrumb Component
 * Class-based component for breadcrumb navigation
 */
class Breadcrumb extends Component<BreadcrumbProps, BreadcrumbState> {
  private getItems(): BreadcrumbItem[] {
    const { currentPage } = this.props;
    return [
      { label: "Beranda", path: "/" },
      { label: "Katalog", path: "/collection" },
      { label: currentPage, isCurrent: true },
    ];
  }

  render(): React.ReactNode {
    return <BreadcrumbComponent items={this.getItems()} />;
  }
}

export default Breadcrumb;
