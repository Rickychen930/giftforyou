import React, { Component } from "react";
import type { Bouquet } from "../models/domain/bouquet";
import { BouquetEditorController } from "../controllers/bouquet-editor-controller";

interface Props {
  bouquet: Bouquet;
  collections: string[];
  onSave: (formData: FormData) => Promise<boolean> | void;
  onDuplicate?: (bouquetId: string) => Promise<void>;
  onDelete?: (bouquetId: string) => Promise<void>;
}

/**
 * Bouquet Editor Component (Main Entry Point)
 * Follows OOP and SOLID principles:
 * - Single Responsibility: Only connects Controller and View
 * - Open/Closed: Extensible through props
 * - Dependency Inversion: Depends on Controller abstraction
 */
class BouquetCardEditComponent extends Component<Props> {
  render(): React.ReactNode {
    return (
      <BouquetEditorController
        bouquet={this.props.bouquet}
        collections={this.props.collections}
        onSave={this.props.onSave}
        onDuplicate={this.props.onDuplicate}
        onDelete={this.props.onDelete}
      />
    );
  }
}

export default BouquetCardEditComponent;
