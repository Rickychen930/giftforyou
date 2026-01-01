/**
 * Category Filter Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/CategoryFilter.css";

interface CategoryFilterProps<T extends string> {
  categories: readonly T[];
  selectedCategory: T;
  onCategoryChange: (category: T) => void;
  className?: string;
}

interface CategoryFilterState<T extends string> {
  selectedCategory: T;
}

/**
 * Category Filter Component
 * Class-based component for category filtering
 */
class CategoryFilter<T extends string> extends Component<CategoryFilterProps<T>, CategoryFilterState<T>> {
  private baseClass: string = "categoryFilter";

  constructor(props: CategoryFilterProps<T>) {
    super(props);
    this.state = {
      selectedCategory: props.selectedCategory,
    };
  }

  componentDidUpdate(prevProps: CategoryFilterProps<T>): void {
    if (prevProps.selectedCategory !== this.props.selectedCategory) {
      this.setState({ selectedCategory: this.props.selectedCategory });
    }
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private handleCategoryClick = (category: T): void => {
    this.setState({ selectedCategory: category });
    this.props.onCategoryChange(category);
  };

  private renderCategoryButton(category: T): React.ReactNode {
    const { selectedCategory } = this.state;
    const isActive = selectedCategory === category;

    return (
      <button
        key={category}
        type="button"
        className={`${this.baseClass}__button ${
          isActive ? `${this.baseClass}__button--active` : ""
        }`}
        onClick={() => this.handleCategoryClick(category)}
      >
        {category}
      </button>
    );
  }

  render(): React.ReactNode {
    const { categories } = this.props;

    return (
      <div className={this.getClasses()}>
        {categories.map((category) => this.renderCategoryButton(category))}
      </div>
    );
  }
}

export default CategoryFilter;
