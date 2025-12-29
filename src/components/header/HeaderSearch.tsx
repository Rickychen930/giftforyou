import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/header/HeaderSearch.css";
import { SearchIcon, CloseIcon } from "../icons/UIIcons";
import { COLLECTION_SUGGESTIONS } from "../../constants/app-constants";

export interface HeaderSearchProps {
  isOpen: boolean;
  onClose: (opts?: { returnFocus?: boolean }) => void;
  searchButtonRef?: React.RefObject<HTMLButtonElement>;
  collectionSuggestions?: string[];
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({
  isOpen,
  onClose,
  searchButtonRef,
  collectionSuggestions = Array.from(COLLECTION_SUGGESTIONS),
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const searchModalRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = React.useState("");

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = searchModalRef.current;
      if (!root) return;

      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => {
        if (el.hasAttribute("disabled")) return false;
        if (el.getAttribute("aria-hidden") === "true") return false;
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleSearch: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const term = (
      e.currentTarget.elements.namedItem("q") as HTMLInputElement
    )?.value?.trim();
    if (term) {
      navigate(`/search?q=${encodeURIComponent(term)}`);
    } else {
      navigate("/search");
    }
    setQuery("");
    onClose();
    setTimeout(() => searchButtonRef?.current?.focus(), 100);
  };

  if (!isOpen) return null;

  return (
    <div
      className="header-search__overlay"
      onClick={() => onClose({ returnFocus: true })}
    >
      <div
        className="header-search__modal"
        onClick={(e) => e.stopPropagation()}
        ref={searchModalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Pencarian"
        id="search-modal"
      >
        <button
          className="header-search__close"
          onClick={() => onClose({ returnFocus: true })}
          type="button"
          aria-label="Tutup pencarian"
        >
          <CloseIcon />
        </button>
        <form onSubmit={handleSearch} className="header-search__form">
          <div className="header-search__input-wrapper">
            <SearchIcon className="header-search__icon" width={24} height={24} />
            <input
              ref={searchRef}
              name="q"
              list="search-suggestions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="header-search__input"
              placeholder="Cari bouquet, koleksi, momen..."
              aria-label="Cari"
            />
            <datalist id="search-suggestions">
              {collectionSuggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <button type="submit" className="header-search__submit">
            Cari
          </button>
        </form>
        <div className="header-search__suggestions">
          <p className="header-search__suggestions-title">Pencarian Populer</p>
          <div className="header-search__suggestions-tags">
            {collectionSuggestions.slice(0, 5).map((s) => (
              <button
                key={s}
                type="button"
                className="header-search__suggestion-tag"
                onClick={() => {
                  setQuery(s);
                  setTimeout(() => {
                    searchRef.current?.focus();
                    searchRef.current?.setSelectionRange(
                      searchRef.current.value.length,
                      searchRef.current.value.length
                    );
                  }, 0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderSearch;

