/**
 * Key Value List Component
 * Luxury and responsive key-value list for displaying data
 */

import React from "react";
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

/**
 * Key Value List Component
 * Luxury styled key-value list
 */
const KeyValueList: React.FC<KeyValueListProps> = ({
  items,
  className = "",
  variant = "default",
}) => {
  return (
    <div className={`keyValueList keyValueList--${variant} ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="keyValueList__row">
          <span className="keyValueList__key">
            {item.icon && (
              <span className="keyValueList__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.key}
          </span>
          <span className="keyValueList__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default KeyValueList;

