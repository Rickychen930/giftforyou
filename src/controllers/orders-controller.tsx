// src/controllers/orders-controller.tsx
// Controller for orders section
// Manages state and event handlers following MVC pattern

import React, { Component } from "react";
import { API_BASE } from "../config/api";
import { getAuthHeaders } from "../utils/auth-utils";
import type { Bouquet } from "../models/domain/bouquet";
import {
  type Order,
  type Customer,
  type BouquetOption,
  type OrderStats,
  type DerivedNumbers,
  type OrderStatus,
  type PaymentStatus,
  type PaymentMethod,
  calculateDerivedNumbers,
  calculateOrderStats,
  filterAndSortOrders,
  nextOrderStatus,
  applyPaymentPreset,
  applyDeliveryPreset,
  applyDeliveryQuick,
  buildWaMessage,
  buildOrderSummary,
  exportOrdersToCSV,
  formatIDR,
  toDateTimeLocalValue,
  normalizePhone,
  toWaPhone,
  formatDateTime,
  formatShortDateTime,
  calculateOrderTotal,
  calculateOrderRemaining,
  isOrderOverdue,
} from "../models/orders-model";

export type OrdersMode = "list" | "add_order" | "update_order" | "add_user";

interface Props {
  bouquets: Bouquet[];
}

interface State {
  // Data
  orders: Order[];
  customers: Customer[];
  bouquetOptions: BouquetOption[];

  // UI State
  loading: boolean;
  submitting: boolean;
  customerSubmitting: boolean;
  error: string;
  success: string;
  copyFeedback: string;

  // Mode
  mode: OrdersMode;
  showInvoice: boolean;
  invoiceOrder: Order | null;

  // Form State
  buyerName: string;
  phoneNumber: string;
  address: string;
  bouquetId: string;
  deliveryAt: string;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  downPaymentAmount: string;
  additionalPayment: string;
  deliveryPrice: string;

  // Edit State
  editingId: string;
  selectedCustomerId: string;

  // Search & Filter
  listQuery: string;
  debouncedListQuery: string;
  filterOrderStatus: OrderStatus | "all";
  filterPaymentStatus: PaymentStatus | "all";
  sortBy: "date" | "name" | "amount" | "status";
  sortDirection: "asc" | "desc";

  // Customer Management
  customerSearch: string;
  showInlineAddUser: boolean;
  newCustomerName: string;
  newCustomerPhone: string;
  newCustomerAddress: string;

  // Bulk Operations
  selectedOrders: Set<string>;
  bulkActionMode: "none" | "status" | "export" | "delete";
  bulkStatusValue: OrderStatus;

  // Computed
  filteredAndSortedOrders: Order[];
  orderStats: OrderStats;
  derivedNumbers: DerivedNumbers;
  selectedCustomer?: Customer;
  selectedBouquetName: string;
  selectedBouquetPrice: number;
  editingOrder?: Order;
  bouquetPriceForCalc: number;
  buyerFieldsLocked: boolean;
  buyerFieldsDisabled: boolean;
  showOrderDetails: boolean;
  isFormOpen: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Controller for Orders Section
 * Manages all state and business logic
 */
export class OrdersController extends Component<Props, State> {
  private customerSearchRef = React.createRef<HTMLInputElement>();
  private orderDetailsRef = React.createRef<HTMLDivElement>();
  private bouquetSelectRef = React.createRef<HTMLSelectElement>();
  private drawerRef = React.createRef<HTMLDivElement>();
  private drawerCloseBtnRef = React.createRef<HTMLButtonElement>();
  private loadedCustomerIdsRef = React.createRef<Set<string>>(new Set());
  private debounceTimer: NodeJS.Timeout | null = null;
  private copyFeedbackTimer: NodeJS.Timeout | null = null;
  private componentMounted = false;

