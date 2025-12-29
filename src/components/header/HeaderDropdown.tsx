import React from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderDropdown.css";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";

export interface HeaderDropdownProps {
  collectionNames?: string[];
  typeNames?: string[];
  onNavigate?: () => void;
  onClose?: () => void;
}

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({
  collectionNames = [],
  typeNames = [],
  onNavigate,
  onClose,
}) => {
  const collectionSuggestions =
    collectionNames.length > 0
      ? collectionNames
      : Array.from(COLLECTION_SUGGESTIONS);

  const typeSuggestions = typeNames.length > 0 ? typeNames : ["Orchid", "Mixed"];

  return (
    <div
      className="header-dropdown"
      id="collections-dropdown"
      aria-label="Menu koleksi"
      role="menu"
    >
      <div className="header-dropdown__header">
        <h3>Koleksi Kami</h3>
        <p>Dirangkai dengan sepenuh hati</p>
      </div>

      <div className="header-dropdown__header" style={{ marginTop: "0.75rem" }}>
        <h3>Berdasarkan Tipe</h3>
        <p>Filter cepat untuk katalog</p>
      </div>
      <ul className="header-dropdown__grid">
        {typeSuggestions.map((t) => (
          <li key={t}>
            <Link
              to={`/collection?type=${encodeURIComponent(t)}`}
              onClick={() => {
                onNavigate?.();
                onClose?.();
              }}
              className="header-dropdown__link"
              role="menuitem"
            >
              <span className="header-dropdown__icon">🏷️</span>
              <span>{t}</span>
            </Link>
          </li>
        ))}
      </ul>

      <ul className="header-dropdown__grid">
        {collectionSuggestions.map((c) => (
          <li key={c}>
            <Link
              to={`/collection?name=${encodeURIComponent(c)}`}
              onClick={() => {
                onNavigate?.();
                onClose?.();
              }}
              className="header-dropdown__link"
              role="menuitem"
            >
              <span className="header-dropdown__icon">🌸</span>
              <span>{c}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HeaderDropdown;

