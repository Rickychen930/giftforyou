import React, { useRef } from "react";
import "../styles/InvoiceComponent.css";
import { STORE_PROFILE } from "../config/store-profile";
import { formatIDR } from "../utils/money";

export type Order = {
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
  deliveryAt?: string;
  createdAt?: string;
};

interface InvoiceComponentProps {
  order: Order;
  onClose?: () => void;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (dateString?: string): string => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

const getStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    bertanya: "Bertanya",
    memesan: "Memesan",
    sedang_diproses: "Sedang Diproses",
    menunggu_driver: "Menunggu Driver",
    pengantaran: "Pengantaran",
    terkirim: "Terkirim",
  };
  return labels[status || ""] || status || "—";
};

const getPaymentStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    belum_bayar: "Belum Bayar",
    dp: "Down Payment",
    sudah_bayar: "Lunas",
  };
  return labels[status || ""] || status || "—";
};

const getPaymentMethodLabel = (method?: string): string => {
  const labels: Record<string, string> = {
    cash: "Tunai",
    transfer_bank: "Transfer Bank",
    ewallet: "E-Wallet",
    qris: "QRIS",
    lainnya: "Lainnya",
  };
  return labels[method || ""] || method || "—";
};

// Generate professional invoice number
const generateInvoiceNumber = (orderId?: string, createdAt?: string): string => {
  if (!orderId) return "N/A";
  
  const date = createdAt ? new Date(createdAt) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const shortId = orderId.slice(-6).toUpperCase();
  
  return `INV-${year}${month}-${shortId}`;
};

