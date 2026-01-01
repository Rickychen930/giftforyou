// src/models/orders-model.ts
// Business logic model for orders section
// Contains utilities, validation, calculations, and data transformations

export type OrderStatus =
  | "bertanya"
  | "memesan"
  | "sedang_diproses"
  | "menunggu_driver"
  | "pengantaran"
  | "terkirim";

export type PaymentStatus = "belum_bayar" | "dp" | "sudah_bayar";

export type PaymentMethod =
  | ""
  | "cash"
  | "transfer_bank"
  | "ewallet"
  | "qris"
  | "lainnya";

export interface Order {
  _id?: string;
  customerId?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
  bouquetId: string;
  bouquetName: string;
  bouquetPrice?: number;
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
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
}

export interface Customer {
  _id?: string;
  buyerName: string;
  phoneNumber: string;
  address: string;
}

export interface BouquetOption {
  id: string;
  name: string;
  price: number;
}

export interface OrderStats {
  total: number;
  byStatus: Record<OrderStatus, number>;
  byPayment: Record<PaymentStatus, number>;
  overdue: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
}

export interface DerivedNumbers {
  dp: number;
  addPay: number;
  delivery: number;
  total: number;
  paid: number;
  remaining: number;
  derivedPaymentStatus: PaymentStatus;
}

// ==================== Date Utilities ====================
export function safeDate(v?: string): Date | null {
  if (!v) return null;
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return null;
  return new Date(t);
}

