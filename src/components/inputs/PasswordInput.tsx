/**
 * Password Input Component (OOP)
 * Extends BaseInput following SOLID principles
 */

import React from "react";
import { BaseInput, BaseInputProps } from "../base/BaseInput";
import "../../styles/PasswordInput.css";

interface PasswordInputProps extends Omit<BaseInputProps, "type"> {
  showPassword: boolean;
  onToggleVisibility: () => void;
}

interface PasswordInputState {
  isFocused: boolean;
  value: string;
}

/**
 * Password Input Component
 * Class-based component extending BaseInput
 */
class PasswordInput extends BaseInput<PasswordInputProps, PasswordInputState> {
  protected baseClass: string = "passwordInput";

  constructor(props: PasswordInputProps) {
    super(props);
  }

  protected getWrapperClasses(): string {
    const { error } = this.props;
    const errorClass = error ? `${this.baseClass}__wrapper--error` : "";
    const focusedClass = this.state.isFocused ? `${this.baseClass}__wrapper--focused` : "";
    return `${this.baseClass}__wrapper ${errorClass} ${focusedClass}`.trim();
  }

  protected renderToggleButton(): React.ReactNode {
    const { showPassword, onToggleVisibility } = this.props;

    return (
      <button
        type="button"
        className={`${this.baseClass}__toggle`}
        onClick={onToggleVisibility}
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        tabIndex={-1}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          {showPassword ? (
            <>
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </>
          ) : (
            <>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </>
          )}
        </svg>
      </button>
    );
  }

  render(): React.ReactNode {
    const { showPassword, onToggleVisibility, error, hint, id, onFocus, onBlur, ...inputProps } = this.props;

    return (
      <div className={this.baseClass}>
        <div className={this.getWrapperClasses()}>
          <input
            type={showPassword ? "text" : "password"}
            className={`${this.baseClass}__input`}
            id={id}
            value={this.state.value}
            onChange={this.handleChange}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
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
          {this.renderToggleButton()}
        </div>
        {this.renderHint()}
        {this.renderError()}
      </div>
    );
  }
}

export default PasswordInput;

