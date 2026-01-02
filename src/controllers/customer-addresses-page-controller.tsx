/**
 * Customer Addresses Page Controller
 * OOP-based controller for managing customer addresses page state and operations
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { API_BASE } from "../config/api";
import { getAccessToken, clearAuth } from "../utils/auth-utils";
import { toast } from "../utils/toast";
import {
  type AddressesPageState,
  type Address,
  type AddressFormErrors,
  INITIAL_ADDRESSES_PAGE_STATE,
  INITIAL_ADDRESS_FORM_DATA,
  DEFAULT_ADDRESSES_PAGE_SEO,
} from "../models/customer-addresses-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState, type SeoConfig } from "./base/BaseController";
import CustomerAddressesPageView from "../view/customer-addresses-page";

interface CustomerAddressesPageControllerProps extends BaseControllerProps {
  // Add any props if needed in the future
}

/**
 * Customer Addresses Page Controller Class
 * Manages all business logic, form validation, and address operations
 * Extends BaseController to avoid code duplication
 */
export class CustomerAddressesPageController extends BaseController<
  CustomerAddressesPageControllerProps,
  AddressesPageState & BaseControllerState
> {
  private confettiTimeout: NodeJS.Timeout | null = null;

  constructor(props: CustomerAddressesPageControllerProps) {
    const seoConfig: SeoConfig = {
      defaultSeo: DEFAULT_ADDRESSES_PAGE_SEO,
    };

    super(props, seoConfig);

    this.state = {
      ...this.state,
      ...INITIAL_ADDRESSES_PAGE_STATE,
    };
  }

  /**
   * Load addresses
   */
  private loadAddresses = async (): Promise<void> => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await this.safeFetch(`${API_BASE}/api/customer/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.ok) {
        const text = await response.text();
        const data = this.safeJsonParse<{ addresses?: Address[] }>(text, { addresses: [] });
        this.setState({
          addresses: data.addresses || [],
          isLoading: false,
        });
      } else if (response && response.status === 401) {
        clearAuth();
        this.setState({ isAuthenticated: false, isLoading: false });
      } else {
        this.setState({
          errors: { general: "Gagal memuat alamat" },
          isLoading: false,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load addresses:", error);
      }
      this.setState({
        errors: { general: "Terjadi kesalahan saat memuat alamat" },
        isLoading: false,
      });
    }
  };

  /**
   * Validate form
   */
  private validateForm(): boolean {
    const errors: AddressFormErrors = {};
    const { formData } = this.state;

    if (!formData.label.trim()) {
      errors.label = "Label alamat wajib diisi";
    } else if (formData.label.trim().length < 2) {
      errors.label = "Label minimal 2 karakter";
    }

    if (!formData.address.trim()) {
      errors.address = "Alamat wajib diisi";
    } else if (formData.address.trim().length < 10) {
      errors.address = "Alamat minimal 10 karakter";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  /**
   * Handle form field change
   */
  handleChange = (field: keyof AddressesPageState["formData"], value: string | boolean): void => {
    this.setState((prevState) => ({
      formData: {
        ...prevState.formData,
        [field]: value,
      },
      errors: {
        ...prevState.errors,
        [field]: undefined,
        general: undefined,
      },
      showSuccess: false,
    }));
  };

  /**
   * Handle address change
   */
  handleAddressChange = (address: string, placeDetails?: {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }): void => {
    this.handleChange("address", address);
  };

  /**
   * Handle form submission
   */
  handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setState({ isSaving: true, errors: {}, showSuccess: false });

    const token = getAccessToken();
    if (!token) {
      this.setState({
        errors: { general: "Tidak terautentikasi" },
        isSaving: false,
      });
      return;
    }

    try {
      const url = this.state.editingId
        ? `${API_BASE}/api/customer/addresses/${this.state.editingId}`
        : `${API_BASE}/api/customer/addresses`;

      const method = this.state.editingId ? "PATCH" : "POST";

      const response = await this.safeFetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(this.state.formData),
      });

      if (!response) {
        this.setState({
          errors: { general: "Gagal menyimpan alamat" },
          isSaving: false,
        });
        return;
      }

      const text = await response.text();
      const data = this.safeJsonParse<any>(text, {});

      if (!response.ok) {
        this.setState({
          errors: {
            general: data.error || "Gagal menyimpan alamat",
          },
          isSaving: false,
        });
        return;
      }

      const message = this.state.editingId ? "Alamat berhasil diperbarui!" : "Alamat berhasil ditambahkan!";

      this.setState({
        showSuccess: true,
        successMessage: message,
        isSaving: false,
        showForm: false,
        editingId: null,
        showConfetti: true,
        formData: { ...INITIAL_ADDRESS_FORM_DATA },
      });

      toast.success(message);

      // Reload addresses
      await this.loadAddresses();

      // Hide success message and confetti after 3 seconds
      if (this.confettiTimeout) {
        clearTimeout(this.confettiTimeout);
      }
      this.confettiTimeout = setTimeout(() => {
        this.setState({ showSuccess: false, showConfetti: false });
        this.confettiTimeout = null;
      }, 3000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to save address:", error);
      }
      this.setState({
        errors: {
          general: "Terjadi kesalahan. Silakan coba lagi nanti.",
        },
        isSaving: false,
      });
    }
  };

  /**
   * Handle edit address
   */
  handleEdit = (address: Address): void => {
    this.setState({
      editingId: address._id || null,
      formData: {
        label: address.label,
        address: address.address,
        isDefault: address.isDefault,
      },
      showForm: true,
      errors: {},
      showSuccess: false,
    });
  };

  /**
   * Handle delete address
   */
  handleDelete = async (addressId: string): Promise<void> => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await this.safeFetch(`${API_BASE}/api/customer/addresses/${addressId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.ok) {
        toast.success("Alamat berhasil dihapus!");
        await this.loadAddresses();
      } else {
        const text = response ? await response.text() : "";
        const data = this.safeJsonParse<{ error?: string }>(text, {});
        this.setState({
          errors: {
            general: data.error || "Gagal menghapus alamat",
          },
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to delete address:", error);
      }
      this.setState({
        errors: {
          general: "Terjadi kesalahan saat menghapus alamat",
        },
      });
    }
  };

  /**
   * Handle set default address
   */
  handleSetDefault = async (addressId: string): Promise<void> => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const response = await this.safeFetch(`${API_BASE}/api/customer/addresses/${addressId}/set-default`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.ok) {
        toast.success("Alamat default berhasil diubah!");
        await this.loadAddresses();
      } else {
        const text = response ? await response.text() : "";
        const data = this.safeJsonParse<{ error?: string }>(text, {});
        this.setState({
          errors: {
            general: data.error || "Gagal mengubah alamat default",
          },
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to set default address:", error);
      }
      this.setState({
        errors: {
          general: "Terjadi kesalahan saat mengubah alamat default",
        },
      });
    }
  };

  /**
   * Handle cancel form
   */
  handleCancel = (): void => {
    this.setState({
      showForm: false,
      editingId: null,
      formData: { ...INITIAL_ADDRESS_FORM_DATA },
      errors: {},
    });
  };

  /**
   * Handle show form
   */
  handleShowForm = (): void => {
    this.setState({
      showForm: true,
      editingId: null,
      formData: { ...INITIAL_ADDRESS_FORM_DATA },
      errors: {},
    });
  };

  /**
   * Component lifecycle: Mount
   */
  /**
   * Component lifecycle: Mount
   * BaseController handles SEO initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo({ top: 0, behavior: "smooth" });

    const token = getAccessToken();
    if (!token) {
      this.setState({ isAuthenticated: false, isLoading: false });
      return;
    }

    this.setState({ isAuthenticated: true });
    this.loadAddresses();
  }

  /**
   * Component lifecycle: Unmount
   * BaseController handles cleanup
   */
  componentWillUnmount(): void {
    super.componentWillUnmount();
    if (this.confettiTimeout) {
      clearTimeout(this.confettiTimeout);
    }
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    return (
      <CustomerAddressesPageView
        addresses={this.state.addresses}
        isLoading={this.state.isLoading}
        isSaving={this.state.isSaving}
        isAuthenticated={this.state.isAuthenticated}
        showForm={this.state.showForm}
        editingId={this.state.editingId}
        formData={this.state.formData}
        errors={this.state.errors}
        showSuccess={this.state.showSuccess}
        successMessage={this.state.successMessage}
        showConfetti={this.state.showConfetti}
        onFormChange={this.handleChange}
        onAddressChange={this.handleAddressChange}
        onFormSubmit={this.handleSubmit}
        onEdit={this.handleEdit}
        onDelete={this.handleDelete}
        onSetDefault={this.handleSetDefault}
        onCancel={this.handleCancel}
        onShowForm={this.handleShowForm}
      />
    );
  }
}

export default CustomerAddressesPageController;

