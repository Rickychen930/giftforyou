/**
 * Search Button Component
 * Reusable search button
 * Following SOLID, DRY principles
 */

import React from "react";
import { SearchIcon } from "../icons/UIIcons";
import "../../styles/Header.css";

interface SearchButtonProps {
  onClick: () => void;
  isOpen: boolean;
  className?: string;
}

/**
 * Search Button Component
 * Displays search icon button
 */
export const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  isOpen,
  className = "",
}) => {
  return (
    <button
      className={`icon-btn search-btn ${className}`}
      onClick={onClick}
      type="button"
      aria-label="Cari (Ctrl+K atau Cmd+K)"
      aria-expanded={isOpen}
      aria-controls={isOpen ? "search-modal" : undefined}
      title="Cari (Ctrl+K atau Cmd+K)"
    >
      <SearchIcon />
    </button>
  );
};

export default SearchButton;