// Generate order reference
const generateOrderReference = (orderId?: string): string => {
  if (!orderId) return "N/A";
  return `ORD-${orderId.slice(-8).toUpperCase()}`;
};

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({ order, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const invoiceNumber = generateInvoiceNumber(order._id, order.createdAt);
  const orderReference = generateOrderReference(order._id);

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = invoiceRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.bouquetName}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              padding: 40px;
              background: white;
              color: #1a1a1a;
            }
            ${document.querySelector("style")?.innerHTML || ""}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadPDF = () => {
    // For now, just trigger print dialog
    // In production, you might want to use a library like jsPDF or html2pdf
    handlePrint();
  };

  const bouquetPrice = order.bouquetPrice || 0;
  const deliveryPrice = order.deliveryPrice || 0;
  const downPayment = order.downPaymentAmount || 0;
  const additionalPayment = order.additionalPayment || 0;
  const totalAmount = order.totalAmount || bouquetPrice + deliveryPrice;
  const remainingAmount = totalAmount - downPayment - additionalPayment;

  return (
    <div className="invoice-overlay" onClick={onClose}>
      <div className="invoice-container" onClick={(e) => e.stopPropagation()} ref={invoiceRef}>
        {/* Header */}
        <div className="invoice-header">
          <div className="invoice-header__top">
            <div className="invoice-header__brand">
              <h1 className="invoice-brand__name">{STORE_PROFILE.brand.displayName}</h1>
              <p className="invoice-brand__tagline">{STORE_PROFILE.brand.tagline}</p>
            </div>
            <div className="invoice-header__actions">
              <button
                type="button"
                className="invoice-btn invoice-btn--print"
                onClick={handlePrint}
                aria-label="Print invoice"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 14h12v8H6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Print
              </button>
              {onClose && (
                <button
                  type="button"
                  className="invoice-btn invoice-btn--close"
                  onClick={onClose}
                  aria-label="Close invoice"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="invoice-header__divider"></div>
        </div>

        {/* Invoice Content */}
        <div className="invoice-content">
          {/* Watermark */}
          <div className="invoice-watermark">INVOICE</div>

          {/* Invoice Title */}
          <div className="invoice-title-section">
            <div className="invoice-title-wrapper">
              <h2 className="invoice-title">INVOICE</h2>
              <p className="invoice-subtitle">Official Invoice Document</p>
            </div>
            <div className="invoice-meta">
              <div className="invoice-meta__item">
                <span className="invoice-meta__label">Invoice No.</span>
                <span className="invoice-meta__value">{invoiceNumber}</span>
              </div>
              <div className="invoice-meta__item">
                <span className="invoice-meta__label">Order Ref.</span>
                <span className="invoice-meta__value">{orderReference}</span>
              </div>
              <div className="invoice-meta__item">
                <span className="invoice-meta__label">Tanggal</span>
                <span className="invoice-meta__value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="invoice-meta__item">
                <span className="invoice-meta__label">Due Date</span>
                <span className="invoice-meta__value">{formatDate(order.deliveryAt || order.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Customer & Store Info */}
          <div className="invoice-info-grid">
            <div className="invoice-info-card">
              <h3 className="invoice-info-card__title">Bill To</h3>
              <div className="invoice-info-card__content">
                <p className="invoice-info-card__name">{order.buyerName}</p>
                <p className="invoice-info-card__detail">{order.phoneNumber}</p>
                <p className="invoice-info-card__detail">{order.address}</p>
              </div>
            </div>
            <div className="invoice-info-card">
              <h3 className="invoice-info-card__title">From</h3>
              <div className="invoice-info-card__content">
                <p className="invoice-info-card__name">{STORE_PROFILE.brand.displayName}</p>
                <p className="invoice-info-card__detail">{STORE_PROFILE.location.streetAddress}</p>
                <p className="invoice-info-card__detail">
                  {STORE_PROFILE.location.locality}, {STORE_PROFILE.location.region} {STORE_PROFILE.location.postalCode}
                </p>
                <p className="invoice-info-card__detail">{STORE_PROFILE.contact.phoneDisplay}</p>
                <p className="invoice-info-card__detail">{STORE_PROFILE.contact.email}</p>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="invoice-details">
            <h3 className="invoice-details__title">Order Details</h3>
            <div className="invoice-table">
              <div className="invoice-table__header">
                <div className="invoice-table__col invoice-table__col--item">Item</div>
                <div className="invoice-table__col invoice-table__col--qty">Qty</div>
                <div className="invoice-table__col invoice-table__col--price">Price</div>
                <div className="invoice-table__col invoice-table__col--total">Total</div>
              </div>
              <div className="invoice-table__row">
                <div className="invoice-table__col invoice-table__col--item">
                  <div className="invoice-item">
                    <span className="invoice-item__name">{order.bouquetName}</span>
                    <span className="invoice-item__id">ID: {order.bouquetId.slice(-8)}</span>
                  </div>
                </div>
                <div className="invoice-table__col invoice-table__col--qty">1</div>
                <div className="invoice-table__col invoice-table__col--price">{formatIDR(bouquetPrice)}</div>
                <div className="invoice-table__col invoice-table__col--total">{formatIDR(bouquetPrice)}</div>
              </div>
              {deliveryPrice > 0 && (
                <div className="invoice-table__row invoice-table__row--subtotal">
                  <div className="invoice-table__col invoice-table__col--item">
                    <span className="invoice-item__name">Biaya Pengiriman</span>
                  </div>
                  <div className="invoice-table__col invoice-table__col--qty">—</div>
                  <div className="invoice-table__col invoice-table__col--price">{formatIDR(deliveryPrice)}</div>
                  <div className="invoice-table__col invoice-table__col--total">{formatIDR(deliveryPrice)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="invoice-summary">
            <div className="invoice-summary__row">
              <span className="invoice-summary__label">Subtotal</span>
              <span className="invoice-summary__value">{formatIDR(bouquetPrice + deliveryPrice)}</span>
            </div>
            {downPayment > 0 && (
              <div className="invoice-summary__row invoice-summary__row--payment">
                <span className="invoice-summary__label">Down Payment</span>
                <span className="invoice-summary__value invoice-summary__value--negative">
                  -{formatIDR(downPayment)}
                </span>
              </div>
            )}
            {additionalPayment > 0 && (
              <div className="invoice-summary__row invoice-summary__row--payment">
                <span className="invoice-summary__label">Additional Payment</span>
                <span className="invoice-summary__value invoice-summary__value--negative">
                  -{formatIDR(additionalPayment)}
                </span>
              </div>
            )}
            <div className="invoice-summary__row invoice-summary__row--total">
              <span className="invoice-summary__label">Total Amount</span>
              <span className="invoice-summary__value invoice-summary__value--total">
                {formatIDR(totalAmount)}
              </span>
            </div>
            {remainingAmount > 0 && (
              <div className="invoice-summary__row invoice-summary__row--remaining">
                <span className="invoice-summary__label">Remaining</span>
                <span className="invoice-summary__value invoice-summary__value--remaining">
                  {formatIDR(remainingAmount)}
                </span>
              </div>
            )}
          </div>

          {/* Payment & Status Info */}
          <div className="invoice-status-grid">
            <div className="invoice-status-card">
              <h4 className="invoice-status-card__title">Payment Status</h4>
              <div className="invoice-status-badge invoice-status-badge--payment">
                {getPaymentStatusLabel(order.paymentStatus)}
              </div>
              {order.paymentMethod && (
                <p className="invoice-status-card__detail">
                  Method: {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              )}
              {downPayment > 0 && (
                <p className="invoice-status-card__detail">
                  DP: {formatIDR(downPayment)}
                </p>
              )}
              {additionalPayment > 0 && (
                <p className="invoice-status-card__detail">
                  Additional: {formatIDR(additionalPayment)}
                </p>
              )}
            </div>
            <div className="invoice-status-card">
              <h4 className="invoice-status-card__title">Order Status</h4>
              <div className="invoice-status-badge invoice-status-badge--order">
                {getStatusLabel(order.orderStatus)}
              </div>
              {order.deliveryAt && (
                <p className="invoice-status-card__detail">
                  Delivery: {formatDate(order.deliveryAt)}
                </p>
              )}
            </div>
            <div className="invoice-status-card">
              <h4 className="invoice-status-card__title">Payment Summary</h4>
              <div className="invoice-payment-summary">
                <div className="invoice-payment-summary__row">
                  <span>Total Amount</span>
                  <span className="invoice-payment-summary__value">{formatIDR(totalAmount)}</span>
                </div>
                {(downPayment > 0 || additionalPayment > 0) && (
                  <div className="invoice-payment-summary__row">
                    <span>Paid</span>
                    <span className="invoice-payment-summary__value invoice-payment-summary__value--paid">
                      {formatIDR(downPayment + additionalPayment)}
                    </span>
                  </div>
                )}
                {remainingAmount > 0 && (
                  <div className="invoice-payment-summary__row invoice-payment-summary__row--remaining">
                    <span>Remaining</span>
                    <span className="invoice-payment-summary__value invoice-payment-summary__value--remaining">
                      {formatIDR(remainingAmount)}
                    </span>
                  </div>
                )}
                {remainingAmount <= 0 && (
                  <div className="invoice-payment-summary__row invoice-payment-summary__row--paid">
                    <span>Status</span>
                    <span className="invoice-payment-summary__value invoice-payment-summary__value--paid">
                      Fully Paid
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {remainingAmount > 0 && (
            <div className="invoice-payment-instructions">
              <h4 className="invoice-payment-instructions__title">Payment Instructions</h4>
              <div className="invoice-payment-instructions__content">
                <p>Please complete your payment of <strong>{formatIDR(remainingAmount)}</strong> to confirm your order.</p>
                <p>Payment can be made via:</p>
                <ul>
                  <li>Bank Transfer: {STORE_PROFILE.contact.phoneDisplay}</li>
                  <li>E-Wallet / QRIS: Contact us for payment details</li>
                  <li>Cash on Delivery: Available for local deliveries</li>
                </ul>
                <p className="invoice-payment-instructions__note">
                  <strong>Note:</strong> Please include invoice number <strong>{invoiceNumber}</strong> in your payment reference.
                </p>
              </div>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="invoice-terms">
            <h4 className="invoice-terms__title">Terms & Conditions</h4>
            <div className="invoice-terms__content">
              <ul>
                <li>All prices are in Indonesian Rupiah (IDR) and include applicable taxes.</li>
                <li>Payment must be completed before delivery unless otherwise agreed.</li>
                <li>Orders are subject to product availability. We reserve the right to substitute items of equal or greater value.</li>
                <li>Delivery dates are estimates and may vary based on location and availability.</li>
                <li>For cancellations, please contact us at least 24 hours before the scheduled delivery date.</li>
                <li>This invoice is valid for 30 days from the date of issue.</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="invoice-footer">
            <div className="invoice-footer__divider"></div>
            <p className="invoice-footer__text">
              Terima kasih telah mempercayai {STORE_PROFILE.brand.displayName} untuk kebutuhan hadiah Anda.
            </p>
            <p className="invoice-footer__text invoice-footer__text--small">
              Invoice ini dibuat secara otomatis pada {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceComponent;

