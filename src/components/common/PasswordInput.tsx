/**
 * Password Input Component
 * Luxury and responsive password input with visibility toggle
 */

import React from "react";
import "../../styles/PasswordInput.css";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showPassword: boolean;
  onToggleVisibility: () => void;
  error?: string;
  hint?: string;
}

/**
 * Password Input Component
 * Luxury styled password input with visibility toggle
 */
const PasswordInput: React.FC<PasswordInputProps> = ({
  showPassword,
  onToggleVisibility,
  error,
  hint,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="passwordInput">
      <div className={`passwordInput__wrapper ${error ? "passwordInput__wrapper--error" : ""}`}>
        <input
          type={showPassword ? "text" : "password"}
          className={`passwordInput__input ${className}`}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          className="passwordInput__toggle"
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
      </div>
      {hint && !error && (
        <span className="passwordInput__hint" id={hint ? `${id}-hint` : undefined}>
          {hint}
        </span>
      )}
      {error && (
        <span className="passwordInput__error" id={id ? `${id}-error` : undefined} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;

