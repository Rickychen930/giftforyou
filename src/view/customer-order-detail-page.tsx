/**
 * Customer Order Detail Page
 * Displays complete order information including items, pricing, status, and delivery details
 */

import React, { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useCustomerOrder } from "../hooks/useCustomer";
import { formatIDR } from "../utils/money";
import { setSeo } from "../utils/seo";
import { getAccessToken } from "../utils/auth-utils";
import InvoiceComponent from "../components/InvoiceComponent";
import OrderTrackingTimeline from "../components/OrderTrackingTimeline";
import "../styles/CustomerOrderDetailPage.css";

const CustomerOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const token = getAccessToken();
  const isAuthenticated = !!token;

  const {
    data: order,
    isLoading,
    error,
  } = useCustomerOrder(id || "", {
    enabled: !!id && isAuthenticated,
  });

  useEffect(() => {
    if (order && order._id) {
      try {
        const orderId = String(order._id);
        const bouquetName = typeof order.bouquetName === "string" ? order.bouquetName : "Bouquet";
        const totalAmount = typeof order.totalAmount === "number" && Number.isFinite(order.totalAmount)
          ? order.totalAmount
          : 0;
        setSeo({
          title: `Detail Pesanan #${orderId.slice(-8)} | Giftforyou.idn`,
          description: `Detail pesanan ${bouquetName} - ${formatIDR(totalAmount)}`,
          path: `/customer/orders/${id || ""}`,
        });
      } catch (error) {
        console.error("Error setting SEO:", error);
      }
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [order, id]);

  if (!isAuthenticated) {
    return <Navigate to="/customer/login" replace />;
  }

  if (isLoading) {
    return (
      <section className="customerOrderDetail customerOrderDetail--loading">
        <div className="customerOrderDetail__container">
          <div className="customerOrderDetail__loading">
            <div className="customerOrderDetail__spinner"></div>
            <p>Memuat detail pesanan...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="customerOrderDetail">
        <div className="customerOrderDetail__container">
          <div className="customerOrderDetail__error">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M12 8v4M12 16h.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h2>Pesanan Tidak Ditemukan</h2>
            <p>{error instanceof Error ? error.message : "Pesanan tidak ditemukan atau terjadi kesalahan."}</p>
            <Link to="/customer/dashboard" className="customerOrderDetail__backBtn">
              Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const getStatusBadge = (status: string): { text: string; className: string } => {
    const statusMap: Record<string, { text: string; className: string }> = {
      bertanya: { text: "Bertanya", className: "status--info" },
      memesan: { text: "Memesan", className: "status--primary" },
      sedang_diproses: { text: "Diproses", className: "status--warning" },
      menunggu_driver: { text: "Menunggu Driver", className: "status--warning" },
      pengantaran: { text: "Pengantaran", className: "status--info" },
      terkirim: { text: "Terkirim", className: "status--success" },
    };
    return statusMap[status] || { text: status, className: "status--default" };
  };

  const getPaymentStatusBadge = (status?: string): { text: string; className: string } => {
    const statusMap: Record<string, { text: string; className: string }> = {
      belum_bayar: { text: "Belum Bayar", className: "payment--unpaid" },
      dp: { text: "DP", className: "payment--partial" },
      sudah_bayar: { text: "Lunas", className: "payment--paid" },
    };
    return statusMap[status || ""] || { text: status || "Tidak diketahui", className: "payment--unknown" };
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString || typeof dateString !== "string" || dateString.trim() === "") return "-";
    try {
      const date = new Date(dateString);
      if (!Number.isFinite(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const statusBadge = getStatusBadge(order.orderStatus);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

  // Convert CustomerOrder to InvoiceComponent Order format
  const invoiceOrder = {
    _id: order._id,
    customerId: undefined,
    buyerName: "",
    phoneNumber: "",
    address: "",
    bouquetId: order.bouquetId || "",
    bouquetName: order.bouquetName,
    bouquetPrice: 0,
    orderStatus: order.orderStatus as any,
    paymentStatus: order.paymentStatus as any,
    paymentMethod: "" as any,
    downPaymentAmount: 0,
    additionalPayment: 0,
    deliveryPrice: 0,
    totalAmount: order.totalAmount,
    deliveryAt: order.deliveryAt,
    createdAt: order.createdAt,
  };

  return (
    <section className="customerOrderDetail">
      <div className="customerOrderDetail__container">
        <div className="customerOrderDetail__header">
          <Link to="/customer/dashboard" className="customerOrderDetail__backLink">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Kembali ke Dashboard
          </Link>
          <h1 className="customerOrderDetail__title">Detail Pesanan</h1>
          <p className="customerOrderDetail__subtitle">
            ID Pesanan: #{order._id && String(order._id).length > 8 ? String(order._id).slice(-8) : String(order._id || "")}
          </p>
        </div>

        <div className="customerOrderDetail__content">
          {/* Order Status Cards */}
          <div className="customerOrderDetail__statusCards">
            <div className="customerOrderDetail__statusCard">
              <span className="customerOrderDetail__statusLabel">Status Pesanan</span>
              <span className={`customerOrderDetail__statusBadge ${statusBadge.className}`}>
                {statusBadge.text}
              </span>
            </div>
            {order.paymentStatus && (
              <div className="customerOrderDetail__statusCard">
                <span className="customerOrderDetail__statusLabel">Status Pembayaran</span>
                <span className={`customerOrderDetail__statusBadge ${paymentBadge.className}`}>
                  {paymentBadge.text}
                </span>
              </div>
            )}
          </div>

          {/* Order Tracking Timeline */}
          <div className="customerOrderDetail__timeline">
            <h2 className="customerOrderDetail__sectionTitle">Lacak Pesanan</h2>
            <OrderTrackingTimeline
              activities={Array.isArray(order.activity) ? order.activity : []}
              createdAt={order.createdAt}
              orderStatus={order.orderStatus}
            />
          </div>

          {/* Order Summary */}
          <div className="customerOrderDetail__summary">
            <h2 className="customerOrderDetail__sectionTitle">Ringkasan Pesanan</h2>
            <div className="customerOrderDetail__summaryGrid">
              <div className="customerOrderDetail__summaryItem">
                <span className="customerOrderDetail__summaryLabel">Nama Bouquet</span>
                <span className="customerOrderDetail__summaryValue">{order.bouquetName}</span>
              </div>
              <div className="customerOrderDetail__summaryItem">
                <span className="customerOrderDetail__summaryLabel">Total Harga</span>
                <span className="customerOrderDetail__summaryValue customerOrderDetail__summaryValue--price">
                  {formatIDR(order.totalAmount)}
                </span>
              </div>
              <div className="customerOrderDetail__summaryItem">
                <span className="customerOrderDetail__summaryLabel">Tanggal Pesanan</span>
                <span className="customerOrderDetail__summaryValue">{formatDate(order.createdAt)}</span>
              </div>
              {order.deliveryAt && (
                <div className="customerOrderDetail__summaryItem">
                  <span className="customerOrderDetail__summaryLabel">Tanggal Pengiriman</span>
                  <span className="customerOrderDetail__summaryValue">{formatDate(order.deliveryAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Component */}
          <div className="customerOrderDetail__invoice">
            <h2 className="customerOrderDetail__sectionTitle">Invoice</h2>
            <InvoiceComponent order={invoiceOrder} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerOrderDetailPage;