  constructor(props: Props) {
    super(props);
    this.state = {
      orders: [],
      customers: [],
      bouquetOptions: this.buildBouquetOptions(props.bouquets),
      loading: true,
      submitting: false,
      customerSubmitting: false,
      error: "",
      success: "",
      copyFeedback: "",
      mode: "list",
      showInvoice: false,
      invoiceOrder: null,
      buyerName: "",
      phoneNumber: "",
      address: "",
      bouquetId: "",
      deliveryAt: "",
      orderStatus: "bertanya",
      paymentMethod: "",
      downPaymentAmount: "",
      additionalPayment: "",
      deliveryPrice: "",
      editingId: "",
      selectedCustomerId: "",
      listQuery: "",
      debouncedListQuery: "",
      filterOrderStatus: "all",
      filterPaymentStatus: "all",
      sortBy: "date",
      sortDirection: "desc",
      customerSearch: "",
      showInlineAddUser: false,
      newCustomerName: "",
      newCustomerPhone: "",
      newCustomerAddress: "",
      selectedOrders: new Set(),
      bulkActionMode: "none",
      bulkStatusValue: "bertanya",
      filteredAndSortedOrders: [],
      orderStats: {
        total: 0,
        byStatus: {
          bertanya: 0,
          memesan: 0,
          sedang_diproses: 0,
          menunggu_driver: 0,
          pengantaran: 0,
          terkirim: 0,
        },
        byPayment: {
          belum_bayar: 0,
          dp: 0,
          sudah_bayar: 0,
        },
        overdue: 0,
        totalRevenue: 0,
        paidRevenue: 0,
        pendingRevenue: 0,
      },
      derivedNumbers: {
        dp: 0,
        addPay: 0,
        delivery: 0,
        total: 0,
        paid: 0,
        remaining: 0,
        derivedPaymentStatus: "belum_bayar",
      },
      selectedBouquetName: "",
      selectedBouquetPrice: 0,
      bouquetPriceForCalc: 0,
      buyerFieldsLocked: false,
      buyerFieldsDisabled: false,
      showOrderDetails: false,
      isFormOpen: false,
      prefersReducedMotion: false,
    };
  }

  componentDidMount(): void {
    this.componentMounted = true;
    this.updatePrefersReducedMotion();
    this.loadOrders();

    // Load customers when in add_order mode
    if (this.state.mode === "add_order" && this.state.customers.length === 0) {
      this.loadCustomers();
    }

    // Set up keyboard shortcuts for drawer
    window.addEventListener("keydown", this.handleGlobalKeyDown);
  }

  componentWillUnmount(): void {
    this.componentMounted = false;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    if (this.copyFeedbackTimer) {
      clearTimeout(this.copyFeedbackTimer);
    }
    window.removeEventListener("keydown", this.handleGlobalKeyDown);
    
    // Restore body overflow
    document.body.style.overflow = "";
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    // Update bouquet options if bouquets change
    if (prevProps.bouquets !== this.props.bouquets) {
      this.setState({
        bouquetOptions: this.buildBouquetOptions(this.props.bouquets),
      });
    }

    // Set default bouquet if none selected
    if (!this.state.bouquetId && this.state.bouquetOptions.length > 0) {
      this.setState({ bouquetId: this.state.bouquetOptions[0].id });
    }

    // Debounce search query
    if (prevState.listQuery !== this.state.listQuery) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => {
        if (this.componentMounted) {
          this.setState({ debouncedListQuery: this.state.listQuery });
        }
      }, 300);
    }

    // Clear copy feedback after 2 seconds
    if (prevState.copyFeedback !== this.state.copyFeedback && this.state.copyFeedback) {
      if (this.copyFeedbackTimer) {
        clearTimeout(this.copyFeedbackTimer);
      }
      this.copyFeedbackTimer = setTimeout(() => {
        if (this.componentMounted) {
          this.setState({ copyFeedback: "" });
        }
      }, 2000);
    }

    // Handle mode changes
    if (prevState.mode !== this.state.mode) {
      if (this.state.mode === "add_order") {
        // Focus customer search when entering add_order mode
        setTimeout(() => {
          this.customerSearchRef.current?.focus();
        }, 0);
        if (this.state.customers.length === 0) {
          this.loadCustomers();
        }
      } else if (this.state.mode === "update_order") {
        // Load customers if needed
        if (this.state.customers.length === 0) {
          this.loadCustomers();
        }
        // Load customer by ID if needed
        if (
          this.state.selectedCustomerId &&
          !this.state.customers.some(
            (c) => (c._id ?? "").toString() === this.state.selectedCustomerId
          )
        ) {
          this.loadCustomerById(this.state.selectedCustomerId);
        }
      }
    }

