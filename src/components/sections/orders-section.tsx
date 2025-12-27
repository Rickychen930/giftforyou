import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../../styles/OrdersSection.css";

import { API_BASE } from "../../config/api";
import type { Bouquet } from "../../models/domain/bouquet";
import InvoiceComponent from "../InvoiceComponent";

type Order = {
  _id?: string;
  customerId?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  bouquetId: string;
  bouquetName: string;
  bouquetPrice?: number;

  orderStatus?:
    | "bertanya"
    | "memesan"
    | "sedang_diproses"
    | "menunggu_driver"
    | "pengantaran"
    | "terkirim";
  paymentStatus?: "belum_bayar" | "dp" | "sudah_bayar";
  paymentMethod?: "" | "cash" | "transfer_bank" | "ewallet" | "qris" | "lainnya";

  downPaymentAmount?: number;
  additionalPayment?: number;
  deliveryPrice?: number;

  totalAmount?: number;

  activity?: Array<{
    at?: string;
    kind?: string;
    message?: string;
  }>;

  deliveryAt?: string;
  createdAt?: string;
};

type Customer = {
  _id?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
};

type Props = {
  bouquets: Bouquet[];
};

const safeDate = (v?: string): Date | null => {
  if (!v) return null;
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return null;
  return new Date(t);
};

const toDateTimeLocalValue = (v?: string): string => {
  const d = safeDate(v);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const toDateTimeLocalFromDate = (d: Date): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

const formatDateTime = (v?: string) => {
  if (!v) return "—";
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("id-ID");
};

const formatShortDateTime = (v?: string) => {
  if (!v) return "—";
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return "—";
  try {
    return new Date(t).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return formatDateTime(v);
  }
};

const formatIDR = (n: unknown) => {
  const num = typeof n === "number" ? n : typeof n === "string" ? Number(n) : NaN;
  if (!Number.isFinite(num)) return "—";
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `Rp ${Math.round(num)}`;
  }
};

const normalizePhone = (v: string) => v.replace(/\s+/g, " ").trim();

const toWaPhone = (raw: string): string | null => {
  const digits = (raw ?? "").toString().replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
};

  const getAuthHeaders = (): HeadersInit => {
  const { getAuthHeaders } = require("../../utils/auth-utils");
  return getAuthHeaders();
};

