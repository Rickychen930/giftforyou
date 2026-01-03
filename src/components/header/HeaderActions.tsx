/**
 * Header Actions Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../../styles/header/HeaderActions.css";
import { SearchIcon, CloseIcon } from "../icons/UIIcons";
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

interface HeaderActionsState {
  cartCount: number;
}

/**
 * Header Actions Component
 * Class-based component for header action buttons
 */
class HeaderActions extends Component<HeaderActionsProps, HeaderActionsState> {
  private baseClass: string = "header-actions";

  constructor(props: HeaderActionsProps) {
    super(props);
    this.state = {
      cartCount: 0,
    };
  }

  componentDidMount(): void {
    this.updateCartCount();
    window.addEventListener("cartUpdated", this.updateCartCount);
  }

  componentWillUnmount(): void {
    window.removeEventListener("cartUpdated", this.updateCartCount);
  }

  private updateCartCount = (): void => {
    const isAuthenticated = !!getAccessToken();
    if (isAuthenticated) {
      this.setState({ cartCount: getCartCount() });
    } else {
      this.setState({ cartCount: 0 });
    }
  };

  private renderCartIcon(): React.ReactNode {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  private renderCartBadge(): React.ReactNode {
    const { cartCount } = this.state;
    if (cartCount <= 0) return null;

    return (
      <span className={`${this.baseClass}__cart-badge`} aria-label={`${cartCount} item di keranjang`}>
        {cartCount > 99 ? "99+" : cartCount}
      </span>
    );
  }

  render(): React.ReactNode {
    const {
      onSearchToggle,
      searchOpen,
      searchButtonRef,
      hamburgerButtonRef,
      mobileOpen,
      onMobileToggle,
    } = this.props;
    const { cartCount } = this.state;

    return (
      <div className={this.baseClass}>
        {/* Search / Close Toggle */}
        <button
          className={`${this.baseClass}__btn ${this.baseClass}__btn--search ${searchOpen ? "is-open" : ""}`}
          onClick={onSearchToggle}
          type="button"
          aria-label={searchOpen ? "Tutup pencarian" : "Cari (Ctrl+K atau Cmd+K)"}
          aria-expanded={searchOpen}
          aria-controls={searchOpen ? "search-modal" : undefined}
          ref={searchButtonRef}
          title={searchOpen ? "Tutup pencarian" : "Cari (Ctrl+K atau Cmd+K)"}
        >
          {searchOpen ? <CloseIcon width={20} height={20} /> : <SearchIcon />}
        </button>

        {/* Cart */}
        {getAccessToken() && (
          <Link
            to="/cart"
            className={`${this.baseClass}__btn ${this.baseClass}__btn--cart`}
            aria-label={`Keranjang (${cartCount} item)`}
            title="Keranjang Belanja"
          >
            {this.renderCartIcon()}
            {this.renderCartBadge()}
          </Link>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className={`${this.baseClass}__hamburger ${mobileOpen ? "is-open" : ""}`}
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
  }
}

export default HeaderActions;