export function toDateTimeLocalValue(v?: string): string {
  const d = safeDate(v);
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function toDateTimeLocalFromDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export function formatDateTime(v?: string): string {
  if (!v) return "—";
  const t = Date.parse(v);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("id-ID");
}

export function formatShortDateTime(v?: string): string {
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
}

// ==================== Money Utilities ====================
export function formatIDR(n: unknown): string {
  const num =
    typeof n === "number"
      ? n
      : typeof n === "string"
        ? Number(n)
        : NaN;
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
}

export function parseAmount(v: string): number {
  const cleaned = (v ?? "").toString().replace(/[^0-9]/g, "").trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}

// ==================== Phone Utilities ====================
export function normalizePhone(v: string): string {
  return v.replace(/\s+/g, " ").trim();
}

export function toWaPhone(raw: string): string | null {
  const digits = (raw ?? "").toString().replace(/\D+/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

// ==================== Order Calculations ====================
export function calculateDerivedNumbers(
  bouquetPrice: number,
  downPaymentAmount: string,
  additionalPayment: string,
  deliveryPrice: string
): DerivedNumbers {
  const dp = parseAmount(downPaymentAmount);
  const addPay = parseAmount(additionalPayment);
  const delivery = parseAmount(deliveryPrice);
  const total = Math.max(0, Math.round(bouquetPrice) + Math.round(delivery));
  const paid = Math.max(0, dp + addPay);
  const remaining = Math.max(0, total - paid);
  const derivedPaymentStatus: PaymentStatus =
    total <= 0
      ? "sudah_bayar"
      : paid <= 0
        ? "belum_bayar"
        : paid >= total
          ? "sudah_bayar"
          : "dp";
  return { dp, addPay, delivery, total, paid, remaining, derivedPaymentStatus };
}

export function calculateOrderTotal(order: Order): number {
  const legacyBouquetPrice = typeof order.bouquetPrice === "number" ? order.bouquetPrice : 0;
  const legacyDelivery = typeof order.deliveryPrice === "number" ? order.deliveryPrice : 0;
  return typeof order.totalAmount === "number"
    ? order.totalAmount
    : Math.max(0, Math.round(legacyBouquetPrice) + Math.round(legacyDelivery));
}

export function calculateOrderRemaining(order: Order): number {
  const total = calculateOrderTotal(order);
  const dp = typeof order.downPaymentAmount === "number" ? order.downPaymentAmount : 0;
  const add = typeof order.additionalPayment === "number" ? order.additionalPayment : 0;
  return Math.max(0, total - dp - add);
}

export function isOrderOverdue(order: Order): boolean {
  const d = safeDate(order.deliveryAt);
  const os = order.orderStatus ?? "bertanya";
  return Boolean(d && os !== "terkirim" && d.getTime() < Date.now());
}

// ==================== Order Statistics ====================
export function calculateOrderStats(orders: Order[]): OrderStats {
  const total = orders.length;
  const byStatus: Record<OrderStatus, number> = {
    bertanya: 0,
    memesan: 0,
    sedang_diproses: 0,
    menunggu_driver: 0,
    pengantaran: 0,
    terkirim: 0,
  };
  const byPayment: Record<PaymentStatus, number> = {
    belum_bayar: 0,
    dp: 0,
    sudah_bayar: 0,
  };

  orders.forEach((o) => {
    const status = (o.orderStatus ?? "bertanya") as OrderStatus;
    byStatus[status] = (byStatus[status] ?? 0) + 1;

    const payment = (o.paymentStatus ?? "belum_bayar") as PaymentStatus;
    byPayment[payment] = (byPayment[payment] ?? 0) + 1;
  });

  const overdue = orders.filter(isOrderOverdue).length;

  const totalRevenue = orders.reduce((sum, o) => {
    return sum + calculateOrderTotal(o);
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
}

// ==================== Order Status Flow ====================
export function nextOrderStatus(
  cur?: OrderStatus
): NonNullable<OrderStatus> {
  const status = (cur ?? "bertanya") as NonNullable<OrderStatus>;
  const flow: NonNullable<OrderStatus>[] = [
    "bertanya",
    "memesan",
    "sedang_diproses",
    "menunggu_driver",
    "pengantaran",
    "terkirim",
  ];
  const idx = flow.indexOf(status);
  return flow[Math.min(Math.max(idx + 1, 0), flow.length - 1)];
}

// ==================== Filter and Sort ====================
export function filterAndSortOrders(
  orders: Order[],
  query: string,
  filterOrderStatus: OrderStatus | "all",
  filterPaymentStatus: PaymentStatus | "all",
  sortBy: "date" | "name" | "amount" | "status",
  sortDirection: "asc" | "desc"
): Order[] {
  let result = [...orders];

  // Apply search filter
  const q = query.trim().toLowerCase();
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
    result = result.filter(
      (o) => (o.orderStatus ?? "bertanya") === filterOrderStatus
    );
  }
  if (filterPaymentStatus !== "all") {
    result = result.filter(
      (o) => (o.paymentStatus ?? "belum_bayar") === filterPaymentStatus
    );
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
        const totalA = calculateOrderTotal(a);
        const totalB = calculateOrderTotal(b);
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
}

// ==================== Payment Presets ====================
export function applyPaymentPreset(
  preset: PaymentStatus,
  total: number,
  currentDp: string,
  currentAdd: string,
  currentPaid: number
): { downPaymentAmount: string; additionalPayment: string } {
  if (preset === "belum_bayar") {
    return { downPaymentAmount: "0", additionalPayment: "0" };
  }

  if (total <= 0) {
    return { downPaymentAmount: currentDp, additionalPayment: currentAdd };
  }

  if (preset === "sudah_bayar") {
    const remaining = total - currentPaid;
    const nextAdd = parseAmount(currentAdd) + remaining;
    return {
      downPaymentAmount: currentDp,
      additionalPayment: String(Math.max(0, Math.round(nextAdd))),
    };
  }

  // preset === "dp"
  if (currentPaid <= 0) {
    const rawHalf = Math.round(total * 0.5);
    const dp =
      total >= 10000
        ? Math.round(rawHalf / 1000) * 1000
        : Math.max(1, Math.floor(total / 2));
    const safeDp = Math.min(Math.max(0, dp), Math.max(0, total - 1));
    return { downPaymentAmount: String(safeDp), additionalPayment: "0" };
  }

  return { downPaymentAmount: currentDp, additionalPayment: currentAdd };
}

// ==================== Delivery Presets ====================
export function applyDeliveryPreset(
  preset: "today" | "tomorrow" | "nextWeek"
): string {
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

  return toDateTimeLocalFromDate(target);
}

export function applyDeliveryQuick(hoursFromNow: number): string {
  const now = new Date();
  const next = new Date(
    now.getTime() + Math.max(0, hoursFromNow) * 60 * 60 * 1000
  );
  return toDateTimeLocalFromDate(next);
}

// ==================== WhatsApp Message ====================
export function buildWaMessage(
  buyerName: string,
  bouquetName: string,
  deliveryAt: string,
  total: number,
  paid: number,
  remaining: number
): string {
  const deliverLabel = deliveryAt
    ? new Date(deliveryAt).toLocaleString("id-ID")
    : "—";

  const lines = [
    `Halo ${buyerName || ""},`,
    `Terima kasih sudah order di Giftforyou.idn.`,
    `Bouquet: ${bouquetName || "—"}`,
    `Jadwal deliver: ${deliverLabel}`,
    `Total: ${formatIDR(total)}`,
    `Sudah dibayar: ${formatIDR(paid)}`,
    `Sisa bayar: ${formatIDR(remaining)}`,
  ];

  return lines.join("\n");
}

export function buildOrderSummary(
  buyerName: string,
  phoneNumber: string,
  address: string,
  bouquetName: string,
  deliveryAt: string,
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
  paymentMethod: PaymentMethod,
  total: number,
  paid: number,
  remaining: number,
  dp: number,
  addPay: number,
  delivery: number
): string {
  const deliverLabel = deliveryAt
    ? new Date(deliveryAt).toLocaleString("id-ID")
    : "—";

  const lines = [
    "[ORDER SUMMARY]",
    `Pembeli: ${buyerName || "—"}`,
    `No HP: ${phoneNumber || "—"}`,
    `Alamat: ${address || "—"}`,
    `Bouquet: ${bouquetName || "—"}`,
    `Deliver: ${deliverLabel}`,
    `Status: ${(orderStatus ?? "bertanya").replace(/_/g, " ")}`,
    `Pembayaran: ${paymentStatus.replace(/_/g, " ")}`,
    `Metode: ${(paymentMethod || "—").replace(/_/g, " ")}`,
    `Total: ${formatIDR(total)}`,
    `Sudah dibayar: ${formatIDR(paid)}`,
    `Sisa bayar: ${formatIDR(remaining)}`,
    `DP: ${formatIDR(dp)} • Tambahan: ${formatIDR(addPay)} • Delivery: ${formatIDR(delivery)}`,
  ];

  return lines.join("\n");
}

// ==================== Export CSV ====================
export function exportOrdersToCSV(orders: Order[]): string {
  const csv = [
    ["ID", "Nama", "Telepon", "Bouquet", "Status", "Payment", "Total", "Tanggal"],
    ...orders.map((o) => [
      o._id || "",
      o.buyerName,
      o.phoneNumber,
      o.bouquetName,
      o.orderStatus || "",
      o.paymentStatus || "",
      calculateOrderTotal(o).toString(),
      formatDateTime(o.createdAt),
    ]),
  ]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  return csv;
}

