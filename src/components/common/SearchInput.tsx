/**
 * Search Input Component
 * Luxury and responsive search input with icon
 */

import React from "react";
import "../../styles/SearchInput.css";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onSearchChange?: (value: string) => void;
  className?: string;
}

/**
 * Search Input Component
 * Luxury styled search input
 */
const SearchInput: React.FC<SearchInputProps> = ({
  onSearchChange,
  className = "",
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`searchInput ${className}`}>
      <input
        type="text"
        className="searchInput__input"
        onChange={handleChange}
        {...props}
      />
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="searchInput__icon"
        aria-hidden="true"
      >
        <path
          d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default SearchInput;

