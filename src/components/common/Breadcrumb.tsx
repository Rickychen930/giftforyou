import React from "react";
import { Link } from "react-router-dom";
import "../../styles/common/Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  if (items.length === 0) return null;

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.isCurrent || isLast;

        return (
          <React.Fragment key={`${item.path || item.label}-${index}`}>
            {isCurrent ? (
              <span className="breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            ) : item.path ? (
              <Link to={item.path} className="breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb__text">{item.label}</span>
            )}
            {!isLast && <span className="breadcrumb__separator" aria-hidden="true">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;

