import React, { Component } from "react";
import { OrdersController } from "../../controllers/orders-controller";
import type { Bouquet } from "../../models/domain/bouquet";

interface Props {
  bouquets: Bouquet[];
}

/**
 * Orders Section (Main Entry Point)
 * Follows OOP and SOLID principles:
 * - Single Responsibility: Only connects Controller and View
 * - Open/Closed: Extensible through props
 * - Dependency Inversion: Depends on Controller abstraction
 */
class OrdersSection extends Component<Props> {
  render(): React.ReactNode {
    return <OrdersController bouquets={this.props.bouquets} />;
  }
}

export default OrdersSection;
