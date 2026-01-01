/**
 * Customer Addresses Page View
 * Pure presentation component - no business logic
 * OOP-based class component following SOLID principles
 */

import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import "../styles/CustomerAddressesPage.css";
import AddressAutocomplete from "../components/AddressAutocomplete";
import ConfettiEffect from "../components/common/ConfettiEffect";
import EmptyState from "../components/common/EmptyState";
import BackLink from "../components/common/BackLink";
import AlertMessage from "../components/common/AlertMessage";
import FormField from "../components/common/FormField";
import IconButton from "../components/common/IconButton";
import LuxuryButton from "../components/buttons/LuxuryButton";
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
 * Pure presentation class component - receives all data and handlers via props
 * Follows Single Responsibility Principle: only handles UI rendering
 */
class CustomerAddressesPageView extends Component<CustomerAddressesPageViewProps> {
  /**
   * Render loading state
   */
  private renderLoading(): React.ReactNode {
    return (
      <section className="customerAddresses customerAddresses--loading">
        <div className="customerAddresses__loading">
          <div className="customerAddresses__spinner"></div>
          <p>Memuat alamat...</p>
        </div>
      </section>
    );
  }

  /**
   * Render method - Single Responsibility: render UI only
   */
  render(): React.ReactNode {
    const {
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
    } = this.props;

    if (!isAuthenticated) {
      return <Navigate to="/customer/login" replace />;
    }

    if (isLoading) {
      return this.renderLoading();
    }

    return (
    <section className="customerAddresses" aria-labelledby="addresses-title">
      <ConfettiEffect trigger={showConfetti} />
      <div className="customerAddresses__container">
        <div className="customerAddresses__header">
          <BackLink to="/customer/dashboard" className="customerAddresses__back">
            Kembali ke Dashboard
          </BackLink>
          <div className="customerAddresses__titleSection">
            <h1 id="addresses-title" className="customerAddresses__title">Buku Alamat</h1>
            <p className="customerAddresses__subtitle">
              Kelola alamat pengiriman Anda
            </p>
          </div>
          {!showForm && (
            <LuxuryButton
              type="button"
              variant="primary"
              size="md"
              onClick={onShowForm}
              className="customerAddresses__addBtn"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              }
              iconPosition="left"
            >
              Tambah Alamat
            </LuxuryButton>
          )}
        </div>

        {showSuccess && (
          <AlertMessage
            variant="success"
            message={successMessage}
            className="customerAddresses__success"
          />
        )}

        {errors.general && (
          <AlertMessage
            variant="error"
            message={errors.general}
            className="customerAddresses__error"
          />
        )}

        {showForm && (
          <div className="customerAddresses__formCard">
            <h2 className="customerAddresses__formTitle">
              {editingId ? "Edit Alamat" : "Tambah Alamat Baru"}
            </h2>
            <form className="customerAddresses__form" onSubmit={onFormSubmit}>
              <FormField
                label="Label Alamat"
                required
                htmlFor="address-label"
                error={errors.label}
                className="customerAddresses__formGroup"
              >
                <input
                  type="text"
                  id="address-label"
                  className={`customerAddresses__input ${errors.label ? "customerAddresses__input--error" : ""}`}
                  value={formData.label}
                  onChange={(e) => onFormChange("label", e.target.value)}
                  placeholder="Contoh: Rumah, Kantor, Alamat Utama"
                />
              </FormField>

              <FormField
                label="Alamat Lengkap"
                required
                error={errors.address}
                className="customerAddresses__formGroup"
              >
                <AddressAutocomplete
                  value={formData.address}
                  onChange={onAddressChange}
                  placeholder="Masukkan alamat lengkap"
                  error={errors.address}
                />
              </FormField>

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
                <LuxuryButton
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  className={`customerAddresses__saveBtn ${isSaving ? "customerAddresses__saveBtn--loading" : ""}`}
                  disabled={isSaving}
                  icon={
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  }
                  iconPosition="left"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </LuxuryButton>
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
                      <IconButton
                        variant="secondary"
                        size="md"
                        onClick={() => onSetDefault(address._id!)}
                        icon={
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        }
                        ariaLabel="Jadikan default"
                        tooltip="Jadikan default"
                        className="customerAddresses__actionBtn"
                      />
                    )}
                    <IconButton
                      variant="secondary"
                      size="md"
                      onClick={() => onEdit(address)}
                      icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      ariaLabel="Edit"
                      tooltip="Edit"
                      className="customerAddresses__actionBtn"
                    />
                    <IconButton
                      variant="danger"
                      size="md"
                      onClick={() => onDelete(address._id!)}
                      icon={
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      }
                      ariaLabel="Hapus"
                      tooltip="Hapus"
                      className="customerAddresses__actionBtn customerAddresses__actionBtn--danger"
                    />
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
  }
}

export default CustomerAddressesPageView;
