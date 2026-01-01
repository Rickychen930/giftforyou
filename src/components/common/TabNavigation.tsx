/**
 * Tab Navigation Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/TabNavigation.css";

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  className?: string;
}

interface TabNavigationState {
  activeTab: string;
}

/**
 * Tab Navigation Component
 * Class-based component for tab navigation
 */
class TabNavigation extends Component<TabNavigationProps, TabNavigationState> {
  private baseClass: string = "tabNavigation";

  constructor(props: TabNavigationProps) {
    super(props);
    this.state = {
      activeTab: props.activeTab,
    };
  }

  componentDidUpdate(prevProps: TabNavigationProps): void {
    if (prevProps.activeTab !== this.props.activeTab) {
      this.setState({ activeTab: this.props.activeTab });
    }
  }

  private getClasses(): string {
    const { className = "" } = this.props;
    return `${this.baseClass} ${className}`.trim();
  }

  private handleTabClick = (key: string): void => {
    this.setState({ activeTab: key });
    this.props.onTabChange(key);
  };

  private renderTab(tab: TabItem): React.ReactNode {
    const { activeTab } = this.state;
    const isActive = activeTab === tab.key;

    return (
      <button
        key={tab.key}
        type="button"
        role="tab"
        aria-selected={isActive}
        className={`${this.baseClass}__tab ${
          isActive ? `${this.baseClass}__tab--active` : ""
        }`}
        onClick={() => this.handleTabClick(tab.key)}
      >
        {tab.icon && <span className={`${this.baseClass}__icon`}>{tab.icon}</span>}
        <span className={`${this.baseClass}__label`}>{tab.label}</span>
        {tab.shortcut && (
          <span className={`${this.baseClass}__shortcut`} aria-label={`Shortcut: ${tab.shortcut}`}>
            {tab.shortcut}
          </span>
        )}
      </button>
    );
  }

  render(): React.ReactNode {
    const { tabs } = this.props;

    return (
      <div className={this.getClasses()} role="tablist">
        {tabs.map((tab) => this.renderTab(tab))}
      </div>
    );
  }
}

export default TabNavigation;
