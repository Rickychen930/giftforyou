import React from "react";
import "../../styles/bouquet-detail/PriceSummary.css";
import { formatIDR } from "../../utils/money";
import { calculateBulkDiscount } from "../../utils/bulk-discount";
import { formatBouquetName } from "../../utils/text-formatter";
import type { OrderFormData } from "./OrderForm";

interface PriceSummaryProps {
  bouquetName: string;
  price: number;
  formData: OrderFormData;
  isFormValid: boolean;
  formProgress: number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({
  bouquetName,
  price,
  formData,
  isFormValid,
  formProgress,
}) => {
  const bulkDiscount = calculateBulkDiscount(price, formData.quantity);
  const subtotal = bulkDiscount.originalPrice;
  const discount = bulkDiscount.discountAmount;
  const delivery = 0; // Will be calculated by admin
  const total = bulkDiscount.finalPrice + delivery;

  return (
    <div className="price-summary">
      <div className="price-summary__header">
        <h3 className="price-summary__title">
          {isFormValid ? "Ringkasan Pesanan" : "Info Cepat"}
        </h3>
      </div>

      <div className="price-summary__content">
        {isFormValid ? (
          <>
            <div className="price-summary__item">
              <span className="price-summary__label">Produk</span>
              <span className="price-summary__value">{formatBouquetName(bouquetName)}</span>
            </div>
            <div className="price-summary__item">
              <span className="price-summary__label">Jumlah</span>
              <span className="price-summary__value">{formData.quantity} pcs</span>
            </div>
            <div className="price-summary__item price-summary__item--breakdown">
              <span className="price-summary__label">Subtotal</span>
              <span className="price-summary__value">{formatIDR(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="price-summary__item price-summary__item--discount">
                <span className="price-summary__label">
                  Diskon ({bulkDiscount.discountPercentage}%)
                </span>
                <span className="price-summary__value price-summary__value--discount">
                  -{formatIDR(discount)}
                </span>
              </div>
            )}
            {formData.deliveryType === "delivery" && (
              <div className="price-summary__item price-summary__item--breakdown">
                <span className="price-summary__label">Ongkir</span>
                <span className="price-summary__value">Akan dihitung</span>
              </div>
            )}
            <div className="price-summary__item price-summary__item--total">
              <span className="price-summary__label">Total</span>
              <span className="price-summary__value price-summary__value--total">
                {formatIDR(total)}
              </span>
            </div>
          </>
        ) : (
          <div className="price-summary__quick-info">
            <div className="price-summary__quick-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <span className="price-summary__quick-label">Harga</span>
                <span className="price-summary__quick-value">{formatIDR(price)}</span>
              </div>
            </div>
            <div className="price-summary__progress">
              <div className="price-summary__progress-bar">
                <div
                  className="price-summary__progress-fill"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              <span className="price-summary__progress-text">{formProgress}% Lengkap</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceSummary;