    // Handle selected customer changes
    if (prevState.selectedCustomerId !== this.state.selectedCustomerId) {
      if (this.state.selectedCustomerId && this.state.selectedCustomer) {
        this.setState({
          buyerName: (this.state.selectedCustomer.buyerName ?? "").toString(),
          phoneNumber: (this.state.selectedCustomer.phoneNumber ?? "").toString(),
          address: (this.state.selectedCustomer.address ?? "").toString(),
        });
      }
    }

    // Handle form open/close
    if (prevState.isFormOpen !== this.state.isFormOpen) {
      if (this.state.isFormOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }

    // Update computed values
    this.updateComputedValues();
  }

  // ==================== Keyboard Handlers ====================
  handleGlobalKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.state.isFormOpen) {
      e.preventDefault();
      this.closeDrawer();
    }
  };

  handleDrawerKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key !== "Tab") return;
    const root = this.drawerRef.current;
    if (!root) return;

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      const disabled = (el as any).disabled === true;
      if (disabled) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });

    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (!active || active === first || !root.contains(active)) {
        e.preventDefault();
        last.focus();
      }
      return;
    }

    if (!active || active === last || !root.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  };

  // ==================== Utility Methods ====================
  private buildBouquetOptions(bouquets: Bouquet[]): BouquetOption[] {
    return (bouquets ?? [])
      .map((b) => ({
        id: (b._id ?? "").toString(),
        name: (b.name ?? "").toString().trim(),
        price: typeof b.price === "number" ? b.price : 0,
      }))
      .filter((b) => b.id && b.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private updatePrefersReducedMotion(): void {
    try {
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia
          ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
          : false;
      this.setState({ prefersReducedMotion });
    } catch {
      this.setState({ prefersReducedMotion: false });
    }
  }

  private updateComputedValues(): void {
    const {
      orders,
      debouncedListQuery,
      filterOrderStatus,
      filterPaymentStatus,
      sortBy,
      sortDirection,
      bouquetId,
      bouquetOptions,
      editingId,
      orders: allOrders,
      downPaymentAmount,
      additionalPayment,
      deliveryPrice,
      selectedCustomerId,
      customers,
      mode,
    } = this.state;

    // Filter and sort orders
    const filteredAndSortedOrders = filterAndSortOrders(
      orders,
      debouncedListQuery,
      filterOrderStatus,
      filterPaymentStatus,
      sortBy,
      sortDirection
    );

    // Calculate order stats
    const orderStats = calculateOrderStats(allOrders);

    // Selected customer
    const selectedCustomer = selectedCustomerId
      ? customers.find((x) => (x._id ?? "").toString() === selectedCustomerId)
      : undefined;

    // Selected bouquet
    const selectedBouquet = bouquetOptions.find((b) => b.id === bouquetId);
    const selectedBouquetName = selectedBouquet?.name ?? "";
    const selectedBouquetPrice = selectedBouquet?.price ?? 0;

    // Editing order
    const editingOrder = editingId
      ? allOrders.find((o) => o._id === editingId)
      : undefined;

    // Bouquet price for calculation
    let bouquetPriceForCalc = selectedBouquetPrice;
    if (editingOrder && bouquetId && editingOrder.bouquetId === bouquetId) {
      const snap = editingOrder.bouquetPrice;
      bouquetPriceForCalc =
        typeof snap === "number" && Number.isFinite(snap)
          ? Math.max(0, Math.round(snap))
          : 0;
    }

    // Derived numbers
    const derivedNumbers = calculateDerivedNumbers(
      bouquetPriceForCalc,
      downPaymentAmount,
      additionalPayment,
      deliveryPrice
    );

    // Buyer fields
    const buyerFieldsLocked = Boolean(selectedCustomerId);
    const buyerFieldsDisabled = mode === "add_order" && !selectedCustomerId;
    const showOrderDetails = mode === "update_order" || Boolean(selectedCustomerId);
    const isFormOpen = mode === "add_order" || mode === "update_order";

    this.setState({
      filteredAndSortedOrders,
      orderStats,
      selectedCustomer,
      selectedBouquetName,
      selectedBouquetPrice,
      editingOrder,
      bouquetPriceForCalc,
      derivedNumbers,
      buyerFieldsLocked,
      buyerFieldsDisabled,
      showOrderDetails,
      isFormOpen,
    });
  }

  // ==================== API Methods ====================
  loadOrders = async (): Promise<void> => {
    this.setState({ loading: true, error: "" });
    try {
      const res = await fetch(`${API_BASE}/api/orders?limit=500`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Gagal memuat order (${res.status})`;
        try {
          if (
            responseText.includes("<!DOCTYPE html>") ||
            responseText.includes("<html")
          ) {
            errorMessage =
              "Endpoint /api/orders tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
          } else {
            try {
              const json = JSON.parse(responseText);
              errorMessage = json.message || json.error || errorMessage;
            } catch {
              errorMessage = responseText || errorMessage;
            }
          }
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      let data: unknown;
      try {
        data = responseText.trim() ? JSON.parse(responseText) : [];
      } catch (parseErr) {
        throw new Error(
          `Failed to parse orders response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`
        );
      }
      this.setState({
        orders: Array.isArray(data) ? (data as Order[]) : [],
        loading: false,
      });
    } catch (e: unknown) {
      this.setState({
        error: e instanceof Error ? e.message : "Gagal memuat order.",
        loading: false,
      });
    }
  };

  loadCustomers = async (q?: string): Promise<void> => {
    this.setState({ error: "" });
    try {
      const query = (q ?? "").trim();
      const url = query
        ? `${API_BASE}/api/customers?limit=200&q=${encodeURIComponent(query)}`
        : `${API_BASE}/api/customers?limit=200`;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Gagal memuat customer (${res.status})`;
        try {
          if (
            responseText.includes("<!DOCTYPE html>") ||
            responseText.includes("<html")
          ) {
            errorMessage =
              "Endpoint /api/customers tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
          } else {
            try {
              const json = JSON.parse(responseText);
              errorMessage = json.message || json.error || errorMessage;
            } catch {
              errorMessage =
                responseText.length > 200
                  ? `${errorMessage}: ${responseText.substring(0, 200)}...`
                  : `${errorMessage}: ${responseText}`;
            }
          }
        } catch {
          // If we can't parse, use default message
        }
        throw new Error(errorMessage);
      }

      let data: unknown;
      try {
        data = responseText.trim() ? JSON.parse(responseText) : [];
      } catch (parseErr) {
        throw new Error(
          `Failed to parse customers response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`
        );
      }
      this.setState({
        customers: Array.isArray(data) ? (data as Customer[]) : [],
      });
    } catch (e: unknown) {
      this.setState({
        error: e instanceof Error ? e.message : "Gagal memuat customer.",
      });
    }
  };

  loadCustomerById = async (id: string): Promise<void> => {
    const safeId = (id ?? "").toString().trim();
    if (!safeId) return;
    if (this.loadedCustomerIdsRef.current?.has(safeId)) return;
    this.loadedCustomerIdsRef.current?.add(safeId);

    try {
      const res = await fetch(
        `${API_BASE}/api/customers/${encodeURIComponent(safeId)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (!res.ok) {
        return;
      }

      let data: unknown;
      try {
        const text = await res.text();
        data = text.trim() ? JSON.parse(text) : null;
      } catch {
        return; // Silently fail for customer lookup
      }
      if (!data || typeof data !== "object") return;
      const c = data as Customer;
      const cid = (c._id ?? "").toString();
      if (!cid) return;

      this.setState((prev) => {
        const exists = prev.customers.some(
          (x) => (x._id ?? "").toString() === cid
        );
        return exists
          ? prev
          : {
              ...prev,
              customers: [c, ...prev.customers],
            };
      });
    } catch {
      // ignore
    }
  };

  // ==================== Form Handlers ====================
  handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    this.setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  handleSelectChange = (name: string, value: string): void => {
    this.setState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  resetForm = (): void => {
    this.setState({
      editingId: "",
      selectedCustomerId: "",
      buyerName: "",
      phoneNumber: "",
      address: "",
      deliveryAt: "",
      orderStatus: "memesan",
      paymentMethod: "",
      downPaymentAmount: "",
      additionalPayment: "",
      deliveryPrice: "",
    });
  };

  // ==================== Mode Handlers ====================
  setMode = (mode: OrdersMode): void => {
    this.setState({ mode });
  };

  closeDrawer = (): void => {
    this.resetForm();
    this.setState({
      mode: "list",
      showInlineAddUser: false,
      success: "",
      error: "",
    });
  };

  // ==================== Copy Handlers ====================
  copyText = async (text: string, feedbackMessage?: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        if (feedbackMessage) {
          this.setState({ copyFeedback: feedbackMessage });
        }
        return true;
      }

      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "true");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      if (feedbackMessage) {
        this.setState({ copyFeedback: feedbackMessage });
      }
      return true;
    } catch {
      return false;
    }
  };

  copyWaMessage = async (): Promise<void> => {
    const { derivedNumbers, buyerName, selectedBouquetName, deliveryAt } = this.state;
    const message = buildWaMessage(
      buyerName,
      selectedBouquetName,
      deliveryAt,
      derivedNumbers.total,
      derivedNumbers.paid,
      derivedNumbers.remaining
    );
    await this.copyText(message, "Pesan WhatsApp tersalin");
  };

  copyOrderSummary = async (): Promise<void> => {
    const {
      derivedNumbers,
      buyerName,
      phoneNumber,
      address,
      selectedBouquetName,
      deliveryAt,
      orderStatus,
      paymentMethod,
    } = this.state;
    const summary = buildOrderSummary(
      buyerName,
      phoneNumber,
      address,
      selectedBouquetName,
      deliveryAt,
      orderStatus,
      derivedNumbers.derivedPaymentStatus,
      paymentMethod,
      derivedNumbers.total,
      derivedNumbers.paid,
      derivedNumbers.remaining,
      derivedNumbers.dp,
      derivedNumbers.addPay,
      derivedNumbers.delivery
    );
    await this.copyText(summary, "Ringkasan order tersalin");
    this.setState({ error: "" });
  };

  copyPhone = async (): Promise<void> => {
    await this.copyText(
      (this.state.phoneNumber ?? "").toString().trim(),
      "Nomor HP tersalin"
    );
  };

  copyAddress = async (): Promise<void> => {
    await this.copyText(
      (this.state.address ?? "").toString().trim(),
      "Alamat tersalin"
    );
  };

  openWaChat = (): void => {
    const wa = toWaPhone(this.state.phoneNumber);
    if (!wa) {
      this.setState({ error: "Nomor HP tidak valid untuk WhatsApp." });
      return;
    }
    window.open(`https://wa.me/${wa}`, "_blank", "noopener,noreferrer");
  };

  // ==================== Payment & Delivery Presets ====================
  applyPaymentPreset = (preset: PaymentStatus): void => {
    const { derivedNumbers, downPaymentAmount, additionalPayment } = this.state;
    const result = applyPaymentPreset(
      preset,
      derivedNumbers.total,
      downPaymentAmount,
      additionalPayment,
      derivedNumbers.paid
    );
    this.setState({
      downPaymentAmount: result.downPaymentAmount,
      additionalPayment: result.additionalPayment,
      success:
        preset === "belum_bayar"
          ? "Pembayaran di-reset (belum bayar)."
          : preset === "sudah_bayar"
            ? "Otomatis melunasi: tambahan pembayaran diisi sisa bayar."
            : "DP diisi otomatis (bisa kamu ubah).",
      error: "",
    });
  };

  applyDeliveryPreset = (preset: "today" | "tomorrow" | "nextWeek"): void => {
    const deliveryAt = applyDeliveryPreset(preset);
    const date = new Date(deliveryAt);
    this.setState({
      deliveryAt,
      success: `Waktu deliver diisi: ${date.toLocaleString("id-ID")}`,
      error: "",
    });
  };

  applyDeliveryQuick = (hoursFromNow: number): void => {
    const deliveryAt = applyDeliveryQuick(hoursFromNow);
    const date = new Date(deliveryAt);
    this.setState({
      deliveryAt,
      success: `Waktu deliver diisi: ${date.toLocaleString("id-ID")}`,
      error: "",
    });
  };

  // ==================== Order Management ====================
  selectOrderForEdit = (order: Order): void => {
    if (!order._id) return;
    this.setState({
      mode: "update_order",
      editingId: order._id,
      selectedCustomerId: (order.customerId ?? "").toString(),
      buyerName: order.buyerName ?? "",
      phoneNumber: order.phoneNumber ?? "",
      address: order.address ?? "",
      bouquetId: order.bouquetId ?? this.state.bouquetId,
      deliveryAt: toDateTimeLocalValue(order.deliveryAt),
      orderStatus: (order.orderStatus ?? "bertanya") as OrderStatus,
      paymentMethod: (order.paymentMethod ?? "") as PaymentMethod,
      downPaymentAmount: String(order.downPaymentAmount ?? ""),
      additionalPayment: String(order.additionalPayment ?? ""),
      deliveryPrice: String(order.deliveryPrice ?? ""),
      success: "Mode edit aktif.",
      showInlineAddUser: false,
    });
  };

  submitOrder = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const {
      mode,
      selectedCustomerId,
      selectedCustomer,
      buyerName,
      phoneNumber,
      address,
      bouquetId,
      selectedBouquetName,
      selectedBouquetPrice,
      deliveryAt,
      orderStatus,
      paymentMethod,
      derivedNumbers,
      editingId,
    } = this.state;

    this.setState({ success: "", error: "" });

    if (mode === "add_order" && !selectedCustomerId) {
      this.setState({ error: "Pilih customer dulu. Jika belum ada, klik Add user." });
      return;
    }

    const isEditing = mode === "update_order" && Boolean(editingId);

    // Use selected customer as the source of truth when available.
    const bn = (selectedCustomer?.buyerName ?? buyerName).trim();
    const ph = normalizePhone((selectedCustomer?.phoneNumber ?? phoneNumber).toString());
    const ad = (selectedCustomer?.address ?? address).trim();

    if (mode === "add_order") {
      if (!selectedCustomer) {
        this.setState({ error: "Pilih user dulu. Jika belum ada, klik Add user." });
        return;
      }
      if (!bn || !ph || !ad) {
        this.setState({
          error: "Data user belum lengkap (nama/nomor/alamat). Lengkapi di Add user.",
        });
        return;
      }
    } else {
      // update_order: allow manual buyer fields if not linked to a customer
      if (!bn || !ph || !ad) {
        this.setState({ error: "Mohon lengkapi nama, nomor, dan alamat." });
        return;
      }
    }

    if (!bouquetId || !selectedBouquetName) {
      this.setState({ error: "Pilih bouquet dulu." });
      return;
    }

    const { dp, addPay, delivery } = derivedNumbers;

    if (mode === "update_order" && !editingId) {
      this.setState({ error: "Pilih order dulu dari daftar untuk update." });
      return;
    }

    this.setState({ submitting: true });
    try {
      const url = isEditing
        ? `${API_BASE}/api/orders/${editingId}`
        : `${API_BASE}/api/orders`;

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          customerId: selectedCustomerId || "",
          buyerName: bn,
          phoneNumber: ph,
          address: ad,
          bouquetId,
          bouquetName: selectedBouquetName,
          ...(isEditing ? {} : { bouquetPrice: selectedBouquetPrice }),
          deliveryAt: deliveryAt ? new Date(deliveryAt).toISOString() : "",
          orderStatus,
          paymentMethod,
          downPaymentAmount: dp,
          additionalPayment: addPay,
          deliveryPrice: delivery,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gagal menyimpan order (${res.status}): ${t}`);
      }

      this.resetForm();
      this.setState({
        mode: "list",
        success: isEditing ? "Order diperbarui." : "Order tersimpan.",
      });

      await this.loadOrders();
    } catch (err: unknown) {
      this.setState({
        error: err instanceof Error ? err.message : "Gagal menyimpan order.",
        submitting: false,
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  deleteOrderById = async (orderId: string): Promise<void> => {
    const id = (orderId ?? "").toString();
    if (!id) return;
    const order = this.state.orders.find((o) => o._id === id);
    const orderName = order
      ? `${order.buyerName} - ${order.bouquetName}`
      : "order ini";
    const ok = window.confirm(
      `Hapus order "${orderName}"?\n\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;

    this.setState({ submitting: true, error: "", success: "" });
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gagal menghapus order (${res.status}): ${t}`);
      }

      if (this.state.editingId === id) {
        this.resetForm();
        this.setState({ mode: "list" });
      }

      this.setState({ success: "Order dihapus." });
      await this.loadOrders();
    } catch (err: unknown) {
      this.setState({
        error: err instanceof Error ? err.message : "Gagal menghapus order.",
        submitting: false,
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  deleteEditing = async (): Promise<void> => {
    if (!this.state.editingId) return;
    await this.deleteOrderById(this.state.editingId);
  };

  patchEditing = async (patch: Partial<Order>): Promise<void> => {
    if (!this.state.editingId) return;
    this.setState({ submitting: true, error: "", success: "" });
    try {
      const res = await fetch(`${API_BASE}/api/orders/${this.state.editingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gagal update cepat (${res.status}): ${t}`);
      }

      let updated: unknown;
      try {
        const text = await res.text();
        updated = text.trim() ? JSON.parse(text) : null;
      } catch (parseErr) {
        throw new Error(
          `Failed to parse order update response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`
        );
      }
      if (updated && typeof updated === "object") {
        const u = updated as Order;
        if (u._id) {
          this.selectOrderForEdit(u);
        }
      }

      this.setState({ success: "Perubahan tersimpan." });
      await this.loadOrders();
    } catch (err: unknown) {
      this.setState({
        error: err instanceof Error ? err.message : "Gagal update cepat.",
        submitting: false,
      });
    } finally {
      this.setState({ submitting: false });
    }
  };

  submitCustomerData = async (): Promise<void> => {
    this.setState({ success: "", error: "" });

    const bn = this.state.newCustomerName.trim();
    const ph = normalizePhone(this.state.newCustomerPhone);
    const ad = this.state.newCustomerAddress.trim();

    if (!bn || !ph || !ad) {
      this.setState({ error: "Mohon lengkapi nama, nomor, dan alamat." });
      return;
    }

    this.setState({ customerSubmitting: true });
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ buyerName: bn, phoneNumber: ph, address: ad }),
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Gagal menyimpan customer (${res.status})`;
        try {
          if (
            responseText.includes("<!DOCTYPE html>") ||
            responseText.includes("<html")
          ) {
            errorMessage =
              "Endpoint /api/customers tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
          } else {
            try {
              const json = JSON.parse(responseText);
              errorMessage = json.message || json.error || errorMessage;
            } catch {
              errorMessage =
                responseText.length > 200
                  ? `${errorMessage}: ${responseText.substring(0, 200)}...`
                  : `${errorMessage}: ${responseText}`;
            }
          }
        } catch {
          // If we can't parse, use default message
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let created: unknown;
      try {
        created = responseText.trim() ? JSON.parse(responseText) : null;
      } catch (parseErr) {
        throw new Error(
          `Failed to parse customer creation response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`
        );
      }
      const id =
        created && typeof created === "object"
          ? ((created as any)._id ?? "").toString()
          : "";

      // Ensure the newly created/updated customer is present in the dropdown.
      await this.loadCustomers(ph);

      if (id) {
        this.setState({ selectedCustomerId: id });
      }

      this.setState({
        buyerName: bn,
        phoneNumber: ph,
        address: ad,
        mode: "add_order",
        showInlineAddUser: false,
        success: "User tersimpan. Sekarang buat order card.",
        customerSubmitting: false,
      });
    } catch (err: unknown) {
      this.setState({
        error: err instanceof Error ? err.message : "Gagal menyimpan user.",
        customerSubmitting: false,
      });
    }
  };

  repeatFromEditing = (): void => {
    if (!this.state.editingId) return;
    this.setState({
      editingId: "",
      mode: "add_order",
      deliveryAt: "",
      orderStatus: "bertanya",
      paymentMethod: "",
      downPaymentAmount: "",
      additionalPayment: "",
      success: "Repeat order: data disiapkan (silakan atur waktu deliver lalu simpan).",
      error: "",
    });
  };

  // ==================== Invoice ====================
  showInvoice = (order: Order): void => {
    this.setState({ showInvoice: true, invoiceOrder: order });
  };

  hideInvoice = (): void => {
    this.setState({ showInvoice: false, invoiceOrder: null });
  };

  // ==================== Bulk Operations ====================
  toggleOrderSelection = (orderId: string): void => {
    this.setState((prev) => {
      const newSelected = new Set(prev.selectedOrders);
      if (newSelected.has(orderId)) {
        newSelected.delete(orderId);
      } else {
        newSelected.add(orderId);
      }
      return { selectedOrders: newSelected };
    });
  };

  clearOrderSelection = (): void => {
    this.setState({ selectedOrders: new Set(), bulkActionMode: "none" });
  };

  // ==================== Expose State for View ====================
  getControllerState() {
    return {
      state: this.state,
      handlers: {
        loadOrders: this.loadOrders,
        loadCustomers: this.loadCustomers,
        loadCustomerById: this.loadCustomerById,
        handleTextChange: this.handleTextChange,
        handleSelectChange: this.handleSelectChange,
        resetForm: this.resetForm,
        setMode: this.setMode,
        closeDrawer: this.closeDrawer,
        copyText: this.copyText,
        copyWaMessage: this.copyWaMessage,
        copyOrderSummary: this.copyOrderSummary,
        copyPhone: this.copyPhone,
        copyAddress: this.copyAddress,
        openWaChat: this.openWaChat,
        applyPaymentPreset: this.applyPaymentPreset,
        applyDeliveryPreset: this.applyDeliveryPreset,
        applyDeliveryQuick: this.applyDeliveryQuick,
        selectOrderForEdit: this.selectOrderForEdit,
        submitOrder: this.submitOrder,
        deleteOrderById: this.deleteOrderById,
        deleteEditing: this.deleteEditing,
        patchEditing: this.patchEditing,
        submitCustomerData: this.submitCustomerData,
        repeatFromEditing: this.repeatFromEditing,
        showInvoice: this.showInvoice,
        hideInvoice: this.hideInvoice,
        toggleOrderSelection: this.toggleOrderSelection,
        clearOrderSelection: this.clearOrderSelection,
        handleDrawerKeyDown: this.handleDrawerKeyDown,
      },
      refs: {
        customerSearchRef: this.customerSearchRef,
        orderDetailsRef: this.orderDetailsRef,
        bouquetSelectRef: this.bouquetSelectRef,
        drawerRef: this.drawerRef,
        drawerCloseBtnRef: this.drawerCloseBtnRef,
      },
      utils: {
        formatIDR,
        formatDateTime,
        formatShortDateTime,
        toDateTimeLocalValue,
        normalizePhone,
        toWaPhone,
        calculateOrderTotal,
        calculateOrderRemaining,
        isOrderOverdue,
        nextOrderStatus,
        applyPaymentPreset,
        applyDeliveryPreset,
        applyDeliveryQuick,
        buildWaMessage,
        buildOrderSummary,
        exportOrdersToCSV,
      },
    };
  }

  render(): React.ReactNode {
    // View will be rendered by wrapper component
    const OrdersView = require("../view/orders-view").default;
    return <OrdersView controller={this} />;
  }
}

