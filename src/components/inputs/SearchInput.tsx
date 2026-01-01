/**
 * Search Input Component (OOP)
 * Extends BaseInput following SOLID principles
 */

import React from "react";
import { BaseInput, BaseInputProps } from "../base/BaseInput";
import "../../styles/SearchInput.css";

interface SearchInputProps extends Omit<BaseInputProps, "type"> {
  onSearchChange?: (value: string) => void;
}

interface SearchInputState {
  isFocused: boolean;
  value: string;
}

/**
 * Search Input Component
 * Class-based component extending BaseInput
 */
class SearchInput extends BaseInput<SearchInputProps, SearchInputState> {
  protected baseClass: string = "searchInput";


  protected getWrapperClasses(): string {
    const { className = "" } = this.props;
    const focusedClass = this.state.isFocused ? `${this.baseClass}--focused` : "";
    return `${this.baseClass} ${focusedClass} ${className}`.trim();
  }

  protected handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    this.setState({ value });
    
    // Call parent handler
    super.handleChange(e);
    
    // Call search-specific handler
    if (this.props.onSearchChange) {
      this.props.onSearchChange(value);
    }
  };

  protected renderIcon(): React.ReactNode {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${this.baseClass}__icon`}
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
    );
  }

  render(): React.ReactNode {
    const { onSearchChange, onFocus, onBlur, ...inputProps } = this.props;

    return (
      <div className={this.getWrapperClasses()}>
        <input
          type="text"
          className={this.getInputClasses()}
          value={this.state.value}
          onChange={this.handleChange}
          onFocus={(e) => {
            this.handleFocus(e);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            this.handleBlur(e);
            if (onBlur) onBlur(e);
          }}
          {...inputProps}
        />
        {this.renderIcon()}
        {this.renderError()}
        {this.renderHint()}
      </div>
    );
  }
}

export default SearchInput;

