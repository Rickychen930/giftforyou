/**
 * Back Link Component
 * Luxury and responsive back navigation link
 */

import React from "react";
import { Link } from "react-router-dom";
import "../../styles/BackLink.css";

interface BackLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Back Link Component
 * Luxury styled back navigation link
 */
const BackLink: React.FC<BackLinkProps> = ({
  to,
  children,
  className = "",
}) => {
  return (
    <Link to={to} className={`backLink ${className}`}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span>{children}</span>
    </Link>
  );
};

export default BackLink;

