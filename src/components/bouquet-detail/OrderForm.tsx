import React from "react";
import "../../styles/bouquet-detail/OrderForm.css";

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

const OrderForm: React.FC<OrderFormProps> = ({
  formData,
  errors,
  onFormChange,
  onAddressChange,
  getDefaultDate,
}) => {
  return (
    <div className="order-form">
      <h2 className="order-form__title">Form Pemesanan</h2>

      {/* Delivery Type */}
      <div className="order-form__group">
        <label className="order-form__label">
          Tipe Pengiriman <span className="order-form__required">*</span>
        </label>
        <div className="order-form__radio-group">
          <label className="order-form__radio">
            <input
              type="radio"
              id="order-delivery-type-delivery"
              name="deliveryType"
              value="delivery"
              checked={formData.deliveryType === "delivery"}
              onChange={(e) => onFormChange("deliveryType", e.target.value)}
            />
            <span className="order-form__radio-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Diantar
            </span>
          </label>
          <label className="order-form__radio">
            <input
              type="radio"
              id="order-delivery-type-pickup"
              name="deliveryType"
              value="pickup"
              checked={formData.deliveryType === "pickup"}
              onChange={(e) => onFormChange("deliveryType", e.target.value)}
            />
            <span className="order-form__radio-label">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ambil di Toko
            </span>
          </label>
        </div>
      </div>

      {/* Delivery Date */}
      <div className="order-form__group">
        <label htmlFor="delivery-date" className="order-form__label">
          {formData.deliveryType === "delivery" ? "Tanggal Pengiriman" : "Tanggal Pengambilan"} <span className="order-form__required">*</span>
        </label>
        <input
          id="delivery-date"
          name="deliveryDate"
          type="date"
          className={`order-form__input ${errors.deliveryDate ? "order-form__input--error" : ""}`}
          value={formData.deliveryDate}
          min={getDefaultDate()}
          onChange={(e) => onFormChange("deliveryDate", e.target.value)}
          aria-invalid={!!errors.deliveryDate}
        />
        {errors.deliveryDate && (
          <span className="order-form__error" role="alert">{errors.deliveryDate}</span>
        )}
      </div>

      {/* Delivery Time */}
      {formData.deliveryDate && (
        <div className="order-form__group">
          <label htmlFor="delivery-time" className="order-form__label">
            {formData.deliveryType === "delivery" ? "Waktu Pengiriman" : "Waktu Pengambilan"} (Opsional)
          </label>
          <input
            id="delivery-time"
            name="deliveryTimeSlot"
            type="time"
            className="order-form__input"
            value={formData.deliveryTimeSlot || ""}
            onChange={(e) => onFormChange("deliveryTimeSlot", e.target.value)}
          />
        </div>
      )}

      {/* Address - Only for delivery */}
      {formData.deliveryType === "delivery" && (
        <div className="order-form__group">
          <label htmlFor="address" className="order-form__label">
            Alamat Pengiriman <span className="order-form__required">*</span>
          </label>
          <textarea
            id="address"
            className={`order-form__input order-form__textarea ${errors.address ? "order-form__input--error" : ""}`}
            rows={3}
            value={formData.address}
            onChange={onAddressChange}
            placeholder="Masukkan alamat lengkap (contoh: Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan, Kota, Kode Pos)"
            aria-invalid={!!errors.address}
          />
          {errors.address && (
            <span className="order-form__error" role="alert">{errors.address}</span>
          )}
        </div>
      )}

      {/* Quantity */}
      <div className="order-form__group">
        <label htmlFor="quantity" className="order-form__label">
          Jumlah <span className="order-form__required">*</span>
        </label>
        <div className="order-form__quantity">
          <button
            type="button"
            className="order-form__quantity-btn"
            onClick={() => {
              if (formData.quantity > 1) {
                onFormChange("quantity", formData.quantity - 1);
              }
            }}
            disabled={formData.quantity <= 1}
            aria-label="Kurangi jumlah"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <input
            id="quantity"
            name="quantity"
            type="number"
            className="order-form__quantity-input"
            min="1"
            max="99"
            value={formData.quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10) || 1;
              onFormChange("quantity", Math.max(1, Math.min(99, val)));
            }}
            aria-invalid={!!errors.quantity}
          />
          <button
            type="button"
            className="order-form__quantity-btn"
            onClick={() => {
              if (formData.quantity < 99) {
                onFormChange("quantity", formData.quantity + 1);
              }
            }}
            disabled={formData.quantity >= 99}
            aria-label="Tambah jumlah"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {errors.quantity && (
          <span className="order-form__error" role="alert">{errors.quantity}</span>
        )}
      </div>

      {/* Greeting Card */}
      <div className="order-form__group">
        <label htmlFor="greeting-card" className="order-form__label">
          Kartu Ucapan (Opsional)
        </label>
        <textarea
          id="greeting-card"
          className="order-form__input order-form__textarea"
          rows={3}
          value={formData.greetingCard}
          onChange={(e) => onFormChange("greetingCard", e.target.value)}
          placeholder="Tulis pesan untuk kartu ucapan..."
          maxLength={200}
        />
        <div className="order-form__hint">
          {formData.greetingCard.length}/200 karakter
        </div>
      </div>
    </div>
  );
};

export default OrderForm;

