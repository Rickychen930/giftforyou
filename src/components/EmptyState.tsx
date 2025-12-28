import React from "react";
import { Link } from "react-router-dom";
import "../styles/EmptyState.css";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  actionPath,
  onAction,
  className = "",
}) => {
  const defaultIcon = (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
    </svg>
  );

  const ActionButton = actionPath ? (
    <Link to={actionPath} className="emptyState__action btn-luxury">
      {actionLabel || "Mulai"}
    </Link>
  ) : onAction ? (
    <button type="button" onClick={onAction} className="emptyState__action btn-luxury">
      {actionLabel || "Mulai"}
    </button>
  ) : null;

  return (
    <div className={`emptyState ${className}`}>
      <div className="emptyState__icon">{icon || defaultIcon}</div>
      <h3 className="emptyState__title">{title}</h3>
      {description && <p className="emptyState__description">{description}</p>}
      {ActionButton}
    </div>
  );
};

export default EmptyState;

