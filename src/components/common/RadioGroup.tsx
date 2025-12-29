/**
 * Radio Group Component
 * Luxury and responsive radio button group
 */

import React from "react";
import "../../styles/RadioGroup.css";

export interface RadioOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Radio Group Component
 * Luxury styled radio button group
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`radioGroup ${className}`} role="radiogroup">
      {options.map((option) => (
        <label
          key={option.value}
          className={`radioGroup__option ${
            value === option.value ? "radioGroup__option--active" : ""
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="radioGroup__input"
          />
          <span className="radioGroup__content">
            {option.icon && <span className="radioGroup__icon">{option.icon}</span>}
            <span className="radioGroup__label">{option.label}</span>
            {option.description && (
              <span className="radioGroup__description">{option.description}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;

