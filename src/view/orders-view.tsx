// src/view/orders-view.tsx
// Orders View Component - Complete View for Orders Section
// Follows OOP and SOLID principles - only handles presentation

import React, { Component } from "react";
import "../styles/OrdersSection.css";
import type { OrdersController } from "../controllers/orders-controller";
import InvoiceComponent from "../components/common/InvoiceComponent";
import EmptyState from "../components/common/EmptyState";
import SkeletonLoader from "../components/common/SkeletonLoader";
import type { Order } from "../models/orders-model";

interface Props {
  controller: OrdersController;
}

/**
 * View Component for Orders Section
 * Handles Header, Statistics, Order List, Form Drawer, and Invoice Modal
 */
class OrdersView extends Component<Props> {
  private getControllerState() {
    return this.props.controller.getControllerState();
  }

  // ==================== Header Section ====================
  private renderHeader(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { mode } = state;

    return (
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
              handlers.resetForm();
              handlers.setMode("add_order");
              this.props.controller.setState((prev) => ({
                ...prev,
                showInlineAddUser: false,
                success: "",
                error: "",
              }));
            }}
          >
            Add order card
          </button>
          <button
            type="button"
            className="overviewActionBtn"
            onClick={() => void handlers.loadOrders()}
          >
            Refresh
          </button>
          {(mode === "add_order" || mode === "update_order") && (
            <button
              type="button"
              className="overviewActionBtn"
              onClick={handlers.closeDrawer}
            >
              Tutup form
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==================== Statistics Section ====================
  private renderStatistics(): React.ReactNode {
    const { state, utils } = this.getControllerState();
    const { orders, orderStats } = state;

    if (orders.length === 0) return null;

    return (
      <div className="ordersStats" aria-label="Statistik order">
        <div className="ordersStats__grid">
          <div className="ordersStatCard">
            <div className="ordersStatCard__label">Total Order</div>
            <div className="ordersStatCard__value">{orderStats.total}</div>
          </div>
          <div className="ordersStatCard ordersStatCard--warning">
            <div className="ordersStatCard__label">Belum Bayar</div>
            <div className="ordersStatCard__value">
              {orderStats.byPayment.belum_bayar}
            </div>
          </div>
          <div className="ordersStatCard ordersStatCard--success">
            <div className="ordersStatCard__label">Terkirim</div>
            <div className="ordersStatCard__value">
              {orderStats.byStatus.terkirim}
            </div>
          </div>
          <div className="ordersStatCard ordersStatCard--danger">
            <div className="ordersStatCard__label">Terlambat</div>
            <div className="ordersStatCard__value">{orderStats.overdue}</div>
          </div>
          <div className="ordersStatCard ordersStatCard--revenue">
            <div className="ordersStatCard__label">Total Revenue</div>
            <div className="ordersStatCard__value">
              {utils.formatIDR(orderStats.totalRevenue)}
            </div>
          </div>
          <div className="ordersStatCard ordersStatCard--revenue">
            <div className="ordersStatCard__label">Sudah Dibayar</div>
            <div className="ordersStatCard__value">
              {utils.formatIDR(orderStats.paidRevenue)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Search and Filters ====================
  private renderSearchAndFilters(): React.ReactNode {
    const { state } = this.getControllerState();
    const {
      listQuery,
      filterOrderStatus,
      filterPaymentStatus,
      sortBy,
      sortDirection,
    } = state;

    return (
      <>
        <div className="ordersList__head">
          <h3 className="ordersList__title">Order card</h3>

          <div className="ordersList__headRight" aria-label="Pencarian order">
            <div className="ordersListSearch" aria-label="Cari order">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ordersListSearch__icon"
                aria-hidden="true"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m21 21-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                className="ordersInput"
                value={listQuery}
                onChange={(e) =>
                  this.props.controller.setState((prev) => ({
                    ...prev,
                    listQuery: e.target.value,
                  }))
                }
                placeholder="Cari: nama / nomor / bouquet"
                inputMode="search"
                aria-label="Cari order"
              />
              {listQuery && (
                <button
                  type="button"
                  className="ordersListSearch__clear"
                  onClick={() =>
                    this.props.controller.setState((prev) => ({
                      ...prev,
                      listQuery: "",
                    }))
                  }
                  aria-label="Hapus pencarian"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 3L3 9M3 3L9 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
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
                onChange={(e) =>
                  this.props.controller.setState((prev) => ({
                    ...prev,
                    filterOrderStatus: e.target.value as any,
                  }))
                }
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
                onChange={(e) =>
                  this.props.controller.setState((prev) => ({
                    ...prev,
                    filterPaymentStatus: e.target.value as any,
                  }))
                }
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
                  onChange={(e) =>
                    this.props.controller.setState((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any,
                    }))
                  }
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
                  onClick={() =>
                    this.props.controller.setState((prev) => ({
                      ...prev,
                      sortDirection:
                        prev.sortDirection === "asc" ? "desc" : "asc",
                    }))
                  }
                  aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                  title={
                    sortDirection === "asc"
                      ? "Urutkan menurun"
                      : "Urutkan menaik"
                  }
                >
                  {sortDirection === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </label>

            {(filterOrderStatus !== "all" ||
              filterPaymentStatus !== "all" ||
              listQuery.trim()) && (
              <button
                type="button"
                className="ordersFilterClear"
                onClick={() =>
                  this.props.controller.setState((prev) => ({
                    ...prev,
                    filterOrderStatus: "all",
                    filterPaymentStatus: "all",
                    listQuery: "",
                  }))
                }
                aria-label="Hapus semua filter"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Reset
              </button>
            )}
          </div>
        </div>
      </>
    );
  }

  // ==================== Order Card ====================
  private renderOrderCard(order: Order): React.ReactNode {
    const { state, handlers, utils } = this.getControllerState();
    const {
      editingId,
      submitting,
      selectedOrders,
    } = state;

    const isSelected = Boolean(editingId && order._id && editingId === order._id);
    const os = (order.orderStatus ?? "bertanya") as any;
    const ps = (order.paymentStatus ?? "belum_bayar") as any;
    const isOverdue = utils.isOrderOverdue(order);

    const total = utils.calculateOrderTotal(order);
    const remaining = utils.calculateOrderRemaining(order);
    const dp = typeof order.downPaymentAmount === "number" ? order.downPaymentAmount : 0;
    const add = typeof order.additionalPayment === "number" ? order.additionalPayment : 0;
    const method = order.paymentMethod ? order.paymentMethod.replace(/_/g, " ") : "—";

    const orderBadgeCls =
      os === "terkirim" ? "ordersBadge--success" : "ordersBadge--warning";
    const payBadgeCls =
      ps === "sudah_bayar"
        ? "ordersBadge--success"
        : ps === "belum_bayar"
          ? "ordersBadge--danger"
          : "ordersBadge--warning";

    const orderId = order._id || "";
    const isBulkSelected = orderId && selectedOrders.has(orderId);

    return (
      <div
        key={order._id ?? `${order.buyerName}-${order.createdAt}`}
        className={`ordersCard ${isSelected ? "is-selected" : ""} ${isOverdue ? "is-danger" : ""} ${isBulkSelected ? "is-bulk-selected" : ""}`}
        role="listitem"
        tabIndex={0}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest(".ordersCard__checkbox")) {
            return;
          }
          handlers.selectOrderForEdit(order);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handlers.selectOrderForEdit(order);
          }
        }}
      >
        {selectedOrders.size > 0 && (
          <div className="ordersCard__checkboxWrapper">
            <input
              type="checkbox"
              className="ordersCard__checkbox"
              checked={Boolean(isBulkSelected)}
              onChange={(e) => {
                e.stopPropagation();
                handlers.toggleOrderSelection(orderId);
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Select order ${order.buyerName}`}
            />
          </div>
        )}
        <div className="ordersCard__top">
          <div className="ordersCard__buyer">
            <div className="ordersCard__buyerName">{order.buyerName}</div>
            <div className="ordersCard__buyerSub">{order.phoneNumber}</div>
          </div>
          <div className="ordersCard__amount" aria-label="Sisa pembayaran">
            <div className="ordersCard__amountLabel">Sisa</div>
            <div
              className={`ordersCard__amountValue ${remaining > 0 ? "is-danger" : ""}`.trim()}
            >
              {utils.formatIDR(remaining)}
            </div>
          </div>
        </div>

        <div className="ordersCard__main">
          <div className="ordersCard__bouquet">{order.bouquetName}</div>
          <div className="ordersCard__chips" aria-label="Ringkasan order">
            <span className="ordersChip ordersChip--muted">
              Deliver {utils.formatShortDateTime(order.deliveryAt)}
            </span>
            <span className={`ordersChip ${orderBadgeCls}`.trim()}>
              {os.replace(/_/g, " ")}
            </span>
            <span className={`ordersChip ${payBadgeCls}`.trim()}>
              {ps.replace(/_/g, " ")}
            </span>
            <span className="ordersChip ordersChip--muted">Metode {method}</span>
            {isOverdue && (
              <span className="ordersChip ordersChip--danger">Terlambat</span>
            )}
          </div>
        </div>

        {isSelected && (
          <>
            <div className="ordersCard__money">
              <div className="ordersCard__moneyRow">
                <span>Total</span>
                <b>{utils.formatIDR(total)}</b>
              </div>
              <div className="ordersCard__moneyRow">
                <span>Sudah bayar</span>
                <b>{utils.formatIDR(dp + add)}</b>
              </div>
            </div>
            <div className="ordersCard__note">
              DP {utils.formatIDR(dp)} • Tambahan {utils.formatIDR(add)} • Delivery{" "}
              {utils.formatIDR(order.deliveryPrice)}
            </div>
          </>
        )}
        <div className="ordersCard__actions" aria-label="Aksi order">
          <button
            type="button"
            className="ordersBtn ordersBtn--sm ordersBtn--primary"
            onClick={(ev) => {
              ev.stopPropagation();
              handlers.selectOrderForEdit(order);
            }}
            disabled={submitting}
            aria-label={`Update order ${order.buyerName}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Update</span>
          </button>
          {isSelected && (
            <button
              type="button"
              className="ordersBtn ordersBtn--sm"
              onClick={(ev) => {
                ev.stopPropagation();
                const nextStatus = utils.nextOrderStatus(order.orderStatus);
                void handlers.patchEditing({ orderStatus: nextStatus });
              }}
              disabled={submitting || !editingId || editingId !== order._id}
              aria-label={`Next status untuk order ${order.buyerName}`}
              title="Lanjut ke status berikutnya"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Next</span>
            </button>
          )}
          <button
            type="button"
            className="ordersBtn ordersBtn--sm"
            onClick={(ev) => {
              ev.stopPropagation();
              handlers.showInvoice(order);
            }}
            disabled={submitting}
            aria-label={`Lihat invoice untuk order ${order.buyerName}`}
            title="Lihat invoice"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Invoice</span>
          </button>
          <button
            type="button"
            className="ordersBtn ordersBtn--sm ordersBtn--danger"
            onClick={(ev) => {
              ev.stopPropagation();
              void handlers.deleteOrderById((order._id ?? "").toString());
            }}
            disabled={submitting}
            aria-label={`Hapus order ${order.buyerName}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>Delete</span>
          </button>
        </div>
      </div>
    );
  }

  // ==================== Bulk Actions ====================
  private renderBulkActions(): React.ReactNode {
    const { state, handlers, utils } = this.getControllerState();
    const {
      selectedOrders,
      bulkActionMode,
      bulkStatusValue,
      orders,
    } = state;

    if (selectedOrders.size === 0) return null;

    return (
      <div className="ordersList__actions ordersActions" aria-label="Aksi cepat">
        <div className="ordersBulkActions">
          <span className="ordersBulkActions__count">
            {selectedOrders.size} order dipilih
          </span>
          <div className="ordersBulkActions__buttons">
            <select
              value={bulkActionMode}
              onChange={(e) => {
                const mode = e.target.value as typeof bulkActionMode;
                this.props.controller.setState((prev) => ({
                  ...prev,
                  bulkActionMode: mode,
                  bulkStatusValue:
                    mode === "status" ? ("bertanya" as any) : prev.bulkStatusValue,
                }));
              }}
              className="ordersBulkActions__select"
            >
              <option value="none">Pilih Aksi...</option>
              <option value="status">Update Status</option>
              <option value="export">Export Selected</option>
              <option value="delete">Hapus Selected</option>
            </select>
            {bulkActionMode === "status" && (
              <select
                value={bulkStatusValue}
                onChange={(e) =>
                  this.props.controller.setState((prev) => ({
                    ...prev,
                    bulkStatusValue: e.target.value as any,
                  }))
                }
                className="ordersBulkActions__select"
              >
                <option value="bertanya">Bertanya</option>
                <option value="memesan">Memesan</option>
                <option value="sedang_diproses">Sedang Diproses</option>
                <option value="menunggu_driver">Menunggu Driver</option>
                <option value="pengantaran">Pengantaran</option>
                <option value="terkirim">Terkirim</option>
              </select>
            )}
            {bulkActionMode !== "none" && (
              <button
                type="button"
                className="ordersBulkActions__apply"
                onClick={async () => {
                  const { API_BASE } = require("../config/api");
                  const { getAuthHeaders } = require("../utils/auth-utils");

                  if (bulkActionMode === "status") {
                    this.props.controller.setState({ submitting: true });
                    try {
                      const updates = Array.from(selectedOrders).map(async (orderId) => {
                        const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            ...getAuthHeaders(),
                          },
                          body: JSON.stringify({ orderStatus: bulkStatusValue }),
                        });
                        return res.ok;
                      });
                      await Promise.all(updates);
                      this.props.controller.setState({
                        success: `Status ${selectedOrders.size} order berhasil diupdate`,
                        selectedOrders: new Set(),
                        bulkActionMode: "none",
                        submitting: false,
                      });
                      await handlers.loadOrders();
                    } catch (err) {
                      this.props.controller.setState({
                        error: "Gagal update status",
                        submitting: false,
                      });
                    }
                  } else if (bulkActionMode === "export") {
                    const selected = orders.filter(
                      (o) => o._id && selectedOrders.has(o._id)
                    );
                    const csv = utils.exportOrdersToCSV(selected);
                    const blob = new Blob([csv], {
                      type: "text/csv;charset=utf-8;",
                    });
                    const link = document.createElement("a");
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute(
                      "download",
                      `orders_${new Date().toISOString().split("T")[0]}.csv`
                    );
                    link.style.visibility = "hidden";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    this.props.controller.setState({
                      success: `${selectedOrders.size} order berhasil diexport`,
                      selectedOrders: new Set(),
                      bulkActionMode: "none",
                    });
                  } else if (bulkActionMode === "delete") {
                    if (
                      window.confirm(
                        `Apakah Anda yakin ingin menghapus ${selectedOrders.size} order?`
                      )
                    ) {
                      this.props.controller.setState({ submitting: true });
                      try {
                        const { API_BASE } = require("../config/api");
                        const { getAuthHeaders } = require("../utils/auth-utils");
                        const deletes = Array.from(selectedOrders).map(async (orderId) => {
                          const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
                            method: "DELETE",
                            headers: getAuthHeaders(),
                          });
                          return res.ok;
                        });
                        await Promise.all(deletes);
                        this.props.controller.setState({
                          success: `${selectedOrders.size} order berhasil dihapus`,
                          selectedOrders: new Set(),
                          bulkActionMode: "none",
                          submitting: false,
                        });
                        await handlers.loadOrders();
                      } catch (err) {
                        this.props.controller.setState({
                          error: "Gagal menghapus order",
                          submitting: false,
                        });
                      }
                    }
                  }
                }}
              >
                Terapkan
              </button>
            )}
            <button
              type="button"
              className="ordersBulkActions__cancel"
              onClick={() => handlers.clearOrderSelection()}
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== Order List ====================
  private renderOrderList(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const {
      loading,
      orders,
      filteredAndSortedOrders,
      listQuery,
      filterOrderStatus,
      filterPaymentStatus,
    } = state;

    if (loading) {
      return (
        <div className="ordersEmpty" role="status" aria-live="polite" aria-busy="true">
          <SkeletonLoader variant="rectangular" width="100%" height="200px" />
          <span style={{ marginTop: "1rem", display: "block" }}>Memuat order...</span>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <EmptyState
          title="Belum ada order"
          description="Mulai dengan membuat order pertama"
          actionLabel="Buat Order Pertama"
          onAction={() => {
            handlers.resetForm();
            handlers.setMode("add_order");
            this.props.controller.setState((prev) => ({
              ...prev,
              showInlineAddUser: false,
              success: "",
              error: "",
            }));
          }}
        />
      );
    }

    if (filteredAndSortedOrders.length === 0) {
      return (
        <EmptyState
          title="Tidak ada hasil"
          description="Tidak ada order yang sesuai dengan filter/pencarian"
          actionLabel="Hapus Filter"
          onAction={() =>
            this.props.controller.setState((prev) => ({
              ...prev,
              filterOrderStatus: "all",
              filterPaymentStatus: "all",
              listQuery: "",
            }))
          }
        />
      );
    }

    return (
      <>
        <div className="ordersList__sub">
          <span>
            Menampilkan:{" "}
            <b style={{ color: "var(--dash-brand-pink)" }}>
              {filteredAndSortedOrders.length}
            </b>
            {listQuery.trim() ||
            filterOrderStatus !== "all" ||
            filterPaymentStatus !== "all"
              ? ` dari ${orders.length} order`
              : " order"}
          </span>
          {filteredAndSortedOrders.length !== orders.length && (
            <button
              type="button"
              className="ordersList__showAll"
              onClick={() =>
                this.props.controller.setState((prev) => ({
                  ...prev,
                  filterOrderStatus: "all",
                  filterPaymentStatus: "all",
                  listQuery: "",
                }))
              }
              aria-label="Tampilkan semua order"
            >
              Tampilkan semua
            </button>
          )}
        </div>

        <div className="ordersCards" role="list" aria-label="Daftar order">
          {filteredAndSortedOrders.map((order) => this.renderOrderCard(order))}
        </div>
      </>
    );
  }

  // ==================== Form Drawer ====================
  private renderFormDrawer(): React.ReactNode {
    const { state, handlers, refs, utils } = this.getControllerState();
    const {
      isFormOpen,
      mode,
      editingId,
      buyerName,
      phoneNumber,
      address,
      bouquetId,
      bouquetOptions,
      deliveryAt,
      orderStatus,
      paymentMethod,
      downPaymentAmount,
      additionalPayment,
      deliveryPrice,
      derivedNumbers,
      buyerFieldsLocked,
      buyerFieldsDisabled,
      showOrderDetails,
      submitting,
      customerSubmitting,
      error,
      success,
      editingOrder,
      bouquetPriceForCalc,
      customers,
      customerSearch,
      selectedCustomerId,
      showInlineAddUser,
      newCustomerName,
      newCustomerPhone,
      newCustomerAddress,
    } = state;

    if (!isFormOpen) return null;

    return (
      <div
        className="ordersDrawerOverlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) handlers.closeDrawer();
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) handlers.closeDrawer();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) handlers.closeDrawer();
        }}
      >
        <div
          ref={refs.drawerRef}
          className="ordersDrawer"
          role="dialog"
          aria-modal="true"
          aria-label="Form order"
          onKeyDown={handlers.handleDrawerKeyDown}
        >
          <div className="ordersDrawer__head">
            <div className="ordersDrawer__headText">
              <div className="ordersDrawer__title">
                {mode === "add_order" ? "Tambah order" : "Update order"}
              </div>
              <div className="ordersDrawer__sub">
                {mode === "add_order"
                  ? "Pilih user dulu, lalu isi detail order."
                  : "Update order yang dipilih dari daftar."}
              </div>
            </div>
            <button
              ref={refs.drawerCloseBtnRef}
              type="button"
              className="ordersBtn ordersBtn--sm"
              onClick={handlers.closeDrawer}
              aria-label="Tutup form"
            >
              Tutup
            </button>
          </div>

          <div className="ordersDrawer__body">
            <form
              className="ordersForm"
              onSubmit={handlers.submitOrder}
              aria-label="Form order"
            >
              <div className="ordersForm__head">
                <h2 className="ordersTitle">
                  {mode === "add_order"
                    ? "Tambah order card"
                    : "Update order"}
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
                {/* Customer Selection */}
                <label className="ordersField ordersField--full">
                  <span className="ordersLabel">Pilih user</span>
                  <div
                    className="ordersInlineActions"
                    role="group"
                    aria-label="Cari user"
                  >
                    <input
                      className="ordersInput"
                      ref={refs.customerSearchRef}
                      value={customerSearch}
                      onChange={(e) =>
                        this.props.controller.setState((prev) => ({
                          ...prev,
                          customerSearch: e.target.value,
                        }))
                      }
                      placeholder="Cari user: nama / nomor"
                      inputMode="search"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void handlers.loadCustomers(customerSearch);
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="ordersBtn ordersBtn--sm"
                      onClick={() => void handlers.loadCustomers(customerSearch)}
                      disabled={submitting}
                    >
                      Cari
                    </button>
                    {mode === "add_order" && (
                      <button
                        type="button"
                        className="ordersBtn ordersBtn--sm"
                        onClick={() =>
                          this.props.controller.setState((prev) => ({
                            ...prev,
                            showInlineAddUser: !prev.showInlineAddUser,
                            newCustomerName: buyerName,
                            newCustomerPhone: phoneNumber,
                            newCustomerAddress: address,
                          }))
                        }
                        disabled={submitting}
                      >
                        {showInlineAddUser
                          ? "Tutup tambah user"
                          : "Tambah user"}
                      </button>
                    )}
                  </div>
                  <select
                    className="ordersSelect"
                    aria-label="Pilih user"
                    value={selectedCustomerId}
                    onChange={(e) =>
                      this.props.controller.setState((prev) => ({
                        ...prev,
                        selectedCustomerId: e.target.value,
                      }))
                    }
                  >
                    <option value="">— pilih user —</option>
                    {customers.map((c) => (
                      <option
                        key={(c._id ?? c.phoneNumber).toString()}
                        value={(c._id ?? "").toString()}
                      >
                        {(c.buyerName ?? "").toString()} •{" "}
                        {(c.phoneNumber ?? "").toString()}
                      </option>
                    ))}
                  </select>
                  <div className="ordersHint">
                    Jika user belum ada, klik Add user dulu.
                  </div>
                </label>

                {/* Inline Add User Form */}
                {mode === "add_order" && showInlineAddUser && (
                  <div
                    className="ordersField ordersField--full"
                    aria-label="Tambah user baru"
                  >
                    <div className="ordersHint">
                      Tambah user baru (langsung dipilih setelah tersimpan)
                    </div>
                    <div className="ordersGrid" role="group" aria-label="Data user baru">
                      <label className="ordersField">
                        <span className="ordersLabel">Nama</span>
                        <input
                          className="ordersInput"
                          value={newCustomerName}
                          onChange={(e) =>
                            this.props.controller.setState((prev) => ({
                              ...prev,
                              newCustomerName: e.target.value,
                            }))
                          }
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
                          onChange={(e) =>
                            this.props.controller.setState((prev) => ({
                              ...prev,
                              newCustomerPhone: e.target.value,
                            }))
                          }
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
                          onChange={(e) =>
                            this.props.controller.setState((prev) => ({
                              ...prev,
                              newCustomerAddress: e.target.value,
                            }))
                          }
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
                        onClick={() => void handlers.submitCustomerData()}
                        disabled={customerSubmitting}
                      >
                        {customerSubmitting ? "Menyimpan..." : "Simpan user"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Buyer Info Display/Edit */}
                {!showOrderDetails ? (
                  <div className="ordersNotice" role="status" aria-live="polite">
                    Pilih user dulu untuk lanjut isi order.
                  </div>
                ) : (
                  <div ref={refs.orderDetailsRef}>
                    {mode === "add_order" ? (
                      <div className="ordersNotice" role="status" aria-live="polite">
                        User terpilih: <b>{buyerName || "—"}</b> •{" "}
                        {phoneNumber || "—"}
                        <div className="ordersNotice__sub">{address || "—"}</div>
                      </div>
                    ) : (
                      <>
                        <label className="ordersField">
                          <span className="ordersLabel">Nama pembeli</span>
                          <input
                            className="ordersInput"
                            name="buyerName"
                            value={buyerName}
                            onChange={handlers.handleTextChange}
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
                            name="phoneNumber"
                            value={phoneNumber}
                            onChange={handlers.handleTextChange}
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
                            name="address"
                            value={address}
                            onChange={handlers.handleTextChange}
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

                {/* Order Fields */}
                {showOrderDetails && (
                  <>
                    <label className="ordersField">
                      <span className="ordersLabel">Bouquet</span>
                      <select
                        className="ordersSelect"
                        ref={refs.bouquetSelectRef}
                        name="bouquetId"
                        value={bouquetId}
                        onChange={handlers.handleTextChange}
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

                    <label className="ordersField">
                      <span className="ordersLabel">Waktu deliver</span>
                      <input
                        className="ordersInput"
                        type="datetime-local"
                        name="deliveryAt"
                        value={deliveryAt}
                        onChange={handlers.handleTextChange}
                      />
                      <div
                        className="ordersInlineActions"
                        role="group"
                        aria-label="Aksi waktu deliver"
                      >
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() => handlers.applyDeliveryPreset("today")}
                          disabled={submitting}
                          title="Hari ini jam 14:00 (atau 2 jam dari sekarang jika sudah lewat)"
                        >
                          Hari ini
                        </button>
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() =>
                            handlers.applyDeliveryPreset("tomorrow")
                          }
                          disabled={submitting}
                          title="Besok jam 10:00"
                        >
                          Besok
                        </button>
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() => handlers.applyDeliveryQuick(2)}
                          disabled={submitting}
                          title="2 jam dari sekarang"
                        >
                          +2 jam
                        </button>
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() =>
                            this.props.controller.setState((prev) => ({
                              ...prev,
                              deliveryAt: "",
                            }))
                          }
                          disabled={submitting}
                          title="Hapus waktu deliver"
                        >
                          Hapus
                        </button>
                      </div>
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Status order</span>
                      <select
                        className="ordersSelect"
                        name="orderStatus"
                        value={orderStatus ?? "bertanya"}
                        onChange={handlers.handleTextChange}
                      >
                        <option value="bertanya">Bertanya</option>
                        <option value="memesan">Memesan</option>
                        <option value="sedang_diproses">Sedang diproses</option>
                        <option value="menunggu_driver">Menunggu driver</option>
                        <option value="pengantaran">Pengantaran</option>
                        <option value="terkirim">Terkirim</option>
                      </select>
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Status pembayaran</span>
                      <input
                        className="ordersInput"
                        value={derivedNumbers.derivedPaymentStatus.replace(
                          /_/g,
                          " "
                        )}
                        readOnly
                        aria-readonly="true"
                      />
                      <div className="ordersHint">
                        Otomatis dari DP + tambahan vs total. Pakai tombol cepat
                        untuk set nominal.
                      </div>
                      <div
                        className="ordersInlineActions"
                        role="group"
                        aria-label="Aksi pembayaran"
                      >
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() =>
                            handlers.applyPaymentPreset("belum_bayar")
                          }
                          disabled={submitting}
                        >
                          Belum bayar
                        </button>
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() => handlers.applyPaymentPreset("dp")}
                          disabled={submitting}
                        >
                          Set DP
                        </button>
                        <button
                          type="button"
                          className="ordersBtn ordersBtn--sm"
                          onClick={() =>
                            handlers.applyPaymentPreset("sudah_bayar")
                          }
                          disabled={submitting}
                        >
                          Set lunas
                        </button>
                      </div>
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Media pembayaran</span>
                      <select
                        className="ordersSelect"
                        name="paymentMethod"
                        value={paymentMethod ?? ""}
                        onChange={handlers.handleTextChange}
                      >
                        <option value="">—</option>
                        <option value="cash">Cash</option>
                        <option value="transfer_bank">Transfer bank</option>
                        <option value="ewallet">E-wallet</option>
                        <option value="qris">QRIS</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Nominal DP</span>
                      <input
                        className="ordersInput"
                        name="downPaymentAmount"
                        value={downPaymentAmount}
                        onChange={handlers.handleTextChange}
                        placeholder="Rp"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Biaya delivery</span>
                      <input
                        className="ordersInput"
                        name="deliveryPrice"
                        value={deliveryPrice}
                        onChange={handlers.handleTextChange}
                        placeholder="Rp"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Tambahan pembayaran</span>
                      <input
                        className="ordersInput"
                        name="additionalPayment"
                        value={additionalPayment}
                        onChange={handlers.handleTextChange}
                        placeholder="Rp"
                        inputMode="numeric"
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Harga bouquet</span>
                      <input
                        className="ordersInput"
                        value={utils.formatIDR(bouquetPriceForCalc)}
                        readOnly
                        aria-readonly="true"
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Total</span>
                      <input
                        className="ordersInput"
                        value={utils.formatIDR(derivedNumbers.total)}
                        readOnly
                        aria-readonly="true"
                      />
                    </label>

                    <label className="ordersField">
                      <span className="ordersLabel">Sisa bayar</span>
                      <input
                        className="ordersInput"
                        value={utils.formatIDR(derivedNumbers.remaining)}
                        readOnly
                        aria-readonly="true"
                      />
                    </label>
                  </>
                )}
              </div>

              {/* Messages */}
              {(error || success) && (
                <div
                  className={`ordersNotice ${error ? "is-error" : "is-success"}`}
                  role={error ? "alert" : "status"}
                  aria-live={error ? "assertive" : "polite"}
                  aria-atomic="true"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    {error ? (
                      <>
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 8v4M12 16h.01"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M9 12l2 2 4-4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </>
                    )}
                  </svg>
                  <span>{error || success}</span>
                </div>
              )}

              {/* Actions */}
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
                  onClick={handlers.closeDrawer}
                  disabled={submitting}
                >
                  Batal
                </button>

                {editingId && (
                  <>
                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() =>
                        void handlers.patchEditing({
                          orderStatus: utils.nextOrderStatus(orderStatus),
                        })
                      }
                      disabled={submitting}
                    >
                      Next status
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() =>
                        void handlers.patchEditing({ orderStatus: "terkirim" })
                      }
                      disabled={submitting}
                    >
                      Tandai terkirim
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() => void handlers.copyWaMessage()}
                      disabled={submitting}
                    >
                      Salin pesan
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() => void handlers.copyOrderSummary()}
                      disabled={submitting}
                    >
                      Salin ringkasan
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() => void handlers.copyPhone()}
                      disabled={submitting}
                    >
                      Salin nomor
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() => void handlers.copyAddress()}
                      disabled={submitting}
                    >
                      Salin alamat
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={handlers.openWaChat}
                      disabled={submitting}
                    >
                      WhatsApp
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={handlers.repeatFromEditing}
                      disabled={submitting}
                    >
                      Repeat order
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={handlers.resetForm}
                      disabled={submitting}
                    >
                      Batal edit
                    </button>

                    <button
                      type="button"
                      className="ordersBtn"
                      onClick={() => void handlers.deleteEditing()}
                      disabled={submitting}
                    >
                      Hapus
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="ordersBtn"
                  onClick={() => void handlers.loadOrders()}
                  disabled={state.loading}
                >
                  Refresh
                </button>
              </div>

              {/* Activity History */}
              {editingOrder &&
                Array.isArray(editingOrder.activity) &&
                editingOrder.activity.length > 0 && (
                  <div
                    className="ordersHistory"
                    aria-label="Riwayat perubahan order"
                  >
                    <div className="ordersHistory__title">Riwayat</div>
                    <div className="ordersHistory__list">
                      {editingOrder.activity
                        .slice()
                        .reverse()
                        .slice(0, 8)
                        .map((a, idx) => (
                          <div
                            key={`${a.at ?? idx}-${idx}`}
                            className="ordersHistory__row"
                          >
                            <div className="ordersHistory__msg">
                              {a.message ?? "—"}
                            </div>
                            <div className="ordersHistory__time">
                              {a.at ? utils.formatDateTime(a.at) : "—"}
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
    );
  }

  // ==================== Main Render ====================
  render(): React.ReactNode {
    const { state, handlers } = this.getControllerState();
    const { showInvoice, invoiceOrder } = state;

    return (
      <>
        <section className="dashboardSurface" aria-label="Record seller">
          {this.renderHeader()}

          <div className="ordersLayout is-single">
            {this.renderStatistics()}

            <aside className="ordersList" aria-label="Daftar order">
              {this.renderSearchAndFilters()}
              {this.renderBulkActions()}
              {this.renderOrderList()}
            </aside>
          </div>

          {/* Invoice Modal */}
          {showInvoice && invoiceOrder && (
            <InvoiceComponent order={invoiceOrder} onClose={handlers.hideInvoice} />
          )}
        </section>

        {/* Form Drawer */}
        {this.renderFormDrawer()}
      </>
    );
  }
}

export default OrdersView;
