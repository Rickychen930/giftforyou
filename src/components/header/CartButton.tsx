/**
 * Cart Button Component
 * Reusable cart button with badge
 * Following SOLID, DRY principles
 */

import React from "react";
import { Link } from "react-router-dom";
import "../../styles/Header.css";

interface CartButtonProps {
  cartCount: number;
  className?: string;
}

/**
 * Cart Button Component
 * Displays cart icon with item count badge
 */
export const CartButton: React.FC<CartButtonProps> = ({
  cartCount,
  className = "",
}) => {
  return (
    <Link
      to="/cart"
      className={`icon-btn cart-btn ${className}`}
      aria-label={`Keranjang (${cartCount} item)`}
      title="Keranjang Belanja"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M9 2L7 6H2v2h1l1 10h12l1-10h1V6h-5L15 2H9z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {cartCount > 0 && (
        <span className="cart-badge" aria-label={`${cartCount} item di keranjang`}>
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </Link>
  );
};

export default CartButton;

