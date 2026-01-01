/**
 * Key Value List Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/KeyValueList.css";

interface KeyValueItem {
  key: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

interface KeyValueListProps {
  items: KeyValueItem[];
  className?: string;
  variant?: "default" | "compact" | "spacious";
}

interface KeyValueListState {
  // No state needed, but keeping for consistency
}

/**
 * Key Value List Component
 * Class-based component for displaying key-value pairs
 */
class KeyValueList extends Component<KeyValueListProps, KeyValueListState> {
  private baseClass: string = "keyValueList";

  private getClasses(): string {
    const { variant = "default", className = "" } = this.props;
    return `${this.baseClass} ${this.baseClass}--${variant} ${className}`.trim();
  }

  private renderItem(item: KeyValueItem, index: number): React.ReactNode {
    return (
      <div key={index} className={`${this.baseClass}__row`}>
        <span className={`${this.baseClass}__key`}>
          {item.icon && (
            <span className={`${this.baseClass}__icon`} aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.key}
        </span>
        <span className={`${this.baseClass}__value`}>{item.value}</span>
      </div>
    );
  }

  render(): React.ReactNode {
    const { items } = this.props;

    return (
      <div className={this.getClasses()}>
        {items.map((item, index) => this.renderItem(item, index))}
      </div>
    );
  }
}

export default KeyValueList;
