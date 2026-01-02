/**
 * Customer Card Component (OOP)
 * Class-based component following SOLID principles
 * Reusable card component for displaying customer in list view
 */

import React from "react";
import { BaseCard, BaseCardProps } from "../base/BaseCard";
import StatusBadge from "../common/StatusBadge";
import "../../styles/CustomerCard.css";

export interface CustomerCardProps extends Omit<BaseCardProps, "onClick"> {
  customerId?: string;
  name: string;
  phone: string;
  totalOrders?: number;
  totalSpent?: string | number;
  joinedDate?: string;
  isRegistered?: boolean;
  onClick?: (customerId?: string) => void;
}

interface CustomerCardState {
  isHovered: boolean;
}

/**
 * Customer Card Component
 * Class-based component extending BaseCard for customer list items
 */
class CustomerCard extends BaseCard<CustomerCardProps, CustomerCardState> {
  protected baseClass: string = "customerCard";

  protected renderHeader(): React.ReactNode {
    const { name, phone, isRegistered } = this.props;

    return (
      <div className={`${this.baseClass}__header`}>
        <div className={`${this.baseClass}__info`}>
          <h3 className={`${this.baseClass}__name`}>{name}</h3>
          <p className={`${this.baseClass}__phone`}>{phone}</p>
        </div>
        <div className={`${this.baseClass}__badges`}>
          <StatusBadge
            type={isRegistered ? "ready" : "preorder"}
            label={isRegistered ? "Terdaftar" : "Guest"}
            size="sm"
          />
        </div>
      </div>
    );
  }

  protected renderContent(): React.ReactNode {
    const { totalOrders = 0, totalSpent, joinedDate } = this.props;

    return (
      <div className={`${this.baseClass}__stats`}>
        <div className={`${this.baseClass}__stat`}>
          <span className={`${this.baseClass}__statLabel`}>Pesanan</span>
          <span className={`${this.baseClass}__statValue`}>{totalOrders}</span>
        </div>
        <div className={`${this.baseClass}__stat`}>
          <span className={`${this.baseClass}__statLabel`}>Total Belanja</span>
          <span className={`${this.baseClass}__statValue`}>{totalSpent || "—"}</span>
        </div>
        <div className={`${this.baseClass}__stat`}>
          <span className={`${this.baseClass}__statLabel`}>Bergabung</span>
          <span className={`${this.baseClass}__statValue`}>{joinedDate || "—"}</span>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const { onClick, customerId } = this.props;

    return (
      <div
        className={this.getClasses()}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        onClick={() => onClick?.(customerId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.(customerId);
          }
        }}
      >
        {this.renderHeader()}
        {this.renderContent()}
      </div>
    );
  }
}

export default CustomerCard;

