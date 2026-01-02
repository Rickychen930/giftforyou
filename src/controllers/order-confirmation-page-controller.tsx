/**
 * Order Confirmation Page Controller
 * OOP-based controller for managing order confirmation page
 * Extends BaseController for common functionality (SOLID, DRY)
 */

import React from "react";
import { useSearchParams } from "react-router-dom";
import type { OrderConfirmationData } from "../models/order-confirmation-page-model";
import { BaseController, type BaseControllerProps, type BaseControllerState } from "./base/BaseController";
import OrderConfirmationPageView from "../view/order-confirmation-page";

interface OrderConfirmationPageControllerProps extends BaseControllerProps {
  searchParams: URLSearchParams;
}

/**
 * Order Confirmation Page Controller Class
 * Manages order confirmation data parsing and state
 * Extends BaseController to avoid code duplication
 */
export class OrderConfirmationPageController extends BaseController<
  OrderConfirmationPageControllerProps,
  BaseControllerState
> {
  /**
   * Parse order data from search params
   */
  private parseOrderData(): OrderConfirmationData {
    const { searchParams } = this.props;

    const itemsJson = searchParams.get("items");
    let items: OrderConfirmationData["items"] = undefined;

    if (itemsJson) {
      try {
        items = JSON.parse(decodeURIComponent(itemsJson));
      } catch {
        // If parsing fails, items remains undefined
      }
    }

    return {
      bouquetName: searchParams.get("bouquetName") || undefined,
      quantity: searchParams.get("quantity") ? parseInt(searchParams.get("quantity") || "1") : undefined,
      items,
      deliveryType: searchParams.get("deliveryType") || undefined,
      deliveryDate: searchParams.get("deliveryDate") || undefined,
      deliveryTimeSlot: searchParams.get("deliveryTimeSlot") || undefined,
      address: searchParams.get("address") || undefined,
      greetingCard: searchParams.get("greetingCard") || undefined,
      orderNotes: searchParams.get("orderNotes") || undefined,
      totalPrice: searchParams.get("totalPrice") ? parseFloat(searchParams.get("totalPrice") || "0") : undefined,
    };
  }

  /**
   * Component lifecycle: Mount
   * BaseController handles initialization
   */
  componentDidMount(): void {
    super.componentDidMount();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * Render view
   */
  render(): React.ReactNode {
    const orderData = this.parseOrderData();

    return <OrderConfirmationPageView orderData={orderData} />;
  }
}

/**
 * Wrapper component to use useSearchParams hook
 */
const OrderConfirmationPageControllerWrapper: React.FC = () => {
  const [searchParams] = useSearchParams();

  return <OrderConfirmationPageController searchParams={searchParams} />;
};

export default OrderConfirmationPageControllerWrapper;

