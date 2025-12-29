import React from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderActions.css";
import { SearchIcon } from "../icons/UIIcons";
import { getAccessToken } from "../../utils/auth-utils";
import { getCartCount } from "../../utils/cart";

export interface HeaderActionsProps {
  onSearchToggle: () => void;
  searchOpen: boolean;
  searchButtonRef?: React.RefObject<HTMLButtonElement>;
  hamburgerButtonRef?: React.RefObject<HTMLButtonElement>;
  mobileOpen: boolean;
  onMobileToggle: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  onSearchToggle,
  searchOpen,
  searchButtonRef,
  hamburgerButtonRef,
  mobileOpen,
  onMobileToggle,
}) => {
  const [cartCount, setCartCount] = React.useState<number>(0);

  React.useEffect(() => {
    const updateCartCount = () => {
      const isAuthenticated = !!getAccessToken();
      if (isAuthenticated) {
        setCartCount(getCartCount());
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  return (
    <div className="header-actions">
      {/* Search */}
      <button
        className="header-actions__btn header-actions__btn--search"
        onClick={onSearchToggle}
        type="button"
        aria-label="Cari (Ctrl+K atau Cmd+K)"
        aria-expanded={searchOpen}
        aria-controls={searchOpen ? "search-modal" : undefined}
        ref={searchButtonRef}
        title="Cari (Ctrl+K atau Cmd+K)"
      >
        <SearchIcon />
      </button>

      {/* Cart */}
      {getAccessToken() && (
        <Link
          to="/cart"
          className="header-actions__btn header-actions__btn--cart"
          aria-label={`Keranjang (${cartCount} item)`}
          title="Keranjang Belanja"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {cartCount > 0 && (
            <span className="header-actions__cart-badge" aria-label={`${cartCount} item di keranjang`}>
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      )}

      {/* Mobile Menu Toggle */}
      <button
        className={`header-actions__hamburger ${mobileOpen ? "is-open" : ""}`}
        onClick={onMobileToggle}
        type="button"
        aria-label="Buka/tutup menu"
        aria-expanded={mobileOpen}
        aria-controls="primary-navigation"
        ref={hamburgerButtonRef}
      >
        <span />
        <span />
        <span />
      </button>
    </div>
  );
};

export default HeaderActions;

