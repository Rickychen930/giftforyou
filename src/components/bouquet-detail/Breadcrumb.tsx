import React from "react";
import BreadcrumbComponent, { BreadcrumbItem } from "../common/Breadcrumb";

interface BreadcrumbProps {
  currentPage: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPage }) => {
  const items: BreadcrumbItem[] = [
    { label: "Beranda", path: "/" },
    { label: "Katalog", path: "/collection" },
    { label: currentPage, isCurrent: true },
  ];

  return <BreadcrumbComponent items={items} />;
};

export default Breadcrumb;
