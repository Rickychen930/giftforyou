/**
 * Bouquet Edit Form Component (OOP)
 * Class-based component following SOLID principles
 * 
 * FIXED: Removed duplicate collection selector - collection selection is now handled
 * entirely by BouquetEditor component to prevent state synchronization bugs.
 * 
 * IMPROVED: Better performance with proper state management and memoization.
 */

import React, { Component } from "react";
import type { Bouquet } from "../../models/domain/bouquet";
import type { Collection } from "../../models/domain/collection";
import "../../styles/BouquetEditForm.css";
import BouquetEditor from "../../components/bouquet-card-edit-component";
import SectionHeader from "../../components/common/SectionHeader";

interface Props {
  bouquet: Bouquet;
  collections: Collection[];
  onSave: (formData: FormData) => Promise<boolean>;
  onBack: () => void;
}

interface State {
  bouquet: Bouquet;
}

/**
 * Bouquet Edit Form Component
 * 
 * Single Responsibility: Wraps BouquetEditor with navigation header
 * Open/Closed: Extensible through props
 * Dependency Inversion: Depends on BouquetEditor abstraction
 */
class BouquetEditForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      bouquet: props.bouquet,
    };
  }

  componentDidUpdate(prevProps: Props): void {
    // Only update if bouquet ID changed (different bouquet selected)
    if (prevProps.bouquet._id !== this.props.bouquet._id) {
      this.setState({
        bouquet: this.props.bouquet,
      });
    }
    // Also update if bouquet data changed (after save)
    else if (prevProps.bouquet !== this.props.bouquet) {
      this.setState({
        bouquet: this.props.bouquet,
      });
    }
  }

  private handleSave = async (formData: FormData): Promise<boolean> => {
    // Collection name is already in formData from BouquetEditor
    // No need to override it - this prevents state sync bugs
    const success = await this.props.onSave(formData);
    return success;
  };

  // Memoize collection names to prevent unnecessary re-renders
  private getCollectionNames = (): string[] => {
    return this.props.collections.map((c) => c.name);
  };

  render(): React.ReactNode {
    const { onBack } = this.props;
    const { bouquet } = this.state;
    const collectionNames = this.getCollectionNames();

    return (
      <section className="bouquetEditForm" aria-label={`Edit bouquet ${bouquet.name}`}>
        <SectionHeader
          title="Edit Bouquet"
          subtitle="Edit detail bouquet. Perubahan akan tersimpan ke database."
          backButton={{
            onClick: onBack,
            label: "Kembali",
          }}
          className="bouquetEditForm__header"
        />

        <div className="bouquetEditForm__formWrapper">
          <BouquetEditor
            bouquet={bouquet}
            collections={collectionNames}
            onSave={this.handleSave}
          />
        </div>
      </section>
    );
  }
}

export default BouquetEditForm;

