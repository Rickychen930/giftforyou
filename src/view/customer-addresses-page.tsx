/**
 * Customer Addresses Page View
 * Pure presentation component - no business logic
 */

import React from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/CustomerAddressesPage.css";
import AddressAutocomplete from "../components/AddressAutocomplete";
import ConfettiEffect from "../components/ConfettiEffect";
import EmptyState from "../components/EmptyState";
import type {
  Address,
  AddressFormData,
  AddressFormErrors,
} from "../models/customer-addresses-page-model";

interface CustomerAddressesPageViewProps {
  addresses: Address[];
  isLoading: boolean;
  isSaving: boolean;
  isAuthenticated: boolean;
  showForm: boolean;
  editingId: string | null;
  formData: AddressFormData;
  errors: AddressFormErrors;
  showSuccess: boolean;
  successMessage: string;
  showConfetti: boolean;
  onFormChange: (field: keyof AddressFormData, value: string | boolean) => void;
  onAddressChange: (address: string, placeDetails?: {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }) => void;
  onFormSubmit: (e: React.FormEvent) => void;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string) => void;
  onSetDefault: (addressId: string) => void;
  onCancel: () => void;
  onShowForm: () => void;
}

/**
 * Customer Addresses Page View Component
 * Pure presentation - receives all data and handlers via props
 */
const CustomerAddressesPageView: React.FC<CustomerAddressesPageViewProps> = ({
  addresses,
  isLoading,
  isSaving,
  isAuthenticated,
  showForm,
  editingId,
  formData,
  errors,
  showSuccess,
  successMessage,
  showConfetti,
  onFormChange,
  onAddressChange,
  onFormSubmit,
  onEdit,
  onDelete,
  onSetDefault,
  onCancel,
  onShowForm,
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  if (isLoading) {
    return (
      <section className="customerAddresses customerAddresses--loading">
        <div className="customerAddresses__loading">
          <div className="customerAddresses__spinner"></div>
          <p>Memuat alamat...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="customerAddresses" aria-labelledby="addresses-title">
      <ConfettiEffect trigger={showConfetti} />
      <div className="customerAddresses__container">
        <div className="customerAddresses__header">
          <Link to="/customer/dashboard" className="customerAddresses__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="customerAddresses__titleSection">
            <h1 id="addresses-title" className="customerAddresses__title">Buku Alamat</h1>
            <p className="customerAddresses__subtitle">
              Kelola alamat pengiriman Anda
            </p>
          </div>
          {!showForm && (
            <button
              type="button"
              onClick={onShowForm}
              className="customerAddresses__addBtn btn-luxury"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Tambah Alamat</span>
            </button>
          )}
        </div>

        {showSuccess && (
          <div className="customerAddresses__success" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {errors.general && (
          <div className="customerAddresses__error" role="alert">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        {showForm && (
          <div className="customerAddresses__formCard">
            <h2 className="customerAddresses__formTitle">
              {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h2>
            <form className="customerAddresses__form" onSubmit={onFormSubmit}>
              <div className="customerAddresses__formGroup">
                <label className="customerAddresses__label">
                  Label Alamat
                  <span className="customerAddresses__required">*</span>
                </label>
                <input
                  type="text"
                  className={`customerAddresses__input ${errors.label ? "customerAddresses__input--error" : ""}`}
                  value={formData.label}
                  onChange={(e) => onFormChange("label", e.target.value)}
                  placeholder="Contoh: Rumah, Kantor, Alamat Utama"
                  aria-invalid={!!errors.label}
                  aria-describedby={errors.label ? "label-error" : undefined}
                />
                {errors.label && (
                  <span className="customerAddresses__errorText" id="label-error" role="alert">
                    {errors.label}
                  </span>
                )}
              </div>

              <div className="customerAddresses__formGroup">
                <label className="customerAddresses__label">
                  Alamat Lengkap
                  <span className="customerAddresses__required">*</span>
                </label>
                <AddressAutocomplete
                  value={formData.address}
                  onChange={onAddressChange}
                  placeholder="Masukkan alamat lengkap"
                  error={errors.address}
                />
                {errors.address && (
                  <span className="customerAddresses__errorText" role="alert">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="customerAddresses__formGroup">
                <label className="customerAddresses__checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => onFormChange("isDefault", e.target.checked)}
                  />
                  <span>Jadikan sebagai alamat default</span>
                </label>
              </div>

              <div className="customerAddresses__formActions">
                <button
                  type="button"
                  onClick={onCancel}
                  className="customerAddresses__cancelBtn"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`customerAddresses__saveBtn btn-luxury ${isSaving ? "customerAddresses__saveBtn--loading" : ""}`}
                  disabled={isSaving}
                  aria-busy={isSaving}
                >
                  {isSaving ? (
                    <>
                      <svg className="customerAddresses__spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416" opacity="0.3">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="customerAddresses__list">
          {addresses.length === 0 ? (
            <EmptyState
              title="Belum Ada Alamat"
              description="Tambahkan alamat pengiriman untuk mempermudah proses checkout"
              actionLabel="Tambah Alamat Pertama"
              onAction={onShowForm}
              icon={
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                </svg>
              }
            />
          ) : (
            addresses.map((address) => (
              <div key={address._id} className={`customerAddresses__card ${address.isDefault ? "customerAddresses__card--default" : ""}`}>
                <div className="customerAddresses__cardHeader">
                  <div className="customerAddresses__cardTitle">
                    <h3>{address.label}</h3>
                    {address.isDefault && (
                      <span className="customerAddresses__defaultBadge">Default</span>
                    )}
                  </div>
                  <div className="customerAddresses__cardActions">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => onSetDefault(address._id!)}
                        className="customerAddresses__actionBtn"
                        title="Jadikan default"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEdit(address)}
                      className="customerAddresses__actionBtn"
                      title="Edit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(address._id!)}
                      className="customerAddresses__actionBtn customerAddresses__actionBtn--danger"
                      title="Hapus"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="customerAddresses__cardAddress">{address.address}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default CustomerAddressesPageView;
