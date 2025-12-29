/**
 * Tab Navigation Component
 * Luxury and responsive tab navigation
 */

import React from "react";
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

/**
 * Tab Navigation Component
 * Luxury styled tab navigation
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = "",
}) => {
  return (
    <div className={`tabNavigation ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.key}
          className={`tabNavigation__tab ${
            activeTab === tab.key ? "tabNavigation__tab--active" : ""
          }`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.icon && <span className="tabNavigation__icon">{tab.icon}</span>}
          <span className="tabNavigation__label">{tab.label}</span>
          {tab.shortcut && (
            <span className="tabNavigation__shortcut" aria-label={`Shortcut: ${tab.shortcut}`}>
              {tab.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;