export default function OrdersSection({ bouquets }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  type OrdersMode = "list" | "add_order" | "update_order" | "add_user";
  const [mode, setMode] = useState<OrdersMode>("list");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const bouquetOptions = useMemo(() => {
    return (bouquets ?? [])
      .map((b) => ({
        id: (b._id ?? "").toString(),
        name: (b.name ?? "").toString().trim(),
        price: typeof b.price === "number" ? b.price : 0,
      }))
      .filter((b) => b.id && b.name)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [bouquets]);

  const [buyerName, setBuyerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [bouquetId, setBouquetId] = useState("");
  const [deliveryAt, setDeliveryAt] = useState("");

  const [orderStatus, setOrderStatus] = useState<Order["orderStatus"]>("bertanya");
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("");

  const [downPaymentAmount, setDownPaymentAmount] = useState<string>("");
  const [additionalPayment, setAdditionalPayment] = useState<string>("");
  const [deliveryPrice, setDeliveryPrice] = useState<string>("");

  const [editingId, setEditingId] = useState<string>("");

  const [listQuery, setListQuery] = useState<string>("");
  const [debouncedListQuery, setDebouncedListQuery] = useState<string>("");

  // Filter and sort state
  const [filterOrderStatus, setFilterOrderStatus] = useState<Order["orderStatus"] | "all">("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<Order["paymentStatus"] | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "amount" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [showInlineAddUser, setShowInlineAddUser] = useState<boolean>(false);

  // Copy feedback state
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  // Copy text utility function (moved inside component to access setCopyFeedback)
  const copyText = useCallback(async (text: string, feedbackMessage?: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        if (feedbackMessage) setCopyFeedback(feedbackMessage);
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
      if (feedbackMessage) setCopyFeedback(feedbackMessage);
      return true;
    } catch {
      return false;
    }
  }, []);

  const customerSearchRef = useRef<HTMLInputElement | null>(null);
  const orderDetailsRef = useRef<HTMLDivElement | null>(null);
  const bouquetSelectRef = useRef<HTMLSelectElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const [newCustomerName, setNewCustomerName] = useState<string>("");
  const [newCustomerPhone, setNewCustomerPhone] = useState<string>("");
  const [newCustomerAddress, setNewCustomerAddress] = useState<string>("");
  const [customerSubmitting, setCustomerSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!bouquetId && bouquetOptions.length) {
      setBouquetId(bouquetOptions[0].id);
    }
  }, [bouquetId, bouquetOptions]);

  const loadCustomers = async (q?: string) => {
    setError("");
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

      // Read response text once
      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Gagal memuat customer (${res.status})`;
        try {
          // Check if response is HTML (404 page)
          if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
            errorMessage = "Endpoint /api/customers tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
          } else {
            // Try to parse as JSON
            try {
              const json = JSON.parse(responseText);
              errorMessage = json.message || json.error || errorMessage;
            } catch {
              // If not JSON, use the text (but limit length)
              errorMessage = responseText.length > 200 ? `${errorMessage}: ${responseText.substring(0, 200)}...` : `${errorMessage}: ${responseText}`;
            }
          }
        } catch {
          // If we can't parse, use default message
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data: unknown;
      try {
        data = responseText.trim() ? JSON.parse(responseText) : [];
      } catch (parseErr) {
        throw new Error(`Failed to parse customers response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      setCustomers(Array.isArray(data) ? (data as Customer[]) : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat customer.");
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/orders?limit=500`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Gagal memuat order (${res.status}): ${t}`);
      }

      let data: unknown;
      try {
        const text = await res.text();
        data = text.trim() ? JSON.parse(text) : [];
      } catch (parseErr) {
        throw new Error(`Failed to parse orders response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      setOrders(Array.isArray(data) ? (data as Order[]) : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat order.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode !== "add_order") return;
    // Make the common happy-path fast: jump to user search.
    customerSearchRef.current?.focus();
    if ((customers?.length ?? 0) === 0) {
      void loadCustomers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadedCustomerIdsRef = useRef<Set<string>>(new Set());

  const loadCustomerById = useCallback(async (id: string) => {
    const safeId = (id ?? "").toString().trim();
    if (!safeId) return;
    if (loadedCustomerIdsRef.current.has(safeId)) return;
    loadedCustomerIdsRef.current.add(safeId);

    try {
      const res = await fetch(`${API_BASE}/api/customers/${encodeURIComponent(safeId)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

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

      setCustomers((prev) => {
        const exists = prev.some((x) => (x._id ?? "").toString() === cid);
        return exists ? prev : [c, ...prev];
      });
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mode !== "update_order") return;

    let cancelled = false;
    (async () => {
      // Make sure the dropdown isn't empty in update mode.
      if ((customers?.length ?? 0) === 0) {
        await loadCustomers();
        if (cancelled) return;
      }

      // If the order is linked to a customerId that isn't in the current list, fetch it by id.
      if (selectedCustomerId && !customers.some((c) => (c._id ?? "").toString() === selectedCustomerId)) {
        await loadCustomerById(selectedCustomerId);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedCustomerId]);

  const prefersReducedMotion = useMemo(() => {
    try {
      return typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
    } catch {
      return false;
    }
  }, []);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return undefined;
    return customers.find((x) => (x._id ?? "").toString() === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const selectedBouquetName = useMemo(() => {
    return bouquetOptions.find((b) => b.id === bouquetId)?.name ?? "";
  }, [bouquetId, bouquetOptions]);

  const selectedBouquetPrice = useMemo(() => {
    const p = bouquetOptions.find((b) => b.id === bouquetId)?.price ?? 0;
    return Number.isFinite(p) ? Math.max(0, Math.round(p)) : 0;
  }, [bouquetId, bouquetOptions]);

  const editingOrder = useMemo(() => {
    return editingId ? orders.find((o) => o._id === editingId) : undefined;
  }, [editingId, orders]);

  const bouquetPriceForCalc = useMemo(() => {
    if (editingOrder && bouquetId && editingOrder.bouquetId === bouquetId) {
      const snap = editingOrder.bouquetPrice;
      return typeof snap === "number" && Number.isFinite(snap) ? Math.max(0, Math.round(snap)) : 0;
    }
    return selectedBouquetPrice;
  }, [bouquetId, editingOrder, selectedBouquetPrice]);

  const resetForm = useCallback(() => {
    setEditingId("");
    setSelectedCustomerId("");
    setBuyerName("");
    setPhoneNumber("");
    setAddress("");
    setDeliveryAt("");
    // Faster default for new orders
    setOrderStatus("memesan");
    setPaymentMethod("");
    setDownPaymentAmount("");
    setAdditionalPayment("");
    setDeliveryPrice("");
  }, []);

  const repeatFromEditing = () => {
    if (!editingId) return;
    setEditingId("");
    setMode("add_order");
    setDeliveryAt("");
    setOrderStatus("bertanya");
    setPaymentMethod("");
    setDownPaymentAmount("");
    setAdditionalPayment("");
    setSuccess("Repeat order: data disiapkan (silakan atur waktu deliver lalu simpan).");
    setError("");
  };

  const deleteEditing = async () => {
    if (!editingId) return;
    const order = orders.find((o) => o._id === editingId);
    const orderName = order ? `${order.buyerName} - ${order.bouquetName}` : "order ini";
    const ok = window.confirm(
      `Hapus order "${orderName}"?\n\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/${editingId}`, {
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

      resetForm();
      setSuccess("Order dihapus.");
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus order.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteOrderById = async (orderId: string) => {
    const id = (orderId ?? "").toString();
    if (!id) return;
    const order = orders.find((o) => o._id === id);
    const orderName = order ? `${order.buyerName} - ${order.bouquetName}` : "order ini";
    const ok = window.confirm(
      `Hapus order "${orderName}"?\n\nTindakan ini tidak bisa dibatalkan.`
    );
    if (!ok) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
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

      if (editingId === id) {
        resetForm();
        setMode("list");
      }

      setSuccess("Order dihapus.");
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus order.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitCustomerData = async () => {
    setSuccess("");
    setError("");

    const bn = newCustomerName.trim();
    const ph = normalizePhone(newCustomerPhone);
    const ad = newCustomerAddress.trim();

    if (!bn || !ph || !ad) {
      setError("Mohon lengkapi nama, nomor, dan alamat.");
      return;
    }

    setCustomerSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ buyerName: bn, phoneNumber: ph, address: ad }),
      });

      // Read response text once
      const responseText = await res.text();

      if (!res.ok) {
        let errorMessage = `Gagal menyimpan customer (${res.status})`;
        try {
          // Check if response is HTML (404 page)
          if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html")) {
            errorMessage = "Endpoint /api/customers tidak tersedia. Pastikan server berjalan dan route dikonfigurasi dengan benar.";
          } else {
            // Try to parse as JSON
            try {
              const json = JSON.parse(responseText);
              errorMessage = json.message || json.error || errorMessage;
            } catch {
              errorMessage = responseText.length > 200 ? `${errorMessage}: ${responseText.substring(0, 200)}...` : `${errorMessage}: ${responseText}`;
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
        throw new Error(`Failed to parse customer creation response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      const id = created && typeof created === "object" ? ((created as any)._id ?? "").toString() : "";

      // Ensure the newly created/updated customer is present in the dropdown.
      // Using phone number avoids missing the record due to a non-matching search query or pagination.
      await loadCustomers(ph);

      if (id) {
        setSelectedCustomerId(id);
      }

      setBuyerName(bn);
      setPhoneNumber(ph);
      setAddress(ad);

      setMode("add_order");
      setShowInlineAddUser(false);
      setSuccess("User tersimpan. Sekarang buat order card.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan user.");
    } finally {
      setCustomerSubmitting(false);
    }
  };

  const selectOrderForEdit = (o: Order) => {
    if (!o._id) return;
    setMode("update_order");
    setEditingId(o._id);
    setSelectedCustomerId((o.customerId ?? "").toString());
    setBuyerName(o.buyerName ?? "");
    setPhoneNumber(o.phoneNumber ?? "");
    setAddress(o.address ?? "");
    setBouquetId(o.bouquetId ?? bouquetId);
    setDeliveryAt(toDateTimeLocalValue(o.deliveryAt));
    setOrderStatus((o.orderStatus ?? "bertanya") as any);
    setPaymentMethod((o.paymentMethod ?? "") as any);
    setDownPaymentAmount(String(o.downPaymentAmount ?? ""));
    setAdditionalPayment(String(o.additionalPayment ?? ""));
    setDeliveryPrice(String(o.deliveryPrice ?? ""));
    setSuccess("Mode edit aktif.");
    setShowInlineAddUser(false);
  };

  useEffect(() => {
    if (!selectedCustomerId) return;
    const c = customers.find((x) => (x._id ?? "").toString() === selectedCustomerId);
    if (!c) return;
    setBuyerName((c.buyerName ?? "").toString());
    setPhoneNumber((c.phoneNumber ?? "").toString());
    setAddress((c.address ?? "").toString());
  }, [customers, selectedCustomerId]);

  const patchEditing = async (patch: Partial<Order>) => {
    if (!editingId) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/api/orders/${editingId}`, {
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
        throw new Error(`Failed to parse order update response: ${parseErr instanceof Error ? parseErr.message : "Invalid JSON"}`);
      }
      if (updated && typeof updated === "object") {
        const u = updated as Order;
        if (u._id) {
          selectOrderForEdit(u);
        }
      }

      setSuccess("Perubahan tersimpan.");
      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal update cepat.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextOrderStatus = (cur?: Order["orderStatus"]): NonNullable<Order["orderStatus"]> => {
    const status = (cur ?? "bertanya") as NonNullable<Order["orderStatus"]>;
    const flow: NonNullable<Order["orderStatus"]>[] = [
      "bertanya",
      "memesan",
      "sedang_diproses",
      "menunggu_driver",
      "pengantaran",
      "terkirim",
    ];
    const idx = flow.indexOf(status);
    return flow[Math.min(Math.max(idx + 1, 0), flow.length - 1)];
  };

  const copyWaMessage = async () => {
    const total = derivedNumbers.total;
    const paid = derivedNumbers.paid;
    const remaining = derivedNumbers.remaining;
    const deliverLabel = deliveryAt ? new Date(deliveryAt).toLocaleString("id-ID") : "—";

    const lines = [
      `Halo ${buyerName || ""},`,
      `Terima kasih sudah order di Giftforyou.idn.`,
      `Bouquet: ${selectedBouquetName || "—"}`,
      `Jadwal deliver: ${deliverLabel}`,
      `Total: ${formatIDR(total)}`,
      `Sudah dibayar: ${formatIDR(paid)}`,
      `Sisa bayar: ${formatIDR(remaining)}`,
    ];

    await copyText(lines.join("\n"), "Pesan WhatsApp tersalin");
  };

  const openWaChat = () => {
    const wa = toWaPhone(phoneNumber);
    if (!wa) {
      setError("Nomor HP tidak valid untuk WhatsApp.");
      return;
    }
    window.open(`https://wa.me/${wa}`, "_blank", "noopener,noreferrer");
  };

  const copyPhone = async () => {
    await copyText((phoneNumber ?? "").toString().trim(), "Nomor HP tersalin");
  };

  const copyAddress = async () => {
    await copyText((address ?? "").toString().trim(), "Alamat tersalin");
  };

  const parseAmount = (v: string) => {
    const cleaned = (v ?? "").toString().replace(/[^0-9]/g, "").trim();
    if (!cleaned) return 0;
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  };

  const derivedNumbers = useMemo(() => {
    const dp = parseAmount(downPaymentAmount);
    const addPay = parseAmount(additionalPayment);
    const delivery = parseAmount(deliveryPrice);
    const total = Math.max(0, Math.round(bouquetPriceForCalc) + Math.round(delivery));
    const paid = Math.max(0, dp + addPay);
    const remaining = Math.max(0, total - paid);
    const derivedPaymentStatus: NonNullable<Order["paymentStatus"]> =
      total <= 0 ? "sudah_bayar" : paid <= 0 ? "belum_bayar" : paid >= total ? "sudah_bayar" : "dp";
    return { dp, addPay, delivery, total, paid, remaining, derivedPaymentStatus };
  }, [additionalPayment, bouquetPriceForCalc, deliveryPrice, downPaymentAmount]);

  const copyOrderSummary = async () => {
    const total = derivedNumbers.total;
    const paid = derivedNumbers.paid;
    const remaining = derivedNumbers.remaining;
    const deliverLabel = deliveryAt ? new Date(deliveryAt).toLocaleString("id-ID") : "—";

    const lines = [
      "[ORDER SUMMARY]",
      `Pembeli: ${buyerName || "—"}`,
      `No HP: ${phoneNumber || "—"}`,
      `Alamat: ${address || "—"}`,
      `Bouquet: ${selectedBouquetName || "—"}`,
      `Deliver: ${deliverLabel}`,
      `Status: ${(orderStatus ?? "bertanya").replace(/_/g, " ")}`,
      `Pembayaran: ${derivedNumbers.derivedPaymentStatus.replace(/_/g, " ")}`,
      `Metode: ${(paymentMethod || "—").replace(/_/g, " ")}`,
      `Total: ${formatIDR(total)}`,
      `Sudah dibayar: ${formatIDR(paid)}`,
      `Sisa bayar: ${formatIDR(remaining)}`,
      `DP: ${formatIDR(derivedNumbers.dp)} • Tambahan: ${formatIDR(derivedNumbers.addPay)} • Delivery: ${formatIDR(derivedNumbers.delivery)}`,
    ];

    await copyText(lines.join("\n"), "Ringkasan order tersalin");
    setError("");
  };

  const applyPaymentPreset = (preset: "belum_bayar" | "dp" | "sudah_bayar") => {
    const total = derivedNumbers.total;
    if (preset === "belum_bayar") {
      setDownPaymentAmount("0");
      setAdditionalPayment("0");
      setSuccess("Pembayaran di-reset (belum bayar). ");
      setError("");
      return;
    }

    if (total <= 0) {
      setSuccess("Total 0, status bayar otomatis sudah bayar.");
      setError("");
      return;
    }

    if (preset === "sudah_bayar") {
      const nextAdd = parseAmount(additionalPayment) + derivedNumbers.remaining;
      setAdditionalPayment(String(Math.max(0, Math.round(nextAdd))));
      setSuccess("Otomatis melunasi: tambahan pembayaran diisi sisa bayar.");
      setError("");
      return;
    }

    // preset === "dp" : if nothing paid yet, set a sensible default DP (≈50% of total)
    if (derivedNumbers.paid <= 0) {
      const rawHalf = Math.round(total * 0.5);
      const dp = total >= 10000 ? Math.round(rawHalf / 1000) * 1000 : Math.max(1, Math.floor(total / 2));
      const safeDp = Math.min(Math.max(0, dp), Math.max(0, total - 1));
      setDownPaymentAmount(String(safeDp));
      setAdditionalPayment("0");
      setSuccess("DP diisi otomatis (bisa kamu ubah). ");
      setError("");
      return;
    }

    setSuccess("Status DP mengikuti nominal yang sudah diisi.");
    setError("");
  };

  const applyDeliveryQuick = (hoursFromNow: number) => {
    const now = new Date();
    const next = new Date(now.getTime() + Math.max(0, hoursFromNow) * 60 * 60 * 1000);
    setDeliveryAt(toDateTimeLocalFromDate(next));
    setSuccess(`Waktu deliver diisi: ${next.toLocaleString("id-ID")}`);
    setError("");
  };

  const applyDeliveryPreset = (preset: "today" | "tomorrow" | "nextWeek") => {
    const now = new Date();
    let target: Date;
    
    switch (preset) {
      case "today":
        target = new Date(now);
        target.setHours(14, 0, 0, 0); // 2 PM today
        if (target.getTime() < now.getTime()) {
          target.setHours(now.getHours() + 2, 0, 0, 0); // 2 hours from now if past 2 PM
        }
        break;
      case "tomorrow":
        target = new Date(now);
        target.setDate(target.getDate() + 1);
        target.setHours(10, 0, 0, 0); // 10 AM tomorrow
        break;
      case "nextWeek":
        target = new Date(now);
        target.setDate(target.getDate() + 7);
        target.setHours(10, 0, 0, 0); // 10 AM next week
        break;
    }
    
    setDeliveryAt(toDateTimeLocalFromDate(target));
    setSuccess(`Waktu deliver diisi: ${target.toLocaleString("id-ID")}`);
    setError("");
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedListQuery(listQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [listQuery]);

  // Clear copy feedback after 2 seconds
  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Apply search filter
    const q = debouncedListQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((o) => {
        const buyer = (o.buyerName ?? "").toString().toLowerCase();
        const phone = (o.phoneNumber ?? "").toString().toLowerCase();
        const bouquet = (o.bouquetName ?? "").toString().toLowerCase();
        return buyer.includes(q) || phone.includes(q) || bouquet.includes(q);
      });
    }

    // Apply status filters
    if (filterOrderStatus !== "all") {
      result = result.filter((o) => (o.orderStatus ?? "bertanya") === filterOrderStatus);
    }
    if (filterPaymentStatus !== "all") {
      result = result.filter((o) => (o.paymentStatus ?? "belum_bayar") === filterPaymentStatus);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          const dateA = safeDate(a.createdAt)?.getTime() ?? 0;
          const dateB = safeDate(b.createdAt)?.getTime() ?? 0;
          comparison = dateA - dateB;
          break;
        case "name":
          comparison = (a.buyerName ?? "").localeCompare(b.buyerName ?? "");
          break;
        case "amount": {
          const totalA = typeof a.totalAmount === "number" ? a.totalAmount : 
            Math.max(0, Math.round((a.bouquetPrice ?? 0) + (a.deliveryPrice ?? 0)));
          const totalB = typeof b.totalAmount === "number" ? b.totalAmount :
            Math.max(0, Math.round((b.bouquetPrice ?? 0) + (b.deliveryPrice ?? 0)));
          comparison = totalA - totalB;
          break;
        }
        case "status":
          const statusA = (a.orderStatus ?? "bertanya").replace(/_/g, " ");
          const statusB = (b.orderStatus ?? "bertanya").replace(/_/g, " ");
          comparison = statusA.localeCompare(statusB);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [debouncedListQuery, orders, filterOrderStatus, filterPaymentStatus, sortBy, sortDirection]);

  // Order statistics
  const orderStats = useMemo(() => {
    const total = orders.length;
    const byStatus = {
      bertanya: orders.filter((o) => (o.orderStatus ?? "bertanya") === "bertanya").length,
      memesan: orders.filter((o) => (o.orderStatus ?? "bertanya") === "memesan").length,
      sedang_diproses: orders.filter((o) => (o.orderStatus ?? "bertanya") === "sedang_diproses").length,
      menunggu_driver: orders.filter((o) => (o.orderStatus ?? "bertanya") === "menunggu_driver").length,
      pengantaran: orders.filter((o) => (o.orderStatus ?? "bertanya") === "pengantaran").length,
      terkirim: orders.filter((o) => (o.orderStatus ?? "bertanya") === "terkirim").length,
    };
    const byPayment = {
      belum_bayar: orders.filter((o) => (o.paymentStatus ?? "belum_bayar") === "belum_bayar").length,
      dp: orders.filter((o) => (o.paymentStatus ?? "belum_bayar") === "dp").length,
      sudah_bayar: orders.filter((o) => (o.paymentStatus ?? "belum_bayar") === "sudah_bayar").length,
    };
    const overdue = orders.filter((o) => {
      const d = safeDate(o.deliveryAt);
      const os = o.orderStatus ?? "bertanya";
      return Boolean(d && os !== "terkirim" && d.getTime() < Date.now());
    }).length;
    
    const totalRevenue = orders.reduce((sum, o) => {
      const total = typeof o.totalAmount === "number" ? o.totalAmount :
        Math.max(0, Math.round((o.bouquetPrice ?? 0) + (o.deliveryPrice ?? 0)));
      return sum + total;
    }, 0);
    
    const paidRevenue = orders.reduce((sum, o) => {
      const dp = typeof o.downPaymentAmount === "number" ? o.downPaymentAmount : 0;
      const add = typeof o.additionalPayment === "number" ? o.additionalPayment : 0;
      return sum + dp + add;
    }, 0);

    return {
      total,
      byStatus,
      byPayment,
      overdue,
      totalRevenue,
      paidRevenue,
      pendingRevenue: totalRevenue - paidRevenue,
    };
  }, [orders]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    if (mode === "add_order" && !selectedCustomerId) {
      setError("Pilih customer dulu. Jika belum ada, klik Add user.");
      return;
    }

    const isEditing = mode === "update_order" && Boolean(editingId);

    // Use selected customer as the source of truth when available.
    const bn = (selectedCustomer?.buyerName ?? buyerName).trim();
    const ph = normalizePhone((selectedCustomer?.phoneNumber ?? phoneNumber).toString());
    const ad = (selectedCustomer?.address ?? address).trim();

    if (mode === "add_order") {
      if (!selectedCustomer) {
        setError("Pilih user dulu. Jika belum ada, klik Add user.");
        return;
      }
      if (!bn || !ph || !ad) {
        setError("Data user belum lengkap (nama/nomor/alamat). Lengkapi di Add user.");
        return;
      }
    } else {
      // update_order: allow manual buyer fields if not linked to a customer
      if (!bn || !ph || !ad) {
        setError("Mohon lengkapi nama, nomor, dan alamat.");
        return;
      }
    }

    if (!bouquetId || !selectedBouquetName) {
      setError("Pilih bouquet dulu.");
      return;
    }

    const { dp, addPay, delivery } = derivedNumbers;

    if (mode === "update_order" && !editingId) {
      setError("Pilih order dulu dari daftar untuk update.");
      return;
    }

    setSubmitting(true);
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

      resetForm();
      setMode("list");
      setSuccess(isEditing ? "Order diperbarui." : "Order tersimpan.");

      await loadOrders();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan order.");
    } finally {
      setSubmitting(false);
    }
  };

  const buyerFieldsLocked = Boolean(selectedCustomerId);
  const buyerFieldsDisabled = mode === "add_order" && !selectedCustomerId;
  const showOrderDetails = mode === "update_order" || Boolean(selectedCustomerId);

  const isFormOpen = mode === "add_order" || mode === "update_order";

  const drawerCloseBtnRef = useRef<HTMLButtonElement | null>(null);

  const closeDrawer = useCallback(() => {
    resetForm();
    setMode("list");
    setShowInlineAddUser(false);
    setSuccess("");
    setError("");
  }, [resetForm]);

  const onDrawerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const root = drawerRef.current;
    if (!root) return;

    const focusables = Array.from(
      root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => {
      const disabled = (el as any).disabled === true;
      if (disabled) return false;
      if (el.getAttribute("aria-hidden") === "true") return false;
      // Basic visibility guard
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
  }, []);

  useEffect(() => {
    if (!isFormOpen) return;

    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // Focus a primary field for speed.
    window.setTimeout(() => {
      if (mode === "add_order") {
        customerSearchRef.current?.focus();
        return;
      }

      // update_order
      if (showOrderDetails) {
        bouquetSelectRef.current?.focus();
        return;
      }

      drawerCloseBtnRef.current?.focus();
    }, 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [closeDrawer, isFormOpen, mode, showOrderDetails]);

  useEffect(() => {
    if (mode !== "add_order") return;
    if (!selectedCustomerId) return;
    // Once user is chosen, bring admin straight into order inputs.
    const el = orderDetailsRef.current;
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
    // Focus a primary field for speed.
    bouquetSelectRef.current?.focus();
  }, [mode, prefersReducedMotion, selectedCustomerId]);

  return (
    <section className="dashboardSurface" aria-label="Record seller">
      <div className="overviewHeader" aria-label="Order actions">
        <div className="overviewHeader__meta">
          <p className="overviewHeader__title">Order</p>
          <p className="overviewHeader__sub">
            Card view: pilih customer, buat order, dan tracking cepat.
          </p>
        </div>

        <div className="overviewHeader__actions" aria-label="Aksi order">
          <button
            type="button"
            className="overviewActionBtn overviewActionBtn--primary"
            onClick={() => {
              resetForm();
              setMode("add_order");
              setShowInlineAddUser(false);
              setSuccess("");
              setError("");
            }}
          >
            Add order card
          </button>
          <button type="button" className="overviewActionBtn" onClick={() => void loadOrders()}>
            Refresh
          </button>
          {(mode === "add_order" || mode === "update_order") && (
            <button
              type="button"
              className="overviewActionBtn"
              onClick={closeDrawer}
            >
              Tutup form
            </button>
          )}
        </div>
      </div>

      <div className="ordersLayout is-single">
        {/* Order Statistics */}
        {orders.length > 0 && (
          <div className="ordersStats" aria-label="Statistik order">
            <div className="ordersStats__grid">
              <div className="ordersStatCard">
                <div className="ordersStatCard__label">Total Order</div>
                <div className="ordersStatCard__value">{orderStats.total}</div>
              </div>
              <div className="ordersStatCard ordersStatCard--warning">
                <div className="ordersStatCard__label">Belum Bayar</div>
                <div className="ordersStatCard__value">{orderStats.byPayment.belum_bayar}</div>
              </div>
              <div className="ordersStatCard ordersStatCard--success">
                <div className="ordersStatCard__label">Terkirim</div>
                <div className="ordersStatCard__value">{orderStats.byStatus.terkirim}</div>
              </div>
              <div className="ordersStatCard ordersStatCard--danger">
                <div className="ordersStatCard__label">Terlambat</div>
                <div className="ordersStatCard__value">{orderStats.overdue}</div>
              </div>
              <div className="ordersStatCard ordersStatCard--revenue">
                <div className="ordersStatCard__label">Total Revenue</div>
                <div className="ordersStatCard__value">{formatIDR(orderStats.totalRevenue)}</div>
              </div>
              <div className="ordersStatCard ordersStatCard--revenue">
                <div className="ordersStatCard__label">Sudah Dibayar</div>
                <div className="ordersStatCard__value">{formatIDR(orderStats.paidRevenue)}</div>
              </div>
            </div>
          </div>
        )}

        <aside className="ordersList" aria-label="Daftar order">
          <div className="ordersList__head">
            <h3 className="ordersList__title">Order card</h3>

            <div className="ordersList__headRight" aria-label="Pencarian order">
              <div className="ordersListSearch" aria-label="Cari order">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ordersListSearch__icon" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  className="ordersInput"
                  value={listQuery}
                  onChange={(e) => setListQuery(e.target.value)}
                  placeholder="Cari: nama / nomor / bouquet"
                  inputMode="search"
                  aria-label="Cari order"
                />
                {listQuery && (
                  <button
                    type="button"
                    className="ordersListSearch__clear"
                    onClick={() => setListQuery("")}
                    aria-label="Hapus pencarian"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Filters and Sort */}
          <div className="ordersList__filters" aria-label="Filter dan sort order">
            <div className="ordersFilters">
              <label className="ordersFilterGroup">
                <span className="ordersFilterLabel">Status</span>
                <select
                  className="ordersFilterSelect"
                  value={filterOrderStatus}
                  onChange={(e) => setFilterOrderStatus(e.target.value as any)}
                  aria-label="Filter status order"
                >
                  <option value="all">Semua</option>
                  <option value="bertanya">Bertanya</option>
                  <option value="memesan">Memesan</option>
                  <option value="sedang_diproses">Sedang diproses</option>
                  <option value="menunggu_driver">Menunggu driver</option>
                  <option value="pengantaran">Pengantaran</option>
                  <option value="terkirim">Terkirim</option>
                </select>
              </label>

              <label className="ordersFilterGroup">
                <span className="ordersFilterLabel">Bayar</span>
                <select
                  className="ordersFilterSelect"
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value as any)}
                  aria-label="Filter status pembayaran"
                >
                  <option value="all">Semua</option>
                  <option value="belum_bayar">Belum bayar</option>
                  <option value="dp">DP</option>
                  <option value="sudah_bayar">Sudah bayar</option>
                </select>
              </label>

              <label className="ordersFilterGroup">
                <span className="ordersFilterLabel">Urutkan</span>
                <div className="ordersSortGroup">
                  <select
                    className="ordersFilterSelect"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort by"
                  >
                    <option value="date">Tanggal</option>
                    <option value="name">Nama</option>
                    <option value="amount">Jumlah</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    type="button"
                    className="ordersSortBtn"
                    onClick={() => setSortDirection((d) => d === "asc" ? "desc" : "asc")}
                    aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                    title={sortDirection === "asc" ? "Urutkan menurun" : "Urutkan menaik"}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </label>

              {(filterOrderStatus !== "all" || filterPaymentStatus !== "all" || listQuery.trim()) && (
                <button
                  type="button"
                  className="ordersFilterClear"
                  onClick={() => {
                    setFilterOrderStatus("all");
                    setFilterPaymentStatus("all");
                    setListQuery("");
                  }}
                  aria-label="Hapus semua filter"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="ordersList__actions ordersActions" aria-label="Aksi cepat">
            <button
              type="button"
              className="overviewActionBtn overviewActionBtn--primary"
              onClick={() => {
                resetForm();
                setMode("add_order");
                setShowInlineAddUser(false);
                setSuccess("");
                setError("");
              }}
            >
              Add order card
            </button>
            <button type="button" className="overviewActionBtn" onClick={() => void loadOrders()}>
              Refresh
            </button>
          </div>

          <div className="ordersList__sub">
            <span>
              Menampilkan: <b style={{ color: "var(--dash-brand-pink)" }}>{filteredAndSortedOrders.length}</b>
              {listQuery.trim() || filterOrderStatus !== "all" || filterPaymentStatus !== "all" 
                ? ` dari ${orders.length} order` 
                : " order"}
            </span>
            {filteredAndSortedOrders.length !== orders.length && (
              <button
                type="button"
                className="ordersList__showAll"
                onClick={() => {
                  setFilterOrderStatus("all");
                  setFilterPaymentStatus("all");
                  setListQuery("");
                }}
                aria-label="Tampilkan semua order"
              >
                Tampilkan semua
              </button>
            )}
          </div>

          {loading ? (
            <div className="ordersEmpty" role="status" aria-live="polite" aria-busy="true">
              <div style={{ 
                width: "32px", 
                height: "32px", 
                border: "3px solid rgba(212, 140, 156, 0.2)", 
                borderTopColor: "var(--dash-brand-pink)", 
                borderRadius: "50%", 
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 1rem"
              }} aria-hidden="true" />
              <span>Memuat order...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="ordersEmpty" role="status" aria-live="polite">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "1rem", opacity: 0.5 }} aria-hidden="true">
                <path d="M9 2v2M15 2v2M9 18v2M15 18v2M5 6h14M5 10h14M5 14h14M5 18h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0 }}>Belum ada order.</p>
              <button
                type="button"
                className="ordersEmpty__action"
                onClick={() => {
                  resetForm();
                  setMode("add_order");
                  setShowInlineAddUser(false);
                  setSuccess("");
                  setError("");
                }}
              >
                Buat Order Pertama
              </button>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="ordersEmpty" role="status" aria-live="polite">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: "1rem", opacity: 0.5 }} aria-hidden="true">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0 }}>Tidak ada hasil untuk filter/pencarian.</p>
              <button
                type="button"
                className="ordersEmpty__action"
                onClick={() => {
                  setFilterOrderStatus("all");
                  setFilterPaymentStatus("all");
                  setListQuery("");
                }}
              >
                Hapus Filter
              </button>
            </div>
          ) : (
            <div className="ordersCards" role="list" aria-label="Daftar order">
              {filteredAndSortedOrders.map((o) => {
                const isSelected = Boolean(editingId && o._id && editingId === o._id);
                const os = (o.orderStatus ?? "bertanya") as NonNullable<Order["orderStatus"]>;
                const ps = (o.paymentStatus ?? "belum_bayar") as NonNullable<Order["paymentStatus"]>;
                const d = safeDate(o.deliveryAt);
                const isOverdue = Boolean(d && os !== "terkirim" && d.getTime() < Date.now());

                const legacyBouquetPrice = typeof o.bouquetPrice === "number" ? o.bouquetPrice : 0;
                const legacyDelivery = typeof o.deliveryPrice === "number" ? o.deliveryPrice : 0;
                const total =
                  typeof o.totalAmount === "number" ? o.totalAmount : Math.max(0, Math.round(legacyBouquetPrice) + Math.round(legacyDelivery));
                const dp = typeof o.downPaymentAmount === "number" ? o.downPaymentAmount : 0;
                const add = typeof o.additionalPayment === "number" ? o.additionalPayment : 0;
                const remaining = Math.max(0, total - dp - add);
                const method = o.paymentMethod ? o.paymentMethod.replace(/_/g, " ") : "—";

                const orderBadgeCls = os === "terkirim" ? "ordersBadge--success" : "ordersBadge--warning";
                const payBadgeCls =
                  ps === "sudah_bayar"
                    ? "ordersBadge--success"
                    : ps === "belum_bayar"
                      ? "ordersBadge--danger"
                      : "ordersBadge--warning";

                return (
                  <div
                    key={o._id ?? `${o.buyerName}-${o.createdAt}`}
                    className={`ordersCard ${isSelected ? "is-selected" : ""} ${isOverdue ? "is-danger" : ""}`}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => selectOrderForEdit(o)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        selectOrderForEdit(o);
                      }
                    }}
                  >
                    <div className="ordersCard__top">
                      <div className="ordersCard__buyer">
                        <div className="ordersCard__buyerName">{o.buyerName}</div>
                        <div className="ordersCard__buyerSub">{o.phoneNumber}</div>
                      </div>
                      <div className="ordersCard__amount" aria-label="Sisa pembayaran">
                        <div className="ordersCard__amountLabel">Sisa</div>
                        <div className={`ordersCard__amountValue ${remaining > 0 ? "is-danger" : ""}`.trim()}>
                          {formatIDR(remaining)}
                        </div>
                      </div>
                    </div>

                    <div className="ordersCard__main">
                      <div className="ordersCard__bouquet">{o.bouquetName}</div>
                      <div className="ordersCard__chips" aria-label="Ringkasan order">
                        <span className="ordersChip ordersChip--muted">Deliver {formatShortDateTime(o.deliveryAt)}</span>
                        <span className={`ordersChip ${orderBadgeCls}`.trim()}>{os.replace(/_/g, " ")}</span>
                        <span className={`ordersChip ${payBadgeCls}`.trim()}>{ps.replace(/_/g, " ")}</span>
                        <span className="ordersChip ordersChip--muted">Metode {method}</span>
                        {isOverdue && <span className="ordersChip ordersChip--danger">Terlambat</span>}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="ordersCard__money">
                        <div className="ordersCard__moneyRow">
                          <span>Total</span>
                          <b>{formatIDR(total)}</b>
                        </div>
                        <div className="ordersCard__moneyRow">
                          <span>Sudah bayar</span>
                          <b>{formatIDR(dp + add)}</b>
                        </div>
                      </div>
                    )}

                    {isSelected && (
                      <div className="ordersCard__note">
                        DP {formatIDR(dp)} • Tambahan {formatIDR(add)} • Delivery {formatIDR(o.deliveryPrice)}
                      </div>
                    )}
                    <div className="ordersCard__actions" aria-label="Aksi order">
                      <button
                        type="button"
                        className="ordersBtn ordersBtn--sm ordersBtn--primary"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          selectOrderForEdit(o);
                        }}
                        disabled={submitting}
                        aria-label={`Update order ${o.buyerName}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Update</span>
                      </button>
                      {isSelected && (
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            const nextStatus = nextOrderStatus(o.orderStatus);
                            void patchEditing({ orderStatus: nextStatus });
                          }}
                          disabled={submitting || !editingId || editingId !== o._id}
                          aria-label={`Next status untuk order ${o.buyerName}`}
                          title="Lanjut ke status berikutnya"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span>Next</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className="ordersBtn ordersBtn--sm"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setInvoiceOrder(o);
                          setShowInvoice(true);
                        }}
                        disabled={submitting}
                        aria-label={`Lihat invoice untuk order ${o.buyerName}`}
                        title="Lihat invoice"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>Invoice</span>
                      </button>
                      <button
                        type="button"
                        className="ordersBtn ordersBtn--sm ordersBtn--danger"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          void deleteOrderById((o._id ?? "").toString());
                        }}
                        disabled={submitting}
                        aria-label={`Hapus order ${o.buyerName}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>

      {/* Invoice Modal */}
      {showInvoice && invoiceOrder && (
        <InvoiceComponent
          order={invoiceOrder}
          onClose={() => {
            setShowInvoice(false);
            setInvoiceOrder(null);
          }}
        />
      )}

      {isFormOpen && (
        <div
          className="ordersDrawerOverlay"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
          onTouchStart={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDrawer();
          }}
        >
          <div
            ref={drawerRef}
            className="ordersDrawer"
            role="dialog"
            aria-modal="true"
            aria-label="Form order"
            onKeyDown={onDrawerKeyDown}
          >
            <div className="ordersDrawer__head">
              <div className="ordersDrawer__headText">
                <div className="ordersDrawer__title">{mode === "add_order" ? "Tambah order" : "Update order"}</div>
                <div className="ordersDrawer__sub">
                  {mode === "add_order" ? "Pilih user dulu, lalu isi detail order." : "Update order yang dipilih dari daftar."}
                </div>
              </div>
              <button
                ref={drawerCloseBtnRef}
                type="button"
                className="ordersBtn ordersBtn--sm"
                onClick={closeDrawer}
                aria-label="Tutup form"
              >
                Tutup
              </button>
            </div>

            <div className="ordersDrawer__body">
              <form className="ordersForm" onSubmit={submit} aria-label="Form order">
          <div className="ordersForm__head">
            <h2 className="ordersTitle">
              {mode === "add_order" ? "Tambah order card" : "Update order"}
            </h2>
            <p className="ordersSubtitle">
              {mode === "add_order"
                ? "Pilih user dulu, lalu isi detail order."
                : editingId
                  ? "Update order yang dipilih dari daftar."
                  : "Pilih order dari daftar untuk mulai update."}
            </p>
          </div>

          <div className="ordersGrid" role="group" aria-label="Detail order">
            <label className="ordersField ordersField--full">
              <span className="ordersLabel">Pilih user</span>
              <div className="ordersInlineActions" role="group" aria-label="Cari user">
                <input
                  className="ordersInput"
                  ref={customerSearchRef}
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Cari user: nama / nomor"
                  inputMode="search"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void loadCustomers(customerSearch);
                    }
                  }}
                />
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => void loadCustomers(customerSearch)}
                  disabled={submitting}
                >
                  Cari
                </button>
                {mode === "add_order" && (
                  <button
                    type="button"
                    className="ordersBtn ordersBtn--sm"
                    onClick={() => {
                      setShowInlineAddUser((v) => !v);
                      setNewCustomerName(buyerName);
                      setNewCustomerPhone(phoneNumber);
                      setNewCustomerAddress(address);
                    }}
                    disabled={submitting}
                  >
                    {showInlineAddUser ? "Tutup tambah user" : "Tambah user"}
                  </button>
                )}
              </div>
              <select
                className="ordersSelect"
                aria-label="Pilih user"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="">— pilih user —</option>
                {customers.map((c) => (
                  <option key={(c._id ?? c.phoneNumber).toString()} value={(c._id ?? "").toString()}>
                    {(c.buyerName ?? "").toString()} • {(c.phoneNumber ?? "").toString()}
                  </option>
                ))}
              </select>
              <div className="ordersHint">Jika user belum ada, klik Add user dulu.</div>
            </label>

            {mode === "add_order" && showInlineAddUser && (
              <div className="ordersField ordersField--full" aria-label="Tambah user baru">
                <div className="ordersHint">Tambah user baru (langsung dipilih setelah tersimpan)</div>
                <div className="ordersGrid" role="group" aria-label="Data user baru">
                  <label className="ordersField">
                    <span className="ordersLabel">Nama</span>
                    <input
                      className="ordersInput"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="Nama pembeli"
                      autoComplete="name"
                      disabled={customerSubmitting}
                    />
                  </label>

                  <label className="ordersField">
                    <span className="ordersLabel">No. HP</span>
                    <input
                      className="ordersInput"
                      value={newCustomerPhone}
                      onChange={(e) => setNewCustomerPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      autoComplete="tel"
                      inputMode="tel"
                      disabled={customerSubmitting}
                    />
                  </label>

                  <label className="ordersField ordersField--full">
                    <span className="ordersLabel">Alamat</span>
                    <textarea
                      className="ordersTextarea"
                      value={newCustomerAddress}
                      onChange={(e) => setNewCustomerAddress(e.target.value)}
                      placeholder="Alamat lengkap"
                      rows={3}
                      disabled={customerSubmitting}
                    />
                  </label>
                </div>
                <div className="ordersActions">
                  <button
                    type="button"
                    className="ordersBtn ordersBtn--primary"
                    onClick={() => void submitCustomerData()}
                    disabled={customerSubmitting}
                  >
                    {customerSubmitting ? "Menyimpan..." : "Simpan user"}
                  </button>
                </div>
              </div>
            )}

            {!showOrderDetails ? (
              <div className="ordersNotice" role="status" aria-live="polite">
                Pilih user dulu untuk lanjut isi order.
              </div>
            ) : (
              <div ref={orderDetailsRef}>
                {mode === "add_order" ? (
                  <div className="ordersNotice" role="status" aria-live="polite">
                    User terpilih: <b>{buyerName || "—"}</b> • {phoneNumber || "—"}
                    <div className="ordersNotice__sub">{address || "—"}</div>
                  </div>
                ) : (
                  <>
                    <label className="ordersField">
                      <span className="ordersLabel">Nama pembeli</span>
                      <input
                        className="ordersInput"
                        value={buyerName}
                        onChange={(ev) => setBuyerName(ev.target.value)}
                        placeholder="Nama lengkap"
                        autoComplete="name"
                        readOnly={buyerFieldsLocked}
                        aria-readonly={buyerFieldsLocked ? "true" : "false"}
                        disabled={buyerFieldsDisabled}
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">No. HP</span>
                      <input
                        className="ordersInput"
                        value={phoneNumber}
                        onChange={(ev) => setPhoneNumber(ev.target.value)}
                        placeholder="08xxxxxxxxxx"
                        autoComplete="tel"
                        inputMode="tel"
                        readOnly={buyerFieldsLocked}
                        aria-readonly={buyerFieldsLocked ? "true" : "false"}
                        disabled={buyerFieldsDisabled}
                      />
                    </label>

                    <label className="ordersField ordersField--full">
                      <span className="ordersLabel">Alamat</span>
                      <textarea
                        className="ordersTextarea"
                        value={address}
                        onChange={(ev) => setAddress(ev.target.value)}
                        placeholder="Alamat lengkap pengantaran"
                        rows={3}
                        readOnly={buyerFieldsLocked}
                        aria-readonly={buyerFieldsLocked ? "true" : "false"}
                        disabled={buyerFieldsDisabled}
                      />
                    </label>
                  </>
                )}
              </div>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Bouquet</span>
              <select
                className="ordersSelect"
                ref={bouquetSelectRef}
                value={bouquetId}
                onChange={(ev) => setBouquetId(ev.target.value)}
              >
                {bouquetOptions.length === 0 ? (
                  <option value="">Tidak ada bouquet</option>
                ) : (
                  bouquetOptions.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Waktu deliver</span>
              <input
                className="ordersInput"
                type="datetime-local"
                value={deliveryAt}
                onChange={(ev) => setDeliveryAt(ev.target.value)}
              />
              <div className="ordersInlineActions" role="group" aria-label="Aksi waktu deliver">
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyDeliveryPreset("today")}
                  disabled={submitting}
                  title="Hari ini jam 14:00 (atau 2 jam dari sekarang jika sudah lewat)"
                >
                  Hari ini
                </button>
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyDeliveryPreset("tomorrow")}
                  disabled={submitting}
                  title="Besok jam 10:00"
                >
                  Besok
                </button>
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyDeliveryQuick(2)}
                  disabled={submitting}
                  title="2 jam dari sekarang"
                >
                  +2 jam
                </button>
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => setDeliveryAt("")}
                  disabled={submitting}
                  title="Hapus waktu deliver"
                >
                  Hapus
                </button>
              </div>
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Status order</span>
              <select
                className="ordersSelect"
                value={orderStatus ?? "bertanya"}
                onChange={(ev) => setOrderStatus(ev.target.value as any)}
              >
                <option value="bertanya">Bertanya</option>
                <option value="memesan">Memesan</option>
                <option value="sedang_diproses">Sedang diproses</option>
                <option value="menunggu_driver">Menunggu driver</option>
                <option value="pengantaran">Pengantaran</option>
                <option value="terkirim">Terkirim</option>
              </select>
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Status pembayaran</span>
              <input
                className="ordersInput"
                value={derivedNumbers.derivedPaymentStatus.replace(/_/g, " ")}
                readOnly
                aria-readonly="true"
              />
              <div className="ordersHint">
                Otomatis dari DP + tambahan vs total. Pakai tombol cepat untuk set nominal.
              </div>
              <div className="ordersInlineActions" role="group" aria-label="Aksi pembayaran">
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyPaymentPreset("belum_bayar")}
                  disabled={submitting}
                >
                  Belum bayar
                </button>
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyPaymentPreset("dp")}
                  disabled={submitting}
                >
                  Set DP
                </button>
                <button
                  type="button"
                  className="ordersBtn ordersBtn--sm"
                  onClick={() => applyPaymentPreset("sudah_bayar")}
                  disabled={submitting}
                >
                  Set lunas
                </button>
              </div>
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Media pembayaran</span>
              <select
                className="ordersSelect"
                value={paymentMethod ?? ""}
                onChange={(ev) => setPaymentMethod(ev.target.value as any)}
              >
                <option value="">—</option>
                <option value="cash">Cash</option>
                <option value="transfer_bank">Transfer bank</option>
                <option value="ewallet">E-wallet</option>
                <option value="qris">QRIS</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Nominal DP</span>
              <input
                className="ordersInput"
                value={downPaymentAmount}
                onChange={(ev) => setDownPaymentAmount(ev.target.value)}
                placeholder="Rp"
                inputMode="numeric"
              />
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Biaya delivery</span>
              <input
                className="ordersInput"
                value={deliveryPrice}
                onChange={(ev) => setDeliveryPrice(ev.target.value)}
                placeholder="Rp"
                inputMode="numeric"
              />
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Tambahan pembayaran</span>
              <input
                className="ordersInput"
                value={additionalPayment}
                onChange={(ev) => setAdditionalPayment(ev.target.value)}
                placeholder="Rp"
                inputMode="numeric"
              />
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Harga bouquet</span>
              <input
                className="ordersInput"
                value={formatIDR(bouquetPriceForCalc)}
                readOnly
                aria-readonly="true"
              />
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Total</span>
              <input
                className="ordersInput"
                value={formatIDR(derivedNumbers.total)}
                readOnly
                aria-readonly="true"
              />
            </label>
            )}

            {showOrderDetails && (
            <label className="ordersField">
              <span className="ordersLabel">Sisa bayar</span>
              <input
                className="ordersInput"
                value={formatIDR(derivedNumbers.remaining)}
                readOnly
                aria-readonly="true"
              />
            </label>
            )}
          </div>

          {(error || success) && (
            <div
              className={`ordersNotice ${error ? "is-error" : "is-success"}`}
              role={error ? "alert" : "status"}
              aria-live={error ? "assertive" : "polite"}
              aria-atomic="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                {error ? (
                  <>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </>
                ) : (
                  <>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </>
                )}
              </svg>
              <span>{error || success}</span>
            </div>
          )}

          <div className="ordersActions">
            <button
              type="submit"
              className="ordersBtn ordersBtn--primary"
              disabled={
                submitting ||
                bouquetOptions.length === 0 ||
                !showOrderDetails ||
                (mode === "update_order" && !editingId)
              }
            >
              {submitting
                ? "Menyimpan..."
                : mode === "update_order"
                  ? "Update order"
                  : "Simpan order card"}
            </button>

            <button
              type="button"
              className="ordersBtn"
              onClick={closeDrawer}
              disabled={submitting}
            >
              Batal
            </button>

            {editingId && (
              <>
                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void patchEditing({ orderStatus: nextOrderStatus(orderStatus) })}
                  disabled={submitting}
                >
                  Next status
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void patchEditing({ orderStatus: "terkirim" })}
                  disabled={submitting}
                >
                  Tandai terkirim
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void copyWaMessage()}
                  disabled={submitting}
                >
                  Salin pesan
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void copyOrderSummary()}
                  disabled={submitting}
                >
                  Salin ringkasan
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void copyPhone()}
                  disabled={submitting}
                >
                  Salin nomor
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void copyAddress()}
                  disabled={submitting}
                >
                  Salin alamat
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={openWaChat}
                  disabled={submitting}
                >
                  WhatsApp
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={repeatFromEditing}
                  disabled={submitting}
                >
                  Repeat order
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Batal edit
                </button>

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void deleteEditing()}
                  disabled={submitting}
                >
                  Hapus
                </button>
              </>
            )}

            <button
              type="button"
              className="ordersBtn"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {editingOrder && Array.isArray(editingOrder.activity) && editingOrder.activity.length > 0 && (
            <div className="ordersHistory" aria-label="Riwayat perubahan order">
              <div className="ordersHistory__title">Riwayat</div>
              <div className="ordersHistory__list">
                {editingOrder.activity
                  .slice()
                  .reverse()
                  .slice(0, 8)
                  .map((a, idx) => (
                    <div key={`${a.at ?? idx}-${idx}`} className="ordersHistory__row">
                      <div className="ordersHistory__msg">{a.message ?? "—"}</div>
                      <div className="ordersHistory__time">
                        {a.at ? formatDateTime(a.at) : "—"}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceOrder && (
        <InvoiceComponent
          order={invoiceOrder}
          onClose={() => {
            setShowInvoice(false);
            setInvoiceOrder(null);
          }}
        />
      )}
    </section>
  );
}
