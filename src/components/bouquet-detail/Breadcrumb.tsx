import React from "react";
import { Link } from "react-router-dom";
import "../../styles/bouquet-detail/Breadcrumb.css";

interface BreadcrumbProps {
  currentPage: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/" className="breadcrumb__link">
        Beranda
      </Link>
      <span className="breadcrumb__separator">/</span>
      <Link to="/collection" className="breadcrumb__link">
        Katalog
      </Link>
      <span className="breadcrumb__separator">/</span>
      <span className="breadcrumb__current">{currentPage}</span>
    </nav>
  );
};

export default Breadcrumb;

