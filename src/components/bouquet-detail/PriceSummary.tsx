/**
 * Price Summary Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
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

interface PriceSummaryState {
  // No state needed, but keeping for consistency
}

/**
 * Price Summary Component
 * Class-based component for price summary
 */
class PriceSummary extends Component<PriceSummaryProps, PriceSummaryState> {
  private baseClass: string = "price-summary";

  private calculateTotals(): {
    bulkDiscount: ReturnType<typeof calculateBulkDiscount>;
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
  } {
    const { price, formData } = this.props;
    const bulkDiscount = calculateBulkDiscount(price, formData.quantity);
    const subtotal = bulkDiscount.originalPrice;
    const discount = bulkDiscount.discountAmount;
    const delivery = 0; // Will be calculated by admin
    const total = bulkDiscount.finalPrice + delivery;

    return { bulkDiscount, subtotal, discount, delivery, total };
  }

  render(): React.ReactNode {
    const { bouquetName, formData, isFormValid, formProgress } = this.props;
    const { bulkDiscount, subtotal, discount, total } = this.calculateTotals();

    return (
      <div className={this.baseClass}>
        <div className={`${this.baseClass}__header`}>
          <h3 className={`${this.baseClass}__title`}>
            {isFormValid ? "Ringkasan Pesanan" : "Info Cepat"}
          </h3>
        </div>

        <div className={`${this.baseClass}__content`}>
          {isFormValid ? (
            <>
              <div className={`${this.baseClass}__item`}>
                <span className={`${this.baseClass}__label`}>Produk</span>
                <span className={`${this.baseClass}__value`}>{formatBouquetName(bouquetName)}</span>
              </div>
              <div className={`${this.baseClass}__item`}>
                <span className={`${this.baseClass}__label`}>Jumlah</span>
                <span className={`${this.baseClass}__value`}>{formData.quantity} pcs</span>
              </div>
              <div className={`${this.baseClass}__item ${this.baseClass}__item--breakdown`}>
                <span className={`${this.baseClass}__label`}>Subtotal</span>
                <span className={`${this.baseClass}__value`}>{formatIDR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className={`${this.baseClass}__item ${this.baseClass}__item--discount`}>
                  <span className={`${this.baseClass}__label`}>
                    Diskon ({bulkDiscount.discountPercentage}%)
                  </span>
                  <span className={`${this.baseClass}__value ${this.baseClass}__value--discount`}>
                    -{formatIDR(discount)}
                  </span>
                </div>
              )}
              {formData.deliveryType === "delivery" && (
                <div className={`${this.baseClass}__item ${this.baseClass}__item--breakdown`}>
                  <span className={`${this.baseClass}__label`}>Ongkir</span>
                  <span className={`${this.baseClass}__value`}>Akan dihitung</span>
                </div>
              )}
              <div className={`${this.baseClass}__item ${this.baseClass}__item--total`}>
                <span className={`${this.baseClass}__label`}>Total</span>
                <span className={`${this.baseClass}__value ${this.baseClass}__value--total`}>
                  {formatIDR(total)}
                </span>
              </div>
            </>
          ) : (
            <div className={`${this.baseClass}__quick-info`}>
              <div className={`${this.baseClass}__quick-item`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div>
                  <span className={`${this.baseClass}__quick-label`}>Harga</span>
                  <span className={`${this.baseClass}__quick-value`}>
                    {formatIDR(this.props.price)}
                  </span>
                </div>
              </div>
              <div className={`${this.baseClass}__progress`}>
                <div className={`${this.baseClass}__progress-bar`}>
                  <div
                    className={`${this.baseClass}__progress-fill`}
                    style={{ width: `${formProgress}%` }}
                  />
                </div>
                <span className={`${this.baseClass}__progress-text`}>
                  {formProgress}% Lengkap
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PriceSummary;
