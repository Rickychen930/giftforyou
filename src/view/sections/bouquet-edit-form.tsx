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
  // Performance: Cache collection names to prevent recalculation
  private cachedCollectionNames: string[] | null = null;
  private lastCollectionsHash: string = "";

  constructor(props: Props) {
    super(props);
    this.state = {
      bouquet: props.bouquet,
    };
  }

  // Performance: Prevent unnecessary re-renders with deep comparison
  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // Only update if props or state actually changed
    const propsChanged = 
      nextProps.bouquet !== this.props.bouquet ||
      nextProps.collections !== this.props.collections ||
      nextProps.onSave !== this.props.onSave ||
      nextProps.onBack !== this.props.onBack;

    // Performance: Deep comparison for bouquet changes
    const bouquetChanged = 
      nextState.bouquet !== this.state.bouquet &&
      (nextState.bouquet._id !== this.state.bouquet._id ||
       nextState.bouquet.name !== this.state.bouquet.name ||
       nextState.bouquet.price !== this.state.bouquet.price ||
       nextState.bouquet.collectionName !== this.state.bouquet.collectionName);

    return propsChanged || bouquetChanged;
  }

  // Performance: Cleanup on unmount
  componentWillUnmount(): void {
    this.cachedCollectionNames = null;
    this.lastCollectionsHash = "";
  }

  componentDidUpdate(prevProps: Props): void {
    // Only update if bouquet ID changed (different bouquet selected)
    if (prevProps.bouquet._id !== this.props.bouquet._id) {
      this.setState({
        bouquet: this.props.bouquet,
      });
    }
    // Also update if bouquet data changed (after save) - use deep comparison
    else if (prevProps.bouquet !== this.props.bouquet) {
      // Performance: Only update if data actually changed
      const hasChanges = 
        prevProps.bouquet.name !== this.props.bouquet.name ||
        prevProps.bouquet.price !== this.props.bouquet.price ||
        prevProps.bouquet.collectionName !== this.props.bouquet.collectionName ||
        prevProps.bouquet.description !== this.props.bouquet.description;
      
      if (hasChanges) {
        this.setState({
          bouquet: this.props.bouquet,
        });
      }
    }
  }

  private handleSave = async (formData: FormData): Promise<boolean> => {
    // Collection name is already in formData from BouquetEditor
    // No need to override it - this prevents state sync bugs
    const success = await this.props.onSave(formData);
    return success;
  };

  // Performance: Memoize collection names with caching
  private getCollectionNames = (): string[] => {
    const collectionsHash = JSON.stringify(this.props.collections.map(c => c._id + c.name));
    
    if (this.cachedCollectionNames && this.lastCollectionsHash === collectionsHash) {
      return this.cachedCollectionNames;
    }
    
    const names = this.props.collections.map((c) => c.name);
    this.cachedCollectionNames = names;
    this.lastCollectionsHash = collectionsHash;
    return names;
  };

  render(): React.ReactNode {
    const { onBack } = this.props;
    const { bouquet } = this.state;
    const collectionNames = this.getCollectionNames();

    // Enhanced: Validate bouquet data before rendering
    if (!bouquet || !bouquet._id) {
      return (
        <section className="bouquetEditForm bouquetEditForm--error" aria-label="Error loading bouquet">
          <SectionHeader
            title="Error"
            subtitle="Gagal memuat data bouquet."
            backButton={{
              onClick: onBack,
              label: "Kembali",
            }}
            className="bouquetEditForm__header"
          />
          <div className="bouquetEditForm__errorMessage">
            <p>Bouquet tidak ditemukan atau data tidak valid. Silakan kembali dan coba lagi.</p>
          </div>
        </section>
      );
    }

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

