/**
 * Alert Message Component
 * Luxury and responsive alert/notification message
 */

import React from "react";
import "../../styles/AlertMessage.css";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AlertMessageProps {
  variant: AlertVariant;
  message: string;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Alert Message Component
 * Luxury styled alert message
 */
const AlertMessage: React.FC<AlertMessageProps> = ({
  variant,
  message,
  className = "",
  icon,
}) => {
  const defaultIcon = icon || (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {variant === "success" ? (
        <>
          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        </>
      ) : variant === "error" ? (
        <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      ) : variant === "warning" ? (
        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      ) : (
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
  );

  return (
    <div className={`alertMessage alertMessage--${variant} ${className}`} role="alert">
      <span className="alertMessage__icon">{defaultIcon}</span>
      <span className="alertMessage__message">{message}</span>
    </div>
  );
};

export default AlertMessage;

