import React from "react";
import "../../styles/bouquet-detail/ProductHeader.css";
import { formatIDR } from "../../utils/money";
import { formatBouquetName } from "../../utils/text-formatter";
import StatusBadge from "../common/StatusBadge";

interface ProductHeaderProps {
  name: string;
  price: number;
  status: "ready" | "preorder";
  isFavorite: boolean;
  onFavoriteToggle: () => void;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  name,
  price,
  status,
  isFavorite,
  onFavoriteToggle,
}) => {
  return (
    <div className="product-header">
      <div className="product-header__top">
        <h1 className="product-header__title" id="bouquet-title">
          {formatBouquetName(name)}
        </h1>
        <button
          type="button"
          className={`product-header__favorite ${
            isFavorite ? "product-header__favorite--active" : ""
          }`}
          onClick={onFavoriteToggle}
          aria-label={isFavorite ? "Hapus dari favorit" : "Tambahkan ke favorit"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="product-header__price-row">
        <div className="product-header__price">
          <span className="product-header__price-label">Harga</span>
          <span className="product-header__price-value">{formatIDR(price)}</span>
        </div>
        <StatusBadge
          type={status}
          size="md"
          className="product-header__status"
        />
      </div>
    </div>
  );
};

export default ProductHeader;
