/**
 * Order Form Component (OOP)
 * Class-based component following SOLID principles
 */

import React, { Component } from "react";
import "../../styles/bouquet-detail/OrderForm.css";
import DeliveryTimeSlot from "../common/DeliveryTimeSlot";

export interface OrderFormData {
  deliveryType: "pickup" | "delivery";
  deliveryDate: string;
  deliveryTimeSlot?: string;
  address: string;
  greetingCard: string;
  quantity: number;
}

interface OrderFormProps {
  formData: OrderFormData;
  errors: Partial<Record<keyof OrderFormData, string>>;
  onFormChange: (field: keyof OrderFormData, value: string | number) => void;
  onAddressChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  getDefaultDate: () => string;
}

interface OrderFormState {
  // No state needed, but keeping for consistency
}

/**
 * Order Form Component
 * Class-based component for order form
 */
class OrderForm extends Component<OrderFormProps, OrderFormState> {
  private baseClass: string = "order-form";

  private handleFormChange = (field: keyof OrderFormData, value: string | number): void => {
    this.props.onFormChange(field, value);
  };

  private handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    this.props.onAddressChange(e);
  };

  private handleTimeSlotChange = (timeSlot: string): void => {
    this.handleFormChange("deliveryTimeSlot", timeSlot);
  };

  render(): React.ReactNode {
    const { formData, errors, getDefaultDate } = this.props;

    return (
      <div className={this.baseClass}>
        <h2 className={`${this.baseClass}__title`}>Form Pemesanan</h2>

        {/* Delivery Type */}
        <div className={`${this.baseClass}__group`}>
          <label className={`${this.baseClass}__label`}>
            Tipe Pengiriman <span className={`${this.baseClass}__required`}>*</span>
          </label>
          <div className={`${this.baseClass}__radio-group`}>
            <label className={`${this.baseClass}__radio`}>
              <input
                type="radio"
                name="deliveryType"
                value="delivery"
                checked={formData.deliveryType === "delivery"}
                onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
              />
              <span className={`${this.baseClass}__radio-label`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Diantar
              </span>
            </label>
            <label className={`${this.baseClass}__radio`}>
              <input
                type="radio"
                name="deliveryType"
                value="pickup"
                checked={formData.deliveryType === "pickup"}
                onChange={(e) => this.handleFormChange("deliveryType", e.target.value)}
              />
              <span className={`${this.baseClass}__radio-label`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Ambil di Toko
              </span>
            </label>
          </div>
        </div>

        {/* Delivery Date */}
        <div className={`${this.baseClass}__group`}>
          <label htmlFor="delivery-date" className={`${this.baseClass}__label`}>
            {formData.deliveryType === "delivery" ? "Tanggal Pengiriman" : "Tanggal Pengambilan"}{" "}
            <span className={`${this.baseClass}__required`}>*</span>
          </label>
          <input
            id="delivery-date"
            type="date"
            className={`${this.baseClass}__input ${errors.deliveryDate ? `${this.baseClass}__input--error` : ""}`}
            value={formData.deliveryDate}
            min={getDefaultDate()}
            onChange={(e) => this.handleFormChange("deliveryDate", e.target.value)}
            aria-invalid={!!errors.deliveryDate}
          />
          {errors.deliveryDate && (
            <span className={`${this.baseClass}__error`} role="alert">
              {errors.deliveryDate}
            </span>
          )}
        </div>

        {/* Delivery Time Slot */}
        {formData.deliveryDate && formData.deliveryType === "delivery" && (
          <div className={`${this.baseClass}__group`}>
            <label className={`${this.baseClass}__label`}>
              Waktu Pengiriman <span className={`${this.baseClass}__required`}>*</span>
            </label>
            <DeliveryTimeSlot
              selectedDate={formData.deliveryDate}
              selectedSlot={formData.deliveryTimeSlot}
              onSelect={this.handleTimeSlotChange}
            />
            {errors.deliveryTimeSlot && (
              <span className={`${this.baseClass}__error`} role="alert">
                {errors.deliveryTimeSlot}
              </span>
            )}
          </div>
        )}

        {/* Pickup Time */}
        {formData.deliveryDate && formData.deliveryType === "pickup" && (
          <div className={`${this.baseClass}__group`}>
            <label htmlFor="delivery-time" className={`${this.baseClass}__label`}>
              Waktu Pengambilan (Opsional)
            </label>
            <input
              id="delivery-time"
              type="time"
              className={`${this.baseClass}__input`}
              value={formData.deliveryTimeSlot || ""}
              onChange={(e) => this.handleFormChange("deliveryTimeSlot", e.target.value)}
            />
          </div>
        )}

        {/* Address */}
        {formData.deliveryType === "delivery" && (
          <div className={`${this.baseClass}__group`}>
            <label htmlFor="address" className={`${this.baseClass}__label`}>
              Alamat Pengiriman <span className={`${this.baseClass}__required`}>*</span>
            </label>
            <textarea
              id="address"
              className={`${this.baseClass}__textarea ${errors.address ? `${this.baseClass}__textarea--error` : ""}`}
              value={formData.address}
              onChange={this.handleAddressChange}
              rows={4}
              placeholder="Masukkan alamat lengkap pengiriman"
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <span className={`${this.baseClass}__error`} role="alert">
                {errors.address}
              </span>
            )}
          </div>
        )}

        {/* Greeting Card */}
        <div className={`${this.baseClass}__group`}>
          <label htmlFor="greeting-card" className={`${this.baseClass}__label`}>
            Kartu Ucapan (Opsional)
          </label>
          <textarea
            id="greeting-card"
            className={`${this.baseClass}__textarea`}
            value={formData.greetingCard}
            onChange={(e) => this.handleFormChange("greetingCard", e.target.value)}
            rows={3}
            placeholder="Tuliskan pesan untuk kartu ucapan..."
            maxLength={200}
          />
          <div className={`${this.baseClass}__hint`}>
            {formData.greetingCard.length}/200 karakter
          </div>
        </div>

        {/* Quantity */}
        <div className={`${this.baseClass}__group`}>
          <label htmlFor="quantity" className={`${this.baseClass}__label`}>
            Jumlah <span className={`${this.baseClass}__required`}>*</span>
          </label>
          <input
            id="quantity"
            type="number"
            className={`${this.baseClass}__input ${errors.quantity ? `${this.baseClass}__input--error` : ""}`}
            value={formData.quantity}
            min={1}
            max={100}
            onChange={(e) => this.handleFormChange("quantity", parseInt(e.target.value, 10) || 1)}
            aria-invalid={!!errors.quantity}
          />
          {errors.quantity && (
            <span className={`${this.baseClass}__error`} role="alert">
              {errors.quantity}
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default OrderForm;
